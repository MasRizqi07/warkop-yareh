import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MembershipTier } from '@warkop-yareh/database';
import { LoyaltyService } from './loyalty.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let prisma: {
    $transaction: jest.Mock;
    withTenantTransaction: jest.Mock;
    user: {
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    reward: { findUnique: jest.Mock; findMany: jest.Mock };
    loyaltyTransaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    outboxEvent: { create: jest.Mock };
  };

  const user = {
    id: 'user-1',
    name: 'Coffee Fan',
    branchId: 'branch-1',
    loyaltyPoints: 200,
    membershipTier: MembershipTier.BRONZE,
  };
  const reward = {
    id: 'reward-1',
    name: 'Free Espresso',
    description: 'One espresso',
    image: null,
    pointsCost: 200,
    category: 'Beverage',
    tier: MembershipTier.BRONZE,
    isAvailable: true,
    expiresAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      withTenantTransaction: jest.fn(),
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      reward: { findUnique: jest.fn(), findMany: jest.fn() },
      loyaltyTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      outboxEvent: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation((operation: unknown) =>
      Array.isArray(operation)
        ? Promise.all(operation)
        : (operation as (client: typeof prisma) => unknown)(prisma),
    );
    prisma.withTenantTransaction.mockImplementation(
      (operation: (client: typeof prisma) => unknown) => operation(prisma),
    );
    prisma.loyaltyTransaction.create.mockResolvedValue({ id: 'tx-1' });
    prisma.outboxEvent.create.mockResolvedValue({ id: 'event-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: DatabaseService,
          useValue: prisma,
        },
      ],
    }).compile();
    service = module.get(LoyaltyService);
  });

  it('returns the current loyalty status without sensitive user fields', async () => {
    prisma.user.findFirst.mockResolvedValue(user);

    await expect(service.getLoyaltyStatus('user-1')).resolves.toEqual(user);
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({ passwordHash: true }),
      }),
    );
  });

  it('throws NotFoundException for an unknown user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.getLoyaltyStatus('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects invalid point awards', async () => {
    await expect(service.awardPoints('user-1', -1, 'Purchase')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.withTenantTransaction).not.toHaveBeenCalled();
  });

  it('awards points and upgrades the tier atomically', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue({
      ...user,
      loyaltyPoints: 500,
      membershipTier: MembershipTier.GOLD,
    });

    const result = await service.awardPoints('user-1', 300, 'Purchase bonus');

    expect(result.user.membershipTier).toBe(MembershipTier.GOLD);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ membershipTier: MembershipTier.GOLD }),
      }),
    );
    expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'LoyaltyTierUpgraded' }),
      }),
    );
  });

  it('rejects unavailable, expired, or tier-locked rewards', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.reward.findUnique.mockResolvedValue({
      ...reward,
      tier: MembershipTier.GOLD,
    });
    await expect(service.redeemReward('user-1', 'reward-1')).rejects.toThrow(
      'Reward requires GOLD membership',
    );

    prisma.reward.findUnique.mockResolvedValue({
      ...reward,
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    });
    await expect(service.redeemReward('user-1', 'reward-1')).rejects.toThrow(
      'Reward is not available',
    );
  });

  it('uses an atomic conditional deduction and never permits a negative balance', async () => {
    let balance = 200;
    prisma.user.findFirst.mockImplementation(() => ({
      ...user,
      loyaltyPoints: balance,
    }));
    prisma.reward.findUnique.mockResolvedValue(reward);
    prisma.user.updateMany.mockImplementation(() => {
      if (balance < reward.pointsCost) return { count: 0 };
      balance -= reward.pointsCost;
      return { count: 1 };
    });
    prisma.user.findUniqueOrThrow.mockImplementation(() => ({
      ...user,
      loyaltyPoints: balance,
    }));

    const outcomes = await Promise.allSettled([
      service.redeemReward('user-1', 'reward-1'),
      service.redeemReward('user-1', 'reward-1'),
    ]);

    expect(outcomes.filter((item) => item.status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(outcomes.filter((item) => item.status === 'rejected')).toHaveLength(
      1,
    );
    expect(balance).toBe(0);
  });

  it('uses Serializable isolation for reward redemption', async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.reward.findUnique.mockResolvedValue(reward);
    prisma.user.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      ...user,
      loyaltyPoints: 0,
    });

    await service.redeemReward('user-1', 'reward-1');

    expect(prisma.withTenantTransaction).toHaveBeenCalledWith(
      expect.any(Function),
      {
        isolationLevel: 'Serializable',
      },
    );
  });

  it('paginates transaction history', async () => {
    prisma.loyaltyTransaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
    prisma.loyaltyTransaction.count.mockResolvedValue(1);

    const result = await service.listTransactions('user-1', 2, 10);

    expect(result.total).toBe(1);
    expect(prisma.loyaltyTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });
});
