import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { Prisma } from '@warkop-yareh/database';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: DatabaseService) {}

  async getLoyaltyStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true, membershipTier: true, name: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async awardPoints(userId: string, points: number, reason: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: points },
        },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          userId,
          points,
          type: 'EARNED',
          description: reason,
        },
      });

      // Simple tier calculation logic
      const currentPoints = user.loyaltyPoints;
      let newTier = user.membershipTier;
      if (currentPoints >= 1000) newTier = 'PLATINUM';
      else if (currentPoints >= 500) newTier = 'GOLD';
      else if (currentPoints >= 200) newTier = 'SILVER';

      if (newTier !== user.membershipTier) {
        await tx.user.update({
          where: { id: userId },
          data: { membershipTier: newTier },
        });

        await tx.outboxEvent.create({
          data: {
            aggregateType: 'User',
            aggregateId: userId,
            eventType: 'LoyaltyTierUpgraded',
            payload: { userId, oldTier: user.membershipTier, newTier },
          },
        });
      }

      return { user, transaction };
    });
  }

  async redeemReward(userId: string, rewardId: string) {
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        const reward = await tx.reward.findUnique({ where: { id: rewardId } });

        if (!user || !reward) {
          throw new BadRequestException('User or Reward not found');
        }

        if (!reward.isAvailable) {
          throw new BadRequestException('Reward is not available');
        }

        if (user.loyaltyPoints < reward.pointsCost) {
          throw new BadRequestException('Insufficient loyalty points');
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            loyaltyPoints: { decrement: reward.pointsCost },
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
            payload: { userId, rewardId, pointsSpent: reward.pointsCost },
          },
        });

        return { user: updatedUser, transaction };
      },
      { isolationLevel: 'Serializable' },
    );
  }

  async listTransactions(userId: string) {
    return this.prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableRewards() {
    return this.prisma.reward.findMany({
      where: { isAvailable: true },
      orderBy: { pointsCost: 'asc' },
    });
  }
}
