import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FranchiseService } from '../../application/services/franchise.service';
import { CreateAgreementDto, GenerateBillingDto } from '../dtos/franchise.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { resolveManagedBranch } from '../../../../common/authorization/branch-access';

@ApiTags('Franchise')
@Controller('api/v1/franchise')
@Roles(Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post('agreements')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new franchise agreement' })
  async createAgreement(
    @Body()
    body: CreateAgreementDto,
  ) {
    const data = await this.franchiseService.createAgreement(body);
    return { data };
  }

  @Get('agreements')
  async listAgreements(
    @CurrentUser() user: AuthenticatedUser,
    @Query('branchId') requestedBranchId?: string,
  ) {
    const branchId = resolveManagedBranch(user, requestedBranchId);
    const data = await this.franchiseService.listAgreements(branchId);
    return { data };
  }

  @Get('agreements/:id')
  async getAgreement(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const branchId = resolveManagedBranch(user);
    const data = await this.franchiseService.getAgreement(id, branchId);
    return { data };
  }

  @Post('billings')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Generate billing for an agreement' })
  async generateBilling(
    @Body()
    body: GenerateBillingDto,
  ) {
    const data = await this.franchiseService.createBilling(body);
    return { data };
  }
}
