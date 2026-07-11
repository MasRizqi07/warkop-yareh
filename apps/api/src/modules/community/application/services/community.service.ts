import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: DatabaseService) {}

  async createGroup(data: {
    name: string;
    description?: string;
    category?: string;
  }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.communityGroup.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
        category: data.category || 'General',
      },
    });
  }

  async listGroups(category?: string) {
    return this.prisma.communityGroup.findMany({
      where: category ? { category } : {},
      include: {
        _count: {
          select: { memberships: true, posts: true },
        },
      },
    });
  }

  async joinGroup(userId: string, groupId: string) {
    return this.prisma.communityMembership.create({
      data: {
        userId,
        groupId,
        role: 'MEMBER',
      },
    });
  }

  async createPost(data: {
    groupId: string;
    authorId: string;
    content: string;
  }) {
    return this.prisma.$transaction(async (tx: any) => {
      const post = await tx.communityPost.create({
        data: {
          groupId: data.groupId,
          authorId: data.authorId,
          content: data.content,
        },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'CommunityPost',
          aggregateId: post.id,
          eventType: 'CommunityPostCreated',
          payload: {
            postId: post.id,
            authorId: data.authorId,
            groupId: data.groupId,
          },
        },
      });

      return post;
    });
  }

  async listPosts(groupId: string, page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where: { groupId },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communityPost.count({ where: { groupId } }),
    ]);

    return { data, total };
  }
}
