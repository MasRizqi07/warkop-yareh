import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from '../../application/services/analytics.service';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { resolveManagedBranch } from '../../../../common/authorization/branch-access';
import { AnalyticsQueryDto } from '../dtos/analytics.dto';
import { CustomerAnalyticsQueryDto } from '../dtos/analytics.dto';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';

@Controller('api/v1/analytics')
@Roles('MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  async getRevenue(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsQueryDto,
  ) {
    const branchId = resolveManagedBranch(user, query.branchId);
    const data = await this.analyticsService.getRevenueStats(branchId);
    return { data };
  }

  @Get('categories')
  async getCategories(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AnalyticsQueryDto,
  ) {
    const branchId = resolveManagedBranch(user, query.branchId);
    const data = await this.analyticsService.getCategoryPerformance(branchId);
    return { data };
  }

  @Get('customers')
  async getCustomers(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CustomerAnalyticsQueryDto,
  ) {
    const branchId = resolveManagedBranch(user, query.branchId);
    const result = await this.analyticsService.getCustomerInsights({
      branchId,
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return paginate(result.data, result.total, query.page, query.limit);
  }
}
