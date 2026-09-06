import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import { IdentityService } from '../../application/services/identity.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { ListUsersQueryDto, UpdateUserDto } from '../dtos/user.dto';

const GLOBAL_USER_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];
const BRANCH_MANAGER_ROLES: readonly Role[] = [Role.MANAGER, Role.OWNER];

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly identityService: IdentityService) {}

  @Get(':id')
  async getUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const profile = await this.identityService.getUserProfile(id);
    if (!profile) throw new NotFoundException('User not found');
    this.assertCanManageProfile(user, profile.id, profile.branchId);
    return { data: profile };
  }

  @Get()
  @Roles(Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
  async listUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListUsersQueryDto,
  ) {
    const branchId = this.hasRole(user, GLOBAL_USER_ROLES)
      ? undefined
      : this.requireAssignedBranch(user);
    const result = await this.identityService.listUsers({
      page: query.page,
      limit: query.limit,
      role: query.role,
      branchId,
    });
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Patch(':id')
  async updateUser(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    const profile = await this.identityService.getUserProfile(id);
    if (!profile) throw new NotFoundException('User not found');
    this.assertCanManageProfile(user, profile.id, profile.branchId);
    const updated = await this.identityService.updateUser(id, body);
    return { data: updated };
  }

  private assertCanManageProfile(
    actor: AuthenticatedUser,
    targetId: string,
    targetBranchId: string | null,
  ): void {
    if (actor.id === targetId || this.hasRole(actor, GLOBAL_USER_ROLES)) return;
    if (
      this.hasRole(actor, BRANCH_MANAGER_ROLES) &&
      actor.branchId &&
      actor.branchId === targetBranchId
    ) {
      return;
    }
    throw new ForbiddenException('You cannot access this user profile');
  }

  private hasRole(
    user: AuthenticatedUser,
    allowedRoles: readonly Role[],
  ): boolean {
    return allowedRoles.includes(user.role);
  }

  private requireAssignedBranch(user: AuthenticatedUser): string {
    if (!user.branchId) {
      throw new ForbiddenException('A branch assignment is required');
    }
    return user.branchId;
  }
}
