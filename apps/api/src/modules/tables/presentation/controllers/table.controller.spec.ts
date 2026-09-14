import type { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import request from 'supertest';
import { TableController } from './table.controller';
import { TableService } from '../../application/services/table.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Role } from '@warkop-yareh/database';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

const staffUser: AuthenticatedUser = {
  id: 'user_A',
  email: 'staff@example.test',
  name: 'Staff',
  role: Role.STAFF,
  branchId: 'branch_1',
};
let mockUser: AuthenticatedUser = staffUser;

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

describe('TableController (E2E / Controller)', () => {
  let app: INestApplication<Server>;
  let tableService: jest.Mocked<Partial<TableService>>;

  beforeAll(async () => {
    tableService = {
      resolveQrCode: jest.fn().mockResolvedValue({ id: 'tbl_1', number: 'T1' }),
      getTablesByBranch: jest.fn().mockResolvedValue([]),
      getTableById: jest
        .fn()
        .mockResolvedValue({ id: 'tbl_1', branchId: 'branch_1' }),
      updateStatus: jest
        .fn()
        .mockResolvedValue({ id: 'tbl_1', status: 'OCCUPIED' }),
      createWaiterCall: jest.fn().mockResolvedValue({ id: 'call_1' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TableController],
      providers: [
        { provide: TableService, useValue: tableService },
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
    mockUser = staffUser;
  });

  it('GET /api/v1/tables/qr/:code should resolve QR code (Public)', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tables/qr/QR_T1')
      .expect(200);

    expect(tableService.resolveQrCode).toHaveBeenCalledWith('QR_T1');
  });

  it('GET /api/v1/tables/branch/:branchId should return tables for user branch', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tables/branch/branch_1')
      .expect(200);

    expect(tableService.getTablesByBranch).toHaveBeenCalledWith('branch_1');
  });

  it('GET /api/v1/tables/branch/:branchId should throw 403 Forbidden for another branch when role is STAFF', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/tables/branch/other_branch')
      .expect(403);
  });

  it('PATCH /api/v1/tables/:id/status should update table status', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tables/tbl_1/status')
      .send({ status: 'OCCUPIED' })
      .expect(200);

    expect(tableService.updateStatus).toHaveBeenCalledWith('tbl_1', 'OCCUPIED');
  });

  it('POST /api/v1/tables/:id/call should trigger waiter call (Public)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tables/tbl_1/call')
      .send({ type: 'CALL_WAITER' })
      .expect(200);

    expect(tableService.createWaiterCall).toHaveBeenCalledWith(
      'tbl_1',
      'CALL_WAITER',
    );
  });
});
