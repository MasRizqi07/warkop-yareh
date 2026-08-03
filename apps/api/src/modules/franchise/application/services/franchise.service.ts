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
    return this.prisma.franchiseAgreement.create({
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
    return this.prisma.franchiseAgreement.findUnique({
      where: { id },
      include: {
        billings: true,
      },
    });
  }

  async listAgreements() {
    return this.prisma.franchiseAgreement.findMany();
  }

  async createBilling(data: {
    agreementId: string;
    period: string;
    amount: number;
    dueDate: string;
  }) {
    return this.prisma.franchiseBilling.create({
      data: {
        agreementId: data.agreementId,
        period: data.period,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
      },
    });
  }
}
