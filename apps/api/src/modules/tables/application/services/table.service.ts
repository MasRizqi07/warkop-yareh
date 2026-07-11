import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { TableStatus } from '@warkop-yareh/database';
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
    type: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE',
  ) {
    const table = await this.tableRepo.getTableById(tableId);
    if (!table) throw new NotFoundException('Table not found');

    const call = await this.tableRepo.createWaiterCall(tableId, type);

    // Append priority for the frontend
    const priority =
      type === 'NEED_ASSISTANCE'
        ? 'HIGH'
        : type === 'REQUEST_BILL'
          ? 'MEDIUM'
          : 'LOW';
    const payload = { ...call, priority };

    this.eventsGateway.broadcastWaiterCalled(payload);
    return payload;
  }
}
