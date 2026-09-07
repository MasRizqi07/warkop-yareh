import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bullmq';
import {
  MarketingCampaignStatus,
  MarketingDeliveryStatus,
  MembershipTier,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { WhatsAppCloudService } from '../../infrastructure/whatsapp-cloud.service';
import { MarketingService } from './marketing.service';
import type { MarketingDispatchJobData } from '../../marketing.constants';

describe('MarketingService', () => {
  let prisma: any;
  let whatsapp: any;
  let dispatchQueue: {
    getJob: jest.Mock;
    add: jest.Mock;
  };
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
    dispatchQueue = {
      getJob: jest.fn().mockResolvedValue(null),
      add: jest.fn().mockResolvedValue({ id: 'campaign-1' }),
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
      dispatchQueue as unknown as Queue<MarketingDispatchJobData>,
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

  it('rejects a targeted WhatsApp campaign when customer opt-in is absent', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'customer-1',
      whatsAppMarketingOptInAt: null,
    });

    await expect(
      service.createCampaign(
        {
          name: 'Retention offer',
          objective: 'retention',
          audience: 'single_customer',
          targetUserId: 'customer-1',
          discountPercent: 10,
          expiresInHours: 48,
          message: 'Kami merindukan kunjunganmu di Warkop Yareh.',
        },
        { id: 'admin-1' },
        'branch-1',
      ),
    ).rejects.toThrow('has not opted in');
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

  it('atomically locks and enqueues dispatch without blocking the request on provider I/O', async () => {
    prisma.marketingCampaign.findFirst
      .mockResolvedValueOnce(campaign)
      .mockResolvedValueOnce({
        ...campaign,
        status: MarketingCampaignStatus.DISPATCHING,
      });
    prisma.marketingCampaign.updateMany.mockResolvedValue({ count: 1 });

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
    expect(dispatchQueue.add).toHaveBeenCalledWith(
      'dispatch-campaign',
      { campaignId: 'campaign-1' },
      expect.objectContaining({ jobId: 'campaign-1', attempts: 3 }),
    );
    expect(whatsapp.sendCampaignTemplate).not.toHaveBeenCalled();
    expect(result.status).toBe(MarketingCampaignStatus.DISPATCHING);
  });

  it('persists provider success and marks the worker dispatch exactly once', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.DISPATCHING,
    });
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
    prisma.marketingDelivery.count.mockResolvedValue(1);
    prisma.marketingCampaign.update.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.SENT,
      recipientCount: 1,
    });

    const result = await service.processCampaign('campaign-1');

    expect(whatsapp.assertConfigured).toHaveBeenCalledTimes(1);
    expect(whatsapp.sendCampaignTemplate).toHaveBeenCalledTimes(1);
    expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    expect(prisma.marketingDelivery.count).toHaveBeenCalledWith({
      where: {
        campaignId: 'campaign-1',
        userId: { in: ['customer-1'] },
        channel: 'WHATSAPP',
        status: MarketingDeliveryStatus.SENT,
      },
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          whatsAppMarketingOptInAt: { not: null },
        }),
      }),
    );
    expect(result.status).toBe(MarketingCampaignStatus.SENT);
  });

  it('does not downgrade or resend an accepted WhatsApp delivery when the in-app notification fails', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.DISPATCHING,
    });
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
    prisma.notification.create.mockRejectedValue(
      new Error('notification storage unavailable'),
    );
    prisma.marketingDelivery.count.mockResolvedValue(1);
    prisma.marketingCampaign.update.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.SENT,
      recipientCount: 1,
    });

    await expect(service.processCampaign('campaign-1')).resolves.toEqual(
      expect.objectContaining({ status: MarketingCampaignStatus.SENT }),
    );

    expect(prisma.marketingDelivery.update).toHaveBeenCalledTimes(1);
    expect(prisma.marketingDelivery.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: MarketingDeliveryStatus.FAILED,
        }),
      }),
    );
  });

  it('marks an empty audience failed without retrying a non-recoverable job', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.DISPATCHING,
    });
    prisma.user.findMany.mockResolvedValue([]);
    prisma.marketingCampaign.update.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.FAILED,
      recipientCount: 0,
    });

    await expect(service.processCampaign('campaign-1')).resolves.toEqual(
      expect.objectContaining({
        status: MarketingCampaignStatus.FAILED,
        recipientCount: 0,
      }),
    );
    expect(whatsapp.sendCampaignTemplate).not.toHaveBeenCalled();
    expect(prisma.marketingCampaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: MarketingCampaignStatus.FAILED,
          recipientCount: 0,
        }),
      }),
    );
  });

  it('rejects a second dispatcher when the atomic lock is unavailable', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue(campaign);
    prisma.marketingCampaign.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.dispatchCampaign('campaign-1', 'branch-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(dispatchQueue.add).not.toHaveBeenCalled();
    expect(whatsapp.sendCampaignTemplate).not.toHaveBeenCalled();
  });

  it('repairs a dispatching campaign whose durable queue job is missing', async () => {
    prisma.marketingCampaign.findFirst.mockResolvedValue({
      ...campaign,
      status: MarketingCampaignStatus.DISPATCHING,
    });

    const result = await service.dispatchCampaign('campaign-1', 'branch-1');

    expect(prisma.marketingCampaign.updateMany).not.toHaveBeenCalled();
    expect(dispatchQueue.add).toHaveBeenCalledWith(
      'dispatch-campaign',
      { campaignId: 'campaign-1' },
      expect.objectContaining({ jobId: 'campaign-1' }),
    );
    expect(result.status).toBe(MarketingCampaignStatus.DISPATCHING);
  });

  it('replaces a terminal failed queue job when a campaign is retried', async () => {
    const remove = jest.fn().mockResolvedValue(undefined);
    dispatchQueue.getJob.mockResolvedValue({
      getState: jest.fn().mockResolvedValue('failed'),
      remove,
    });
    prisma.marketingCampaign.findFirst
      .mockResolvedValueOnce({
        ...campaign,
        status: MarketingCampaignStatus.FAILED,
      })
      .mockResolvedValueOnce({
        ...campaign,
        status: MarketingCampaignStatus.DISPATCHING,
      });
    prisma.marketingCampaign.updateMany.mockResolvedValue({ count: 1 });

    await service.dispatchCampaign('campaign-1', 'branch-1');

    expect(remove).toHaveBeenCalledTimes(1);
    expect(dispatchQueue.add).toHaveBeenCalledWith(
      'dispatch-campaign',
      { campaignId: 'campaign-1' },
      expect.objectContaining({ jobId: 'campaign-1' }),
    );
  });
});
