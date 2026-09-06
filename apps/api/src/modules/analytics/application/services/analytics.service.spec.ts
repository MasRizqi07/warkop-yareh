import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      order: {
        aggregate: jest.fn(),
      },
      orderItem: {
        groupBy: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getRevenueStats', () => {
    it('should calculate sum, count, and average order value for completed orders', async () => {
      mockPrisma.order.aggregate.mockResolvedValue({
        _sum: { total: 150000 },
        _count: { _all: 2 },
      });

      const res = await service.getRevenueStats('branch-1');

      expect(res.totalRevenue).toBe(150000);
      expect(res.orderCount).toBe(2);
      expect(res.averageOrderValue).toBe(75000);
      expect(mockPrisma.order.aggregate).toHaveBeenCalledWith({
        where: {
          branchId: 'branch-1',
          status: 'COMPLETED',
          deletedAt: null,
        },
        _sum: { total: true },
        _count: { _all: true },
      });
    });

    it('should return 0 averageOrderValue when zero completed orders exist (no division by zero)', async () => {
      mockPrisma.order.aggregate.mockResolvedValue({
        _sum: { total: null },
        _count: { _all: 0 },
      });

      const res = await service.getRevenueStats();

      expect(res.totalRevenue).toBe(0);
      expect(res.orderCount).toBe(0);
      expect(res.averageOrderValue).toBe(0);
      expect(mockPrisma.order.aggregate).toHaveBeenCalledWith({
        where: { status: 'COMPLETED', deletedAt: null },
        _sum: { total: true },
        _count: { _all: true },
      });
    });
  });

  describe('getCategoryPerformance', () => {
    it('should aggregate category units sold and revenue for completed orders', async () => {
      mockPrisma.orderItem.groupBy.mockResolvedValue([
        {
          productId: 'kopi-1',
          _sum: { quantity: 2, totalPrice: 30000 },
        },
        {
          productId: 'food-1',
          _sum: { quantity: 1, totalPrice: 20000 },
        },
        {
          productId: 'kopi-2',
          _sum: { quantity: 3, totalPrice: 45000 },
        },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'kopi-1', category: { name: 'Kopi' } },
        { id: 'food-1', category: { name: 'Makanan' } },
        { id: 'kopi-2', category: { name: 'Kopi' } },
      ]);

      const stats = await service.getCategoryPerformance('branch-1');

      expect(stats).toHaveLength(2);

      const kopiStat = stats.find((s) => s.category === 'Kopi');
      expect(kopiStat).toEqual({
        category: 'Kopi',
        unitsSold: 5,
        revenue: 75000, // (2*15000) + (3*15000)
      });

      const makananStat = stats.find((s) => s.category === 'Makanan');
      expect(makananStat).toEqual({
        category: 'Makanan',
        unitsSold: 1,
        revenue: 20000,
      });

      expect(mockPrisma.orderItem.groupBy).toHaveBeenCalledWith({
        by: ['productId'],
        where: {
          order: {
            branchId: 'branch-1',
            status: 'COMPLETED',
            deletedAt: null,
          },
        },
        _sum: { quantity: true, totalPrice: true },
      });
    });
  });
});
