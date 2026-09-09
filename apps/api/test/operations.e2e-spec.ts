import { randomUUID } from 'node:crypto';
import {
  CashierShiftStatus,
  CashMovementType,
  PrismaClient,
  Role,
} from '@warkop-yareh/database';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../src/infrastructure/database/database.service';
import { tenantContext } from '../src/infrastructure/database/tenant-context';
import { ShiftService } from '../src/modules/operations/application/services/shift.service';

describe('Cashier shift persistence, concurrency and RLS', () => {
  const suffix = randomUUID();
  const branchA = `shift-branch-a-${suffix}`;
  const branchB = `shift-branch-b-${suffix}`;
  const operatorA = `shift-operator-a-${suffix}`;
  const operatorB = `shift-operator-b-${suffix}`;
  let admin: PrismaClient;
  let database: DatabaseService;
  let shifts: ShiftService;

  const inBranch = <T>(
    branchId: string,
    userId: string,
    operation: () => Promise<T>,
  ) => tenantContext.run({ branchId, userId, role: Role.MANAGER }, operation);

  beforeAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url || new URL(url).pathname !== '/warkop_audit') {
      throw new Error(
        'Operations integration tests require the isolated warkop_audit database',
      );
    }

    admin = new PrismaClient();
    database = new DatabaseService();
    await database.onModuleInit();
    shifts = new ShiftService(database);

    await admin.branch.createMany({
      data: [branchA, branchB].map((id, index) => ({
        id,
        slug: id,
        name: `Shift branch ${index + 1}`,
        address: 'Integration test',
        city: 'Surabaya',
        province: 'Jawa Timur',
      })),
    });
    await admin.user.createMany({
      data: [
        {
          id: operatorA,
          email: `${operatorA}@example.test`,
          name: 'Shift operator A',
          role: Role.MANAGER,
          branchId: branchA,
        },
        {
          id: operatorB,
          email: `${operatorB}@example.test`,
          name: 'Shift operator B',
          role: Role.MANAGER,
          branchId: branchB,
        },
      ],
    });
  });

  afterAll(async () => {
    if (admin) {
      const records = await admin.cashierShift.findMany({
        where: { branchId: { in: [branchA, branchB] } },
        select: { id: true },
      });
      await admin.outboxEvent.deleteMany({
        where: { aggregateId: { in: records.map(({ id }) => id) } },
      });
      await admin.cashierShift.deleteMany({
        where: { branchId: { in: [branchA, branchB] } },
      });
      await admin.user.deleteMany({
        where: { id: { in: [operatorA, operatorB] } },
      });
      await admin.branch.deleteMany({
        where: { id: { in: [branchA, branchB] } },
      });
      await admin.$disconnect();
    }
    if (database) await database.onModuleDestroy();
  });

  it('allows exactly one concurrent open shift per branch', async () => {
    const attempts = await Promise.allSettled([
      inBranch(branchA, operatorA, () =>
        shifts.open(branchA, operatorA, 100_000),
      ),
      inBranch(branchA, operatorA, () =>
        shifts.open(branchA, operatorA, 100_000),
      ),
    ]);

    expect(
      attempts.filter(({ status }) => status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = attempts.find(({ status }) => status === 'rejected');
    expect(rejected).toMatchObject({
      status: 'rejected',
      reason: expect.any(ConflictException),
    });
    expect(
      await admin.cashierShift.count({
        where: { branchId: branchA, status: CashierShiftStatus.OPEN },
      }),
    ).toBe(1);
  });

  it('persists movements, reloads the summary, and serializes close', async () => {
    const current = await inBranch(branchA, operatorA, () =>
      shifts.getCurrent(branchA),
    );
    expect(current).not.toBeNull();

    await inBranch(branchA, operatorA, () =>
      shifts.addMovement(
        current!.id,
        operatorA,
        CashMovementType.CASH_IN,
        20_000,
        'Tambahan kas operasional',
      ),
    );
    await inBranch(branchA, operatorA, () =>
      shifts.addMovement(
        current!.id,
        operatorA,
        CashMovementType.CASH_OUT,
        5_000,
        'Pembelian kebutuhan shift',
      ),
    );

    const reloaded = await inBranch(branchA, operatorA, () =>
      new ShiftService(database).getCurrent(branchA),
    );
    expect(reloaded?.movements).toHaveLength(2);
    expect(reloaded?.summary).toMatchObject({
      cashSales: 0,
      cashIn: 20_000,
      cashOut: 5_000,
      expectedCash: 115_000,
    });

    const closing = await Promise.allSettled([
      inBranch(branchA, operatorA, () =>
        shifts.close(current!.id, operatorA, 117_000, 'Tutup kas pertama'),
      ),
      inBranch(branchA, operatorA, () =>
        shifts.close(current!.id, operatorA, 117_000, 'Tutup kas kedua'),
      ),
    ]);
    expect(closing.filter(({ status }) => status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(closing.find(({ status }) => status === 'rejected')).toMatchObject({
      status: 'rejected',
      reason: expect.any(ConflictException),
    });

    const persisted = await admin.cashierShift.findUniqueOrThrow({
      where: { id: current!.id },
      include: { movements: true },
    });
    expect(persisted).toMatchObject({
      status: CashierShiftStatus.CLOSED,
      openingFloat: 100_000,
      expectedCash: 115_000,
      closingCash: 117_000,
      variance: 2_000,
      movements: expect.arrayContaining([
        expect.objectContaining({
          type: CashMovementType.CASH_IN,
          amount: 20_000,
        }),
        expect.objectContaining({
          type: CashMovementType.CASH_OUT,
          amount: 5_000,
        }),
      ]),
    });
    expect(
      await inBranch(branchA, operatorA, () => shifts.getCurrent(branchA)),
    ).toBeNull();
  });

  it('enforces branch isolation on reads and shift lookup', async () => {
    const branchBShift = await inBranch(branchB, operatorB, () =>
      shifts.open(branchB, operatorB, 50_000),
    );

    expect(
      await inBranch(branchA, operatorA, () => shifts.getCurrent(branchB)),
    ).toBeNull();
    await expect(
      inBranch(branchA, operatorA, () => shifts.getBranchId(branchBShift.id)),
    ).rejects.toThrow(NotFoundException);

    const visible = await inBranch(branchB, operatorB, () =>
      shifts.getCurrent(branchB),
    );
    expect(visible?.id).toBe(branchBShift.id);
  });
});
