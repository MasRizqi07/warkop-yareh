import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ProductPublicationStatus } from '@warkop-yareh/database';
import type { SourceType } from '@warkop-yareh/database';
import type {
  FullCatalog,
  ICatalogRepository,
  UpdateCatalogProductInput,
  UpdateBranchProductInput,
} from '../../domain/repositories/catalog.repository.interface';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @Inject('ICatalogRepository')
    private readonly catalogRepo: ICatalogRepository,
    private readonly redis: RedisService,
  ) {}

  async getFullCatalog(branchId?: string) {
    const resolvedBranchId =
      branchId ?? (await this.catalogRepo.getDefaultBranchId());
    if (!resolvedBranchId) {
      throw new NotFoundException('No active branch is available');
    }
    if (!(await this.catalogRepo.branchExists(resolvedBranchId))) {
      throw new NotFoundException('Branch not found');
    }
    const cacheKey = `catalog:full:${resolvedBranchId}`;

    // Check Redis cache first
    const cached = await this.redis.getJson<FullCatalog>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for ${cacheKey}. Fetching from DB...`);
    const result = await this.catalogRepo.getFullCatalog(resolvedBranchId);

    // Cache for 5 minutes (300 seconds)
    await this.redis.setJson(cacheKey, result, 300);

    return result;
  }

  async listCategories() {
    return this.catalogRepo.listCategories();
  }

  async listAdminProducts() {
    return this.catalogRepo.listAdminProducts();
  }

  async listAdminCategories() {
    return this.catalogRepo.listAdminCategories();
  }

  async replaceCustomizations(
    productId: string,
    groups: Array<{
      name: string;
      options: Array<{ label: string; price: number }>;
    }>,
  ) {
    if (!(await this.catalogRepo.getAdminProduct(productId)))
      throw new NotFoundException('Product not found');
    const names = groups.map((group) =>
      group.name.trim().toLocaleLowerCase('id-ID'),
    );
    if (new Set(names).size !== names.length)
      throw new BadRequestException('Customization group names must be unique');
    const normalized = groups.map((group) => ({
      name: group.name.trim(),
      options: group.options.map((option) => ({
        label: option.label.trim(),
        price: option.price,
      })),
    }));
    for (const group of normalized) {
      const labels = group.options.map((option) =>
        option.label.toLocaleLowerCase('id-ID'),
      );
      if (new Set(labels).size !== labels.length)
        throw new BadRequestException(
          'Customization option labels must be unique',
        );
    }
    const product = await this.catalogRepo.replaceCustomizations(
      productId,
      normalized,
    );
    await this.redis.delPattern('catalog:full:*');
    return product;
  }

  async createCategory(name: string) {
    const cleanName = name.trim();
    const slugBase =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'category';
    return this.catalogRepo.createCategory({
      name: cleanName,
      slug: `${slugBase}-${randomBytes(3).toString('hex')}`,
    });
  }

  async createMenuEvidence(
    productId: string,
    actorId: string,
    evidence: {
      sourceType: SourceType;
      sourceName: string;
      referenceUrl?: string;
      rawExcerpt?: string;
      capturedAt: string;
    },
  ) {
    const product = await this.catalogRepo.getAdminProduct(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.publicationStatus !== ProductPublicationStatus.REVIEW) {
      throw new BadRequestException(
        'Product must be in review before recording evidence',
      );
    }
    if (!evidence.referenceUrl?.trim() && !evidence.rawExcerpt?.trim()) {
      throw new BadRequestException('Evidence URL or excerpt is required');
    }
    if (evidence.referenceUrl?.trim()) {
      try {
        if (new URL(evidence.referenceUrl).protocol !== 'https:')
          throw new Error('HTTPS required');
      } catch {
        throw new BadRequestException('Evidence URL must be a valid HTTPS URL');
      }
    }
    const capturedAt = new Date(evidence.capturedAt);
    if (
      Number.isNaN(capturedAt.getTime()) ||
      capturedAt.getTime() > Date.now()
    ) {
      throw new BadRequestException('Evidence capture date is invalid');
    }
    return this.catalogRepo.createMenuEvidence({
      productId,
      sourceType: evidence.sourceType,
      sourceName: evidence.sourceName.trim(),
      referenceUrl: evidence.referenceUrl?.trim() || undefined,
      rawExcerpt: evidence.rawExcerpt?.trim() || undefined,
      capturedAt,
      actorId,
    });
  }

  async transitionProduct(
    id: string,
    status: ProductPublicationStatus,
    actorId: string,
    sourceReferenceId?: string,
  ) {
    const product = await this.catalogRepo.getAdminProduct(id);
    if (!product) throw new NotFoundException('Product not found');
    const allowed: Record<
      ProductPublicationStatus,
      ProductPublicationStatus[]
    > = {
      DRAFT: [
        ProductPublicationStatus.REVIEW,
        ProductPublicationStatus.ARCHIVED,
      ],
      REVIEW: [
        ProductPublicationStatus.DRAFT,
        ProductPublicationStatus.VERIFIED,
      ],
      VERIFIED: [
        ProductPublicationStatus.REVIEW,
        ProductPublicationStatus.PUBLISHED,
        ProductPublicationStatus.ARCHIVED,
      ],
      PUBLISHED: [
        ProductPublicationStatus.ARCHIVED,
        ProductPublicationStatus.REVIEW,
      ],
      ARCHIVED: [ProductPublicationStatus.DRAFT],
    };
    if (!allowed[product.publicationStatus].includes(status)) {
      throw new BadRequestException(
        `Cannot transition ${product.publicationStatus} to ${status}`,
      );
    }
    let sourceId = product.sourceReferenceId;
    if (status === ProductPublicationStatus.VERIFIED) {
      sourceId = sourceReferenceId?.trim() || null;
      if (
        !sourceId ||
        !(await this.catalogRepo.isVerifiedSource(sourceId, id))
      ) {
        throw new BadRequestException(
          'Verified menu source reference is required',
        );
      }
    }
    if (status === ProductPublicationStatus.PUBLISHED) {
      if (
        !product.isActive ||
        !product.category.isActive ||
        product.price < 0 ||
        !sourceId ||
        !(await this.catalogRepo.isVerifiedSource(sourceId, id))
      ) {
        throw new BadRequestException(
          'Product and verified source must be active before publication',
        );
      }
      if ((await this.catalogRepo.countAvailableBranches(id)) === 0) {
        throw new BadRequestException(
          'At least one active branch must offer this product',
        );
      }
    }
    const result = await this.catalogRepo.setPublicationStatus(
      id,
      product.publicationStatus,
      {
        publicationStatus: status,
        ...(status === ProductPublicationStatus.VERIFIED
          ? {
              sourceReferenceId: sourceId,
              verifiedAt: new Date(),
              verifiedById: actorId,
            }
          : {}),
        ...(status === ProductPublicationStatus.PUBLISHED
          ? { publishedAt: new Date() }
          : {}),
        ...(status === ProductPublicationStatus.DRAFT ||
        status === ProductPublicationStatus.REVIEW ||
        status === ProductPublicationStatus.ARCHIVED
          ? { publishedAt: null }
          : {}),
      },
    );
    if (!result)
      throw new ConflictException(
        'Product changed during publication; reload and review again',
      );
    await this.redis.delPattern('catalog:full:*');
    return result;
  }

  async listProducts(params: {
    categoryId?: string;
    branchId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    return this.catalogRepo.listProducts(params);
  }

  async getProduct(id: string) {
    const product = await this.catalogRepo.getProduct(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async listBranchProducts(branchId?: string) {
    if (branchId && !(await this.catalogRepo.branchExists(branchId))) {
      throw new NotFoundException('Branch not found');
    }
    return this.catalogRepo.listBranchProducts(branchId);
  }

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    image?: string;
  }) {
    if (!(await this.catalogRepo.categoryExists(data.categoryId))) {
      throw new BadRequestException('Category is not active');
    }
    const image = this.normalizeImage(data.image);
    const slugBase =
      data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'product';
    const product = await this.catalogRepo.createProduct({
      name: data.name.trim(),
      slug: `${slugBase}-${randomBytes(4).toString('hex')}`,
      description: data.description?.trim() ?? '',
      price: data.price,
      categoryId: data.categoryId,
      image,
    });
    await this.redis.delPattern('catalog:full:*');
    return product;
  }

  async updateProduct(id: string, data: UpdateCatalogProductInput) {
    if (!(await this.catalogRepo.productExists(id))) {
      throw new NotFoundException('Product not found');
    }
    if (
      data.categoryId &&
      !(await this.catalogRepo.categoryExists(data.categoryId))
    ) {
      throw new BadRequestException('Category is not active');
    }
    const update: UpdateCatalogProductInput = {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() }
        : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.image !== undefined
        ? { image: this.normalizeImage(data.image) }
        : {}),
    };
    if (Object.keys(update).length === 0) {
      throw new BadRequestException('At least one product field is required');
    }
    const product = await this.catalogRepo.updateProduct(id, update);
    await this.redis.delPattern('catalog:full:*');
    return product;
  }

  async toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ) {
    const [branchExists, productExists] = await Promise.all([
      this.catalogRepo.branchExists(branchId),
      this.catalogRepo.productExists(productId),
    ]);
    if (!branchExists) throw new NotFoundException('Branch not found');
    if (!productExists) throw new NotFoundException('Product not found');
    const result = await this.catalogRepo.toggleAvailability(
      branchId,
      productId,
      isAvailable,
    );
    await this.redis.delPattern('catalog:full:*');
    return result;
  }

  async updateBranchProduct(
    branchId: string,
    productId: string,
    data: Omit<UpdateBranchProductInput, 'inventoryUpdatedAt'>,
  ) {
    const [branchExists, productExists, current] = await Promise.all([
      this.catalogRepo.branchExists(branchId),
      this.catalogRepo.productExists(productId),
      this.catalogRepo.getBranchProduct(branchId, productId),
    ]);
    if (!branchExists) throw new NotFoundException('Branch not found');
    if (!productExists) throw new NotFoundException('Product not found');
    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        'At least one branch product field is required',
      );
    }

    const capacity = Object.prototype.hasOwnProperty.call(data, 'stockCapacity')
      ? data.stockCapacity
      : current?.stockCapacity?.toNumber();
    const threshold = Object.prototype.hasOwnProperty.call(
      data,
      'stockThreshold',
    )
      ? data.stockThreshold
      : current?.stockThreshold?.toNumber();
    if (
      capacity !== null &&
      capacity !== undefined &&
      threshold !== null &&
      threshold !== undefined &&
      threshold > capacity
    ) {
      throw new BadRequestException('Stock threshold cannot exceed capacity');
    }

    const normalized: UpdateBranchProductInput = {
      ...data,
      ...(data.stockUnit !== undefined
        ? { stockUnit: data.stockUnit?.trim() || null }
        : {}),
      ...(data.supplier !== undefined
        ? { supplier: data.supplier?.trim() || null }
        : {}),
      ...(this.hasInventoryField(data)
        ? { inventoryUpdatedAt: new Date() }
        : {}),
    };
    const result = await this.catalogRepo.updateBranchProduct(
      branchId,
      productId,
      normalized,
    );
    if (
      Object.prototype.hasOwnProperty.call(data, 'priceOverride') ||
      Object.prototype.hasOwnProperty.call(data, 'isAvailable')
    ) {
      await this.redis.delPattern('catalog:full:*');
    } else {
      await this.redis.del(`catalog:full:${branchId}`);
    }
    return result;
  }

  private hasInventoryField(
    data: Omit<UpdateBranchProductInput, 'inventoryUpdatedAt'>,
  ) {
    return [
      'stockQuantity',
      'stockCapacity',
      'stockThreshold',
      'stockUnit',
      'supplier',
      'leadTimeHours',
      'burnRatePerDay',
    ].some((field) => Object.prototype.hasOwnProperty.call(data, field));
  }

  private normalizeImage(value: string | null | undefined): string | null {
    if (!value?.trim()) return null;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') throw new Error('HTTPS required');
      return url.href;
    } catch {
      throw new BadRequestException('Product image must be an HTTPS URL');
    }
  }
}
