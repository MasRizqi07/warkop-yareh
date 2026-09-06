import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: DatabaseService) {}

  async getRevenueStats(branchId?: string) {
    const where: Prisma.OrderWhereInput = {
      status: OrderStatus.COMPLETED,
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
    };
    const aggregate = await this.prisma.order.aggregate({
      where,
      _sum: { total: true },
      _count: { _all: true },
    });

    const totalRevenue = aggregate._sum.total ?? 0;
    const count = aggregate._count._all;

    return {
      totalRevenue,
      orderCount: count,
      averageOrderValue: count > 0 ? totalRevenue / count : 0,
    };
  }

  async getCategoryPerformance(branchId?: string) {
    const where: Prisma.OrderItemWhereInput = {
      order: {
        status: OrderStatus.COMPLETED,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
    };
    const groupedItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true, totalPrice: true },
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: groupedItems.map((item) => item.productId) } },
      select: { id: true, category: { select: { name: true } } },
    });
    const categoryByProduct = new Map(
      products.map((product) => [product.id, product.category.name]),
    );

    const categoryStats: Record<string, { count: number; revenue: number }> =
      {};
    for (const item of groupedItems) {
      const catName = categoryByProduct.get(item.productId) ?? 'Uncategorized';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { count: 0, revenue: 0 };
      }
      categoryStats[catName].count += item._sum.quantity ?? 0;
      categoryStats[catName].revenue += item._sum.totalPrice ?? 0;
    }

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        unitsSold: stats.count,
        revenue: stats.revenue,
      }))
      .sort((left, right) => right.revenue - left.revenue);
  }
}
