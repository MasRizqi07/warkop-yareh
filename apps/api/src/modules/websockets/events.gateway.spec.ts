/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: any;
  let mockSocket: any;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockSocket = {
      id: 'socket-1',
      handshake: { headers: { authorization: 'Bearer valid_token' }, auth: {} },
      data: {},
      join: jest.fn(),
      leave: jest.fn(),
      disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ id: 'user-1', role: 'STAFF' }),
          },
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer as any;
  });

  describe('Broadcast Methods', () => {
    it('broadcastOrderCreated should emit order.created to cashier and kitchen rooms', () => {
      const order = { id: 'order-1', status: 'PENDING' };
      gateway.broadcastOrderCreated(order);

      expect(mockServer.to).toHaveBeenCalledWith('cashier');
      expect(mockServer.to).toHaveBeenCalledWith('kitchen');
      expect(mockServer.emit).toHaveBeenCalledWith('order.created', order);
    });

    it('broadcastOrderUpdated should emit order.updated to cashier, kitchen, and order room', () => {
      const order = { id: 'order-1', status: 'PREPARING' };
      gateway.broadcastOrderUpdated(order);

      expect(mockServer.to).toHaveBeenCalledWith('cashier');
      expect(mockServer.to).toHaveBeenCalledWith('kitchen');
      expect(mockServer.to).toHaveBeenCalledWith('order:order-1');
      expect(mockServer.emit).toHaveBeenCalledWith('order.updated', order);
    });

    it('broadcastPaymentUpdated should emit payment.success to cashier and order room', () => {
      const order = { id: 'order-1', status: 'PAID' };
      gateway.broadcastPaymentUpdated(order);

      expect(mockServer.to).toHaveBeenCalledWith('cashier');
      expect(mockServer.to).toHaveBeenCalledWith('order:order-1');
      expect(mockServer.emit).toHaveBeenCalledWith('payment.success', order);
    });

    it('broadcastWaiterCalled should emit waiter.called to cashier room', () => {
      const call = { id: 'call-1', priority: 'HIGH' };
      gateway.broadcastWaiterCalled(call);

      expect(mockServer.to).toHaveBeenCalledWith('cashier');
      expect(mockServer.emit).toHaveBeenCalledWith('waiter.called', call);
    });

    it('broadcastTableUpdated should emit table.updated to cashier room', () => {
      const table = { id: 'table-1', status: 'OCCUPIED' };
      gateway.broadcastTableUpdated(table);

      expect(mockServer.to).toHaveBeenCalledWith('cashier');
      expect(mockServer.emit).toHaveBeenCalledWith('table.updated', table);
    });
  });

  describe('Room Subscriptions', () => {
    it('handleJoinCashier should join cashier room', () => {
      const res = gateway.handleJoinCashier(mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith('cashier');
      expect(res).toEqual({ event: 'joined', room: 'cashier' });
    });

    it('handleJoinKitchen should join kitchen room', () => {
      const res = gateway.handleJoinKitchen(mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith('kitchen');
      expect(res).toEqual({ event: 'joined', room: 'kitchen' });
    });

    it('handleJoinTable should join table room', () => {
      const res = gateway.handleJoinTable(mockSocket, { tableId: 'tbl-1' });
      expect(mockSocket.join).toHaveBeenCalledWith('table:tbl-1');
      expect(res).toEqual({ event: 'joined', room: 'table:tbl-1' });
    });

    it('handleJoinOrder should join order room', () => {
      const res = gateway.handleJoinOrder(mockSocket, { orderId: 'ord-1' });
      expect(mockSocket.join).toHaveBeenCalledWith('order:ord-1');
      expect(res).toEqual({ event: 'joined', room: 'order:ord-1' });
    });

    it('handleLeaveRoom should leave specified room', () => {
      const res = gateway.handleLeaveRoom(mockSocket, { room: 'kitchen' });
      expect(mockSocket.leave).toHaveBeenCalledWith('kitchen');
      expect(res).toEqual({ event: 'left', room: 'kitchen' });
    });
  });
});
