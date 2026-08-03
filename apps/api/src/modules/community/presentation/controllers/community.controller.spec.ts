/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import request from 'supertest';
import { CommunityController } from './community.controller';
import { CommunityService } from '../../application/services/community.service';
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

describe('CommunityController (E2E / Controller)', () => {
  let app: INestApplication;
  let communityService: jest.Mocked<Partial<CommunityService>>;

  beforeAll(async () => {
    communityService = {
      joinGroup: jest.fn().mockResolvedValue({ success: true }),
      createPost: jest.fn().mockResolvedValue({ id: 'post_1', authorId: 'user_A' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        { provide: CommunityService, useValue: communityService },
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

  it('joinGroup: should ignore client-supplied userId (User B) and use authenticated user (User A)', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/community/groups/group_123/join')
      .send({ userId: 'user_B' })
      .expect(200);

    expect(communityService.joinGroup).toHaveBeenCalledWith(
      'user_A',
      'group_123',
    );
  });

  it('createPost: should ignore body authorId (User B) and use authenticated user (User A) for CUSTOMER', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/community/posts')
      .send({ groupId: 'group_123', authorId: 'user_B', content: 'hello' })
      .expect(201);

    expect(communityService.createPost).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: 'user_A' }),
    );
  });

  it('listGroups: should list community groups with category filter', async () => {
    communityService.listGroups = jest.fn().mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/api/v1/community/groups?category=Coffee')
      .expect(200);

    expect(communityService.listGroups).toHaveBeenCalledWith('Coffee');
  });

  it('createGroup: should allow STAFF/MANAGER/ADMIN to create a group', async () => {
    mockUser = { id: 'admin_1', role: 'ADMIN' };
    communityService.createGroup = jest.fn().mockResolvedValue({ id: 'group_new', name: 'Coffee Lovers' });

    await request(app.getHttpServer())
      .post('/api/v1/community/groups')
      .send({ name: 'Coffee Lovers', category: 'Coffee' })
      .expect(201);

    expect(communityService.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Coffee Lovers' }),
    );
  });

  it('listPosts: should list posts for a group with pagination', async () => {
    communityService.listPosts = jest.fn().mockResolvedValue({ data: [], total: 0 });

    await request(app.getHttpServer())
      .get('/api/v1/community/groups/group_123/posts?page=1&limit=10')
      .expect(200);

    expect(communityService.listPosts).toHaveBeenCalledWith('group_123', 1, 10);
  });
});
