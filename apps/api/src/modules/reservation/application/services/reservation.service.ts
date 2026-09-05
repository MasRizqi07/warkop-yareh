import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  ReservationStatus,
  Role,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

const GLOBAL_RESERVATION_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];
const BRANCH_RESERVATION_ROLES: readonly Role[] = [
  Role.STAFF,
  Role.CASHIER,
  Role.MANAGER,
  Role.OWNER,
];

interface CreateReservationInput {
  userId: string;
  branchId: string;
  tableId?: string;
  date: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  specialRequests?: string;
}

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: DatabaseService) {}

  async createReservation(data: CreateReservationInput) {
    const date = this.parseReservationDate(data.date);
    this.assertValidTimeRange(data.startTime, data.endTime);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const [branch, user] = await Promise.all([
              tx.branch.findFirst({
                where: { id: data.branchId, isActive: true, deletedAt: null },
                select: { id: true },
              }),
              tx.user.findFirst({
                where: { id: data.userId, deletedAt: null },
                select: { id: true },
              }),
            ]);
            if (!branch) throw new BadRequestException('Branch is not active');
            if (!user) throw new BadRequestException('Reservation user not found');

            if (data.tableId) {
              const lockKey = `${data.tableId}:${date.toISOString().slice(0, 10)}`;
              await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

              const table = await tx.table.findFirst({
                where: {
                  id: data.tableId,
                  branchId: data.branchId,
                  isActive: true,
                },
                select: { id: true, capacity: true },
              });
              if (!table) {
                throw new BadRequestException(
                  'The selected table is not active at this branch',
                );
              }
              if (data.guestCount > table.capacity) {
                throw new BadRequestException(
                  `Guest count exceeds table capacity of ${table.capacity}`,
                );
              }

              const existing = await tx.reservation.findMany({
                where: {
                  tableId: data.tableId,
                  date,
                  status: {
                    notIn: [ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
                  },
                },
                select: { startTime: true, endTime: true },
              });
              const hasOverlap = existing.some(
                (reservation) =>
                  data.startTime < reservation.endTime &&
                  data.endTime > reservation.startTime,
              );
              if (hasOverlap) {
                throw new ConflictException(
                  'Table is already reserved for this time slot',
                );
              }
            }

            const reservation = await tx.reservation.create({
              data: {
                userId: data.userId,
                branchId: data.branchId,
                ...(data.tableId ? { tableId: data.tableId } : {}),
                date,
                startTime: data.startTime,
                endTime: data.endTime,
                guestCount: data.guestCount,
                ...(data.specialRequests?.trim()
                  ? { specialRequests: data.specialRequests.trim() }
                  : {}),
              },
            });

            await tx.outboxEvent.create({
              data: {
                aggregateType: 'Reservation',
                aggregateId: reservation.id,
                eventType: 'ReservationCreated',
                payload: {
                  reservationId: reservation.id,
                  userId: data.userId,
                  branchId: data.branchId,
                },
              },
            });
            return reservation;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (this.isSerializationConflict(error) && attempt < 2) continue;
        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Reservation changed concurrently; please try again',
          );
        }
        throw error;
      }
    }

    throw new ConflictException('Unable to reserve this time slot');
  }

  async listReservations(params: {
    branchId?: string;
    userId?: string;
    date?: string;
    status?: ReservationStatus;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ReservationWhereInput = {
      ...(params.branchId ? { branchId: params.branchId } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.date ? { date: this.parseReservationDate(params.date, false) } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        include: {
          table: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      }),
      this.prisma.reservation.count({ where }),
    ]);
    return { data, total };
  }

  async updateStatus(
    id: string,
    status: ReservationStatus,
    user: AuthenticatedUser,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id } });
      if (!reservation) throw new NotFoundException('Reservation not found');

      this.assertCanUpdateReservation(user, reservation.branchId, reservation.userId, status);
      if (!this.canTransition(reservation.status, status)) {
        throw new BadRequestException(
          `Cannot transition reservation from ${reservation.status} to ${status}`,
        );
      }

      const updated = await tx.reservation.update({
        where: { id },
        data: { status },
      });
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'Reservation',
          aggregateId: id,
          eventType: 'ReservationStatusChanged',
          payload: { reservationId: id, status },
        },
      });
      return updated;
    });
  }

  async listTables(branchId: string) {
    return this.prisma.table.findMany({
      where: {
        branchId,
        isActive: true,
        branch: { isActive: true, deletedAt: null },
      },
      orderBy: { number: 'asc' },
    });
  }

  private parseReservationDate(value: string, rejectPast = true): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException('Reservation date must use YYYY-MM-DD format');
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException('Reservation date is invalid');
    }

    if (rejectPast) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (date < today) {
        throw new BadRequestException('Reservation date cannot be in the past');
      }
      const latest = new Date(today);
      latest.setUTCFullYear(latest.getUTCFullYear() + 1);
      if (date > latest) {
        throw new BadRequestException(
          'Reservations can be made up to one year in advance',
        );
      }
    }
    return date;
  }

  private assertValidTimeRange(startTime: string, endTime: string): void {
    if (startTime >= endTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }
  }

  private assertCanUpdateReservation(
    user: AuthenticatedUser,
    reservationBranchId: string,
    reservationUserId: string,
    targetStatus: ReservationStatus,
  ): void {
    if (GLOBAL_RESERVATION_ROLES.includes(user.role)) return;
    if (BRANCH_RESERVATION_ROLES.includes(user.role)) {
      if (!user.branchId || reservationBranchId !== user.branchId) {
        throw new ForbiddenException(
          'You can only update reservations for your own branch',
        );
      }
      return;
    }
    if (reservationUserId !== user.id) {
      throw new ForbiddenException('You can only update your own reservations');
    }
    if (targetStatus !== ReservationStatus.CANCELLED) {
      throw new ForbiddenException('Customers can only cancel reservations');
    }
  }

  private canTransition(
    current: ReservationStatus,
    target: ReservationStatus,
  ): boolean {
    const transitions: Readonly<
      Record<ReservationStatus, readonly ReservationStatus[]>
    > = {
      PENDING: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
      CONFIRMED: [
        ReservationStatus.COMPLETED,
        ReservationStatus.NO_SHOW,
        ReservationStatus.CANCELLED,
      ],
      CANCELLED: [],
      COMPLETED: [],
      NO_SHOW: [],
    };
    return transitions[current].includes(target);
  }

  private isSerializationConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    );
  }
}
