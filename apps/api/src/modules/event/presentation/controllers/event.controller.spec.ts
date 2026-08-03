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
});
