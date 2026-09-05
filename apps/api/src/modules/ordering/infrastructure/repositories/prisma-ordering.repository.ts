import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import {
  CreateOrderData,
  DuplicateIdempotencyKeyError,
  IOrderingRepository,
  OrderItemInput,
} from '../../domain/repositories/ordering.repository.interface';

const orderDetailsInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: { include: { product: true } },
  payment: true,
  feedback: true,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
});

const orderListInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: true,
  payment: true,
  user: {
    select: { id: true, name: true, email: true, phone: true },
  },
});

@Injectable()
export class PrismaOrderingRepository implements IOrderingRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async getAvailableProductsByIds(branchId: string, ids: string[]) {
    const branchProducts = await this.prisma.branchProduct.findMany({
      where: {
        branchId,
        productId: { in: ids },
        isAvailable: true,
        branch: { isActive: true, deletedAt: null },
        product: { isActive: true, deletedAt: null },
      },
      select: {
        priceOverride: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            customizations: { select: { name: true, options: true } },
          },
        },
      },
    });

    return branchProducts.map(({ priceOverride, product }) => ({
      id: product.id,
      name: product.name,
      unitPrice: priceOverride ?? product.price,
      customizations: product.customizations,
    }));
  }

  async getActiveTableForBranch(tableId: string, branchId: string) {
    return this.prisma.table.findFirst({
      where: { id: tableId, branchId, isActive: true },
      select: { id: true },
    });
  }

  async findByIdempotencyKeyHash(hash: string) {
    return this.prisma.order.findUnique({
      where: { idempotencyKeyHash: hash },
      include: orderDetailsInclude,
    });
  }

  async createOrder(
    data: CreateOrderData,
    orderItems: OrderItemInput[],
    outboxPayload: Prisma.InputJsonObject,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            ...data,
            items: {
              create: orderItems.map((item) => ({
                ...item,
                customizations: item.customizations ?? Prisma.JsonNull,
              })),
            },
          },
          include: orderDetailsInclude,
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        this.isIdempotencyConstraint(error.meta?.target)
      ) {
        throw new DuplicateIdempotencyKeyError();
      }
      throw error;
    }
  }

  async getOrder(id: string) {
    return this.prisma.order.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id }, { orderNumber: id }],
      },
      include: orderDetailsInclude,
    });
  }

  async listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: OrderStatus;
    page: number;
    limit: number;
  }) {
    const { userId, branchId, status, page, limit } = params;
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(userId ? { userId } : {}),
      ...(branchId ? { branchId } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: orderListInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total };
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { deletedAt: null, OR: [{ id }, { orderNumber: id }] },
        select: { id: true },
      });
      if (!existing) {
        throw new NotFoundException(`Order not found: ${id}`);
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: { status },
        include: orderDetailsInclude,
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

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { deletedAt: null, OR: [{ id }, { orderNumber: id }] },
        select: { id: true },
      });
      if (!existing) {
        throw new NotFoundException(`Order not found: ${id}`);
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: { paymentStatus },
        include: orderDetailsInclude,
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

  async createFeedback(
    id: string,
    data: {
      productRating: number;
      serviceRating: number;
      atmosphereRating: number;
      comment?: string;
    },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { deletedAt: null, OR: [{ id }, { orderNumber: id }] },
      select: { id: true },
    });
    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return this.prisma.orderFeedback.create({
      data: { orderId: order.id, ...data },
    });
  }

  private isIdempotencyConstraint(target: unknown): boolean {
    if (Array.isArray(target)) {
      return target.some((field) => field === 'idempotencyKeyHash');
    }
    return String(target).includes('idempotencyKeyHash');
  }
}
