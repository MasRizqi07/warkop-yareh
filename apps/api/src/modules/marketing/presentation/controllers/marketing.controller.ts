import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { resolveManagedBranch } from '../../../../common/authorization/branch-access';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { MarketingService } from '../../application/services/marketing.service';
import {
  CreateMarketingCampaignDto,
  ListMarketingCampaignsDto,
  TestMarketingCampaignDto,
  UpdateMarketingCampaignDto,
} from '../dtos/marketing.dto';

@Controller('api/v1/marketing')
@Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('provider-status')
  providerStatus() {
    return { data: this.marketingService.providerStatus() };
  }

  @Get('campaigns')
  async listCampaigns(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMarketingCampaignsDto,
  ) {
    const branchId = resolveManagedBranch(user, query.branchId);
    const result = await this.marketingService.listCampaigns({
      branchId,
      page: query.page,
      limit: query.limit,
    });
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Post('campaigns')
  async createCampaign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateMarketingCampaignDto,
  ) {
    const branchId = resolveManagedBranch(user, body.branchId);
    const data = await this.marketingService.createCampaign(
      body,
      user,
      branchId,
    );
    return { data };
  }

  @Patch('campaigns/:id')
  async updateCampaign(
    @Param('id') id: string,
    @Body() body: UpdateMarketingCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.marketingService.updateCampaign(
      id,
      body,
      resolveManagedBranch(user),
    );
    return { data };
  }

  @Post('campaigns/:id/test')
  async testCampaign(
    @Param('id') id: string,
    @Body() body: TestMarketingCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.marketingService.testCampaign(
      id,
      body.phone,
      resolveManagedBranch(user),
    );
    return { data };
  }

  @Post('campaigns/:id/dispatch')
  async dispatchCampaign(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.marketingService.dispatchCampaign(
      id,
      resolveManagedBranch(user),
    );
    return { data };
  }
}
