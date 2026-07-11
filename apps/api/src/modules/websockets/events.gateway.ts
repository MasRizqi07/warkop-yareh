import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../../infrastructure/auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      let authToken = client.handshake.headers.authorization?.split(' ')[1];
      if (!authToken) {
        authToken = client.handshake.auth?.token;
      }

      if (!authToken) {
        throw new Error('No auth token provided');
      }

      const payload = this.jwtService.verify(authToken, {
        secret: process.env.JWT_SECRET || 'fallback_secret',
      });
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // --- Room Management ---

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinCashier')
  handleJoinCashier(@ConnectedSocket() client: Socket) {
    client.join('cashier');
    return { event: 'joined', room: 'cashier' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinKitchen')
  handleJoinKitchen(@ConnectedSocket() client: Socket) {
    client.join('kitchen');
    return { event: 'joined', room: 'kitchen' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinTable')
  handleJoinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tableId: string },
  ) {
    const room = `table:${payload.tableId}`;
    client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinOrder')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderId: string },
  ) {
    const room = `order:${payload.orderId}`;
    client.join(room);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    client.leave(payload.room);
    return { event: 'left', room: payload.room };
  }

  // --- Broadcast Methods (To be called from other modules) ---

  broadcastOrderCreated(order: any) {
    this.server.to('cashier').to('kitchen').emit('order.created', order);
  }

  broadcastOrderUpdated(order: any) {
    this.server
      .to('cashier')
      .to('kitchen')
      .to(`order:${order.id}`)
      .emit('order.updated', order);
  }

  broadcastPaymentUpdated(order: any) {
    this.server
      .to('cashier')
      .to(`order:${order.id}`)
      .emit('payment.success', order);
  }

  broadcastWaiterCalled(call: any) {
    this.server.to('cashier').emit('waiter.called', call);
  }

  broadcastTableUpdated(table: any) {
    this.server.to('cashier').emit('table.updated', table);
  }
}
