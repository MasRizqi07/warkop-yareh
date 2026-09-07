import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MarketingCampaignStatus,
  MarketingDeliveryStatus,
  MembershipTier,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { WhatsAppCloudService } from '../../infrastructure/whatsapp-cloud.service';
import { MarketingService } from './marketing.service';

describe('MarketingService', () => {
  let prisma: any;
  let whatsapp: any;
  let service: MarketingService;

  const campaign = {
    id: 'campaign-1',
    name: 'Night Owl Drop',
    objective: 'night',
    audience: 'all_active',
    targetUserId: null,
    branchId: 'branch-1',
    discountPercent: 15,
    expiresInHours: 24,
    message: 'Diskon malam untuk Kawan Yareh.',
    includeHeaderMedia: false,
    status: MarketingCampaignStatus.DRAFT,
  };

  beforeEach(() => {
    prisma = {
      marketingCampaign: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
      marketingDelivery: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      notification: { create: jest.fn() },
      user: { findFirst: jest.fn(), findMany: jest.fn() },
    };
    whatsapp = {
      configured: true,
      assertConfigured: jest.fn(),
      sendCampaignTemplate: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string) =>
        key === 'WHATSAPP_BROADCAST_MAX_RECIPIENTS' ? '100' : undefined,
      ),
    };
    service = new MarketingService(
      prisma as DatabaseService,
      whatsapp as WhatsAppCloudService,
      config as unknown as ConfigService,
    );
  });

  it('rejects an incomplete single-customer campaign before persistence', async () => {
    await expect(
      service.createCampaign(
        {
          name: 'Retention offer',
          objective: 'retention',
          audience: 'single_customer',
          discountPercent: 10,
          expiresInHours: 48,
          message: 'Kami merindukan kunjunganmu di Warkop Yareh.',
        },
        { id: 'admin-1' },
        'branch-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.marketingCampaign.create).not.toHaveBeenCalled();
  });

  it('scopes campaign lookup and branch updates to the manager branch', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue(campaign);
    prisma.marketingCampaign.update.mockResolvedValue({
      ...campaign,
      name: 'Updated',
    });

    await service.updateCampaign(
      'campaign-1',
      { name: 'Updated', branchId: 'branch-other' },
      'branch-1',
    );

    expect(prisma.marketingCampaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaign-1', branchId: 'branch-1' },
      }),
    );
    expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ branchId: 'branch-1' }),
      }),
    );
  });

  it('locks, persists, sends, and marks a successful dispatch exactly once', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue(campaign);
    prisma.marketingCampaign.updateMany.mockResolvedValue({ count: 1 });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'customer-1',
        phone: '081234567890',
        membershipTier: MembershipTier.SILVER,
        orders: [],
      },
    ]);
    prisma.marketingDelivery.upsert.mockResolvedValue({ id: 'delivery-1' });
    prisma.marketingDelivery.findUnique.mockResolvedValue({
      id: 'delivery-1',
      status: MarketingDeliveryStatus.PENDING,
    });
    whatsapp.sendCampaignTemplate.mockResolvedValue('wamid.123');
    prisma.marketingDelivery.update.mockResolvedValue({});
    prisma.notification.create.mockResolvedValue({});
    prisma.marketingDelivery.count.mockResolvedValue(0);
    prisma.marketingCampaign.update.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.SENT,
      recipientCount: 1,
    });

    const result = await service.dispatchCampaign('campaign-1', 'branch-1');

    expect(whatsapp.assertConfigured).toHaveBeenCalledTimes(1);
    expect(prisma.marketingCampaign.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'campaign-1',
        status: {
          in: [MarketingCampaignStatus.DRAFT, MarketingCampaignStatus.FAILED],
        },
      },
      data: { status: MarketingCampaignStatus.DISPATCHING },
    });
    expect(whatsapp.sendCampaignTemplate).toHaveBeenCalledTimes(1);
    expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(MarketingCampaignStatus.SENT);
  });

  it('rejects a second dispatcher when the atomic lock is unavailable', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue(campaign);
    prisma.marketingCampaign.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.dispatchCampaign('campaign-1', 'branch-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(whatsapp.sendCampaignTemplate).not.toHaveBeenCalled();
  });
});
