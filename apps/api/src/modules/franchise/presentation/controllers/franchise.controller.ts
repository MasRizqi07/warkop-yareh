import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FranchiseService } from '../../application/services/franchise.service';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('api/v1/franchise')
@Roles('ADMIN', 'OWNER', 'SUPERADMIN')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post('agreements')
  async createAgreement(
    @Body()
    body: {
      ownerName: string;
      ownerEmail: string;
      branchId: string;
      royaltyPercentage?: number;
      monthlyFee: number;
      agreementStart: string;
      agreementEnd?: string;
    },
  ) {
    const data = await this.franchiseService.createAgreement(body);
    return { data };
  }

  @Get('agreements')
  async listAgreements() {
    const data = await this.franchiseService.listAgreements();
    return { data };
  }

  @Get('agreements/:id')
  async getAgreement(@Param('id') id: string) {
    const data = await this.franchiseService.getAgreement(id);
    return { data };
  }

  @Post('billings')
  async createBilling(
    @Body()
    body: {
      agreementId: string;
      period: string;
      amount: number;
      dueDate: string;
    },
  ) {
    const data = await this.franchiseService.createBilling(body);
    return { data };
  }
}
