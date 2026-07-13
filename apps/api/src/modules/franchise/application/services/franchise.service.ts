import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: DatabaseService) {}

  async createAgreement(data: {
    ownerName: string;
    ownerEmail: string;
    branchId: string;
    royaltyPercentage?: number;
    monthlyFee: number;
    agreementStart: string;
    agreementEnd?: string;
  }) {
    const client = this.prisma as any;
    return client.franchiseAgreement.create({
      data: {
        ownerName: data.ownerName,
        ownerEmail: data.ownerEmail,
        branchId: data.branchId,
        revenueShare: data.royaltyPercentage || 0,
        monthlyFee: data.monthlyFee,
        agreementStart: new Date(data.agreementStart),
        agreementEnd: data.agreementEnd ? new Date(data.agreementEnd) : null,
      },
    });
  }

  async getAgreement(id: string) {
    const client = this.prisma as any;
    return client.franchiseAgreement.findUnique({
      where: { id },
      include: {
        billings: true,
      },
    });
  }

  async listAgreements() {
    const client = this.prisma as any;
    return client.franchiseAgreement.findMany();
  }

  async createBilling(data: {
    agreementId: string;
    period: string;
    amount: number;
    dueDate: string;
  }) {
    const client = this.prisma as any;
    return client.franchiseBilling.create({
      data: {
        agreementId: data.agreementId,
        period: data.period,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
      },
    });
  }
}
