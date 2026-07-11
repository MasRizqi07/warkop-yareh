import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { IOrderingRepository } from '../../domain/repositories/ordering.repository.interface';

@Injectable()
export class PrismaOrderingRepository implements IOrderingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async getProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids } },
    });
  }

  async createOrder(data: any, orderItems: any[], outboxPayload: any) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          ...data,
          items: { create: orderItems },
        },
        include: { items: true },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'Order',
          aggregateId: order.id,
          eventType: 'OrderCreated',
          payload: {
            ...outboxPayload,
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        },
      });

      return order;
    });
  }

  async getOrder(id: string) {
    return this.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { items: { include: { product: true } }, user: true },
    });
  }

  async listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { userId, branchId, status, page, limit } = params;
    const where: any = {};
    if (userId) where.userId = userId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
      });
      if (!existing) {
        throw new BadRequestException(`Order not found: ${id}`);
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: { status: status as any },
        include: { items: true },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'Order',
          aggregateId: existing.id,
          eventType: 'OrderStatusChanged',
          payload: { orderId: existing.id, newStatus: status },
        },
      });

      return order;
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
      });
      if (!existing) {
        throw new BadRequestException(`Order not found: ${id}`);
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: { paymentStatus: paymentStatus as any },
        include: { items: true },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'Order',
          aggregateId: existing.id,
          eventType: 'PaymentStatusChanged',
          payload: { orderId: existing.id, newPaymentStatus: paymentStatus },
        },
      });

      return order;
    });
  }

  async createFeedback(id: string, data: any) {
    return this.prisma.orderFeedback.create({
      data: {
        orderId: id,
        ...data,
      },
    });
  }
}
