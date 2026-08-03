/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CommunityService } from './community.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let mockPrisma: any;

  const mockGroup = {
    id: 'group-1',
    name: 'Surabaya Coffee Enthusiasts',
    slug: 'surabaya-coffee-enthusiasts',
    description: 'A community for coffee lovers',
    category: 'Coffee',
  };

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      communityGroup: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      communityMembership: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
      communityPost: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
  });

  describe('joinGroup', () => {
    it('should translate P2002 error to ConflictException when joining group twice', async () => {
      mockPrisma.communityMembership.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed on (userId, groupId)',
      });

      await expect(
        service.joinGroup('user-1', 'group-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow joining group successfully', async () => {
      mockPrisma.communityMembership.create.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
        groupId: 'group-1',
        role: 'MEMBER',
      });

      const result = await service.joinGroup('user-1', 'group-1');
      expect(result.id).toBe('mem-1');
    });
  });

  describe('createPost', () => {
    it('should throw ForbiddenException if author is not a group member', async () => {
      mockPrisma.communityMembership.findFirst.mockResolvedValue(null);

      await expect(
        service.createPost({
          groupId: 'group-1',
          authorId: 'non-member-user',
          content: 'Hello coffee lovers',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create post when author is a group member', async () => {
      mockPrisma.communityMembership.findFirst.mockResolvedValue({
        id: 'mem-1',
        userId: 'user-1',
        groupId: 'group-1',
      });
      mockPrisma.communityPost.create.mockResolvedValue({
        id: 'post-1',
        groupId: 'group-1',
        authorId: 'user-1',
        content: 'Hello coffee lovers',
      });

      const result = await service.createPost({
        groupId: 'group-1',
        authorId: 'user-1',
        content: 'Hello coffee lovers',
      });

      expect(result.id).toBe('post-1');
    });
  });

  describe('createGroup, listGroups & listPosts', () => {
    it('should create group with slug', async () => {
      mockPrisma.communityGroup.create.mockResolvedValue(mockGroup);

      const result = await service.createGroup({
        name: 'Surabaya Coffee Enthusiasts',
        category: 'Coffee',
      });

      expect(result.id).toBe('group-1');
    });

    it('should list groups with category filter', async () => {
      mockPrisma.communityGroup.findMany.mockResolvedValue([mockGroup]);

      const result = await service.listGroups('Coffee');
      expect(result).toHaveLength(1);
    });

    it('should list posts with pagination', async () => {
      mockPrisma.communityPost.findMany.mockResolvedValue([]);
      mockPrisma.communityPost.count.mockResolvedValue(0);

      const result = await service.listPosts('group-1', 1, 10);
      expect(result.total).toBe(0);
    });
  });
});
