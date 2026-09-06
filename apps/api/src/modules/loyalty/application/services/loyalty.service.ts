import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipTier, Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

const TIER_RANK: Readonly<Record<MembershipTier, number>> = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
};

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: DatabaseService) {}

  async getLoyaltyStatus(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        loyaltyPoints: true,
        membershipTier: true,
        branchId: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserBranch(userId: string): Promise<string | null> {
    const user = await this.getLoyaltyStatus(userId);
    return user.branchId;
  }

  async awardPoints(userId: string, points: number, reason: string) {
    if (!Number.isSafeInteger(points) || points <= 0 || points > 1_000_000) {
      throw new BadRequestException(
        'Points must be a positive integer no greater than 1,000,000',
      );
    }
    const description = reason.trim();
    if (description.length < 3 || description.length > 300) {
      throw new BadRequestException(
        'Award reason must contain between 3 and 300 characters',
      );
    }

    return this.prisma.withTenantTransaction(async (tx) => {
      const current = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true, loyaltyPoints: true, membershipTier: true },
      });
      if (!current) throw new NotFoundException('User not found');

      const newBalance = current.loyaltyPoints + points;
      if (!Number.isSafeInteger(newBalance)) {
        throw new BadRequestException(
          'Loyalty balance would exceed safe limits',
        );
      }
      const newTier = this.calculateTier(newBalance, current.membershipTier);
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: points },
          ...(newTier !== current.membershipTier
            ? { membershipTier: newTier }
            : {}),
        },
        select: {
          id: true,
          name: true,
          loyaltyPoints: true,
          membershipTier: true,
        },
      });
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points,
          type: 'EARNED',
          description,
        },
      });

      await tx.outboxEvent.create({
        data: {
          aggregateType: 'User',
          aggregateId: userId,
          eventType:
            newTier !== current.membershipTier
              ? 'LoyaltyTierUpgraded'
              : 'LoyaltyPointsAwarded',
          payload: {
            userId,
            points,
            balance: user.loyaltyPoints,
            oldTier: current.membershipTier,
            newTier,
          },
        },
      });
      return { user, transaction };
    });
  }

  async redeemReward(userId: string, rewardId: string) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.withTenantTransaction(
          async (tx) => {
            const [user, reward] = await Promise.all([
              tx.user.findFirst({
                where: { id: userId, deletedAt: null },
                select: {
                  id: true,
                  name: true,
                  loyaltyPoints: true,
                  membershipTier: true,
                },
              }),
              tx.reward.findUnique({ where: { id: rewardId } }),
            ]);
            if (!user) throw new NotFoundException('User not found');
            if (!reward) throw new NotFoundException('Reward not found');
            if (
              !reward.isAvailable ||
              (reward.expiresAt !== null && reward.expiresAt <= new Date())
            ) {
              throw new BadRequestException('Reward is not available');
            }
            if (TIER_RANK[user.membershipTier] < TIER_RANK[reward.tier]) {
              throw new BadRequestException(
                `Reward requires ${reward.tier} membership`,
              );
            }
            if (reward.pointsCost <= 0) {
              throw new BadRequestException('Reward has an invalid point cost');
            }

            const deduction = await tx.user.updateMany({
              where: {
                id: userId,
                deletedAt: null,
                loyaltyPoints: { gte: reward.pointsCost },
              },
              data: { loyaltyPoints: { decrement: reward.pointsCost } },
            });
            if (deduction.count !== 1) {
              throw new BadRequestException('Insufficient loyalty points');
            }

            const updatedUser = await tx.user.findUniqueOrThrow({
              where: { id: userId },
              select: {
                id: true,
                name: true,
                loyaltyPoints: true,
                membershipTier: true,
              },
            });
            const transaction = await tx.loyaltyTransaction.create({
              data: {
                userId,
                points: -reward.pointsCost,
                type: 'REDEEMED',
                description: `Redeemed reward: ${reward.name}`,
              },
            });
            await tx.outboxEvent.create({
              data: {
                aggregateType: 'Reward',
                aggregateId: rewardId,
                eventType: 'RewardRedeemed',
                payload: {
                  userId,
                  rewardId,
                  pointsSpent: reward.pointsCost,
                  remainingBalance: updatedUser.loyaltyPoints,
                },
              },
            });
            return { user: updatedUser, reward, transaction };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (this.isSerializationConflict(error) && attempt < 2) continue;
        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Loyalty balance changed concurrently; please try again',
          );
        }
        throw error;
      }
    }

    throw new ConflictException('Unable to redeem reward');
  }

  async listTransactions(userId: string, page: number, limit: number) {
    const where: Prisma.LoyaltyTransactionWhereInput = { userId };
    const [data, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({ where }),
    ]);
    return { data, total };
  }

  async getAvailableRewards() {
    const now = new Date();
    return this.prisma.reward.findMany({
      where: {
        isAvailable: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { pointsCost: 'asc' },
    });
  }

  private calculateTier(
    points: number,
    currentTier: MembershipTier,
  ): MembershipTier {
    const calculated =
      points >= 1_000
        ? MembershipTier.PLATINUM
        : points >= 500
          ? MembershipTier.GOLD
          : points >= 200
            ? MembershipTier.SILVER
            : MembershipTier.BRONZE;
    return TIER_RANK[calculated] > TIER_RANK[currentTier]
      ? calculated
      : currentTier;
  }

  private isSerializationConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    );
  }
}
