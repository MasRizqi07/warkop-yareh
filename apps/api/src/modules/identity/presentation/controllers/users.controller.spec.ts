import type { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import request from 'supertest';
import { UsersController } from './users.controller';
import { IdentityService } from '../../application/services/identity.service';
import { APP_GUARD } from '@nestjs/core';

let mockCurrentUser: any = null;

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!mockCurrentUser) {
      return false; // Unauthorized
    }
    req.user = mockCurrentUser;
    return true;
  }
}

describe('UsersController (E2E / Controller)', () => {
  let app: INestApplication<Server>;
  let identityService: jest.Mocked<Partial<IdentityService>>;

  beforeAll(async () => {
    identityService = {
      getUserProfile: jest.fn(),
      listUsers: jest.fn(),
      updateUser: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: IdentityService, useValue: identityService },
        { provide: APP_GUARD, useClass: MockJwtGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = null;
  });

  it('GET /api/v1/users/:id -> returns 403 / 401 when no authenticated user token is provided', async () => {
    mockCurrentUser = null;

    await request(app.getHttpServer())
      .get('/api/v1/users/user-target-id')
      .expect(403); // CanActivate returns false
  });

  it('rejects another customer profile before querying private data', async () => {
    mockCurrentUser = { id: 'user-customer-self', role: 'CUSTOMER' };
    await request(app.getHttpServer())
      .get('/api/v1/users/other-user-target-id')
      .expect(403);
    expect(identityService.getUserProfile).not.toHaveBeenCalled();
  });

  it('allows a customer to read their own profile', async () => {
    mockCurrentUser = { id: 'user-customer-self', role: 'CUSTOMER' };
    (identityService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 'user-customer-self',
      branchId: null,
    });
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/user-customer-self')
      .expect(200);
    expect(res.body.data.id).toBe('user-customer-self');
  });

  it('GET /api/v1/users/:id -> ADMIN role can view any requested user profile by ID', async () => {
    mockCurrentUser = { id: 'user-admin', role: 'ADMIN' };
    (identityService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 'target-user-id',
      name: 'Target User',
      email: 'target@warkop.com',
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/target-user-id')
      .expect(200);

    expect(identityService.getUserProfile).toHaveBeenCalledWith(
      'target-user-id',
    );
    expect(res.body.data.id).toBe('target-user-id');
  });

  it('allows an account owner to withdraw their own WhatsApp marketing consent', async () => {
    mockCurrentUser = { id: 'user-self', role: 'CUSTOMER' };
    (identityService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 'user-self',
      branchId: null,
    });
    (identityService.updateUser as jest.Mock).mockResolvedValue({
      id: 'user-self',
      whatsAppMarketingOptInAt: null,
    });

    await request(app.getHttpServer())
      .patch('/api/v1/users/user-self')
      .send({ whatsAppMarketingOptIn: false })
      .expect(200);

    expect(identityService.updateUser).toHaveBeenCalledWith('user-self', {
      whatsAppMarketingOptIn: false,
    });
  });

  it('prevents managers from granting marketing consent for another account', async () => {
    mockCurrentUser = {
      id: 'manager-1',
      role: 'MANAGER',
      branchId: 'branch-1',
    };

    await request(app.getHttpServer())
      .patch('/api/v1/users/customer-1')
      .send({ whatsAppMarketingOptIn: true })
      .expect(403);

    expect(identityService.getUserProfile).not.toHaveBeenCalled();
    expect(identityService.updateUser).not.toHaveBeenCalled();
  });
});
