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

        OrdersController,
        ReservationsController,
      ],
      providers: [
        { provide: CommunityService, useValue: communityService },
        { provide: EventService, useValue: eventService },

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
