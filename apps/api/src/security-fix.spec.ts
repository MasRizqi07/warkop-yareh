import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { CommunityController } from './modules/community/presentation/controllers/community.controller';
import { CommunityService } from './modules/community/application/services/community.service';
import { EventController } from './modules/event/presentation/controllers/event.controller';
import { EventService } from './modules/event/application/services/event.service';
import { LoyaltyController } from './modules/loyalty/presentation/controllers/loyalty.controller';
import { LoyaltyService } from './modules/loyalty/application/services/loyalty.service';
import { OrdersController } from './modules/ordering/presentation/controllers/orders.controller';
import { OrderingService } from './modules/ordering/application/services/ordering.service';
import { ReservationsController } from './modules/reservation/presentation/controllers/reservations.controller';
import { ReservationService } from './modules/reservation/application/services/reservation.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';

// Create a mock auth guard that inserts a configurable user object
let mockUser: any = { id: 'user_A', role: 'CUSTOMER' };

@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  }
}

describe('Security Fixes — Client-Supplied Identity Protection', () => {
  let app: INestApplication<App>;
  let communityService: jest.Mocked<Partial<CommunityService>>;
  let eventService: jest.Mocked<Partial<EventService>>;
  let loyaltyService: jest.Mocked<Partial<LoyaltyService>>;
  let orderingService: jest.Mocked<Partial<OrderingService>>;
  let reservationService: jest.Mocked<Partial<ReservationService>>;

  beforeAll(async () => {
    communityService = {
      joinGroup: jest.fn().mockResolvedValue({ success: true }),
      createPost: jest
        .fn()
        .mockResolvedValue({ id: 'post_1', authorId: 'user_A' }),
    };
    eventService = {
      registerForEvent: jest.fn().mockResolvedValue({ success: true }),
    };
    loyaltyService = {
      getAvailableRewards: jest.fn().mockResolvedValue([]),
      getLoyaltyStatus: jest
        .fn()
        .mockResolvedValue({ id: 'status_1', props: {} }),
      listTransactions: jest.fn().mockResolvedValue([]),
      redeemReward: jest.fn().mockResolvedValue({ success: true }),
      awardPoints: jest.fn().mockResolvedValue({ success: true }),
    };
    orderingService = {
      listOrders: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createOrder: jest
        .fn()
        .mockResolvedValue({ id: 'order_1', userId: 'user_A' }),
    };
    reservationService = {
      listReservations: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createReservation: jest
        .fn()
        .mockResolvedValue({ id: 'res_1', userId: 'user_A' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        CommunityController,
        EventController,
        LoyaltyController,
        OrdersController,
        ReservationsController,
      ],
      providers: [
        { provide: CommunityService, useValue: communityService },
        { provide: EventService, useValue: eventService },
        { provide: LoyaltyService, useValue: loyaltyService },
        { provide: OrderingService, useValue: orderingService },
        { provide: ReservationService, useValue: reservationService },
        { provide: APP_GUARD, useClass: MockAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'user_A', role: 'CUSTOMER' };
  });

  it('1. joinGroup: should ignore client-supplied userId (User B) and use authenticated user (User A)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/community/groups/group_123/join')
      .send({ userId: 'user_B' })
      .expect(200);

    expect(communityService.joinGroup).toHaveBeenCalledWith(
      'user_A',
      'group_123',
    );
  });

  it('2. registerForEvent: should ignore client-supplied userId (User B) and use authenticated user (User A)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/events/event_123/register')
      .send({ userId: 'user_B' })
      .expect(201);

    expect(eventService.registerForEvent).toHaveBeenCalledWith(
      'user_A',
      'event_123',
    );
  });

  it('3a. getStatus: should ignore path userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/loyalty/user_B')
      .expect(200);

    expect(loyaltyService.getLoyaltyStatus).toHaveBeenCalledWith('user_A');
  });

  it('3b. getStatus: should allow path userId (User B) for ADMIN', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };
    await request(app.getHttpServer())
      .get('/api/v1/loyalty/user_B')
      .expect(200);

    expect(loyaltyService.getLoyaltyStatus).toHaveBeenCalledWith('user_B');
  });

  it('3c. getTransactions: should ignore path userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/loyalty/user_B/transactions')
      .expect(200);

    expect(loyaltyService.listTransactions).toHaveBeenCalledWith('user_A');
  });

  it('3d. getTransactions: should allow path userId (User B) for STAFF', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF' };
    await request(app.getHttpServer())
      .get('/api/v1/loyalty/user_B/transactions')
      .expect(200);

    expect(loyaltyService.listTransactions).toHaveBeenCalledWith('user_B');
  });

  it('3e. redeemReward: should ignore path userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/loyalty/user_B/redeem')
      .send({ rewardId: 'reward_123' })
      .expect(201);

    expect(loyaltyService.redeemReward).toHaveBeenCalledWith(
      'user_A',
      'reward_123',
    );
  });

  it('3f. redeemReward: should allow path userId (User B) for MANAGER', async () => {
    mockUser = { id: 'manager_1', role: 'MANAGER' };
    await request(app.getHttpServer())
      .post('/api/v1/loyalty/user_B/redeem')
      .send({ rewardId: 'reward_123' })
      .expect(201);

    expect(loyaltyService.redeemReward).toHaveBeenCalledWith(
      'user_B',
      'reward_123',
    );
  });

  it('4a. listOrders: should ignore query userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/orders?userId=user_B')
      .expect(200);

    expect(orderingService.listOrders).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('4b. listOrders: should allow query userId (User B) for ADMIN', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };
    await request(app.getHttpServer())
      .get('/api/v1/orders?userId=user_B')
      .expect(200);

    expect(orderingService.listOrders).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_B' }),
    );
  });

  it('5a. listReservations: should ignore query userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/reservations?userId=user_B')
      .expect(200);

    expect(reservationService.listReservations).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('5b. listReservations: should allow query userId (User B) for STAFF', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF' };
    await request(app.getHttpServer())
      .get('/api/v1/reservations?userId=user_B')
      .expect(200);

    expect(reservationService.listReservations).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_B' }),
    );
  });

  it('3g. awardPoints: should block CUSTOMER role with 403 Forbidden', async () => {
    mockUser = { id: 'user_A', role: 'CUSTOMER' };
    await request(app.getHttpServer())
      .post('/api/v1/loyalty/user_B/points')
      .send({ points: 100, reason: 'test' })
      .expect(403);
  });

  it('3h. awardPoints: should allow STAFF role to award points', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF' };
    await request(app.getHttpServer())
      .post('/api/v1/loyalty/user_B/points')
      .send({ points: 100, reason: 'test' })
      .expect(201);

    expect(loyaltyService.awardPoints).toHaveBeenCalledWith(
      'user_B',
      100,
      'test',
    );
  });

  it('6a. createOrder: should ignore body userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({ userId: 'user_B', branchId: 'branch_123', items: [] })
      .expect(201);

    expect(orderingService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('6b. createReservation: should ignore body userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/reservations')
      .send({
        userId: 'user_B',
        branchId: 'branch_123',
        date: '2026-07-11',
        startTime: '10:00',
        endTime: '11:00',
        guestCount: 2,
      })
      .expect(201);

    expect(reservationService.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('6c. createPost: should ignore body authorId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .send({ groupId: 'group_123', authorId: 'user_B', content: 'hello' })
      .expect(201);

    expect(communityService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: 'user_A' }),
    );
  });
});
