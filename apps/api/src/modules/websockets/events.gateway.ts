import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { OrderStatus, Role } from '@warkop-yareh/database';
import { Server, Socket } from 'socket.io';
import { RawDatabaseService } from '../../infrastructure/database/raw-database.service';
import { WsJwtGuard } from '../../infrastructure/auth/ws-jwt.guard';
import type { JwtPayload } from '../../infrastructure/auth/jwt.strategy';
import type { WsAuthenticatedUser } from '../../infrastructure/auth/ws-auth-user.interface';

const LOCAL_SOCKET_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
];
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter((origin): origin is string => Boolean(origin));
const socketOrigins =
  process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...configuredOrigins, ...LOCAL_SOCKET_ORIGINS];

const GLOBAL_ROLES: ReadonlySet<Role> = new Set([Role.ADMIN, Role.SUPERADMIN]);
const CASHIER_ROLES: ReadonlySet<Role> = new Set([
  Role.STAFF,
  Role.CASHIER,
  Role.MANAGER,
  Role.OWNER,
  ...GLOBAL_ROLES,
]);
const KITCHEN_ROLES: ReadonlySet<Role> = new Set([
  Role.KITCHEN,
  Role.MANAGER,
  Role.OWNER,
  ...GLOBAL_ROLES,
]);
const BRANCH_OPERATOR_ROLES: ReadonlySet<Role> = new Set([
  Role.STAFF,
  Role.CASHIER,
  Role.KITCHEN,
  Role.MANAGER,
  Role.OWNER,
]);

interface RoomBranchPayload {
  branchId?: string;
}

interface ResourcePayload {
  tableId?: string;
  orderId?: string;
}

interface RealtimeOrder {
  id: string;
  branchId: string | null;
}

interface RealtimeTable {
  id: string;
  branchId: string;
}

interface RealtimeWaiterCall {
  id: string;
  table: { branchId: string };
}

