import { Injectable } from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import {
  CatalogProduct,
  CreateCatalogProductInput,
  ICatalogRepository,
  UpdateCatalogProductInput,
} from '../../domain/repositories/catalog.repository.interface';

@Injectable()
export class PrismaCatalogRepository implements ICatalogRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async getDefaultBranchId(): Promise<string | null> {
    const branch = await this.prisma.branch.findFirst({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ isMainBranch: 'desc' }, { createdAt: 'asc' }],
      select: { id: true },
    });
    return branch?.id ?? null;
  }

  async branchExists(branchId: string): Promise<boolean> {
    return Boolean(
      await this.prisma.branch.findFirst({
        where: { id: branchId, isActive: true, deletedAt: null },
        select: { id: true },
      }),
    );
  }

  async categoryExists(categoryId: string): Promise<boolean> {
    return Boolean(
      await this.prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true },
      }),
    );
  }

  async productExists(productId: string): Promise<boolean> {
    return Boolean(
      await this.prisma.product.findFirst({
        where: { id: productId, isActive: true, deletedAt: null },
        select: { id: true },
      }),
    );
  }

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
          branchProducts: {
            where: { branchId },
            select: { priceOverride: true },
          },
        },
        orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
      }),
    ]);
    return {
      categories,
      products: products.map((product) => this.toCatalogProduct(product)),
    };
  }

  async listBranchProducts(branchId?: string) {
    return this.prisma.branchProduct.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        product: { include: { category: true } },
        branch: true,
      },
      orderBy: [{ branchId: 'asc' }, { product: { name: 'asc' } }],
    });
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
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(branchId
        ? {
            branchProducts: {
              some: {
                branchId,
                isAvailable: true,
              },
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          customizations: true,
          branchProducts: {
            where: branchId ? { branchId } : { id: '__none__' },
            select: { priceOverride: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isPopular: 'desc' }, { sortOrder: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      data: data.map((product) => this.toCatalogProduct(product)),
      total,
    };
  }

  async getProduct(id: string) {
    return this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        customizations: true,
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async createProduct(data: CreateCatalogProductInput) {
    return this.prisma.product.create({
      data,
      include: { category: true, customizations: true, reviews: true },
    });
  }

  async updateProduct(id: string, data: UpdateCatalogProductInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, customizations: true, reviews: true },
    });
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
      include: {
        product: { include: { category: true } },
        branch: true,
      },
    });
  }

  private toCatalogProduct(
    product: Prisma.ProductGetPayload<{
      include: {
        category: true;
        customizations: true;
        branchProducts: { select: { priceOverride: true } };
      };
    }>,
  ): CatalogProduct {
    const { branchProducts, ...baseProduct } = product;
    const priceOverride = branchProducts[0]?.priceOverride ?? null;
    return {
      ...baseProduct,
      basePrice: baseProduct.price,
      price: priceOverride ?? baseProduct.price,
      priceOverride,
    };
  }
}
