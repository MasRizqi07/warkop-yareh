import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { MidtransService } from './midtrans.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let orderingService: jest.Mocked<Partial<OrderingService>>;
  let midtransService: jest.Mocked<Partial<MidtransService>>;

  beforeEach(async () => {
    orderingService = {
      updatePaymentStatus: jest
        .fn()
        .mockResolvedValue({ id: 'order_123', paymentStatus: 'PAID' }),
      updateOrderStatus: jest
        .fn()
        .mockResolvedValue({ id: 'order_123', status: 'CONFIRMED' }),
    };

    midtransService = {
      createSnapTransaction: jest
        .fn()
        .mockResolvedValue({ token: 'snap_token_abc' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: MidtransService, useValue: midtransService },
        { provide: OrderingService, useValue: orderingService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    process.env.MIDTRANS_SERVER_KEY = 'test_server_key';
  });

  describe('generateSnapToken', () => {
    it('should return snap token from midtrans service', async () => {
      const result = await controller.generateSnapToken({
        orderId: 'order_123',
        grossAmount: 50000,
      });

      expect(result).toEqual({ data: { token: 'snap_token_abc' } });
      expect(midtransService.createSnapTransaction).toHaveBeenCalledWith({
        orderId: 'order_123',
        grossAmount: 50000,
        customerDetails: undefined,
        itemDetails: undefined,
      });
    });
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException if signature is invalid', async () => {
      const payload = {
        order_id: 'order_123',
        status_code: '200',
        gross_amount: '50000',
        signature_key: 'invalid_signature',
      };

      await expect(controller.handleWebhook(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update order to PAID and CONFIRMED on settlement', async () => {
      const validSignature = crypto
        .createHash('sha512')
        .update('order_12320050000test_server_key')
        .digest('hex');

      const payload = {
        order_id: 'order_123',
        status_code: '200',
        gross_amount: '50000',
        transaction_status: 'settlement',
        signature_key: validSignature,
      };

      const result = await controller.handleWebhook(payload);

      expect(result).toEqual({ message: 'OK' });
      expect(orderingService.updatePaymentStatus).toHaveBeenCalledWith(
        'order_123',
        'PAID',
      );
      expect(orderingService.updateOrderStatus).toHaveBeenCalledWith(
        'order_123',
        'CONFIRMED',
      );
    });

    it('should update order to FAILED and CANCELLED on cancel', async () => {
      const validSignature = crypto
        .createHash('sha512')
        .update('order_12320050000test_server_key')
        .digest('hex');

      const payload = {
        order_id: 'order_123',
        status_code: '200',
        gross_amount: '50000',
        transaction_status: 'cancel',
        signature_key: validSignature,
      };

      const result = await controller.handleWebhook(payload);

      expect(result).toEqual({ message: 'OK' });
      expect(orderingService.updatePaymentStatus).toHaveBeenCalledWith(
        'order_123',
        'FAILED',
      );
      expect(orderingService.updateOrderStatus).toHaveBeenCalledWith(
        'order_123',
        'CANCELLED',
      );
    });
  });
});
