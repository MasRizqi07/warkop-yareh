import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: DatabaseService) {}

  async getRevenueStats(branchId?: string) {
    const where = branchId
      ? { branchId, status: 'COMPLETED' }
      : { status: 'COMPLETED' };
    const orders = await this.prisma.order.findMany({
      where: where as any,
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum: number, o: { total: number }) => sum + o.total,
      0,
    );
    const count = orders.length;

    return {
      totalRevenue,
      orderCount: count,
      averageOrderValue: count > 0 ? totalRevenue / count : 0,
    };
  }

  async getCategoryPerformance(branchId?: string) {
    const where = branchId
      ? { order: { branchId, status: 'COMPLETED' } }
      : { order: { status: 'COMPLETED' } };
    const items = await this.prisma.orderItem.findMany({
      where: where as any,
      include: {
        product: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    });

    const categoryStats: Record<string, { count: number; revenue: number }> =
      {};
    for (const item of items) {
      const catName = item.product?.category?.name || 'Uncategorized';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { count: 0, revenue: 0 };
      }
      categoryStats[catName].count += item.quantity;
      categoryStats[catName].revenue +=
        item.quantity * (item.snapshotPrice ?? 0);
    }

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      unitsSold: stats.count,
      revenue: stats.revenue,
    }));
  }
}
