import type { Server } from 'node:http';

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import request from 'supertest';
import { FranchiseController } from './franchise.controller';
import { FranchiseService } from '../../application/services/franchise.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '@warkop-yareh/database';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

function authenticatedUser(id: string, role: Role): AuthenticatedUser {
  return {
    id,
    email: `${id}@example.test`,
    name: id,
    role,
    branchId: null,
  };
}

let mockUser = authenticatedUser('user_A', Role.CUSTOMER);

@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    req.user = mockUser;
    return true;
  }
}

describe('FranchiseController (E2E / Controller)', () => {
  let app: INestApplication<Server>;
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
    mockUser = authenticatedUser('user_A', Role.CUSTOMER);
  });

  it('GET /api/v1/franchise/agreements should return 403 Forbidden for CUSTOMER role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/franchise/agreements')
      .expect(403);
  });

  it('POST /api/v1/franchise/agreements should return 403 Forbidden for CUSTOMER role', async () => {
    mockUser = authenticatedUser('user_A', Role.CUSTOMER);

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
    mockUser = authenticatedUser('staff_1', Role.STAFF);

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
    mockUser = authenticatedUser('admin_1', Role.ADMIN);

    await request(app.getHttpServer())
      .get('/api/v1/franchise/agreements')
      .expect(200);

    expect(franchiseService.listAgreements).toHaveBeenCalled();
  });

  it('POST /api/v1/franchise/agreements should allow ADMIN role', async () => {
    mockUser = authenticatedUser('admin_1', Role.ADMIN);

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
