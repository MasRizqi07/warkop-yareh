/* eslint-disable */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { TableStatus, WaiterCallType } from '@warkop-yareh/database';
import { EventsGateway } from '../../../websockets/events.gateway';
import type { ITableRepository } from '../../domain/repositories/table.repository.interface';

@Injectable()
export class TableService {
  constructor(
    @Inject('ITableRepository')
    private readonly tableRepo: ITableRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async resolveQrCode(qrCode: string) {
    const table = await this.tableRepo.getTableByQrCode(qrCode);

    if (!table) {
      throw new NotFoundException('Table not found or invalid QR code');
    }

    if (!table.isActive) {
      throw new BadRequestException('This table is currently inactive');
    }

    return table;
  }

  async getTablesByBranch(branchId: string) {
    return this.tableRepo.getTablesByBranch(branchId);
  }

  async getTableById(tableId: string) {
    return this.tableRepo.getTableById(tableId);
  }

  async updateStatus(tableId: string, newStatus: TableStatus) {
    const table = await this.tableRepo.getTableById(tableId);
    if (!table) throw new NotFoundException('Table not found');

    // State machine logic
    const isValidTransition = this.validateStatusTransition(
      table.status,
      newStatus,
    );
    if (!isValidTransition) {
      throw new BadRequestException(
        `Cannot transition table from ${table.status} to ${newStatus}`,
      );
    }

    const updated = await this.tableRepo.updateTableStatus(tableId, newStatus);

    // Broadcast table update
    this.eventsGateway.broadcastTableUpdated(updated);
    return updated;
  }

  private validateStatusTransition(
    current: TableStatus,
    target: TableStatus,
  ): boolean {
    if (current === target) return true;

    switch (current) {
      case TableStatus.AVAILABLE:
        return (
          [
            TableStatus.OCCUPIED,
            TableStatus.RESERVED,
            TableStatus.MAINTENANCE,
          ] as TableStatus[]
        ).includes(target);
      case TableStatus.OCCUPIED:
        return ([TableStatus.CLEANING] as TableStatus[]).includes(target);
      case TableStatus.RESERVED:
        return (
          [TableStatus.OCCUPIED, TableStatus.AVAILABLE] as TableStatus[]
        ).includes(target);
      case TableStatus.CLEANING:
        return (
          [TableStatus.AVAILABLE, TableStatus.MAINTENANCE] as TableStatus[]
        ).includes(target);
      case TableStatus.MAINTENANCE:
        return ([TableStatus.AVAILABLE] as TableStatus[]).includes(target);
      default:
        return false;
    }
  }

  async createWaiterCall(
    tableId: string,
    type: WaiterCallType,
  ) {
    const table = await this.tableRepo.getTableById(tableId);
    if (!table) throw new NotFoundException('Table not found');
    if (!table.isActive) {
      throw new BadRequestException('This table is currently inactive');
    }

    const since = new Date(Date.now() - 2 * 60 * 1000);
    const existing = await this.tableRepo.getRecentPendingWaiterCall(
      tableId,
      type,
      since,
    );
    if (existing) return this.withPriority(existing, type);

    const call = await this.tableRepo.createWaiterCall(tableId, type);
    const payload = this.withPriority(call, type);

    this.eventsGateway.broadcastWaiterCalled(payload);
    return payload;
  }

  private withPriority<T extends object>(call: T, type: WaiterCallType) {
    const priority =
      type === WaiterCallType.NEED_ASSISTANCE
        ? 'HIGH'
        : type === WaiterCallType.REQUEST_BILL
          ? 'MEDIUM'
          : 'LOW';
    return { ...call, priority };
  }
}
