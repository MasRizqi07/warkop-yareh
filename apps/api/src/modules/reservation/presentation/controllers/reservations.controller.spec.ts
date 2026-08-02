/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import request from 'supertest';
import { ReservationsController } from './reservations.controller';
import { ReservationService } from '../../application/services/reservation.service';
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

describe('ReservationsController (E2E / Controller)', () => {
  let app: INestApplication;
  let reservationService: jest.Mocked<Partial<ReservationService>>;

  beforeAll(async () => {
    reservationService = {
      listReservations: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      createReservation: jest.fn().mockResolvedValue({ id: 'res_1', userId: 'user_A' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
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

  it('createReservation: should ignore body userId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
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
});
