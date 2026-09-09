import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Role } from '@warkop-yareh/database';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import type { OrderDetails } from '../../modules/ordering/domain/repositories/ordering.repository.interface';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import { ShiftService } from '../../modules/operations/application/services/shift.service';
import { CashPaymentController } from './cash-payment.controller';
import { PaymentService } from './payment.service';

const order = {
  id: 'order-1',
  branchId: 'branch-1',
  total: 55_500,
} as OrderDetails;
const cashier: AuthenticatedUser = {
  id: 'cashier-1',
  name: 'Cashier',
  email: 'cashier@example.com',
  role: Role.CASHIER,
  branchId: 'branch-1',
};

describe('CashPaymentController', () => {
  const settleCash = jest.fn();
  const getOrder = jest.fn();
  const getCurrent = jest.fn();
  let controller: CashPaymentController;

  beforeEach(() => {
    jest.clearAllMocks();
    getOrder.mockResolvedValue(order);
    getCurrent.mockResolvedValue({ id: 'shift-1' });
    settleCash.mockResolvedValue({
      order,
      cashReceived: 60_000,
      change: 4_500,
    });
    controller = new CashPaymentController(
      { settleCash } as unknown as PaymentService,
      { getOrder } as unknown as OrderingService,
      { getCurrent } as unknown as ShiftService,
    );
  });

  it('settles a branch cash order only while a shift is open', async () => {
    await expect(
      controller.settle(cashier, { orderId: order.id, cashReceived: 60_000 }),
    ).resolves.toEqual(
      expect.objectContaining({ message: 'Cash payment settled' }),
    );
    expect(getCurrent).toHaveBeenCalledWith('branch-1');
    expect(settleCash).toHaveBeenCalledWith(order, 60_000);
  });

  it('blocks a branch cashier from settling another branch order', async () => {
    getOrder.mockResolvedValue({ ...order, branchId: 'branch-2' });
    await expect(
      controller.settle(cashier, { orderId: order.id, cashReceived: 60_000 }),
    ).rejects.toThrow(ForbiddenException);
    expect(getCurrent).not.toHaveBeenCalled();
    expect(settleCash).not.toHaveBeenCalled();
  });

  it('fails closed when the branch has no open cashier shift', async () => {
    getCurrent.mockResolvedValue(null);
    await expect(
      controller.settle(cashier, { orderId: order.id, cashReceived: 60_000 }),
    ).rejects.toThrow(ConflictException);
    expect(settleCash).not.toHaveBeenCalled();
  });

  it('allows a global administrator to settle an order from a managed branch', async () => {
    const admin = {
      ...cashier,
      id: 'admin-1',
      role: Role.ADMIN,
      branchId: null,
    };
    await controller.settle(admin, { orderId: order.id, cashReceived: 60_000 });
    expect(settleCash).toHaveBeenCalledWith(order, 60_000);
  });
});
