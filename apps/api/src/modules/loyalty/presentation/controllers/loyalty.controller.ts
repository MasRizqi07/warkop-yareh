import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { LoyaltyService } from '../../application/services/loyalty.service';
import {
  AwardPointsDto,
  LoyaltyTransactionsQueryDto,
} from '../dtos/loyalty.dto';

const GLOBAL_LOYALTY_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];

@ApiTags('loyalty')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current loyalty balance and tier' })
  async getStatus(@CurrentUser() user: AuthenticatedUser) {
    return { data: await this.loyaltyService.getLoyaltyStatus(user.id) };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List the current user loyalty transactions' })
  async listTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: LoyaltyTransactionsQueryDto,
  ) {
    const result = await this.loyaltyService.listTransactions(
      user.id,
      query.page,
      query.limit,
    );
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Get('rewards')
  @ApiOperation({ summary: 'List active, unexpired loyalty rewards' })
  async listRewards() {
    return { data: await this.loyaltyService.getAvailableRewards() };
  }

  @Post('rewards/:rewardId/redeem')
  @ApiOperation({ summary: 'Redeem a reward with the current user points' })
  async redeem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('rewardId') rewardId: string,
  ) {
    return {
      data: await this.loyaltyService.redeemReward(user.id, rewardId),
      message: 'Reward redeemed successfully',
    };
  }

  @Post('users/:userId/award')
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Award loyalty points to a user' })
  async award(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() body: AwardPointsDto,
  ) {
    if (!GLOBAL_LOYALTY_ROLES.includes(actor.role)) {
      const targetBranchId = await this.loyaltyService.getUserBranch(userId);
      if (!actor.branchId || actor.branchId !== targetBranchId) {
        throw new ForbiddenException(
          'You can only award points to users in your own branch',
        );
      }
    }
    return {
      data: await this.loyaltyService.awardPoints(
        userId,
        body.points,
        body.reason,
      ),
      message: 'Loyalty points awarded successfully',
    };
  }
}
