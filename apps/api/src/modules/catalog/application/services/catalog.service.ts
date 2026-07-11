import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @Inject('ICatalogRepository')
    private readonly catalogRepo: ICatalogRepository,
    private readonly redis: RedisService,
  ) {}

  async getFullCatalog(branchId: string = 'coldnbrew-gubeng-001') {
    const cacheKey = `catalog:full:${branchId}`;

    // Check Redis cache first
    const cached = await this.redis.getJson(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for ${cacheKey}. Fetching from DB...`);
    const result = await this.catalogRepo.getFullCatalog(branchId);

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
    return this.catalogRepo.getProduct(id);
  }

  async createProduct(data: any) {
    return this.catalogRepo.createProduct(data);
  }

  async updateProduct(id: string, data: any) {
    return this.catalogRepo.updateProduct(id, data);
  }

  async toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ) {
    return this.catalogRepo.toggleAvailability(
      branchId,
      productId,
      isAvailable,
    );
  }
}
