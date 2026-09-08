import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { ContentService } from './content.service';

describe('ContentService', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const findFirst = jest.fn();
  let service: ContentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContentService({
      blogPost: { findMany, count, findFirst },
      review: { findMany: jest.fn() },
    } as unknown as DatabaseService);
  });

  it('lists only published blog posts whose publication time has arrived', async () => {
    findMany.mockResolvedValue([{ id: 'post-1' }]);
    count.mockResolvedValue(1);
    const result = await service.listBlogPosts({
      search: 'kopi',
      page: 1,
      limit: 12,
    });
    expect(result).toEqual({ data: [{ id: 'post-1' }], total: 1 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
          publishedAt: expect.objectContaining({ lte: expect.any(Date) }),
        }),
        skip: 0,
        take: 12,
      }),
    );
  });

  it('does not expose a missing, draft, or future blog post', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.getBlogPost('not-public')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('filters public reviews to verified records and an optional branch', async () => {
    const reviewFindMany = jest.fn().mockResolvedValue([]);
    service = new ContentService({
      review: { findMany: reviewFindMany },
    } as unknown as DatabaseService);
    await service.listVerifiedReviews('branch-1', 20);
    expect(reviewFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isVerified: true,
          branchId: 'branch-1',
          user: { deletedAt: null },
        },
        take: 20,
      }),
    );
  });
});
