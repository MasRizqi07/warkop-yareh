/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MidtransService } from './midtrans.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import * as crypto from 'crypto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@Controller('api/v1/payments/midtrans')
export class PaymentController {
  constructor(
    private readonly midtransService: MidtransService,
    @Inject(forwardRef(() => OrderingService))
    private readonly orderingService: OrderingService,
  ) {}

  @Public()
  @Post('snap')
  @ApiOperation({ summary: 'Generate Midtrans Snap Token' })
  async generateSnapToken(
    @Body()
    body: {
      orderId: string;
      grossAmount?: number;
      customerDetails?: any;
    },
  ) {
    const { orderId, grossAmount, customerDetails } = body;

    if (!orderId) {
      throw new BadRequestException('orderId is required');
    }

    // 1. Look up order from database
    const order = await this.orderingService.getOrder(orderId);
    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order has already been paid');
    }

    // 2. Reject client-supplied grossAmount if it doesn't match the database total
    if (grossAmount !== undefined && grossAmount !== order.total) {
      throw new BadRequestException(
        `Payment amount mismatch: provided ${grossAmount}, but stored order total is ${order.total}`,
      );
    }

    // 3. Server-computed itemDetails from stored snapshot items
    const itemDetails = (order.items || []).map((item: any) => ({
      id: item.productId,
      price: item.unitPrice,
      quantity: item.quantity,
      name: item.snapshotName || item.product?.name || 'Item',
    }));

    if (order.tax && order.tax > 0) {
      itemDetails.push({
        id: 'TAX-PPN',
        price: order.tax,
        quantity: 1,
        name: 'PPN 11%',
      });
    }

    if (order.discount && order.discount > 0) {
      itemDetails.push({
        id: 'DISCOUNT',
        price: -order.discount,
        quantity: 1,
        name: 'Discount',
      });
    }

    const resolvedCustomer = {
      first_name:
        order.customerName || order.user?.name || customerDetails?.firstName || 'Customer',
      email:
        order.user?.email || customerDetails?.email || 'customer@warkopyareh.com',
      phone:
        order.customerPhone || order.user?.phone || customerDetails?.phone || '08123456789',
    };

    // 4. Server-computed grossAmount strictly from order.total
    const transaction = await this.midtransService.createSnapTransaction({
      orderId: order.orderNumber || order.id,
      grossAmount: order.total,
      customerDetails: resolvedCustomer,
      itemDetails,
    });

    return {
      data: {
        ...transaction,
        orderId: order.id,
        orderNumber: order.orderNumber,
        grossAmount: order.total,
      },
    };
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Midtrans Webhook Callback' })
  async handleWebhook(@Body() body: any) {
    if (!process.env.MIDTRANS_SERVER_KEY) {
      throw new Error('MIDTRANS_SERVER_KEY environment variable is required');
    }
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Verify signature
    const signatureKey = crypto
      .createHash('sha512')
      .update(
        `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`,
      )
      .digest('hex');

    if (signatureKey !== body.signature_key) {
      throw new BadRequestException('Invalid signature');
    }

    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;
    const orderId = body.order_id; // The order.id in our system

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        // Mark as PAID
        await this.orderingService.updatePaymentStatus(orderId, 'PAID');
        await this.orderingService.updateOrderStatus(orderId, 'CONFIRMED');
      }
    } else if (transactionStatus === 'settlement') {
      // Mark as PAID
      await this.orderingService.updatePaymentStatus(orderId, 'PAID');
      await this.orderingService.updateOrderStatus(orderId, 'CONFIRMED');
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      await this.orderingService.updatePaymentStatus(orderId, 'FAILED');
      await this.orderingService.updateOrderStatus(orderId, 'CANCELLED');
    }

    return { message: 'OK' };
  }
}
