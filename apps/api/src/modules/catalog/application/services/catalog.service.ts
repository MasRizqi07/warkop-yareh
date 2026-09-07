import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
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
  }) {
    if (!(await this.catalogRepo.categoryExists(data.categoryId))) {
      throw new BadRequestException('Category is not active');
    }
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
    await this.redis.del(`catalog:full:${branchId}`);
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
    await this.redis.del(`catalog:full:${branchId}`);
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
}
