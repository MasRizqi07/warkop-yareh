/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { ICatalogRepository } from '../../domain/repositories/catalog.repository.interface';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let mockCatalogRepo: any;
  let mockRedisService: any;

  beforeEach(async () => {
    mockCatalogRepo = {
      getFullCatalog: jest.fn(),
      listCategories: jest.fn(),
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      toggleAvailability: jest.fn(),
    };

    mockRedisService = {
      getJson: jest.fn(),
      setJson: jest.fn().mockResolvedValue('OK'),
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
      const cachedCatalog = [{ id: 'cat-1', name: 'Coffee', products: [] }];
      mockRedisService.getJson.mockResolvedValue(cachedCatalog);

      const result = await service.getFullCatalog('branch-gubeng');

      expect(result).toEqual(cachedCatalog);
      expect(mockRedisService.getJson).toHaveBeenCalledWith('catalog:full:branch-gubeng');
      expect(mockCatalogRepo.getFullCatalog).not.toHaveBeenCalled();
    });

    it('should fetch from DB and update Redis cache on cache miss', async () => {
      mockRedisService.getJson.mockResolvedValue(null);
      const dbCatalog = [{ id: 'cat-1', name: 'Coffee', products: [] }];
      mockCatalogRepo.getFullCatalog.mockResolvedValue(dbCatalog as any);

      const result = await service.getFullCatalog('branch-gubeng');

      expect(result).toEqual(dbCatalog);
      expect(mockCatalogRepo.getFullCatalog).toHaveBeenCalledWith('branch-gubeng');
      expect(mockRedisService.setJson).toHaveBeenCalledWith(
        'catalog:full:branch-gubeng',
        dbCatalog,
        300,
      );
    });

    it('branch isolation: branch A catalog prices override base prices and do not leak to branch B', async () => {
      mockRedisService.getJson.mockResolvedValue(null);

      const branchACatalog = [
        {
          id: 'cat-1',
          products: [{ id: 'prod-kopi', name: 'Kopi Susu', price: 18000 }], // Branch A price override
        },
      ];
      const branchBCatalog = [
        {
          id: 'cat-1',
          products: [{ id: 'prod-kopi', name: 'Kopi Susu', price: 15000 }], // Branch B base price
        },
      ];

      mockCatalogRepo.getFullCatalog
        .mockResolvedValueOnce(branchACatalog as any)
        .mockResolvedValueOnce(branchBCatalog as any);

      const resBranchA = await service.getFullCatalog('branch-A');
      const resBranchB = await service.getFullCatalog('branch-B');

      expect(resBranchA[0].products[0].price).toBe(18000);
      expect(resBranchB[0].products[0].price).toBe(15000);
    });
  });

  describe('toggleAvailability', () => {
    it('should update branch product availability', async () => {
      mockCatalogRepo.toggleAvailability.mockResolvedValue({
        branchId: 'branch-1',
        productId: 'prod-1',
        isAvailable: false,
      } as any);

      const result = await service.toggleAvailability('branch-1', 'prod-1', false);

      expect(result.isAvailable).toBe(false);
      expect(mockCatalogRepo.toggleAvailability).toHaveBeenCalledWith('branch-1', 'prod-1', false);
    });
  });
});
