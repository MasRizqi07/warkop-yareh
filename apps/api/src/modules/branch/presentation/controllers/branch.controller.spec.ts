/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import request from 'supertest';
import { BranchController } from './branch.controller';
import { BranchService } from '../../application/services/branch.service';
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

describe('BranchController (E2E / Controller)', () => {
  let app: INestApplication;
  let branchService: jest.Mocked<Partial<BranchService>>;

  beforeAll(async () => {
    branchService = {
      listBranches: jest.fn().mockResolvedValue([]),
      getBranch: jest.fn().mockResolvedValue({ id: 'branch_1' }),
      createBranch: jest.fn().mockResolvedValue({ id: 'branch_1', name: 'Branch 1' }),
      updateBranch: jest.fn().mockResolvedValue({ id: 'branch_1', name: 'Updated Branch' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BranchController],
      providers: [
        { provide: BranchService, useValue: branchService },
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

  it('GET /api/v1/branches should be public', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/branches')
      .expect(200);

    expect(branchService.listBranches).toHaveBeenCalled();
  });

  it('POST /api/v1/branches should return 403 Forbidden for non-ADMIN/OWNER role', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/branches')
      .send({ name: 'New Branch', address: 'Main St' })
      .expect(403);
  });

  it('POST /api/v1/branches should allow ADMIN to create branch', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };

    await request(app.getHttpServer())
      .post('/api/v1/branches')
      .send({ name: 'New Branch', address: 'Main St' })
      .expect(201);

    expect(branchService.createBranch).toHaveBeenCalled();
  });
});
