/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import request from 'supertest';
import { EventController } from './event.controller';
import { EventService } from '../../application/services/event.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../../../common/guards/roles.guard';

let mockUser: any = { id: 'user_A', role: 'CUSTOMER' };

@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  }
}

describe('EventController (E2E / Controller)', () => {
  let app: INestApplication;
  let eventService: jest.Mocked<Partial<EventService>>;

  beforeAll(async () => {
    eventService = {
      registerForEvent: jest.fn().mockResolvedValue({ success: true }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: eventService },
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

  it('registerForEvent: should ignore client-supplied userId (User B) and use authenticated user (User A)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/events/event_123/register')
      .send({ userId: 'user_B' })
      .expect(201);

    expect(eventService.registerForEvent).toHaveBeenCalledWith(
      'user_A',
      'event_123',
    );
  });

  it('listEvents: should list events with pagination and optional branchId', async () => {
    eventService.listEvents = jest.fn().mockResolvedValue({ data: [], total: 0 });

    await request(app.getHttpServer())
      .get('/api/v1/events?page=1&limit=10&branchId=branch_1')
      .expect(200);

    expect(eventService.listEvents).toHaveBeenCalledWith('branch_1', 1, 10);
  });

  it('createEvent: should allow STAFF/MANAGER/ADMIN to create an event', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };
    eventService.createEvent = jest.fn().mockResolvedValue({ id: 'event_new', title: 'Live Music' });

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        title: 'Live Music',
        branchId: 'branch_1',
        date: '2026-08-15',
        startTime: '19:00',
        endTime: '22:00',
        capacity: 50,
      })
      .expect(201);

    expect(eventService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Live Music', capacity: 50 }),
    );
  });

  it('listRegistrations: should list registrations for an event', async () => {
    eventService.listRegistrations = jest.fn().mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/api/v1/events/event_123/registrations')
      .expect(200);

    expect(eventService.listRegistrations).toHaveBeenCalledWith('event_123');
  });
});
