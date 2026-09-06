import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FranchiseStatus, OrderStatus, Prisma } from '@warkop-yareh/database';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: DatabaseService) {}

  async createAgreement(data: {
    ownerName: string;
    ownerEmail: string;
    branchId: string;
    companyName?: string;
    royaltyPercentage?: number;
    monthlyFee: number;
    agreementStart: string;
    agreementEnd?: string;
  }) {
    const agreementStart = this.parseDate(
      data.agreementStart,
      'agreementStart',
    );
    const agreementEnd = data.agreementEnd
      ? this.parseDate(data.agreementEnd, 'agreementEnd')
      : null;
    if (agreementEnd && agreementEnd <= agreementStart) {
      throw new BadRequestException(
        'agreementEnd must be later than agreementStart',
      );
    }
    const branch = await this.prisma.branch.findFirst({
      where: { id: data.branchId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    if (!branch) throw new BadRequestException('Branch is not active');

    try {
      return await this.prisma.franchiseAgreement.create({
        data: {
          ownerName: data.ownerName.trim(),
          ownerEmail: data.ownerEmail.trim().toLowerCase(),
          companyName: data.companyName?.trim() || null,
          branchId: data.branchId,
          revenueShare: data.royaltyPercentage ?? 0,
          monthlyFee: data.monthlyFee,
          agreementStart,
          agreementEnd,
        },
      });
    } catch (error: unknown) {
      if (this.getPrismaErrorCode(error) === 'P2002') {
        throw new ConflictException(
          'This branch already has a franchise agreement',
        );
      }
      throw error;
    }
  }

  async getAgreement(id: string, branchId?: string) {
    const agreement = await this.prisma.franchiseAgreement.findFirst({
      where: { id, ...(branchId ? { branchId } : {}) },
      include: {
        billings: { orderBy: { period: 'desc' } },
      },
    });
    if (!agreement)
      throw new NotFoundException('Franchise agreement not found');
    return agreement;
  }

  async listAgreements(branchId?: string) {
    return this.prisma.franchiseAgreement.findMany({
      where: branchId ? { branchId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBilling(data: {
    agreementId: string;
    period: string;
    dueDate: string;
  }) {
    const dueDate = this.parseDate(data.dueDate, 'dueDate');
    const { start, end } = this.parseBillingPeriod(data.period);
    const agreement = await this.prisma.franchiseAgreement.findUnique({
      where: { id: data.agreementId },
    });
    if (!agreement)
      throw new NotFoundException('Franchise agreement not found');
    if (agreement.status !== FranchiseStatus.ACTIVE) {
      throw new BadRequestException('Franchise agreement is not active');
    }
    if (
      agreement.agreementStart >= end ||
      (agreement.agreementEnd && agreement.agreementEnd < start)
    ) {
      throw new BadRequestException(
        'Billing period is outside the agreement term',
      );
    }

    const revenue = await this.prisma.order.aggregate({
      where: {
        branchId: agreement.branchId,
        status: OrderStatus.COMPLETED,
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
      _sum: { total: true },
    });
    const revenueAmount = revenue._sum.total ?? 0;
    const amount =
      agreement.monthlyFee +
      Math.round((revenueAmount * agreement.revenueShare) / 100);

    try {
      return await this.prisma.franchiseBilling.create({
        data: {
          agreementId: data.agreementId,
          period: data.period,
          amount,
          revenueAmount,
          dueDate,
        },
      });
    } catch (error: unknown) {
      if (this.getPrismaErrorCode(error) === 'P2002') {
        throw new ConflictException('Billing already exists for this period');
      }
      throw error;
    }
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException(`${field} is invalid`);
    }
    return date;
  }

  private parseBillingPeriod(period: string): { start: Date; end: Date } {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      throw new BadRequestException('period must use YYYY-MM format');
    }
    const [year, month] = period.split('-').map(Number);
    return {
      start: new Date(Date.UTC(year, month - 1, 1)),
      end: new Date(Date.UTC(year, month, 1)),
    };
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
