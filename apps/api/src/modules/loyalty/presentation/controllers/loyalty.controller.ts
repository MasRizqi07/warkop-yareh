import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LoyaltyService } from '../../application/services/loyalty.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('api/v1/loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('rewards')
  async getRewards() {
    const data = await this.loyaltyService.getAvailableRewards();
    return { data };
  }

  @Get(':userId')
  async getStatus(@CurrentUser() user: any, @Param('userId') userId: string) {
    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN'].includes(user.role);
    const resolvedUserId = isEmployee ? userId : user.id;
    const data = await this.loyaltyService.getLoyaltyStatus(resolvedUserId);
    return { data };
  }

  @Post(':userId/points')
  @Roles('STAFF', 'MANAGER', 'ADMIN')
  async awardPoints(
    @Param('userId') userId: string,
    @Body('points') points: number,
    @Body('reason') reason: string,
  ) {
    const data = await this.loyaltyService.awardPoints(userId, points, reason);
    return { data };
  }

  @Post(':userId/redeem')
  async redeemReward(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Body('rewardId') rewardId: string,
  ) {
    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN'].includes(user.role);
    const resolvedUserId = isEmployee ? userId : user.id;
    const data = await this.loyaltyService.redeemReward(
      resolvedUserId,
      rewardId,
    );
    return { data };
  }

  @Get(':userId/transactions')
  async getTransactions(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
  ) {
    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN'].includes(user.role);
    const resolvedUserId = isEmployee ? userId : user.id;
    const data = await this.loyaltyService.listTransactions(resolvedUserId);
    return { data };
  }
}
