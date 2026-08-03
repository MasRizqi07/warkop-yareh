import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      order: {
        findMany: jest.fn(),
      },
      orderItem: {
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
      mockPrisma.order.findMany.mockResolvedValue([
        { total: 50000, createdAt: new Date() },
        { total: 100000, createdAt: new Date() },
      ]);

      const res = await service.getRevenueStats('branch-1');

      expect(res.totalRevenue).toBe(150000);
      expect(res.orderCount).toBe(2);
      expect(res.averageOrderValue).toBe(75000);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-1', status: 'COMPLETED' },
        select: expect.any(Object),
      });
    });

    it('should return 0 averageOrderValue when zero completed orders exist (no division by zero)', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);

      const res = await service.getRevenueStats();

      expect(res.totalRevenue).toBe(0);
      expect(res.orderCount).toBe(0);
      expect(res.averageOrderValue).toBe(0);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' },
        select: expect.any(Object),
      });
    });
  });

  describe('getCategoryPerformance', () => {
    it('should aggregate category units sold and revenue for completed orders', async () => {
      mockPrisma.orderItem.findMany.mockResolvedValue([
        {
          quantity: 2,
          snapshotPrice: 15000,
          product: { category: { name: 'Kopi' } },
        },
        {
          quantity: 1,
          snapshotPrice: 20000,
          product: { category: { name: 'Makanan' } },
        },
        {
          quantity: 3,
          snapshotPrice: 15000,
          product: { category: { name: 'Kopi' } },
        },
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

      expect(mockPrisma.orderItem.findMany).toHaveBeenCalledWith({
        where: { order: { branchId: 'branch-1', status: 'COMPLETED' } },
        include: expect.any(Object),
      });
    });
  });
});
