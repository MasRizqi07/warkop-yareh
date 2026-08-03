/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import request from 'supertest';
import { FranchiseController } from './franchise.controller';
import { FranchiseService } from '../../application/services/franchise.service';
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

describe('FranchiseController (E2E / Controller)', () => {
  let app: INestApplication;
  let franchiseService: jest.Mocked<Partial<FranchiseService>>;

  beforeAll(async () => {
    franchiseService = {
      createAgreement: jest.fn().mockResolvedValue({ id: 'agr_1' }),
      listAgreements: jest.fn().mockResolvedValue([]),
      getAgreement: jest.fn().mockResolvedValue({ id: 'agr_1' }),
      createBilling: jest.fn().mockResolvedValue({ id: 'bill_1' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FranchiseController],
      providers: [
        { provide: FranchiseService, useValue: franchiseService },
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

  it('GET /api/v1/franchise/agreements should return 403 Forbidden for CUSTOMER role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/franchise/agreements')
      .expect(403);
  });

  it('POST /api/v1/franchise/agreements should return 403 Forbidden for CUSTOMER role', async () => {
    mockUser = { id: 'user_A', role: 'CUSTOMER' };

    await request(app.getHttpServer())
      .post('/api/v1/franchise/agreements')
      .send({
        ownerName: 'Budi',
        ownerEmail: 'budi@example.com',
        branchId: 'branch_1',
        monthlyFee: 5000000,
        agreementStart: '2026-01-01',
      })
      .expect(403);
  });

  it('POST /api/v1/franchise/billings should return 403 Forbidden for STAFF role', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF' };

    await request(app.getHttpServer())
      .post('/api/v1/franchise/billings')
      .send({
        agreementId: 'agr_1',
        period: '2026-08',
        amount: 5000000,
        dueDate: '2026-08-10',
      })
      .expect(403);
  });

  it('GET /api/v1/franchise/agreements should allow ADMIN role', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };

    await request(app.getHttpServer())
      .get('/api/v1/franchise/agreements')
      .expect(200);

    expect(franchiseService.listAgreements).toHaveBeenCalled();
  });

  it('POST /api/v1/franchise/agreements should allow ADMIN role', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };

    await request(app.getHttpServer())
      .post('/api/v1/franchise/agreements')
      .send({
        ownerName: 'Budi',
        ownerEmail: 'budi@example.com',
        branchId: 'branch_1',
        monthlyFee: 5000000,
        agreementStart: '2026-01-01',
      })
      .expect(201);

    expect(franchiseService.createAgreement).toHaveBeenCalled();
  });
});
