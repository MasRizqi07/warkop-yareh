import { Injectable, Inject, BadRequestException, forwardRef } from '@nestjs/common';
import type { IOrderingRepository } from '../../domain/repositories/ordering.repository.interface';
import { EventsGateway } from '../../../websockets/events.gateway';
import { Order } from '../../domain/entities/order.entity';
import { MidtransService } from '../../../../infrastructure/payment/midtrans.service';

@Injectable()
export class OrderingService {
  constructor(
    @Inject('IOrderingRepository')
    private readonly orderingRepo: IOrderingRepository,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => MidtransService))
    private readonly midtransService: MidtransService,
  ) {}

  async createOrder(data: {
    userId: string;
    branchId: string;
    items: Array<{
      productId: string;
      quantity: number;
      customizations?: any;
      notes?: string;
    }>;
    notes?: string;
  }) {
    const { userId, branchId, items, notes } = data;

    // Fetch product prices for snapshot
    const productIds = items.map((i) => i.productId);
    const products = await this.orderingRepo.getProductsByIds(productIds);

    const productMap = new Map<string, any>(
      products.map((p: any) => [p.id, p]),
    );

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      const unitPrice = product?.price || 0;
      const totalPrice = unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        customizations: item.customizations || null,
        notes: item.notes || null,
        snapshotName: product?.name || '',
        snapshotPrice: unitPrice,
        snapshotTax: 0,
      };
    });

    // Domain logic: calculate total
    const orderEntity = new Order('PENDING', orderItems);
    const subtotal = orderEntity.calculateTotal();

    const tax = Math.round(subtotal * 0.11); // 11% PPN
    const total = subtotal + tax;
    const orderNumber = `WY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;

    const orderData = {
      orderNumber,
      userId,
      branchId,
      subtotal,
      tax,
      total,
      notes,
    };

    const outboxPayload = {
      userId,
      branchId,
      total,
      itemCount: items.length,
    };

    const order = await this.orderingRepo.createOrder(
      orderData,
      orderItems,
      outboxPayload,
    );

    // Broadcast event directly
    this.eventsGateway.broadcastOrderCreated(order);

    return order;
  }

  async getOrder(id: string) {
    return this.orderingRepo.getOrder(id);
  }

  async listOrders(params: {
    userId?: string;
    branchId?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    return this.orderingRepo.listOrders(params);
  }

  async updateOrderStatus(id: string, status: string) {
    const existingOrder = await this.orderingRepo.getOrder(id);
    if (!existingOrder) {
      throw new BadRequestException('Order not found');
    }

    // Domain logic: state machine validation
    const orderEntity = new Order(existingOrder.status, existingOrder.items);
    if (!orderEntity.canTransitionTo(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${existingOrder.status} to ${status}`,
      );
    }

    const order = await this.orderingRepo.updateOrderStatus(id, status);

    // Broadcast order update
    this.eventsGateway.broadcastOrderUpdated(order);

    return order;
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const order = await this.orderingRepo.updatePaymentStatus(
      id,
      paymentStatus,
    );

    this.eventsGateway.broadcastPaymentUpdated(order);

    return order;
  }

  async getPaymentStatusFromMidtrans(orderId: string) {
    try {
      if (!this.midtransService.coreApi) {
        return 'PAYMENT_PENDING';
      }
      const status = await this.midtransService.coreApi.transaction.status(orderId);
      // Determine mapped status based on Midtrans response if necessary,
      // but returning raw Midtrans transaction_status works too, or just map it:
      return status.transaction_status || 'PAYMENT_PENDING';
    } catch (error) {
      // Gracefully handle Midtrans error/unreachable (Task 7)
      return 'PAYMENT_PENDING';
    }
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
    return this.orderingRepo.createFeedback(id, data);
  }
}
