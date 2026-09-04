import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { MidtransService } from './midtrans.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let orderingService: jest.Mocked<Partial<OrderingService>>;
  let midtransService: jest.Mocked<Partial<MidtransService>>;

  const mockOrder = {
    id: 'order_123',
    orderNumber: 'WY-20260829-1001',
    total: 55500,
    subtotal: 50000,
    tax: 5500,
    discount: 0,
    paymentStatus: 'UNPAID',
    customerName: 'Budi Santoso',
    customerPhone: '08123456789',
    user: { id: 'u1', name: 'Budi Santoso', email: 'budi@example.com' },
    items: [
      {
        productId: 'prod-1',
        snapshotName: 'Americano',
        unitPrice: 25000,
        quantity: 2,
        totalPrice: 50000,
      },
    ],
  };

  beforeEach(async () => {
    orderingService = {
      getOrder: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'order_123' || id === 'WY-20260829-1001') {
          return mockOrder as any;
        }
        return null;
      }),
      updatePaymentStatus: jest
        .fn()
        .mockResolvedValue({ id: 'order_123', paymentStatus: 'PAID' } as any),
      updateOrderStatus: jest
        .fn()
        .mockResolvedValue({ id: 'order_123', status: 'CONFIRMED' } as any),
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
    it('should throw NotFoundException if order does not exist', async () => {
      await expect(
        controller.generateSnapToken({ orderId: 'nonexistent-order' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if client-supplied grossAmount mismatches stored total', async () => {
      await expect(
        controller.generateSnapToken({
          orderId: 'order_123',
          grossAmount: 1000, // Tampered amount
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully generate snap token using server-computed total and snapshot items', async () => {
      const result = await controller.generateSnapToken({
        orderId: 'order_123',
      });

      expect(result).toEqual({
        data: {
          token: 'snap_token_abc',
          orderId: 'order_123',
          orderNumber: 'WY-20260829-1001',
          grossAmount: 55500,
        },
      });

      expect(midtransService.createSnapTransaction).toHaveBeenCalledWith({
        orderId: 'WY-20260829-1001',
        grossAmount: 55500,
        customerDetails: {
          first_name: 'Budi Santoso',
          email: 'budi@example.com',
          phone: '08123456789',
        },
        itemDetails: [
          {
            id: 'prod-1',
            price: 25000,
            quantity: 2,
            name: 'Americano',
          },
          {
            id: 'TAX-PPN',
            price: 5500,
            quantity: 1,
            name: 'PPN 11%',
          },
        ],
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
