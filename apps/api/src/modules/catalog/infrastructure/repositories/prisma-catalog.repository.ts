import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';

@Injectable()
export class PrismaCatalogRepository implements ICatalogRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async getFullCatalog(branchId: string) {
    const [categories, products] = await Promise.all([
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.findMany({
        where: {
          isActive: true,
          branchProducts: {
            some: {
              branchId,
              isAvailable: true,
            },
          },
        },
        include: {
          category: true,
          customizations: true,
        },
        orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
      }),
    ]);
    return { categories, products };
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listProducts(params: {
    categoryId?: string;
    branchId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { categoryId, branchId, search, page, limit } = params;
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (branchId) {
      where.branchProducts = {
        some: {
          branchId,
          isAvailable: true,
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          customizations: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, total };
  }

  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        customizations: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async createProduct(data: any) {
    return this.prisma.product.create({ data });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ) {
    return this.prisma.branchProduct.upsert({
      where: { branchId_productId: { branchId, productId } },
      update: { isAvailable },
      create: { branchId, productId, isAvailable },
    });
  }
}
