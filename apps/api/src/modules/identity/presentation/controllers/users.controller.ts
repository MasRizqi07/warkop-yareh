/* eslint-disable */
import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { IdentityService } from '../../application/services/identity.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly identityService: IdentityService) {}

  @Get(':id')
  async getUser(@CurrentUser() user: any, @Param('id') id: string) {
    const isEmployee = [
      'STAFF',
      'CASHIER',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role);
    const resolvedId = isEmployee ? id : user.id;
    const profile = await this.identityService.getUserProfile(resolvedId);
    return { data: profile };
  }

  @Get()
  @Roles('STAFF', 'CASHIER', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN')
  async listUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: string,
  ) {
    const result = await this.identityService.listUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
    });
    return paginate(result.data, result.total, parseInt(page), parseInt(limit));
  }

  @Patch(':id')
  async updateUser(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; phone: string; avatar: string }>,
  ) {
    const isEmployee = [
      'STAFF',
      'CASHIER',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role);
    const resolvedId = isEmployee ? id : user.id;
    const updated = await this.identityService.updateUser(resolvedId, body);
    return { data: updated };
  }
}
