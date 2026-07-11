import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from '../../application/services/analytics.service';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('api/v1/analytics')
@Roles('MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  async getRevenue(@Query('branchId') branchId?: string) {
    const data = await this.analyticsService.getRevenueStats(branchId);
    return { data };
  }

  @Get('categories')
  async getCategories(@Query('branchId') branchId?: string) {
    const data = await this.analyticsService.getCategoryPerformance(branchId);
    return { data };
  }
}
