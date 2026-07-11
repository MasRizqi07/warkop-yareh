import { TableStatus } from '@warkop-yareh/database';

export interface ITableRepository {
  getTableByQrCode(qrCode: string): Promise<any>;
  getTablesByBranch(branchId: string): Promise<any[]>;
  getTableById(id: string): Promise<any>;
  updateTableStatus(id: string, status: TableStatus): Promise<any>;
  createWaiterCall(
    tableId: string,
    type: 'CALL_WAITER' | 'REQUEST_BILL' | 'NEED_ASSISTANCE',
  ): Promise<any>;
}
