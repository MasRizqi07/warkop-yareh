import { ConflictException } from '@nestjs/common';
import { CashierShiftStatus, CashMovementType } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { ShiftService } from './shift.service';

type PrismaMock = {
  withTenantTransaction: jest.Mock;
  $executeRaw: jest.Mock;
  $queryRaw: jest.Mock;
  branch: { findFirst: jest.Mock };
  user: { findFirst: jest.Mock };
  cashierShift: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  cashDrawerMovement: { create: jest.Mock };
  outboxEvent: { create: jest.Mock };
  payment: { aggregate: jest.Mock };
};

const openedAt = new Date('2026-09-08T08:00:00.000Z');
const openShift = {
  id: 'shift-1',
  branchId: 'branch-1',
  openedById: 'cashier-1',
  closedById: null,
  status: CashierShiftStatus.OPEN,
  openingFloat: 100_000,
  closingCash: null,
  expectedCash: null,
  variance: null,
  notes: null,
  openedAt,
  closedAt: null,
  createdAt: openedAt,
  updatedAt: openedAt,
  branch: { id: 'branch-1', name: 'Gubeng' },
  openedBy: { id: 'cashier-1', name: 'Cashier' },
  closedBy: null,
  movements: [
    { id: 'in-1', type: CashMovementType.CASH_IN, amount: 5_000 },
    { id: 'out-1', type: CashMovementType.CASH_OUT, amount: 2_000 },
  ],
};

describe('ShiftService', () => {
  let prisma: PrismaMock;
  let service: ShiftService;

  beforeEach(() => {
    prisma = {
      withTenantTransaction: jest.fn(),
      $executeRaw: jest.fn().mockResolvedValue(1),
      $queryRaw: jest.fn().mockResolvedValue([]),
      branch: { findFirst: jest.fn() },
      user: { findFirst: jest.fn() },
      cashierShift: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      cashDrawerMovement: { create: jest.fn() },
      outboxEvent: { create: jest.fn().mockResolvedValue({}) },
      payment: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 20_000 } }),
      },
    };
    prisma.withTenantTransaction.mockImplementation(
      async (callback: (client: PrismaMock) => Promise<unknown>) =>
        callback(prisma),
    );
    service = new ShiftService(prisma as unknown as DatabaseService);
  });

  it('computes expected cash from float, paid cash, and drawer movements', async () => {
    prisma.cashierShift.findFirst.mockResolvedValue(openShift);
    const result = await service.getCurrent('branch-1');
    expect(result?.summary).toEqual({
      cashSales: 20_000,
      cashIn: 5_000,
      cashOut: 2_000,
      expectedCash: 123_000,
    });
    expect(prisma.payment.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          method: 'CASH',
          status: 'PAID',
          order: { branchId: 'branch-1' },
        }),
      }),
    );
  });

  it('serializes shift opening and rejects a second open shift for a branch', async () => {
    prisma.branch.findFirst.mockResolvedValue({ id: 'branch-1' });
    prisma.user.findFirst.mockResolvedValue({ id: 'cashier-1' });
    prisma.cashierShift.findFirst.mockResolvedValue({ id: 'already-open' });
    await expect(
      service.open('branch-1', 'cashier-1', 100_000),
    ).rejects.toThrow(ConflictException);
    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(prisma.cashierShift.create).not.toHaveBeenCalled();
  });

  it('rejects drawer movements after a shift is closed', async () => {
    prisma.cashierShift.findUnique.mockResolvedValue({
      ...openShift,
      status: CashierShiftStatus.CLOSED,
    });
    await expect(
      service.addMovement(
        'shift-1',
        'cashier-1',
        CashMovementType.CASH_IN,
        5_000,
        'Tambahan float',
      ),
    ).rejects.toThrow(ConflictException);
    expect(prisma.cashDrawerMovement.create).not.toHaveBeenCalled();
  });

  it('persists expected cash and variance when closing a shift', async () => {
    prisma.cashierShift.findUnique.mockResolvedValue(openShift);
    prisma.cashierShift.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({
          ...openShift,
          ...data,
          movements: openShift.movements,
        }),
    );
    const result = await service.close(
      'shift-1',
      'manager-1',
      125_000,
      'Serah terima',
    );
    expect(prisma.cashierShift.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          expectedCash: 123_000,
          closingCash: 125_000,
          variance: 2_000,
        }),
      }),
    );
    expect(result.summary.expectedCash).toBe(123_000);
  });
});
