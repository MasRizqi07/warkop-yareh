import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import {
  assertBranchAccess,
  resolveManagedBranch,
} from '../../../../common/authorization/branch-access';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { ShiftService } from '../../application/services/shift.service';
import {
  CloseShiftDto,
  CreateCashMovementDto,
  ListShiftsQueryDto,
  OpenShiftDto,
} from '../dtos/shift.dto';

@ApiTags('cashier shifts')
@ApiBearerAuth('JWT')
@Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)
@Controller('api/v1/shifts')
export class ShiftController {
  constructor(private readonly shifts: ShiftService) {}

  @Get('current')
  async current(
    @CurrentUser() user: AuthenticatedUser,
    @Query('branchId') requestedBranchId?: string,
  ) {
    const branchId = this.requireBranch(
      resolveManagedBranch(user, requestedBranchId),
    );
    return { data: await this.shifts.getCurrent(branchId) };
  }

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListShiftsQueryDto,
  ) {
    const branchId = this.requireBranch(
      resolveManagedBranch(user, query.branchId),
    );
    const result = await this.shifts.list(branchId, query.page, query.limit);
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Post('open')
  async open(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: OpenShiftDto,
  ) {
    const branchId = this.requireBranch(
      resolveManagedBranch(user, body.branchId),
    );
    return {
      data: await this.shifts.open(branchId, user.id, body.openingFloat),
      message: 'Cashier shift opened',
    };
  }

  @Post(':id/movements')
  async movement(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: CreateCashMovementDto,
  ) {
    assertBranchAccess(user, await this.shifts.getBranchId(id));
    return {
      data: await this.shifts.addMovement(
        id,
        user.id,
        body.type,
        body.amount,
        body.reason,
      ),
      message: 'Cash movement recorded',
    };
  }

  @Post(':id/close')
  async close(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: CloseShiftDto,
  ) {
    assertBranchAccess(user, await this.shifts.getBranchId(id));
    return {
      data: await this.shifts.close(id, user.id, body.closingCash, body.notes),
      message: 'Cashier shift closed',
    };
  }

  private requireBranch(branchId?: string): string {
    if (!branchId) {
      throw new BadRequestException(
        'branchId is required for global operators',
      );
    }
    return branchId;
  }
}
