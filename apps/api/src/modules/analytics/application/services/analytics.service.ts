import { Injectable } from '@nestjs/common';
import {
  MembershipTier,
  OrderStatus,
  Prisma,
  Role,
} from '@warkop-yareh/database';
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

  async getCustomerInsights(params: {
    branchId?: string;
    page: number;
    limit: number;
    search?: string;
  }) {
    const where: Prisma.UserWhereInput = {
      role: Role.CUSTOMER,
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
              { phone: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(params.branchId
        ? { orders: { some: { branchId: params.branchId, deletedAt: null } } }
        : {}),
    };
    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          membershipTier: true,
          loyaltyPoints: true,
          createdAt: true,
          targetedMarketingCampaigns: {
            select: { id: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const customerIds = customers.map((customer) => customer.id);
    const orderStats = customerIds.length
      ? await this.prisma.order.groupBy({
          by: ['userId'],
          where: {
            userId: { in: customerIds },
            status: OrderStatus.COMPLETED,
            deletedAt: null,
            ...(params.branchId ? { branchId: params.branchId } : {}),
          },
          _sum: { total: true },
          _count: { _all: true },
          _max: { createdAt: true },
        })
      : [];
    const statsByUser = new Map(
      orderStats.map((stats) => [stats.userId, stats]),
    );
    const now = Date.now();

    return {
      data: customers.map((customer) => {
        const stats = statsByUser.get(customer.id);
        const lastVisit = stats?._max.createdAt ?? null;
        const inactiveDays = lastVisit
          ? Math.floor((now - lastVisit.getTime()) / 86_400_000)
          : null;
        const isVip =
          customer.membershipTier === MembershipTier.GOLD ||
          customer.membershipTier === MembershipTier.PLATINUM;
        const isNew = now - customer.createdAt.getTime() <= 30 * 86_400_000;
        const cohort = isVip
          ? 'vip'
          : inactiveDays === null || inactiveDays > 21
            ? 'at-risk'
            : isNew
              ? 'new'
              : 'regular';

        return {
          ...customer,
          totalSpend: stats?._sum.total ?? 0,
          orderCount: stats?._count._all ?? 0,
          lastVisit,
          cohort,
          lastCampaign: customer.targetedMarketingCampaigns[0] ?? null,
          targetedMarketingCampaigns: undefined,
        };
      }),
      total,
    };
  }
}
