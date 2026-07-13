import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: DatabaseService) {}

  async createReservation(data: {
    userId: string;
    branchId: string;
    tableId?: string;
    date: string;
    startTime: string;
    endTime: string;
    guestCount: number;
    specialRequests?: string;
  }) {
    return this.prisma.$transaction(async (tx: any) => {
      const reservation = await tx.reservation.create({
        data: {
          userId: data.userId,
          branchId: data.branchId,
          tableId: data.tableId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          guestCount: data.guestCount,
          specialRequests: data.specialRequests,
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
    });
  }

  async listReservations(params: {
    branchId?: string;
    userId?: string;
    date?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const { branchId, userId, date, status, page, limit } = params;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (userId) where.userId = userId;
    if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: {
          table: true,
          user: { select: { id: true, name: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.reservation.count({ where }),
    ]);
    return { data, total };
  }

  async updateStatus(id: string, status: string, user?: { id: string; role: string; branchId: string }) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (user) {
      const isSuperAdmin = ['SUPERADMIN', 'ADMIN'].includes(user.role);
      const isEmployee = ['STAFF', 'MANAGER', 'OWNER'].includes(user.role);

      if (!isSuperAdmin) {
        if (isEmployee) {
          if (reservation.branchId !== user.branchId) {
            throw new ForbiddenException('You can only update reservations for your own branch');
          }
        } else {
          if (reservation.userId !== user.id) {
            throw new ForbiddenException('You can only update your own reservations');
          }
          if (status !== 'CANCELLED') {
            throw new ForbiddenException('Customers can only cancel their reservations');
          }
          if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            throw new ForbiddenException('Cannot cancel a completed or already cancelled reservation');
          }
        }
      }
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async listTables(branchId: string) {
    return this.prisma.table.findMany({ where: { branchId, isActive: true } });
  }
}
