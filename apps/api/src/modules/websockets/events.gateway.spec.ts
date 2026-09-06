import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Role } from '@warkop-yareh/database';
import { EventsGateway } from './events.gateway';
import { RawDatabaseService } from '../../infrastructure/database/raw-database.service';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: { to: jest.Mock; emit: jest.Mock };
  let mockSocket: {
    id: string;
    handshake: {
      headers: { authorization: string };
      auth: Record<string, string>;
    };
    data: Record<string, unknown>;
    rooms: Set<string>;
    join: jest.Mock;
    leave: jest.Mock;
    disconnect: jest.Mock;
  };
  let database: {
    user: { findFirst: jest.Mock };
    branch: { findFirst: jest.Mock };
    table: { findFirst: jest.Mock };
    order: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    mockSocket = {
      id: 'socket-1',
      handshake: { headers: { authorization: 'Bearer valid_token' }, auth: {} },
      data: {
        user: {
          id: 'user-1',
          email: 'staff@example.com',
          role: Role.STAFF,
          branchId: 'branch-1',
        },
        authExpiresAt: Math.floor(Date.now() / 1000) + 900,
      },
      rooms: new Set(['socket-1']),
      join: jest.fn(async (room: string) => mockSocket.rooms.add(room)),
      leave: jest.fn(async (room: string) => mockSocket.rooms.delete(room)),
      disconnect: jest.fn(),
    };
    database = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'staff@example.com',
          role: Role.STAFF,
          branchId: 'branch-1',
        }),
      },
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'branch-1' }),
      },
      table: { findFirst: jest.fn() },
      order: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({
              sub: 'user-1',
              role: Role.STAFF,
              exp: Math.floor(Date.now() / 1000) + 900,
            }),
          },
        },
        { provide: RawDatabaseService, useValue: database },
      ],
    }).compile();

    gateway = module.get(EventsGateway);
    gateway.server = mockServer as never;
  });

  it('authenticates a live database user during connection', async () => {
    mockSocket.data = {};
    await gateway.handleConnection(mockSocket as never);

    expect(database.user.findFirst).toHaveBeenCalled();
    expect(mockSocket.data.user).toEqual(
      expect.objectContaining({ id: 'user-1', branchId: 'branch-1' }),
    );
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });

  it('broadcasts orders only to branch-scoped operations rooms', () => {
    const order = { id: 'order-1', branchId: 'branch-1', status: 'PENDING' };
    gateway.broadcastOrderCreated(order);

    expect(mockServer.to).toHaveBeenCalledWith('cashier:branch-1');
    expect(mockServer.to).toHaveBeenCalledWith('kitchen:branch-1');
    expect(mockServer.to).not.toHaveBeenCalledWith('cashier');
    expect(mockServer.emit).toHaveBeenCalledWith('order.created', order);
  });

  it('broadcasts order updates to its owner room and branch rooms', () => {
    const order = { id: 'order-1', branchId: 'branch-1', status: 'PREPARING' };
    gateway.broadcastOrderUpdated(order);

    expect(mockServer.to).toHaveBeenCalledWith('order:order-1');
    expect(mockServer.to).toHaveBeenCalledWith('cashier:branch-1');
    expect(mockServer.to).toHaveBeenCalledWith('kitchen:branch-1');
    expect(mockServer.emit).toHaveBeenCalledWith('order.updated', order);
  });

  it('broadcasts waiter and table events only to their branch', () => {
    const call = {
      id: 'call-1',
      priority: 'HIGH',
      table: { branchId: 'branch-1' },
    };
    const table = { id: 'table-1', branchId: 'branch-1', status: 'OCCUPIED' };

    gateway.broadcastWaiterCalled(call);
    gateway.broadcastTableUpdated(table);

    expect(mockServer.to).toHaveBeenCalledWith('cashier:branch-1');
    expect(mockServer.to).toHaveBeenCalledWith('table:table-1');
  });

  it('joins the assigned branch cashier room and rejects cross-branch access', async () => {
    await expect(
      gateway.handleJoinCashier(mockSocket as never),
    ).resolves.toEqual({
      event: 'joined',
      room: 'cashier:branch-1',
    });
    await expect(
      gateway.handleJoinCashier(mockSocket as never, { branchId: 'branch-2' }),
    ).rejects.toThrow(WsException);
  });

  it('allows only the owner or an authorized branch operator into an order room', async () => {
    mockSocket.data.user = {
      id: 'customer-1',
      email: 'customer@example.com',
      role: Role.CUSTOMER,
      branchId: null,
    };
    database.order.findFirst.mockResolvedValue({
      id: 'order-1',
      userId: 'customer-1',
      branchId: 'branch-1',
    });

    await expect(
      gateway.handleJoinOrder(mockSocket as never, { orderId: 'order-1' }),
    ).resolves.toEqual({ event: 'joined', room: 'order:order-1' });

    database.order.findFirst.mockResolvedValue({
      id: 'order-2',
      userId: 'someone-else',
      branchId: 'branch-1',
    });
    await expect(
      gateway.handleJoinOrder(mockSocket as never, { orderId: 'order-2' }),
    ).rejects.toThrow(WsException);
  });

  it('only leaves rooms to which the current socket is subscribed', async () => {
    mockSocket.rooms.add('order:order-1');
    await expect(
      gateway.handleLeaveRoom(mockSocket as never, { room: 'order:order-1' }),
    ).resolves.toEqual({ event: 'left', room: 'order:order-1' });
    await expect(
      gateway.handleLeaveRoom(mockSocket as never, { room: 'order:other' }),
    ).rejects.toThrow(WsException);
  });
});
