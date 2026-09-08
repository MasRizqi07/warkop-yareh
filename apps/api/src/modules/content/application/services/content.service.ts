import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: DatabaseService) {}

  async listBlogPosts(params: {
    category?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const now = new Date();
    const search = params.search?.trim();
    const where: Prisma.BlogPostWhereInput = {
      isPublished: true,
      publishedAt: { lte: now },
      ...(params.category ? { category: params.category } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } },
              { tags: { has: search } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { data, total };
  }

  async getBlogPost(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        isPublished: true,
        publishedAt: { lte: new Date() },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async listVerifiedReviews(branchId: string | undefined, limit: number) {
    return this.prisma.review.findMany({
      where: {
        isVerified: true,
        ...(branchId ? { branchId } : {}),
        user: { deletedAt: null },
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: [{ helpful: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }
}
