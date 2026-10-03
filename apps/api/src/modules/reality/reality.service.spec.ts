import { BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { RealityService } from './reality.service';

describe('RealityService publication and persistence safety', () => {
  const gallery = {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  };
  const site = {
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  };
  let service: RealityService;
  const draft = {
    title: 'Venue draft',
    imageUrl: 'https://example.test/photo.jpg',
    provenance: 'UNVERIFIED',
    isVerified: false,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealityService({
      galleryAsset: gallery,
      siteContent: site,
    } as unknown as DatabaseService);
  });
  it('never publishes an unverified or placeholder image', async () => {
    await expect(
      service.saveGallery({ ...draft, isVerified: true }),
    ).rejects.toThrow(BadRequestException);
    expect(gallery.create).not.toHaveBeenCalled();
  });
  it('requires primary evidence and dated verification for a real venue photo', async () => {
    await expect(
      service.saveGallery({
        ...draft,
        provenance: 'VERIFIED_VENUE_PHOTO',
        isVerified: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });
  it('rejects future evidence rather than manufacturing its freshness', async () => {
    await expect(
      service.saveGallery({ ...draft, capturedAt: '2999-01-01' }),
    ).rejects.toThrow(BadRequestException);
  });
  it('keeps drafts private and does not fabricate evidence dates', async () => {
    gallery.create.mockResolvedValue({ id: 'draft' });
    await service.saveGallery(draft);
    expect(gallery.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isVerified: false,
        lastVerifiedAt: null,
        capturedAt: null,
      }),
    });
  });
  it('does not overwrite a concurrently edited gallery record', async () => {
    gallery.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.saveGallery({ ...draft, updatedAt: '2026-01-01' }, 'asset'),
    ).rejects.toThrow(ConflictException);
  });
  it('always stores editorial content as an unverified private draft', async () => {
    site.findUnique.mockResolvedValue(null);
    site.create.mockResolvedValue({ id: 'draft' });
    await service.saveSiteDraft({
      sectionKey: 'homepage.hero',
      title: 'Draft',
      body: 'Draft only',
    });
    expect(site.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isPublished: false,
        metadata: { confidence: 'UNVERIFIED', sourceReference: null },
      }),
    });
  });
  it('hides legacy default-verified, undated, and stale photo rows from public output', async () => {
    gallery.findMany.mockResolvedValue([]);
    await service.listGallery(true);
    expect(gallery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sourceUrl: { not: null },
          capturedAt: { not: null },
          lastVerifiedAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      }),
    );
  });
});
