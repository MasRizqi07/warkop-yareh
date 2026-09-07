import type { Category, Prisma } from '@warkop-yareh/database';

type ProductWithCatalogRelations = Prisma.ProductGetPayload<{
  include: { category: true; customizations: true };
}>;

export type CatalogProduct = Omit<ProductWithCatalogRelations, 'price'> & {
  price: number;
  basePrice: number;
  priceOverride: number | null;
};

export type ProductDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    customizations: true;
    reviews: true;
  };
}>;

export type BranchProductDetails = Prisma.BranchProductGetPayload<{
  include: { product: { include: { category: true } }; branch: true };
}>;

export interface FullCatalog {
  categories: Category[];
  products: CatalogProduct[];
}

export interface CreateCatalogProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface UpdateCatalogProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}

export interface UpdateBranchProductInput {
  isAvailable?: boolean;
  priceOverride?: number | null;
  stockQuantity?: number | null;
  stockCapacity?: number | null;
  stockThreshold?: number | null;
  stockUnit?: string | null;
  supplier?: string | null;
  leadTimeHours?: number | null;
  burnRatePerDay?: number | null;
  inventoryUpdatedAt?: Date;
}

export interface ICatalogRepository {
  getDefaultBranchId(): Promise<string | null>;
  branchExists(branchId: string): Promise<boolean>;
  categoryExists(categoryId: string): Promise<boolean>;
  productExists(productId: string): Promise<boolean>;
  getFullCatalog(branchId: string): Promise<FullCatalog>;
  listBranchProducts(branchId?: string): Promise<BranchProductDetails[]>;
  getBranchProduct(
    branchId: string,
    productId: string,
  ): Promise<BranchProductDetails | null>;
  listCategories(): Promise<Category[]>;
  listProducts(params: {
    categoryId?: string;
    branchId?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: CatalogProduct[]; total: number }>;
  getProduct(id: string): Promise<ProductDetails | null>;
  createProduct(data: CreateCatalogProductInput): Promise<ProductDetails>;
  updateProduct(
    id: string,
    data: UpdateCatalogProductInput,
  ): Promise<ProductDetails>;
  toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ): Promise<BranchProductDetails>;
  updateBranchProduct(
    branchId: string,
    productId: string,
    data: UpdateBranchProductInput,
  ): Promise<BranchProductDetails>;
}
