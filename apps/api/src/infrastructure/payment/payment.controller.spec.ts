import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  Role,
} from '@warkop-yareh/database';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import type { OrderDetails } from '../../modules/ordering/domain/repositories/ordering.repository.interface';

const customer: AuthenticatedUser = {
  id: 'user-1',
  name: 'Customer',
  email: 'customer@example.com',
  role: Role.CUSTOMER,
  branchId: null,
};

const order = (overrides: Record<string, unknown> = {}): OrderDetails =>
  ({
    id: 'order-1',
    orderNumber: 'WY-20260906-0011223344556677',
    userId: 'user-1',
    branchId: 'branch-1',
    status: OrderStatus.PENDING,
    type: OrderType.DINE_IN,
    paymentStatus: 'UNPAID',
    items: [],
    payment: null,
    feedback: null,
    user: null,
    ...overrides,
  }) as unknown as OrderDetails;

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: {
    initializeSnap: jest.Mock;
    handleWebhook: jest.Mock;
  };
  let orderingService: { getOrder: jest.Mock };

  beforeEach(() => {
    paymentService = {
      initializeSnap: jest.fn(),
      handleWebhook: jest.fn(),
    };
    orderingService = { getOrder: jest.fn() };
    controller = new PaymentController(
      paymentService as unknown as PaymentService,
      orderingService as unknown as OrderingService,
    );
  });

  it('returns not found for an unknown order', async () => {
    orderingService.getOrder.mockResolvedValue(null);
    await expect(
      controller.generateSnapToken(customer, {
        orderId: 'missing',
        paymentMethod: PaymentMethod.E_WALLET,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('prevents a customer from paying another user order', async () => {
    orderingService.getOrder.mockResolvedValue(order({ userId: 'other-user' }));
    await expect(
      controller.generateSnapToken(customer, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.E_WALLET,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents branch staff from paying an order in another branch', async () => {
    orderingService.getOrder.mockResolvedValue(order({ branchId: 'branch-2' }));
    await expect(
      controller.generateSnapToken(
        { ...customer, role: Role.CASHIER, branchId: 'branch-1' },
        { orderId: 'order-1', paymentMethod: PaymentMethod.QRIS },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('initializes payment only after ownership validation', async () => {
    const currentOrder = order();
    orderingService.getOrder.mockResolvedValue(currentOrder);
    paymentService.initializeSnap.mockResolvedValue({ token: 'snap-token' });

    await expect(
      controller.generateSnapToken(customer, {
        orderId: 'order-1',
        paymentMethod: PaymentMethod.QRIS,
      }),
    ).resolves.toEqual({ data: { token: 'snap-token' } });
    expect(paymentService.initializeSnap).toHaveBeenCalledWith(
      currentOrder,
      PaymentMethod.QRIS,
      undefined,
    );
  });

  it('delegates provider webhooks to the validated payment service', async () => {
    const payload = { order_id: 'order-1' };
    paymentService.handleWebhook.mockResolvedValue({ message: 'OK' });
    await expect(controller.handleWebhook(payload)).resolves.toEqual({
      message: 'OK',
    });
    expect(paymentService.handleWebhook).toHaveBeenCalledWith(payload);
  });
});
