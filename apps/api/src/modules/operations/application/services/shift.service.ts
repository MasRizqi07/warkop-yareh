import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CashierShiftStatus,
  CashMovementType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

const shiftInclude = Prisma.validator<Prisma.CashierShiftInclude>()({
  branch: { select: { id: true, name: true } },
  openedBy: { select: { id: true, name: true } },
  closedBy: { select: { id: true, name: true } },
  movements: {
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  },
});

type ShiftRecord = Prisma.CashierShiftGetPayload<{
  include: typeof shiftInclude;
}>;

function isTransactionConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;

  if (error.code === 'P2034') return true;

  const databaseCode = error.meta?.code;
  return error.code === 'P2010' && databaseCode === '40001';
}

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: DatabaseService) {}

  async getCurrent(branchId: string) {
    const shift = await this.prisma.cashierShift.findFirst({
      where: { branchId, status: CashierShiftStatus.OPEN },
      include: shiftInclude,
      orderBy: { openedAt: 'desc' },
    });
    return shift ? this.withSummary(shift) : null;
  }

  async list(branchId: string, page: number, limit: number) {
    const where: Prisma.CashierShiftWhereInput = { branchId };
    const [data, total] = await Promise.all([
      this.prisma.cashierShift.findMany({
        where,
        include: shiftInclude,
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cashierShift.count({ where }),
    ]);
    return {
      data: await Promise.all(data.map((shift) => this.withSummary(shift))),
      total,
    };
  }

  async getBranchId(shiftId: string): Promise<string> {
    const shift = await this.prisma.cashierShift.findUnique({
      where: { id: shiftId },
      select: { branchId: true },
    });
    if (!shift) throw new NotFoundException('Cashier shift not found');
    return shift.branchId;
  }

  async open(branchId: string, openedById: string, openingFloat: number) {
    try {
      const shift = await this.prisma.withTenantTransaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`cashier-shift:${branchId}`}))`;
          const [branch, actor, existing] = await Promise.all([
            tx.branch.findFirst({
              where: { id: branchId, isActive: true, deletedAt: null },
              select: { id: true },
            }),
            tx.user.findFirst({
              where: { id: openedById, deletedAt: null },
              select: { id: true },
            }),
            tx.cashierShift.findFirst({
              where: { branchId, status: CashierShiftStatus.OPEN },
              select: { id: true },
            }),
          ]);
          if (!branch) throw new BadRequestException('Branch is not active');
          if (!actor)
            throw new BadRequestException('Shift operator is inactive');
          if (existing) {
            throw new ConflictException(
              'This branch already has an open shift',
            );
          }

          const created = await tx.cashierShift.create({
            data: { branchId, openedById, openingFloat },
            include: shiftInclude,
          });
          await tx.outboxEvent.create({
            data: {
              aggregateType: 'CashierShift',
              aggregateId: created.id,
              eventType: 'CashierShiftOpened',
              payload: { shiftId: created.id, branchId, openedById },
            },
          });
          return created;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return this.withSummary(shift);
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002') ||
        isTransactionConflict(error)
      ) {
        throw new ConflictException('This branch already has an open shift');
      }
      throw error;
    }
  }

  async addMovement(
    shiftId: string,
    createdById: string,
    type: CashMovementType,
    amount: number,
    reason: string,
  ) {
    const movement = await this.prisma.withTenantTransaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "cashier_shifts" WHERE "id" = ${shiftId} FOR UPDATE`;
      const shift = await tx.cashierShift.findUnique({
        where: { id: shiftId },
      });
      if (!shift) throw new NotFoundException('Cashier shift not found');
      if (shift.status !== CashierShiftStatus.OPEN) {
        throw new ConflictException('Closed shifts cannot receive movements');
      }
      const created = await tx.cashDrawerMovement.create({
        data: {
          shiftId,
          createdById,
          type,
          amount,
          reason: reason.trim(),
        },
        include: { createdBy: { select: { id: true, name: true } } },
      });
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'CashierShift',
          aggregateId: shiftId,
          eventType: 'CashDrawerMovementRecorded',
          payload: { shiftId, movementId: created.id, type, amount },
        },
      });
      return created;
    });
    return movement;
  }

  async close(
    shiftId: string,
    closedById: string,
    closingCash: number,
    notes?: string,
  ) {
    try {
      const closed = await this.prisma.withTenantTransaction(
        async (tx) => {
          await tx.$queryRaw`SELECT "id" FROM "cashier_shifts" WHERE "id" = ${shiftId} FOR UPDATE`;
          const shift = await tx.cashierShift.findUnique({
            where: { id: shiftId },
            include: shiftInclude,
          });
          if (!shift) throw new NotFoundException('Cashier shift not found');
          if (shift.status !== CashierShiftStatus.OPEN) {
            throw new ConflictException('Cashier shift is already closed');
          }
          const summary = await this.calculateSummary(tx, shift);
          const closedAt = new Date();
          const updated = await tx.cashierShift.update({
            where: { id: shiftId },
            data: {
              status: CashierShiftStatus.CLOSED,
              closingCash,
              expectedCash: summary.expectedCash,
              variance: closingCash - summary.expectedCash,
              closedById,
              closedAt,
              notes: notes?.trim() || null,
            },
            include: shiftInclude,
          });
          await tx.outboxEvent.create({
            data: {
              aggregateType: 'CashierShift',
              aggregateId: shiftId,
              eventType: 'CashierShiftClosed',
              payload: {
                shiftId,
                branchId: shift.branchId,
                expectedCash: summary.expectedCash,
                closingCash,
                variance: closingCash - summary.expectedCash,
              },
            },
          });
          return { updated, summary };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return { ...closed.updated, summary: closed.summary };
    } catch (error) {
      if (isTransactionConflict(error)) {
        throw new ConflictException('Cashier shift is already closed');
      }
      throw error;
    }
  }

  private async withSummary(shift: ShiftRecord) {
    return {
      ...shift,
      summary: await this.calculateSummary(this.prisma, shift),
    };
  }

  private async calculateSummary(
    client: Prisma.TransactionClient | DatabaseService,
    shift: Pick<
      ShiftRecord,
      'id' | 'branchId' | 'openingFloat' | 'openedAt' | 'closedAt' | 'movements'
    >,
  ) {
    const paidCash = await client.payment.aggregate({
      where: {
        method: PaymentMethod.CASH,
        status: PaymentStatus.PAID,
        paidAt: {
          gte: shift.openedAt,
          ...(shift.closedAt ? { lte: shift.closedAt } : {}),
        },
        order: { branchId: shift.branchId },
      },
      _sum: { amount: true },
    });
    const cashSales = paidCash._sum.amount ?? 0;
    const cashIn = shift.movements
      .filter((item) => item.type === CashMovementType.CASH_IN)
      .reduce((sum, item) => sum + item.amount, 0);
    const cashOut = shift.movements
      .filter((item) => item.type === CashMovementType.CASH_OUT)
      .reduce((sum, item) => sum + item.amount, 0);
    return {
      cashSales,
      cashIn,
      cashOut,
      expectedCash: shift.openingFloat + cashSales + cashIn - cashOut,
    };
  }
}
