import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FranchiseService } from '../../application/services/franchise.service';
import { CreateAgreementDto, GenerateBillingDto } from '../dtos/franchise.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('Franchise')
@Controller('api/v1/franchise')
@Roles('ADMIN', 'OWNER', 'SUPERADMIN')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post('agreements')
  @ApiOperation({ summary: 'Create a new franchise agreement' })
  async createAgreement(
    @Body()
    body: CreateAgreementDto,
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
  @ApiOperation({ summary: 'Generate billing for an agreement' })
  async generateBilling(
    @Body()
    body: GenerateBillingDto,
  ) {
    const data = await this.franchiseService.createBilling(body);
    return { data };
  }
}
