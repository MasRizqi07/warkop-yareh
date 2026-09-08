import { createHash } from 'node:crypto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from '@warkop-yareh/database';
import { DatabaseService } from '../database/database.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import type { OrderDetails } from '../../modules/ordering/domain/repositories/ordering.repository.interface';
import { MidtransService } from './midtrans.service';
import { PaymentService } from './payment.service';

const makeOrder = (overrides: Record<string, unknown> = {}): OrderDetails =>
  ({
    id: 'order-1',
    orderNumber: 'WY-20260906-0011223344556677',
    userId: 'user-1',
    branchId: 'branch-1',
    tableId: null,
    type: OrderType.DINE_IN,
    status: OrderStatus.PENDING,
    subtotal: 50_000,
    tax: 5_500,
    discount: 0,
    total: 55_500,
    paymentStatus: PaymentStatus.UNPAID,
    customerName: null,
    customerPhone: null,
    payment: null,
    feedback: null,
    user: {
      id: 'user-1',
      name: 'Budi',
      email: 'budi@example.com',
      phone: '08123456789',
    },
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        unitPrice: 25_000,
        quantity: 2,
        totalPrice: 50_000,
        snapshotName: 'Americano',
        product: { name: 'Americano' },
      },
    ],
    ...overrides,
  }) as unknown as OrderDetails;

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: {
    withTenantTransaction: jest.Mock;
    $queryRaw: jest.Mock;
    order: { findUnique: jest.Mock };
    payment: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let midtrans: {
    createSnapTransaction: jest.Mock;
    getTransactionStatus: jest.Mock;
  };
  let ordering: {
    getOrder: jest.Mock;
    applyPaymentNotification: jest.Mock;
  };
  const serverKey = 'test_server_key';

  beforeEach(() => {
    prisma = {
      withTenantTransaction: jest.fn(
        (operation: (tx: typeof prisma) => unknown) => operation(prisma),
      ),
      $queryRaw: jest.fn(),
      order: {
        findUnique: jest.fn().mockResolvedValue({
          ...makeOrder(),
          payment: null,
        }),
      },
      payment: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
        update: jest.fn().mockResolvedValue({
          id: 'payment-1',
          midtransToken: 'snap-token',
          redirectUrl: 'https://sandbox.example/pay',
        }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    midtrans = {
      getTransactionStatus: jest.fn().mockResolvedValue({
        orderId: 'WY-20260906-0011223344556677',
        grossAmount: '55500',
        transactionStatus: 'settlement',
      }),
      createSnapTransaction: jest.fn().mockResolvedValue({
        token: 'snap-token',
        redirect_url: 'https://sandbox.example/pay',
      }),
    };
    ordering = {
      getOrder: jest.fn(),
      applyPaymentNotification: jest.fn(),
    };
    const config = { get: jest.fn().mockReturnValue(serverKey) };
    service = new PaymentService(
      prisma as unknown as DatabaseService,
      config as unknown as ConfigService,
      midtrans as unknown as MidtransService,
      ordering as unknown as OrderingService,
    );
  });

  it('rejects a client amount that differs from the stored total', async () => {
    await expect(
      service.initializeSnap(makeOrder(), PaymentMethod.QRIS, 1_000),
    ).rejects.toThrow(BadRequestException);
    expect(midtrans.createSnapTransaction).not.toHaveBeenCalled();
  });

  it('replays a persisted token instead of creating a duplicate provider charge', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      midtransToken: 'existing-token',
      redirectUrl: 'https://sandbox.example/existing',
    });

    const result = await service.initializeSnap(
      makeOrder(),
      PaymentMethod.E_WALLET,
    );

    expect(result.token).toBe('existing-token');
    expect(midtrans.createSnapTransaction).not.toHaveBeenCalled();
  });

  it('creates a payment claim and derives all charge details from order snapshots', async () => {
    const result = await service.initializeSnap(
      makeOrder(),
      PaymentMethod.QRIS,
    );

    expect(result.grossAmount).toBe(55_500);
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        amount: 55_500,
        method: PaymentMethod.QRIS,
      }),
    });
    expect(midtrans.createSnapTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'WY-20260906-0011223344556677',
        grossAmount: 55_500,
        customerDetails: {
          firstName: 'Budi',
          email: 'budi@example.com',
          phone: '08123456789',
        },
        itemDetails: [
          {
            id: 'prod-1',
            price: 25_000,
            quantity: 2,
            name: 'Americano',
          },
          { id: 'TAX-PPN', price: 5_500, quantity: 1, name: 'PPN 11%' },
        ],
      }),
    );
  });

  it('fails closed when stored item snapshots do not match the subtotal', async () => {
    await expect(
      service.initializeSnap(
        makeOrder({ subtotal: 49_000 }),
        PaymentMethod.E_WALLET,
      ),
    ).rejects.toThrow(InternalServerErrorException);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('settles cash through the authoritative payment transition and returns change', async () => {
    ordering.applyPaymentNotification.mockResolvedValue(
      makeOrder({ paymentStatus: PaymentStatus.PAID }),
    );

    const result = await service.settleCash(makeOrder(), 60_000);

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        method: PaymentMethod.CASH,
        amount: 55_500,
        status: PaymentStatus.UNPAID,
      }),
    });
    expect(ordering.applyPaymentNotification).toHaveBeenCalledWith(
      'WY-20260906-0011223344556677',
      PaymentStatus.PAID,
    );
    expect(result.change).toBe(4_500);
  });

  it('rejects cash below the server-stored total without creating a payment', async () => {
    await expect(service.settleCash(makeOrder(), 55_499)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('rejects an invalid webhook signature before reading an order', async () => {
    await expect(
      service.handleWebhook({
        order_id: 'WY-1',
        status_code: '200',
        gross_amount: '55500',
        transaction_status: 'settlement',
        signature_key: 'invalid',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(ordering.getOrder).not.toHaveBeenCalled();
  });

  it('maps a valid settlement webhook to an idempotent paid notification', async () => {
    const payload = signedPayload('settlement');
    ordering.getOrder.mockResolvedValue(makeOrder());
    ordering.applyPaymentNotification.mockResolvedValue(makeOrder());

    await expect(service.handleWebhook(payload)).resolves.toEqual({
      message: 'OK',
    });
    expect(ordering.applyPaymentNotification).toHaveBeenCalledWith(
      'WY-20260906-0011223344556677',
      PaymentStatus.PAID,
    );
  });

  it('maps provider cancellation to a failed payment notification', async () => {
    midtrans.getTransactionStatus.mockResolvedValue({
      orderId: 'WY-20260906-0011223344556677',
      grossAmount: '55500',
      transactionStatus: 'expire',
    });
    ordering.getOrder.mockResolvedValue(makeOrder());
    await service.handleWebhook(signedPayload('expire'));
    expect(ordering.applyPaymentNotification).toHaveBeenCalledWith(
      'WY-20260906-0011223344556677',
      PaymentStatus.FAILED,
    );
  });

  function signedPayload(transactionStatus: string) {
    const orderId = 'WY-20260906-0011223344556677';
    const statusCode = '200';
    const grossAmount = '55500';
    const signatureKey = createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');
    return {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      transaction_status: transactionStatus,
      signature_key: signatureKey,
    };
  }
});
