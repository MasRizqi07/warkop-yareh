/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, CanActivate } from '@nestjs/common';
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
  let app: INestApplication;
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

  it('GET /api/v1/users/:id -> CUSTOMER role cannot read other user profile; resolves ID to self (req.user.id)', async () => {
    mockCurrentUser = { id: 'user-customer-self', role: 'CUSTOMER' };
    (identityService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 'user-customer-self',
      name: 'Customer Self',
      email: 'customer@warkop.com',
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/users/other-user-target-id')
      .expect(200);

    expect(identityService.getUserProfile).toHaveBeenCalledWith('user-customer-self');
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

    expect(identityService.getUserProfile).toHaveBeenCalledWith('target-user-id');
    expect(res.body.data.id).toBe('target-user-id');
  });
});
