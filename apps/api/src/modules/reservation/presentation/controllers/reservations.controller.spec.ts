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

  it('listReservations: should list reservations with pagination and role-based filtering', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/reservations?page=1&limit=10')
      .expect(200);

    expect(reservationService.listReservations).toHaveBeenCalled();
  });

  it('updateStatus: should delegate status update to ReservationService', async () => {
    reservationService.updateStatus = jest.fn().mockResolvedValue({ id: 'res_1', status: 'CANCELLED' });

    await request(app.getHttpServer())
      .patch('/api/v1/reservations/res_1/status')
      .send({ status: 'CANCELLED' })
      .expect(200);

    expect(reservationService.updateStatus).toHaveBeenCalledWith(
      'res_1',
      'CANCELLED',
      expect.objectContaining({ id: 'user_A' }),
    );
  });

  it('listTables: should return active tables for specified branchId', async () => {
    reservationService.listTables = jest.fn().mockResolvedValue([{ id: 'tbl-1', branchId: 'branch_1' }]);

    await request(app.getHttpServer())
      .get('/api/v1/branches/branch_1/tables')
      .expect(200);

    expect(reservationService.listTables).toHaveBeenCalledWith('branch_1');
  });
});
