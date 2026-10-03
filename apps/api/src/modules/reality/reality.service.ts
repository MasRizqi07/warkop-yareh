import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { GalleryDraftDto, SiteDraftDto } from './reality.dto';

export const GALLERY_FRESHNESS_DAYS = 90;

@Injectable()
export class RealityService {
  constructor(private readonly prisma: DatabaseService) {}

  listGallery(publicOnly = false) {
    return this.prisma.galleryAsset.findMany({
      where: publicOnly
        ? {
            isVerified: true,
            provenance: {
              in: ['VERIFIED_VENUE_PHOTO', 'VERIFIED_BRANCH_PHOTO'],
            },
            sourceType: { in: ['PRIMARY_OPERATOR', 'DIRECT_PHYSICAL_AUDIT'] },
            sourceUrl: { not: null },
            capturedAt: { not: null },
            lastVerifiedAt: {
              gte: new Date(Date.now() - GALLERY_FRESHNESS_DAYS * 86_400_000),
              lte: new Date(),
            },
          }
        : {},
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    });
  }

  async saveGallery(dto: GalleryDraftDto, id?: string) {
    const now = Date.now();
    const capturedAt = dto.capturedAt ? new Date(dto.capturedAt) : null;
    const lastVerifiedAt = dto.lastVerifiedAt
      ? new Date(dto.lastVerifiedAt)
      : null;
    if (
      (capturedAt && capturedAt.getTime() > now) ||
      (lastVerifiedAt && lastVerifiedAt.getTime() > now)
    ) {
      throw new BadRequestException('Evidence dates cannot be in the future');
    }
    if (
      dto.isVerified &&
      (!['VERIFIED_VENUE_PHOTO', 'VERIFIED_BRANCH_PHOTO'].includes(
        dto.provenance,
      ) ||
        !dto.sourceUrl ||
        !dto.sourceType ||
        !capturedAt ||
        !lastVerifiedAt ||
        capturedAt > lastVerifiedAt ||
        now - lastVerifiedAt.getTime() > GALLERY_FRESHNESS_DAYS * 86_400_000 ||
        (dto.provenance === 'VERIFIED_BRANCH_PHOTO' && !dto.branchId))
    )
      throw new BadRequestException(
        'Publication requires a venue photo with primary evidence and current verification dates',
      );
    if (
      dto.branchId &&
      !(await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
        select: { id: true },
      }))
    ) {
      throw new BadRequestException('Canonical branch is not provisioned');
    }
    const data = {
      title: dto.title.trim(),
      caption: dto.caption?.trim() || null,
      imageUrl: dto.imageUrl,
      branchId: dto.branchId || null,
      provenance: dto.provenance,
      isVerified: dto.isVerified,
      sourceUrl: dto.sourceUrl || null,
      sourceType: dto.sourceType || null,
      capturedAt,
      lastVerifiedAt,
    };
    if (!data.title) throw new BadRequestException('Title cannot be blank');
    if (!id) return this.prisma.galleryAsset.create({ data });
    if (!dto.updatedAt)
      throw new BadRequestException(
        'The saved version is required when editing',
      );
    const result = await this.prisma.galleryAsset.updateMany({
      where: { id, updatedAt: new Date(dto.updatedAt) },
      data,
    });
    if (!result.count)
      throw new ConflictException('This asset changed. Reload before editing.');
    return this.prisma.galleryAsset.findUniqueOrThrow({ where: { id } });
  }

  listSiteDrafts() {
    return this.prisma.siteContent.findMany({
      orderBy: { sectionKey: 'asc' },
      take: 100,
    });
  }

  async saveSiteDraft(dto: SiteDraftDto) {
    const title = dto.title.trim();
    const body = dto.body.trim();
    if (!title || !body)
      throw new BadRequestException('Title and body cannot be blank');
    // Editorial drafts stay private. Saving is not a business fact verification.
    const data = {
      title,
      subtitle: dto.subtitle?.trim() || null,
      body,
      isPublished: false,
      metadata: {
        confidence: 'UNVERIFIED',
        sourceReference: dto.sourceReference?.trim() || null,
      },
    };
    const existing = await this.prisma.siteContent.findUnique({
      where: { sectionKey: dto.sectionKey },
      select: { id: true },
    });
    if (!existing) {
      try {
        return await this.prisma.siteContent.create({
          data: { sectionKey: dto.sectionKey, ...data },
        });
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          Reflect.get(error, 'code') === 'P2002'
        ) {
          throw new ConflictException(
            'This section was created by another editor. Reload before editing.',
          );
        }
        throw error;
      }
    }
    if (!dto.updatedAt)
      throw new ConflictException('Reload the saved section before editing');
    const result = await this.prisma.siteContent.updateMany({
      where: { id: existing.id, updatedAt: new Date(dto.updatedAt) },
      data,
    });
    if (!result.count)
      throw new ConflictException(
        'This section changed. Reload before editing.',
      );
    const saved = await this.prisma.siteContent.findUnique({
      where: { id: existing.id },
    });
    if (!saved) throw new NotFoundException('Section not found');
    return saved;
  }
}
