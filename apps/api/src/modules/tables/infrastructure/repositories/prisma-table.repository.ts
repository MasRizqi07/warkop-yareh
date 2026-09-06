import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { ITableRepository } from '../../domain/repositories/table.repository.interface';
import { TableStatus } from '@warkop-yareh/database';
import { WaiterCallType } from '@warkop-yareh/database';

@Injectable()
export class PrismaTableRepository implements ITableRepository {
  constructor(private readonly prisma: DatabaseService) {}

  async getTableByQrCode(qrCode: string) {
    return this.prisma.table.findUnique({
      where: { qrCode },
      include: { branch: true },
    });
  }

  async getTablesByBranch(branchId: string) {
    return this.prisma.table.findMany({
      where: { branchId },
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          select: { id: true, status: true, total: true, createdAt: true },
          take: 1,
        },
      },
    });
  }

  async getTableById(id: string) {
    return this.prisma.table.findUnique({ where: { id } });
  }

  async updateTableStatus(id: string, status: TableStatus) {
    return this.prisma.table.update({
      where: { id },
      data: { status },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          select: { id: true, status: true, total: true, createdAt: true },
          take: 1,
        },
      },
    });
  }

  async getRecentPendingWaiterCall(
    tableId: string,
    type: WaiterCallType,
    since: Date,
  ) {
    return this.prisma.waiterCall.findFirst({
      where: {
        tableId,
        type,
        status: 'PENDING',
        createdAt: { gte: since },
      },
      include: { table: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWaiterCall(
    tableId: string,
    type: WaiterCallType,
  ) {
    return this.prisma.waiterCall.create({
      data: {
        tableId,
        type,
      },
      include: {
        table: true,
      },
    });
  }
}
