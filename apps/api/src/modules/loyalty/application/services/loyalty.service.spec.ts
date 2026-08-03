/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let mockPrisma: any;

  const mockUser = {
    id: 'user-1',
    name: 'Coffee Fan',
    loyaltyPoints: 200,
    membershipTier: 'BRONZE',
  };

  const mockReward = {
    id: 'reward-1',
    name: 'Free Espresso',
    pointsCost: 200,
    isAvailable: true,
  };

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      reward: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      loyaltyTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LoyaltyService>(LoyaltyService);
  });

  describe('redeemReward - Race Condition & Validation', () => {
    it('should configure transaction with Serializable isolation level to prevent points race condition', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.reward.findUnique.mockResolvedValue(mockReward);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 0,
      });

      await service.redeemReward('user-1', 'reward-1');

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
        { isolationLevel: 'Serializable' },
      );
    });

    it('should prevent points race condition when 2 concurrent redemptions occur for user with points for only 1 reward', async () => {
      let currentPoints = 200;
      mockPrisma.$transaction.mockImplementation(async (cb: any, options: any) => {
        if (options?.isolationLevel !== 'Serializable') {
          throw new Error('Transaction isolation level must be Serializable');
        }
        const txMock = {
          user: {
            findUnique: jest.fn().mockImplementation(() => {
              return { ...mockUser, loyaltyPoints: currentPoints };
            }),
            update: jest.fn().mockImplementation(({ data }: any) => {
              if (data.loyaltyPoints?.decrement) {
                if (currentPoints < data.loyaltyPoints.decrement) {
                  throw new BadRequestException('Insufficient loyalty points');
                }
                currentPoints -= data.loyaltyPoints.decrement;
              }
              return { ...mockUser, loyaltyPoints: currentPoints };
            }),
          },
          reward: {
            findUnique: jest.fn().mockResolvedValue(mockReward),
          },
          loyaltyTransaction: { create: jest.fn() },
          outboxEvent: { create: jest.fn() },
        };
        return cb(txMock);
      });

      const results = await Promise.allSettled([
        service.redeemReward('user-1', 'reward-1'),
        service.redeemReward('user-1', 'reward-1'),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(BadRequestException);
      expect(currentPoints).toBe(0); // Balance did NOT drop negative!
    });

    it('should throw BadRequestException when user has insufficient loyalty points', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 100,
      });
      mockPrisma.reward.findUnique.mockResolvedValue(mockReward);

      await expect(
        service.redeemReward('user-1', 'reward-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when reward is unavailable', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.reward.findUnique.mockResolvedValue({
        ...mockReward,
        isAvailable: false,
      });

      await expect(
        service.redeemReward('user-1', 'reward-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('awardPoints - Tier Threshold Boundaries', () => {
    it('should upgrade tier to SILVER when crossing 200 points threshold', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 200,
        membershipTier: 'BRONZE',
      });

      const result = await service.awardPoints('user-1', 50, 'Purchase');

      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: { membershipTier: 'SILVER' },
        }),
      );
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'LoyaltyTierUpgraded',
            payload: expect.objectContaining({ newTier: 'SILVER' }),
          }),
        }),
      );
    });

    it('should upgrade tier to GOLD when crossing 500 points threshold', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 500,
        membershipTier: 'SILVER',
      });

      await service.awardPoints('user-1', 100, 'Purchase');

      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: { membershipTier: 'GOLD' },
        }),
      );
    });

    it('should upgrade tier to PLATINUM when crossing 1000 points threshold', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 1000,
        membershipTier: 'GOLD',
      });

      await service.awardPoints('user-1', 500, 'Purchase');

      expect(mockPrisma.user.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: { membershipTier: 'PLATINUM' },
        }),
      );
    });

    it('should NOT emit LoyaltyTierUpgraded event when points stay within same tier band', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 150,
        membershipTier: 'BRONZE',
      });

      await service.awardPoints('user-1', 50, 'Purchase');

      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalled();
    });
  });

  describe('getLoyaltyStatus & Read Operations', () => {
    it('should return loyalty status for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const status = await service.getLoyaltyStatus('user-1');
      expect(status.loyaltyPoints).toBe(200);
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getLoyaltyStatus('user-unknown')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