@WebSocketGateway({
  cors: {
    origin: socketOrigins,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly database: RawDatabaseService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('No auth token provided');

      const payload = this.jwtService.verify<JwtPayload & { exp?: number }>(
        token,
        {
          secret: this.requireJwtSecret(),
        },
      );
      const user = await this.database.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
        select: { id: true, email: true, role: true, branchId: true },
      });
      if (!user) throw new Error('User not found or disabled');

      client.data.user = user satisfies WsAuthenticatedUser;
      client.data.authExpiresAt = payload.exp;
      this.logger.debug(`Realtime client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Unauthorized realtime connection: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Realtime client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinCashier')
  async handleJoinCashier(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomBranchPayload = {},
  ) {
    const user = this.getUser(client);
    if (!CASHIER_ROLES.has(user.role)) {
      throw new WsException('Cashier room access denied');
    }
    const branchId = await this.resolveBranch(user, payload.branchId);
    const room = `cashier:${branchId}`;
    await client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinKitchen')
  async handleJoinKitchen(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomBranchPayload = {},
  ) {
    const user = this.getUser(client);
    if (!KITCHEN_ROLES.has(user.role)) {
      throw new WsException('Kitchen room access denied');
    }
    const branchId = await this.resolveBranch(user, payload.branchId);
    const room = `kitchen:${branchId}`;
    await client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinTable')
  async handleJoinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResourcePayload,
  ) {
    const tableId = this.requireResourceId(payload?.tableId, 'tableId');
    const user = this.getUser(client);
    const table = await this.database.table.findFirst({
      where: {
        id: tableId,
        isActive: true,
        branch: { isActive: true, deletedAt: null },
      },
      select: { id: true, branchId: true },
    });
    if (!table) throw new WsException('Table not found');

    if (!this.canAccessBranch(user, table.branchId)) {
      const activeOrder = await this.database.order.findFirst({
        where: {
          tableId,
          userId: user.id,
          deletedAt: null,
          status: {
            notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          },
        },
        select: { id: true },
      });
      if (!activeOrder) throw new WsException('Table room access denied');
    }

    const room = `table:${table.id}`;
    await client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinOrder')
  async handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResourcePayload,
  ) {
    const orderId = this.requireResourceId(payload?.orderId, 'orderId');
    const user = this.getUser(client);
    const order = await this.database.order.findFirst({
      where: { id: orderId, deletedAt: null },
      select: { id: true, userId: true, branchId: true },
    });
    if (!order) throw new WsException('Order not found');
    const ownsOrder = order.userId === user.id;
    const canManageBranch =
      Boolean(order.branchId) && this.canAccessBranch(user, order.branchId!);
    if (!ownsOrder && !canManageBranch) {
      throw new WsException('Order room access denied');
    }

    const room = `order:${order.id}`;
    await client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room?: string },
  ) {
    const room = this.requireResourceId(payload?.room, 'room');
    if (!client.rooms.has(room)) {
      throw new WsException('Client is not subscribed to this room');
    }
    await client.leave(room);
    return { event: 'left', room };
  }

  broadcastOrderCreated<T extends RealtimeOrder>(order: T): void {
    if (!order.branchId) return;
    this.server
      .to(`cashier:${order.branchId}`)
      .to(`kitchen:${order.branchId}`)
      .emit('order.created', order);
  }

  broadcastOrderUpdated<T extends RealtimeOrder>(order: T): void {
    const rooms = this.server.to(`order:${order.id}`);
    if (order.branchId) {
      rooms.to(`cashier:${order.branchId}`).to(`kitchen:${order.branchId}`);
    }
    rooms.emit('order.updated', order);
  }

  broadcastPaymentUpdated<T extends RealtimeOrder>(order: T): void {
    const rooms = this.server.to(`order:${order.id}`);
    if (order.branchId) rooms.to(`cashier:${order.branchId}`);
    rooms.emit('payment.success', order);
  }

  broadcastWaiterCalled<T extends RealtimeWaiterCall>(call: T): void {
    this.server
      .to(`cashier:${call.table.branchId}`)
      .emit('waiter.called', call);
  }

  broadcastTableUpdated<T extends RealtimeTable>(table: T): void {
    this.server
      .to(`cashier:${table.branchId}`)
      .to(`table:${table.id}`)
      .emit('table.updated', table);
  }

  private extractToken(client: Socket): string | undefined {
    const authorization = client.handshake.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice('Bearer '.length).trim() || undefined;
    }
    const token = client.handshake.auth?.token;
    return typeof token === 'string' && token.length > 0 ? token : undefined;
  }

  private requireJwtSecret(): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return process.env.JWT_SECRET;
  }

  private getUser(client: Socket): WsAuthenticatedUser {
    const user = client.data.user as WsAuthenticatedUser | undefined;
    if (!user) throw new WsException('Unauthorized access');
    return user;
  }

  private async resolveBranch(
    user: WsAuthenticatedUser,
    requestedBranchId?: string,
  ): Promise<string> {
    const branchId = GLOBAL_ROLES.has(user.role)
      ? requestedBranchId
      : user.branchId;
    if (!branchId) throw new WsException('A branch is required');
    if (
      !GLOBAL_ROLES.has(user.role) &&
      requestedBranchId &&
      requestedBranchId !== branchId
    ) {
      throw new WsException('Cross-branch room access denied');
    }
    const branch = await this.database.branch.findFirst({
      where: { id: branchId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!branch) throw new WsException('Branch not found');
    return branch.id;
  }

  private canAccessBranch(
    user: WsAuthenticatedUser,
    branchId: string,
  ): boolean {
    return (
      GLOBAL_ROLES.has(user.role) ||
      (BRANCH_OPERATOR_ROLES.has(user.role) && user.branchId === branchId)
    );
  }

  private requireResourceId(value: string | undefined, field: string): string {
    if (!value || value.length > 160 || !/^[a-zA-Z0-9:_-]+$/.test(value)) {
      throw new WsException(`${field} is invalid`);
    }
    return value;
  }
}
