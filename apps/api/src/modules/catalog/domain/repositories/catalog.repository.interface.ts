export interface ICatalogRepository {
  getFullCatalog(branchId: string): Promise<any>;
  listCategories(): Promise<any[]>;
  listProducts(params: {
    categoryId?: string;
    branchId?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number }>;
  getProduct(id: string): Promise<any>;
  createProduct(data: any): Promise<any>;
  updateProduct(id: string, data: any): Promise<any>;
  toggleAvailability(
    branchId: string,
    productId: string,
    isAvailable: boolean,
  ): Promise<any>;
}
