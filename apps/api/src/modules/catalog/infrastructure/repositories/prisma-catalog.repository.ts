import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ProductPublicationStatus,
  FactConfidence,
  SourceType,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import {
  CatalogProduct,
  CreateCatalogProductInput,
  ICatalogRepository,
  UpdateCatalogProductInput,
  UpdateBranchProductInput,
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
        where: {
          isActive: true,
          products: {
            some: {
              isActive: true,
              deletedAt: null,
              publicationStatus: ProductPublicationStatus.PUBLISHED,
              branchProducts: { some: { branchId, isAvailable: true } },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          publicationStatus: ProductPublicationStatus.PUBLISHED,
          category: { isActive: true },
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

  async getBranchProduct(branchId: string, productId: string) {
    return this.prisma.branchProduct.findUnique({
      where: { branchId_productId: { branchId, productId } },
      include: {
        product: { include: { category: true } },
        branch: true,
      },
    });
  }

  async listCategories() {
    return this.prisma.category.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            isActive: true,
            deletedAt: null,
            publicationStatus: ProductPublicationStatus.PUBLISHED,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listAdminCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createCategory(data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }

  async createMenuEvidence(data: {
    productId: string;
    sourceType: SourceType;
    sourceName: string;
    referenceUrl?: string;
    rawExcerpt?: string;
    capturedAt: Date;
    actorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const snapshot = await this.menuSnapshot(tx, data.productId);
      const fact = await tx.businessFact.upsert({
        where: {
          domain_entityKey: { domain: 'menu', entityKey: data.productId },
        },
        create: {
          domain: 'menu',
          entityKey: data.productId,
          claim: `Menu identity, price and branch availability verified for ${snapshot.name}`,
          value: JSON.stringify(snapshot),
          confidence: FactConfidence.VERIFIED,
          capturedAt: data.capturedAt,
          lastVerifiedAt: new Date(),
        },
        update: {
          claim: `Menu identity, price and branch availability verified for ${snapshot.name}`,
          value: JSON.stringify(snapshot),
          confidence: FactConfidence.VERIFIED,
          capturedAt: data.capturedAt,
          lastVerifiedAt: new Date(),
        },
      });
      return tx.sourceReference.create({
        data: {
          factId: fact.id,
          sourceType: data.sourceType,
          name: data.sourceName,
          referenceUrl: data.referenceUrl,
          rawExcerpt: data.rawExcerpt,
          capturedAt: data.capturedAt,
          verifiedBy: data.actorId,
        },
      });
    });
  }

  async replaceCustomizations(
    productId: string,
    groups: Array<{
      name: string;
      options: Array<{ label: string; price: number }>;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.productCustomization.deleteMany({ where: { productId } });
      for (const group of groups) {
        await tx.productCustomization.create({
          data: { productId, name: group.name, options: group.options },
        });
      }
      return tx.product.update({
        where: { id: productId },
        data: {
          publicationStatus: ProductPublicationStatus.DRAFT,
          sourceReferenceId: null,
          verifiedAt: null,
          verifiedById: null,
          publishedAt: null,
        },
        include: { category: true, customizations: true, reviews: true },
      });
    });
  }

  async listAdminProducts() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true, customizations: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAdminProduct(id: string) {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, customizations: true },
    });
  }

  async isVerifiedSource(sourceReferenceId: string, productId: string) {
    const source = await this.prisma.sourceReference.findFirst({
      where: {
        id: sourceReferenceId,
        fact: {
          confidence: FactConfidence.VERIFIED,
          domain: 'menu',
          entityKey: productId,
        },
      },
      select: { fact: { select: { value: true } } },
    });
    if (!source) return false;
    return (
      source.fact.value ===
      JSON.stringify(await this.menuSnapshot(this.prisma, productId))
    );
  }

  private async menuSnapshot(
    client: Prisma.TransactionClient | DatabaseService,
    productId: string,
  ) {
    const product = await client.product.findUniqueOrThrow({
      where: { id: productId },
      select: {
        name: true,
        price: true,
        image: true,
        categoryId: true,
        branchProducts: {
          where: { isAvailable: true },
          select: { branchId: true, priceOverride: true },
          orderBy: { branchId: 'asc' },
        },
      },
    });
    return product;
  }

  async countAvailableBranches(productId: string) {
    return this.prisma.branchProduct.count({
      where: {
        productId,
        isAvailable: true,
        branch: { isActive: true, deletedAt: null },
      },
    });
  }

  async setPublicationStatus(
    id: string,
    expectedStatus: ProductPublicationStatus,
    data: {
      publicationStatus: ProductPublicationStatus;
      sourceReferenceId?: string | null;
      verifiedAt?: Date | null;
      verifiedById?: string | null;
      publishedAt?: Date | null;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.product.updateMany({
        where: { id, publicationStatus: expectedStatus },
        data,
      });
      if (changed.count !== 1) return null;
      return tx.product.findUniqueOrThrow({
        where: { id },
        include: { category: true, customizations: true, reviews: true },
      });
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
      publicationStatus: ProductPublicationStatus.PUBLISHED,
      category: { isActive: true },
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
      where: {
        id,
        deletedAt: null,
        isActive: true,
        publicationStatus: ProductPublicationStatus.PUBLISHED,
        category: { isActive: true },
      },
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
      data: {
        ...data,
        publicationStatus: ProductPublicationStatus.DRAFT,
        sourceReferenceId: null,
        verifiedAt: null,
        verifiedById: null,
        publishedAt: null,
      },
      include: { category: true, customizations: true, reviews: true },
    });
  }

  async toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.branchProduct.upsert({
        where: { branchId_productId: { branchId, productId } },
        update: { isAvailable },
        create: { branchId, productId, isAvailable },
        include: {
          product: { include: { category: true } },
          branch: true,
        },
      });
      await tx.product.update({
        where: { id: productId },
        data: {
          publicationStatus: ProductPublicationStatus.DRAFT,
          sourceReferenceId: null,
          verifiedAt: null,
          verifiedById: null,
          publishedAt: null,
        },
      });
      return result;
    });
  }

  async updateBranchProduct(
    branchId: string,
    productId: string,
    data: UpdateBranchProductInput,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.branchProduct.upsert({
        where: { branchId_productId: { branchId, productId } },
        update: data,
        create: { branchId, productId, ...data },
        include: {
          product: { include: { category: true } },
          branch: true,
        },
      });
      if (
        Object.prototype.hasOwnProperty.call(data, 'priceOverride') ||
        Object.prototype.hasOwnProperty.call(data, 'isAvailable')
      ) {
        await tx.product.update({
          where: { id: productId },
          data: {
            publicationStatus: ProductPublicationStatus.DRAFT,
            sourceReferenceId: null,
            verifiedAt: null,
            verifiedById: null,
            publishedAt: null,
          },
        });
      }
      return result;
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
