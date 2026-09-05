import type {
  Prisma,
  Table,
  TableStatus,
  WaiterCallType,
} from '@warkop-yareh/database';

export type TableWithBranch = Prisma.TableGetPayload<{
  include: { branch: true };
}>;

export type TableWithActiveOrders = Prisma.TableGetPayload<{
  include: {
    orders: {
      select: { id: true; status: true; total: true; createdAt: true };
    };
  };
}>;

export type WaiterCallWithTable = Prisma.WaiterCallGetPayload<{
  include: { table: true };
}>;

export interface ITableRepository {
  getTableByQrCode(qrCode: string): Promise<TableWithBranch | null>;
  getTablesByBranch(branchId: string): Promise<TableWithActiveOrders[]>;
  getTableById(id: string): Promise<Table | null>;
  updateTableStatus(
    id: string,
    status: TableStatus,
  ): Promise<TableWithActiveOrders>;
  getRecentPendingWaiterCall(
    tableId: string,
    type: WaiterCallType,
    since: Date,
  ): Promise<WaiterCallWithTable | null>;
  createWaiterCall(
    tableId: string,
    type: WaiterCallType,
  ): Promise<WaiterCallWithTable>;
}
