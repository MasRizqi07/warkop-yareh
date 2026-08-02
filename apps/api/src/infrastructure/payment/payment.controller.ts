/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  BadRequestException,
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
      grossAmount: number;
      customerDetails?: any;
      itemDetails?: any;
    },
  ) {
    const { orderId, grossAmount, customerDetails, itemDetails } = body;
    const transaction = await this.midtransService.createSnapTransaction({
      orderId,
      grossAmount,
      customerDetails,
      itemDetails,
    });
    return { data: transaction };
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Midtrans Webhook Callback' })
  async handleWebhook(@Body() body: any) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

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
