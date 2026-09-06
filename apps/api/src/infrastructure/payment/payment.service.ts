import { createHash, timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@warkop-yareh/database';
import { DatabaseService } from '../database/database.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import type { OrderDetails } from '../../modules/ordering/domain/repositories/ordering.repository.interface';
import { MidtransService } from './midtrans.service';

interface MidtransWebhookPayload {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  transactionStatus: string;
  fraudStatus?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly config: ConfigService,
    private readonly midtrans: MidtransService,
    @Inject(forwardRef(() => OrderingService))
    private readonly ordering: OrderingService,
  ) {}

  async initializeSnap(
    order: OrderDetails,
    paymentMethod: PaymentMethod,
    assertedGrossAmount?: number,
  ) {
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order has already been paid');
    }
    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Payment cannot be initialized for a ${order.status} order`,
      );
    }
    if (
      assertedGrossAmount !== undefined &&
      assertedGrossAmount !== order.total
    ) {
      throw new BadRequestException('Payment amount does not match order total');
    }

    const existing = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });
    if (existing?.midtransToken) {
      return {
        token: existing.midtransToken,
        redirectUrl: existing.redirectUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        grossAmount: order.total,
      };
    }

    const payment = await this.claimPaymentInitialization(
      order,
      paymentMethod,
      existing,
    );
    try {
      const itemDetails = this.buildItemDetails(order);
      const transaction = await this.midtrans.createSnapTransaction({
        orderId: order.orderNumber,
        grossAmount: order.total,
        customerDetails: {
          firstName: order.customerName ?? order.user?.name ?? 'Customer',
          email: order.user?.email ?? 'customer@warkopyareh.com',
          phone: order.customerPhone ?? order.user?.phone ?? undefined,
        },
        itemDetails,
      });
      const updated = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          midtransToken: transaction.token,
          redirectUrl: transaction.redirect_url,
        },
      });
      return {
        token: updated.midtransToken,
        redirectUrl: updated.redirectUrl,
        orderId: order.id,
        orderNumber: order.orderNumber,
        grossAmount: order.total,
      };
    } catch (error) {
      await this.prisma.payment.deleteMany({
        where: { id: payment.id, midtransToken: null },
      });
      throw error;
    }
  }

  async handleWebhook(body: unknown) {
    const payload = this.parseWebhook(body);
    this.verifySignature(payload);

    const order = await this.ordering.getOrder(payload.orderId);
    if (!order) throw new NotFoundException('Order not found');
    const grossAmount = Number(payload.grossAmount);
    if (!Number.isFinite(grossAmount) || grossAmount !== order.total) {
      throw new BadRequestException('Webhook amount does not match order total');
    }

    const paymentStatus = this.mapPaymentStatus(
      payload.transactionStatus,
      payload.fraudStatus,
    );
    if (paymentStatus !== null) {
      await this.ordering.applyPaymentNotification(
        order.orderNumber,
        paymentStatus,
      );
    }
    return { message: 'OK' };
  }

  private async claimPaymentInitialization(
    order: OrderDetails,
    paymentMethod: PaymentMethod,
    existing: OrderDetails['payment'],
  ) {
    if (existing) {
      const staleBefore = new Date(Date.now() - 5 * 60 * 1000);
      const removed = await this.prisma.payment.deleteMany({
        where: {
          id: existing.id,
          midtransToken: null,
          updatedAt: { lt: staleBefore },
        },
      });
      if (removed.count !== 1) {
        throw new ConflictException('Payment initialization is already in progress');
      }
    }

    try {
      return await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          status: PaymentStatus.UNPAID,
          amount: order.total,
          midtransOrderId: order.orderNumber,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Payment initialization is already in progress');
      }
      throw error;
    }
  }

  private buildItemDetails(order: OrderDetails) {
    const items = order.items.map((item) => ({
      id: item.productId,
      price: item.unitPrice,
      quantity: item.quantity,
      name: (item.snapshotName || item.product.name || 'Item').slice(0, 50),
    }));
    const itemSubtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    if (itemSubtotal !== order.subtotal) {
      throw new InternalServerErrorException(
        'Order item snapshot does not match the stored subtotal',
      );
    }
    if (order.tax > 0) {
      items.push({ id: 'TAX-PPN', price: order.tax, quantity: 1, name: 'PPN 11%' });
    }
    if (order.discount > 0) {
      items.push({
        id: 'DISCOUNT',
        price: -order.discount,
        quantity: 1,
        name: 'Discount',
      });
    }

    const gatewayTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    if (gatewayTotal !== order.total) {
      throw new InternalServerErrorException(
        'Order totals are inconsistent and cannot be paid',
      );
    }
    return items;
  }

  private parseWebhook(body: unknown): MidtransWebhookPayload {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid webhook payload');
    }
    const value = body as Record<string, unknown>;
    const required = (key: string, maxLength = 256): string => {
      const field = value[key];
      if (
        typeof field !== 'string' ||
        field.length === 0 ||
        field.length > maxLength
      ) {
        throw new BadRequestException(`Invalid webhook field: ${key}`);
      }
      return field;
    };
    const fraudStatus = value.fraud_status;
    if (
      fraudStatus !== undefined &&
      (typeof fraudStatus !== 'string' || fraudStatus.length > 64)
    ) {
      throw new BadRequestException('Invalid webhook field: fraud_status');
    }
    return {
      orderId: required('order_id', 128),
      statusCode: required('status_code', 16),
      grossAmount: required('gross_amount', 32),
      signatureKey: required('signature_key', 256),
      transactionStatus: required('transaction_status', 64),
      ...(fraudStatus ? { fraudStatus } : {}),
    };
  }

  private verifySignature(payload: MidtransWebhookPayload): void {
    const serverKey = this.config.get<string>('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      throw new InternalServerErrorException('Payment webhook is not configured');
    }
    const expected = createHash('sha512')
      .update(
        `${payload.orderId}${payload.statusCode}${payload.grossAmount}${serverKey}`,
      )
      .digest('hex');
    const actualBuffer = Buffer.from(payload.signatureKey, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Invalid signature');
    }
  }

  private mapPaymentStatus(
    transactionStatus: string,
    fraudStatus?: string,
  ): PaymentStatus | null {
    if (transactionStatus === 'settlement') return PaymentStatus.PAID;
    if (transactionStatus === 'capture') {
      return fraudStatus === 'accept' ? PaymentStatus.PAID : null;
    }
    if (['cancel', 'deny', 'expire', 'failure'].includes(transactionStatus)) {
      return PaymentStatus.FAILED;
    }
    if (['refund', 'partial_refund'].includes(transactionStatus)) {
      return PaymentStatus.REFUNDED;
    }
    return null;
  }
}
