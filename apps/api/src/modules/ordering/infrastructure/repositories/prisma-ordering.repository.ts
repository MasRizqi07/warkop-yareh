import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import {
  CreateOrderData,
  DuplicateIdempotencyKeyError,
  IOrderingRepository,
  OrderItemInput,
} from '../../domain/repositories/ordering.repository.interface';
import { calculateCheckout } from '../../domain/checkout-pricing';
import { Order } from '../../domain/entities/order.entity';

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
      return await this.prisma.withTenantTransaction(async (tx) => {
        if (data.voucherCode)
          await tx.$queryRaw`SELECT "code" FROM "vouchers" WHERE "code" = ${data.voucherCode} FOR UPDATE`;
        if (
          data.idempotencyKeyHash &&
          (await tx.order.findUnique({
            where: { idempotencyKeyHash: data.idempotencyKeyHash },
            select: { id: true },
          }))
        )
          throw new DuplicateIdempotencyKeyError();
        const quote = await this.calculateQuote(tx, data);
        const { voucherCode, expectedTotal, ...persistedData } = data;
        if (expectedTotal !== undefined && expectedTotal !== quote.total) {
          throw new ConflictException({
            code: 'PRICE_CHANGED',
            message:
              'Checkout total changed; refresh the quote before ordering',
            details: { total: quote.total },
          });
        }
        const order = await tx.order.create({
          data: {
            ...persistedData,
            tax: quote.tax,
            serviceFee: quote.serviceFee,
            discount: quote.discount,
            total: quote.total,
            loyaltyPointsUsed: quote.loyaltyPointsUsed,
            items: {
              create: orderItems.map((item) => ({
                ...item,
                customizations: item.customizations ?? Prisma.JsonNull,
              })),
            },
          },
          include: orderDetailsInclude,
        });

        if (quote.loyaltyPointsUsed > 0) {
          const deducted = await tx.user.updateMany({
            where: {
              id: data.userId,
              deletedAt: null,
              loyaltyPoints: { gte: quote.loyaltyPointsUsed },
            },
            data: { loyaltyPoints: { decrement: quote.loyaltyPointsUsed } },
          });
          if (deducted.count !== 1)
            throw new ConflictException(
              'Loyalty balance changed; refresh checkout and try again',
            );
          await tx.loyaltyTransaction.create({
            data: {
              userId: data.userId,
              points: -quote.loyaltyPointsUsed,
              type: 'REDEEMED',
              description: `Checkout ${order.orderNumber}`,
            },
          });
        }
        if (voucherCode) {
          await tx.voucherRedemption.create({
            data: { userId: data.userId, orderId: order.id, voucherCode },
          });
          await tx.voucher.update({
            where: { code: voucherCode },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.outboxEvent.create({
          data: {
            aggregateType: 'Order',
            aggregateId: order.id,
            eventType: 'OrderCreated',
            payload: {
              ...outboxPayload,
              orderId: order.id,
              orderNumber: order.orderNumber,
              total: order.total,
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      )
        throw new ConflictException(
          'Voucher has already been used by this account',
        );
      throw error;
    }
  }

  async quoteOrder(data: CreateOrderData) {
    return this.prisma.withTenantTransaction((tx) =>
      this.calculateQuote(tx, data),
    );
  }

  private async calculateQuote(
    tx: Prisma.TransactionClient,
    data: CreateOrderData,
  ) {
    const user = await tx.user.findFirst({
      where: { id: data.userId, deletedAt: null },
      select: { loyaltyPoints: true },
    });
    if (!user) throw new NotFoundException('User not found');
    let voucherDiscount = 0;
    if (data.voucherCode) {
      const voucher = await tx.voucher.findUnique({
        where: { code: data.voucherCode },
      });
      const now = new Date();
      if (
        !voucher ||
        !voucher.isActive ||
        voucher.startsAt > now ||
        (voucher.expiresAt && voucher.expiresAt <= now) ||
        data.subtotal < voucher.minSubtotal ||
        (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit)
      ) {
        throw new BadRequestException(
          'Voucher is invalid, expired, exhausted, or its minimum spend has not been met',
        );
      }
      const used = await tx.voucherRedemption.findUnique({
        where: {
          voucherCode_userId: {
            voucherCode: voucher.code,
            userId: data.userId,
          },
        },
      });
      if (used)
        throw new BadRequestException(
          'Voucher has already been used by this account',
        );
      voucherDiscount = voucher.amount;
    }
    return calculateCheckout(
      data.subtotal,
      voucherDiscount,
      data.loyaltyPointsUsed ?? 0,
      user.loyaltyPoints,
    );
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

    const [data, total] = await Promise.all([
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
    return this.prisma.withTenantTransaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "orders" WHERE "id" = ${id} OR "orderNumber" = ${id} FOR UPDATE`;
      const existing = await tx.order.findFirst({
        where: { deletedAt: null, OR: [{ id }, { orderNumber: id }] },
        include: orderDetailsInclude,
      });
      if (!existing) {
        throw new NotFoundException(`Order not found: ${id}`);
      }

      if (!new Order(existing.status, existing.items).canTransitionTo(status)) {
        throw new ConflictException(
          `Order status changed; cannot transition from ${existing.status} to ${status}`,
        );
      }
      if (status === OrderStatus.CANCELLED) {
        if (
          existing.paymentStatus === PaymentStatus.PAID ||
          (existing.payment && existing.paymentStatus === PaymentStatus.UNPAID)
        ) {
          throw new ConflictException(
            'Resolve the payment with the provider before cancelling this order',
          );
        }
        if (
          existing.userId &&
          !existing.loyaltyPointsRestored &&
          existing.loyaltyPointsUsed > 0
        ) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { increment: existing.loyaltyPointsUsed } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              points: existing.loyaltyPointsUsed,
              type: 'BONUS',
              description: `Cancelled order ${existing.orderNumber}`,
            },
          });
        }
      }

      const order = await tx.order.update({
        where: { id: existing.id },
        data: {
          status,
          ...(status === OrderStatus.CANCELLED
            ? { loyaltyPointsRestored: true }
            : {}),
        },
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
    return this.syncPaymentState(id, paymentStatus);
  }

  async syncPaymentState(id: string, paymentStatus: PaymentStatus) {
    return this.prisma.withTenantTransaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "orders" WHERE "id" = ${id} OR "orderNumber" = ${id} FOR UPDATE`;
      const existing = await tx.order.findFirst({
        where: { deletedAt: null, OR: [{ id }, { orderNumber: id }] },
      });
      if (!existing) {
        throw new NotFoundException(`Order not found: ${id}`);
      }

      const terminal =
        existing.paymentStatus === PaymentStatus.REFUNDED ||
        (existing.paymentStatus === PaymentStatus.PAID &&
          paymentStatus !== PaymentStatus.REFUNDED);
      if (
        terminal ||
        existing.paymentStatus === paymentStatus ||
        (existing.paymentStatus === PaymentStatus.FAILED &&
          paymentStatus !== PaymentStatus.PAID)
      ) {
        return tx.order.findUniqueOrThrow({
          where: { id: existing.id },
          include: orderDetailsInclude,
        });
      }
      const orderStatus =
        paymentStatus === PaymentStatus.PAID &&
        (existing.status === OrderStatus.PENDING ||
          (existing.status === OrderStatus.CANCELLED &&
            existing.paymentStatus === PaymentStatus.FAILED))
          ? OrderStatus.CONFIRMED
          : paymentStatus === PaymentStatus.FAILED &&
              [
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
              ].includes(
                existing.status as 'PENDING' | 'CONFIRMED' | 'PREPARING',
              )
            ? OrderStatus.CANCELLED
            : undefined;

      if (
        existing.userId &&
        (paymentStatus === PaymentStatus.FAILED ||
          paymentStatus === PaymentStatus.REFUNDED) &&
        !existing.loyaltyPointsRestored
      ) {
        const points =
          existing.loyaltyPointsUsed -
          (paymentStatus === PaymentStatus.REFUNDED
            ? existing.loyaltyPointsEarned
            : 0);
        if (points !== 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { increment: points } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              points,
              type: 'BONUS',
              description: `Payment reversal ${existing.orderNumber}`,
            },
          });
        }
        await tx.order.update({
          where: { id: existing.id },
          data: { loyaltyPointsRestored: true },
        });
      }
      if (
        existing.userId &&
        paymentStatus === PaymentStatus.PAID &&
        existing.loyaltyPointsRestored
      ) {
        if (existing.loyaltyPointsUsed > 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { decrement: existing.loyaltyPointsUsed } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              points: -existing.loyaltyPointsUsed,
              type: 'REDEEMED',
              description: `Payment confirmed after reversal ${existing.orderNumber}`,
            },
          });
        }
        await tx.order.update({
          where: { id: existing.id },
          data: { loyaltyPointsRestored: false },
        });
      }
      if (
        existing.userId &&
        paymentStatus === PaymentStatus.PAID &&
        existing.loyaltyPointsEarned === 0
      ) {
        const points = Math.floor(existing.total / 1000);
        if (points > 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { increment: points } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              points,
              type: 'EARNED',
              description: `Paid order ${existing.orderNumber}`,
            },
          });
          await tx.order.update({
            where: { id: existing.id },
            data: { loyaltyPointsEarned: points },
          });
        }
      }

      await tx.payment.updateMany({
        where: { orderId: existing.id },
        data: {
          status: paymentStatus,
          ...(paymentStatus === PaymentStatus.PAID
            ? { paidAt: new Date() }
            : {}),
        },
      });

      if (paymentStatus === PaymentStatus.PAID) {
        await tx.reservation.updateMany({
          where: { orderId: existing.id, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        });
      } else if (
        paymentStatus === PaymentStatus.FAILED ||
        paymentStatus === PaymentStatus.REFUNDED
      ) {
        await tx.reservation.updateMany({
          where: {
            orderId: existing.id,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          data: { status: 'CANCELLED' },
        });
      }

      const hasPaymentChange = existing.paymentStatus !== paymentStatus;
      const hasOrderChange =
        orderStatus !== undefined && existing.status !== orderStatus;
      if (hasPaymentChange || hasOrderChange) {
        await tx.order.update({
          where: { id: existing.id },
          data: {
            ...(hasPaymentChange ? { paymentStatus } : {}),
            ...(hasOrderChange ? { status: orderStatus } : {}),
          },
        });

        await tx.outboxEvent.create({
          data: {
            aggregateType: 'Order',
            aggregateId: existing.id,
            eventType: 'PaymentStateChanged',
            payload: {
              orderId: existing.id,
              oldPaymentStatus: existing.paymentStatus,
              newPaymentStatus: paymentStatus,
              oldOrderStatus: existing.status,
              newOrderStatus: orderStatus ?? existing.status,
            },
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: existing.id },
        include: orderDetailsInclude,
      });
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
