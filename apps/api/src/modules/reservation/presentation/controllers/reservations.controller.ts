import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import { ReservationService } from '../../application/services/reservation.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import {
  CreateReservationDto,
  ListReservationsQueryDto,
  UpdateReservationStatusDto,
} from '../dtos/reservation.dto';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';

const GLOBAL_RESERVATION_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];
const BRANCH_RESERVATION_ROLES: readonly Role[] = [
  Role.STAFF,
  Role.CASHIER,
  Role.MANAGER,
  Role.OWNER,
];

@ApiTags('reservations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reservations')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateReservationDto,
  ) {
    const isGlobal = GLOBAL_RESERVATION_ROLES.includes(user.role);
    const isBranchOperator = BRANCH_RESERVATION_ROLES.includes(user.role);
    const branchId = isGlobal
      ? body.branchId
      : isBranchOperator
        ? this.requireAssignedBranch(user)
        : body.branchId;
    const userId =
      isGlobal || isBranchOperator ? (body.userId ?? user.id) : user.id;

    const reservation = await this.reservationService.createReservation({
      userId,
      branchId,
      tableId: body.tableId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      guestCount: body.guestCount,
      specialRequests: body.specialRequests,
    });
    return { data: reservation };
  }

  @Get('reservations')
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListReservationsQueryDto,
  ) {
    const isGlobal = GLOBAL_RESERVATION_ROLES.includes(user.role);
    const isBranchOperator = BRANCH_RESERVATION_ROLES.includes(user.role);
    const branchId = isGlobal
      ? query.branchId
      : isBranchOperator
        ? this.requireAssignedBranch(user)
        : query.branchId;
    const userId = isGlobal
      ? query.userId
      : isBranchOperator
        ? query.userId
        : user.id;

    const result = await this.reservationService.listReservations({
      branchId,
      userId,
      date: query.date,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Patch('reservations/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateReservationStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const reservation = await this.reservationService.updateStatus(
      id,
      body.status,
      user,
    );
    return { data: reservation };
  }

  @Get('branches/:branchId/tables')
  async listTables(@Param('branchId') branchId: string) {
    const tables = await this.reservationService.listTables(branchId);
    return { data: tables };
  }

  private requireAssignedBranch(user: AuthenticatedUser): string {
    if (!user.branchId) {
      throw new ForbiddenException('A branch assignment is required');
    }
    return user.branchId;
  }
}
