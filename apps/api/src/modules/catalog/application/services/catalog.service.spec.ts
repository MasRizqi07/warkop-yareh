import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { ProductPublicationStatus } from '@warkop-yareh/database';

describe('CatalogService', () => {
  let service: CatalogService;
  let mockCatalogRepo: {
    getFullCatalog: jest.Mock;
    listCategories: jest.Mock;
    listProducts: jest.Mock;
    getProduct: jest.Mock;
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    toggleAvailability: jest.Mock;
    getDefaultBranchId: jest.Mock;
    branchExists: jest.Mock;
    categoryExists: jest.Mock;
    productExists: jest.Mock;
    listBranchProducts: jest.Mock;
    getBranchProduct: jest.Mock;
    updateBranchProduct: jest.Mock;
    getAdminProduct: jest.Mock;
    listAdminProducts: jest.Mock;
    listAdminCategories: jest.Mock;
    createCategory: jest.Mock;
    createMenuEvidence: jest.Mock;
    isVerifiedSource: jest.Mock;
    countAvailableBranches: jest.Mock;
    setPublicationStatus: jest.Mock;
  };
  let mockRedisService: {
    getJson: jest.Mock;
    setJson: jest.Mock;
    del: jest.Mock;
    delPattern: jest.Mock;
  };

  beforeEach(async () => {
    mockCatalogRepo = {
      getFullCatalog: jest.fn(),
      listCategories: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      toggleAvailability: jest.fn(),
      getDefaultBranchId: jest.fn().mockResolvedValue('branch-gubeng'),
      branchExists: jest.fn().mockResolvedValue(true),
      categoryExists: jest.fn().mockResolvedValue(true),
      productExists: jest.fn().mockResolvedValue(true),
      listBranchProducts: jest.fn(),
      getBranchProduct: jest.fn().mockResolvedValue(null),
      updateBranchProduct: jest.fn(),
      getAdminProduct: jest.fn(),
      listAdminProducts: jest.fn(),
      listAdminCategories: jest.fn(),
      createCategory: jest.fn(),
      createMenuEvidence: jest.fn(),
      isVerifiedSource: jest.fn(),
      countAvailableBranches: jest.fn(),
      setPublicationStatus: jest.fn(),
    };

    mockRedisService = {
      getJson: jest.fn(),
      setJson: jest.fn().mockResolvedValue('OK'),
      del: jest.fn(),
      delPattern: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: 'ICatalogRepository', useValue: mockCatalogRepo },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  describe('getFullCatalog', () => {
    it('should return cached catalog on cache hit without querying DB', async () => {
      const cachedCatalog = { categories: [], products: [] };
      mockRedisService.getJson.mockResolvedValue(cachedCatalog);

      const result = await service.getFullCatalog('branch-gubeng');

      expect(result).toEqual(cachedCatalog);
      expect(mockRedisService.getJson).toHaveBeenCalledWith(
        'catalog:full:branch-gubeng',
      );
      expect(mockCatalogRepo.getFullCatalog).not.toHaveBeenCalled();
    });

    it('should fetch from DB and update Redis cache on cache miss', async () => {
      mockRedisService.getJson.mockResolvedValue(null);
      const dbCatalog = { categories: [], products: [] };
      mockCatalogRepo.getFullCatalog.mockResolvedValue(dbCatalog);

      const result = await service.getFullCatalog('branch-gubeng');

      expect(result).toEqual(dbCatalog);
      expect(mockCatalogRepo.getFullCatalog).toHaveBeenCalledWith(
        'branch-gubeng',
      );
      expect(mockRedisService.setJson).toHaveBeenCalledWith(
        'catalog:full:branch-gubeng',
        dbCatalog,
        300,
      );
    });

    it('branch isolation: branch A catalog prices override base prices and do not leak to branch B', async () => {
      mockRedisService.getJson.mockResolvedValue(null);

      const branchACatalog = {
        categories: [],
        products: [{ id: 'prod-kopi', name: 'Kopi Susu', price: 18000 }],
      };
      const branchBCatalog = {
        categories: [],
        products: [{ id: 'prod-kopi', name: 'Kopi Susu', price: 15000 }],
      };

      mockCatalogRepo.getFullCatalog
        .mockResolvedValueOnce(branchACatalog)
        .mockResolvedValueOnce(branchBCatalog);

      const resBranchA = await service.getFullCatalog('branch-A');
      const resBranchB = await service.getFullCatalog('branch-B');

      expect(resBranchA.products[0].price).toBe(18000);
      expect(resBranchB.products[0].price).toBe(15000);
    });
  });

  describe('toggleAvailability', () => {
    it('should update branch product availability', async () => {
      mockCatalogRepo.toggleAvailability.mockResolvedValue({
        branchId: 'branch-1',
        productId: 'prod-1',
        isAvailable: false,
      });

      const result = await service.toggleAvailability(
        'branch-1',
        'prod-1',
        false,
      );

      expect(result.isAvailable).toBe(false);
      expect(mockCatalogRepo.toggleAvailability).toHaveBeenCalledWith(
        'branch-1',
        'prod-1',
        false,
      );
      expect(mockRedisService.delPattern).toHaveBeenCalledWith(
        'catalog:full:*',
      );
    });
  });

  describe('verified publication workflow', () => {
    const product = {
      id: 'product-1',
      name: 'Menu terverifikasi',
      price: 18000,
      isActive: true,
      category: { isActive: true },
      sourceReferenceId: 'source-1',
      publicationStatus: ProductPublicationStatus.REVIEW,
    };

    it('rejects verification without a matching menu source', async () => {
      mockCatalogRepo.getAdminProduct.mockResolvedValue(product);
      mockCatalogRepo.isVerifiedSource.mockResolvedValue(false);
      await expect(
        service.transitionProduct(
          'product-1',
          ProductPublicationStatus.VERIFIED,
          'admin-1',
          'unrelated-source',
        ),
      ).rejects.toThrow('Verified menu source reference is required');
      expect(mockCatalogRepo.setPublicationStatus).not.toHaveBeenCalled();
    });

    it('records verification actor and timestamp for sourced menu', async () => {
      mockCatalogRepo.getAdminProduct.mockResolvedValue(product);
      mockCatalogRepo.isVerifiedSource.mockResolvedValue(true);
      mockCatalogRepo.setPublicationStatus.mockResolvedValue({
        ...product,
        publicationStatus: ProductPublicationStatus.VERIFIED,
      });
      await service.transitionProduct(
        'product-1',
        ProductPublicationStatus.VERIFIED,
        'admin-1',
        'source-1',
      );
      expect(mockCatalogRepo.isVerifiedSource).toHaveBeenCalledWith(
        'source-1',
        'product-1',
      );
      expect(mockCatalogRepo.setPublicationStatus).toHaveBeenCalledWith(
        'product-1',
        ProductPublicationStatus.REVIEW,
        expect.objectContaining({
          publicationStatus: ProductPublicationStatus.VERIFIED,
          verifiedById: 'admin-1',
          verifiedAt: expect.any(Date),
        }),
      );
    });

    it('keeps a verified product private until a branch offers it', async () => {
      mockCatalogRepo.getAdminProduct.mockResolvedValue({
        ...product,
        publicationStatus: ProductPublicationStatus.VERIFIED,
      });
      mockCatalogRepo.isVerifiedSource.mockResolvedValue(true);
      mockCatalogRepo.countAvailableBranches.mockResolvedValue(0);
      await expect(
        service.transitionProduct(
          'product-1',
          ProductPublicationStatus.PUBLISHED,
          'admin-1',
        ),
      ).rejects.toThrow('At least one active branch');
      expect(mockCatalogRepo.setPublicationStatus).not.toHaveBeenCalled();
    });

    it('publishes only sourced and available product, then invalidates all catalog caches', async () => {
      mockCatalogRepo.getAdminProduct.mockResolvedValue({
        ...product,
        publicationStatus: ProductPublicationStatus.VERIFIED,
      });
      mockCatalogRepo.isVerifiedSource.mockResolvedValue(true);
      mockCatalogRepo.countAvailableBranches.mockResolvedValue(1);
      mockCatalogRepo.setPublicationStatus.mockResolvedValue({
        ...product,
        publicationStatus: ProductPublicationStatus.PUBLISHED,
      });
      await service.transitionProduct(
        'product-1',
        ProductPublicationStatus.PUBLISHED,
        'admin-1',
      );
      expect(mockCatalogRepo.setPublicationStatus).toHaveBeenCalledWith(
        'product-1',
        ProductPublicationStatus.VERIFIED,
        expect.objectContaining({
          publicationStatus: ProductPublicationStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
      );
      expect(mockRedisService.delPattern).toHaveBeenCalledWith(
        'catalog:full:*',
      );
    });
  });

  describe('updateBranchProduct', () => {
    it('persists normalized inventory telemetry and invalidates branch cache', async () => {
      mockCatalogRepo.updateBranchProduct.mockResolvedValue({
        branchId: 'branch-1',
        productId: 'prod-1',
        stockQuantity: 12,
      });

      await service.updateBranchProduct('branch-1', 'prod-1', {
        stockQuantity: 12,
        stockUnit: ' kg ',
        supplier: ' Gayo Cooperative ',
      });

      expect(mockCatalogRepo.updateBranchProduct).toHaveBeenCalledWith(
        'branch-1',
        'prod-1',
        expect.objectContaining({
          stockQuantity: 12,
          stockUnit: 'kg',
          supplier: 'Gayo Cooperative',
          inventoryUpdatedAt: expect.any(Date),
        }),
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(
        'catalog:full:branch-1',
      );
    });

    it('rejects a stock threshold above the persisted capacity', async () => {
      mockCatalogRepo.getBranchProduct.mockResolvedValue({
        stockCapacity: { toNumber: () => 100 },
        stockThreshold: { toNumber: () => 10 },
      });

      await expect(
        service.updateBranchProduct('branch-1', 'prod-1', {
          stockThreshold: 101,
        }),
      ).rejects.toThrow('Stock threshold cannot exceed capacity');
      expect(mockCatalogRepo.updateBranchProduct).not.toHaveBeenCalled();
    });

    it('allows an explicit null threshold to clear persisted inventory limits', async () => {
      mockCatalogRepo.getBranchProduct.mockResolvedValue({
        stockCapacity: { toNumber: () => 5 },
        stockThreshold: { toNumber: () => 10 },
      });
      mockCatalogRepo.updateBranchProduct.mockResolvedValue({
        branchId: 'branch-1',
        productId: 'prod-1',
        stockCapacity: 5,
        stockThreshold: null,
      });

      await expect(
        service.updateBranchProduct('branch-1', 'prod-1', {
          stockCapacity: 5,
          stockThreshold: null,
        }),
      ).resolves.toEqual(expect.objectContaining({ stockThreshold: null }));

      expect(mockCatalogRepo.updateBranchProduct).toHaveBeenCalledWith(
        'branch-1',
        'prod-1',
        expect.objectContaining({
          stockCapacity: 5,
          stockThreshold: null,
        }),
      );
    });
  });
});
