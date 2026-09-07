import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MarketingCampaignStatus,
  MarketingDeliveryStatus,
  MembershipTier,
  NotificationType,
  OrderStatus,
  Prisma,
  Role,
} from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';
import { WhatsAppCloudService } from '../../infrastructure/whatsapp-cloud.service';
import type {
  CreateMarketingCampaignDto,
  UpdateMarketingCampaignDto,
} from '../../presentation/dtos/marketing.dto';

const campaignInclude = Prisma.validator<Prisma.MarketingCampaignInclude>()({
  createdBy: { select: { id: true, name: true, email: true } },
  targetUser: { select: { id: true, name: true, phone: true } },
  _count: { select: { deliveries: true } },
});

const jakartaHour = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
});

@Injectable()
export class MarketingService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly whatsapp: WhatsAppCloudService,
    private readonly config: ConfigService,
  ) {}

  providerStatus() {
    return { configured: this.whatsapp.configured };
  }

  async listCampaigns(params: {
    branchId?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.MarketingCampaignWhereInput = params.branchId
      ? { branchId: params.branchId }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.marketingCampaign.findMany({
        where,
        include: campaignInclude,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.marketingCampaign.count({ where }),
    ]);
    return { data, total };
  }

  async createCampaign(
    data: CreateMarketingCampaignDto,
    actor: { id: string },
    branchId?: string,
  ) {
    await this.assertTargetCustomer(data.targetUserId);
    if (data.audience === 'single_customer' && !data.targetUserId) {
      throw new BadRequestException(
        'targetUserId is required for a single-customer campaign',
      );
    }
    return this.prisma.marketingCampaign.create({
      data: {
        name: data.name.trim(),
        objective: data.objective,
        audience: data.audience,
        targetUserId: data.targetUserId,
        branchId,
        discountPercent: data.discountPercent,
        expiresInHours: data.expiresInHours,
        message: data.message.trim(),
        includeHeaderMedia: data.includeHeaderMedia ?? false,
        createdById: actor.id,
      },
      include: campaignInclude,
    });
  }

  async updateCampaign(
    id: string,
    data: UpdateMarketingCampaignDto,
    managedBranchId?: string,
  ) {
    const campaign = await this.requireCampaign(id, managedBranchId);
    if (
      campaign.status === MarketingCampaignStatus.SENT ||
      campaign.status === MarketingCampaignStatus.DISPATCHING
    ) {
      throw new ConflictException('A dispatched campaign cannot be edited');
    }
    const effectiveAudience = data.audience ?? campaign.audience;
    const effectiveTargetUserId =
      data.targetUserId ?? campaign.targetUserId ?? undefined;
    if (effectiveAudience === 'single_customer' && !effectiveTargetUserId) {
      throw new BadRequestException(
        'targetUserId is required for a single-customer campaign',
      );
    }
    await this.assertTargetCustomer(effectiveTargetUserId);
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.objective !== undefined ? { objective: data.objective } : {}),
        ...(data.audience !== undefined ? { audience: data.audience } : {}),
        ...(data.targetUserId !== undefined
          ? { targetUserId: data.targetUserId }
          : {}),
        ...(managedBranchId
          ? { branchId: managedBranchId }
          : data.branchId !== undefined
            ? { branchId: data.branchId }
            : {}),
        ...(data.discountPercent !== undefined
          ? { discountPercent: data.discountPercent }
          : {}),
        ...(data.expiresInHours !== undefined
          ? { expiresInHours: data.expiresInHours }
          : {}),
        ...(data.message !== undefined ? { message: data.message.trim() } : {}),
        ...(data.includeHeaderMedia !== undefined
          ? { includeHeaderMedia: data.includeHeaderMedia }
          : {}),
        status: MarketingCampaignStatus.DRAFT,
      },
      include: campaignInclude,
    });
  }

  async testCampaign(id: string, phone: string, managedBranchId?: string) {
    const campaign = await this.requireCampaign(id, managedBranchId);
    const providerMessageId = await this.whatsapp.sendCampaignTemplate({
      phone,
      campaignName: campaign.name,
      discountPercent: campaign.discountPercent,
      expiresInHours: campaign.expiresInHours,
      includeHeaderMedia: campaign.includeHeaderMedia,
    });
    return { providerMessageId };
  }

  async dispatchCampaign(id: string, managedBranchId?: string) {
    this.whatsapp.assertConfigured();
    const campaign = await this.requireCampaign(id, managedBranchId);
    if (campaign.status === MarketingCampaignStatus.SENT) return campaign;

    const lock = await this.prisma.marketingCampaign.updateMany({
      where: {
        id,
        status: {
          in: [MarketingCampaignStatus.DRAFT, MarketingCampaignStatus.FAILED],
        },
      },
      data: { status: MarketingCampaignStatus.DISPATCHING },
    });
    if (lock.count !== 1) {
      throw new ConflictException('Campaign dispatch is already in progress');
    }

    try {
      const recipients = await this.findRecipients(campaign);
      if (recipients.length === 0) {
        throw new BadRequestException(
          'The selected audience has no WhatsApp-capable recipients',
        );
      }
      await Promise.all(
        recipients.map((recipient) =>
          this.prisma.marketingDelivery.upsert({
            where: {
              campaignId_userId_channel: {
                campaignId: id,
                userId: recipient.id,
                channel: 'WHATSAPP',
              },
            },
            update: { recipient: recipient.phone, failureReason: null },
            create: {
              campaignId: id,
              userId: recipient.id,
              recipient: recipient.phone,
            },
          }),
        ),
      );

      for (let offset = 0; offset < recipients.length; offset += 5) {
        await Promise.all(
          recipients.slice(offset, offset + 5).map(async (recipient) => {
            const existing = await this.prisma.marketingDelivery.findUnique({
              where: {
                campaignId_userId_channel: {
                  campaignId: id,
                  userId: recipient.id,
                  channel: 'WHATSAPP',
                },
              },
            });
            if (existing?.status === MarketingDeliveryStatus.SENT) return;
            try {
              const providerMessageId =
                await this.whatsapp.sendCampaignTemplate({
                  phone: recipient.phone,
                  campaignName: campaign.name,
                  discountPercent: campaign.discountPercent,
                  expiresInHours: campaign.expiresInHours,
                  includeHeaderMedia: campaign.includeHeaderMedia,
                });
              const deliveryKey = {
                campaignId_userId_channel: {
                  campaignId: id,
                  userId: recipient.id,
                  channel: 'WHATSAPP',
                },
              };
              await Promise.all([
                this.prisma.marketingDelivery.update({
                  where: deliveryKey,
                  data: {
                    status: MarketingDeliveryStatus.SENT,
                    providerMessageId,
                    failureReason: null,
                  },
                }),
                this.prisma.notification.create({
                  data: {
                    userId: recipient.id,
                    title: campaign.name,
                    message: campaign.message,
                    type: NotificationType.PROMO,
                    actionUrl: '/menu',
                  },
                }),
              ]);
            } catch (error: unknown) {
              await this.prisma.marketingDelivery.update({
                where: {
                  campaignId_userId_channel: {
                    campaignId: id,
                    userId: recipient.id,
                    channel: 'WHATSAPP',
                  },
                },
                data: {
                  status: MarketingDeliveryStatus.FAILED,
                  failureReason: this.errorMessage(error).slice(0, 500),
                },
              });
            }
          }),
        );
      }

      const failed = await this.prisma.marketingDelivery.count({
        where: { campaignId: id, status: MarketingDeliveryStatus.FAILED },
      });
      return this.prisma.marketingCampaign.update({
        where: { id },
        data: {
          status:
            failed === 0
              ? MarketingCampaignStatus.SENT
              : MarketingCampaignStatus.FAILED,
          recipientCount: recipients.length - failed,
          dispatchedAt: new Date(),
        },
        include: campaignInclude,
      });
    } catch (error: unknown) {
      await this.prisma.marketingCampaign.update({
        where: { id },
        data: { status: MarketingCampaignStatus.FAILED },
      });
      throw error;
    }
  }

  private async requireCampaign(id: string, managedBranchId?: string) {
    const campaign = await this.prisma.marketingCampaign.findFirst({
      where: { id, ...(managedBranchId ? { branchId: managedBranchId } : {}) },
      include: campaignInclude,
    });
    if (!campaign) throw new NotFoundException('Marketing campaign not found');
    return campaign;
  }

  private async assertTargetCustomer(targetUserId?: string): Promise<void> {
    if (!targetUserId) return;
    const user = await this.prisma.user.findFirst({
      where: { id: targetUserId, role: Role.CUSTOMER, deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Target customer not found');
  }

  private async findRecipients(campaign: {
    targetUserId: string | null;
    branchId: string | null;
    audience: string;
  }) {
    const maximum = Math.min(
      1_000,
      Math.max(
        1,
        Number(this.config.get<string>('WHATSAPP_BROADCAST_MAX_RECIPIENTS')) ||
          100,
      ),
    );
    const activeSince = new Date(Date.now() - 14 * 86_400_000);
    const atRiskSince = new Date(Date.now() - 21 * 86_400_000);
    const orderScope: Prisma.OrderWhereInput = {
      status: OrderStatus.COMPLETED,
      deletedAt: null,
      ...(campaign.branchId ? { branchId: campaign.branchId } : {}),
    };
    const users = await this.prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        deletedAt: null,
        phone: { not: null },
        ...(campaign.targetUserId ? { id: campaign.targetUserId } : {}),
        ...(campaign.audience === 'all_active'
          ? {
              orders: {
                some: { ...orderScope, createdAt: { gte: activeSince } },
              },
            }
          : {}),
        ...(campaign.audience === 'at_risk'
          ? {
              AND: [
                { orders: { some: orderScope } },
                {
                  NOT: {
                    orders: {
                      some: {
                        ...orderScope,
                        createdAt: { gte: atRiskSince },
                      },
                    },
                  },
                },
              ],
            }
          : {}),
        ...(campaign.audience === 'coworking'
          ? {
              reservations: {
                some: campaign.branchId ? { branchId: campaign.branchId } : {},
              },
            }
          : {}),
      },
      select: {
        id: true,
        phone: true,
        membershipTier: true,
        orders: {
          where: orderScope,
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
      take: maximum * 4,
    });
    return users
      .filter(
        (user) =>
          campaign.audience !== 'night_owls' ||
          user.membershipTier === MembershipTier.GOLD ||
          user.membershipTier === MembershipTier.PLATINUM ||
          user.orders.some((order) => {
            const hour = Number(jakartaHour.format(order.createdAt));
            return hour >= 21 || hour < 5;
          }),
      )
      .slice(0, maximum)
      .flatMap((user) =>
        user.phone ? [{ id: user.id, phone: user.phone }] : [],
      );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
