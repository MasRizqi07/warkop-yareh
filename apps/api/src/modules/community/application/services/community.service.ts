import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@warkop-yareh/database';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: DatabaseService) {}

  async createGroup(data: {
    name: string;
    description?: string;
    category?: string;
  }) {
    const slugBase =
      data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'community';
    return this.prisma.withTenantTransaction(async (tx) => {
      const group = await tx.communityGroup.create({
        data: {
          name: data.name.trim(),
          slug: `${slugBase}-${randomBytes(4).toString('hex')}`,
          description: data.description?.trim() ?? '',
          category: data.category?.trim() || 'General',
        },
      });
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'CommunityGroup',
          aggregateId: group.id,
          eventType: 'CommunityGroupCreated',
          payload: { groupId: group.id },
        },
      });
      return group;
    });
  }

  async listGroups(category?: string) {
    return this.prisma.communityGroup.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(category ? { category } : {}),
      },
      include: {
        _count: {
          select: { memberships: true, posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getGroup(groupIdOrSlug: string) {
    const group = await this.prisma.communityGroup.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ id: groupIdOrSlug }, { slug: groupIdOrSlug }],
      },
      include: {
        _count: { select: { memberships: true, posts: true } },
      },
    });
    if (!group) throw new NotFoundException('Community group not found');
    return group;
  }

  async getMembership(userId: string, groupIdOrSlug: string) {
    const group = await this.getGroup(groupIdOrSlug);
    return this.prisma.communityMembership.findUnique({
      where: { userId_groupId: { userId, groupId: group.id } },
    });
  }

  async joinGroup(userId: string, groupId: string) {
    const group = await this.prisma.communityGroup.findFirst({
      where: { id: groupId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!group) throw new NotFoundException('Community group not found');

    try {
      return await this.prisma.communityMembership.create({
        data: {
          userId,
          groupId,
          role: 'MEMBER',
        },
      });
    } catch (error: unknown) {
      if (this.getPrismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Already a member of this group');
      }
      throw error;
    }
  }

  async createPost(data: {
    groupId: string;
    authorId: string;
    content: string;
  }) {
    const content = data.content.trim();
    return this.prisma.withTenantTransaction(async (tx) => {
      const membership = await tx.communityMembership.findFirst({
        where: {
          userId: data.authorId,
          groupId: data.groupId,
          group: { isActive: true, deletedAt: null },
        },
      });

      if (!membership) {
        throw new ForbiddenException('Must be a member of the group to post');
      }

      const post = await tx.communityPost.create({
        data: {
          groupId: data.groupId,
          authorId: data.authorId,
          content,
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
        where: {
          groupId,
          group: { isActive: true, deletedAt: null },
        },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communityPost.count({
        where: {
          groupId,
          group: { isActive: true, deletedAt: null },
        },
      }),
    ]);

    return { data, total };
  }

  async listRecentPosts(page: number, limit: number) {
    const where: Prisma.CommunityPostWhereInput = {
      group: { isActive: true, deletedAt: null },
    };
    const [data, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          group: { select: { id: true, name: true, slug: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communityPost.count({ where }),
    ]);
    return { data, total };
  }

  async deletePost(postId: string) {
    return this.prisma.withTenantTransaction(async (tx) => {
      const post = await tx.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, groupId: true, authorId: true },
      });
      if (!post) throw new NotFoundException('Community post not found');
      await tx.communityPost.delete({ where: { id: postId } });
      await tx.outboxEvent.create({
        data: {
          aggregateType: 'CommunityPost',
          aggregateId: postId,
          eventType: 'CommunityPostModerated',
          payload: post,
        },
      });
      return post;
    });
  }

  private getPrismaErrorCode(error: unknown): string | undefined {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code;
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = Reflect.get(error, 'code');
      return typeof code === 'string' ? code : undefined;
    }
    return undefined;
  }
}
