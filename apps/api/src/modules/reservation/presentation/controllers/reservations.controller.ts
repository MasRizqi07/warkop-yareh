import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ReservationService } from '../../application/services/reservation.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('api/v1')
export class ReservationsController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('reservations')
  async create(
    @CurrentUser() user: { id: string; role: string },
    @Body()
    body: {
      branchId: string;
      tableId?: string;
      date: string;
      startTime: string;
      endTime: string;
      guestCount: number;
      specialRequests?: string;
      userId?: string;
    },
  ) {
    const isEmployee = [
      'STAFF',
      'CASHIER',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role);
    const resolvedUserId = isEmployee ? body.userId || '' : user.id;

    const reservation = await this.reservationService.createReservation({
      ...body,
      userId: resolvedUserId,
    });
    return { data: reservation };
  }

  @Get('reservations')
  async list(
    @CurrentUser() user: { id: string; role: string },
    @Query('branchId') branchId?: string,
    @Query('userId') queryUserId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN'].includes(user.role);
    const resolvedUserId = isEmployee ? queryUserId : user.id;
    const result = await this.reservationService.listReservations({
      branchId,
      userId: resolvedUserId,
      date,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return paginate(result.data, result.total, parseInt(page), parseInt(limit));
  }

  @Patch('reservations/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const reservation = await this.reservationService.updateStatus(
      id,
      body.status,
    );
    return { data: reservation };
  }

  @Get('branches/:branchId/tables')
  async listTables(@Param('branchId') branchId: string) {
    const tables = await this.reservationService.listTables(branchId);
    return { data: tables };
  }
}
