import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import { SettleCashPaymentDto } from './payment.dto';
import { PaymentService } from './payment.service';
import { ShiftService } from '../../modules/operations/application/services/shift.service';

const GLOBAL_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];
const CASHIER_ROLES: readonly Role[] = [Role.CASHIER, Role.MANAGER, Role.OWNER];

@ApiTags('payments')
@ApiBearerAuth('JWT')
@Controller('api/v1/payments/cash')
export class CashPaymentController {
  constructor(
    private readonly payments: PaymentService,
    private readonly ordering: OrderingService,
    private readonly shifts: ShiftService,
  ) {}

  @Post()
  @Roles(...CASHIER_ROLES, ...GLOBAL_ROLES)
  @ApiOperation({ summary: 'Settle a branch order with cash at the POS' })
  async settle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SettleCashPaymentDto,
  ) {
    const order = await this.ordering.getOrder(body.orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (!order.branchId) {
      throw new ConflictException('Cash settlement requires a branch order');
    }
    if (!GLOBAL_ROLES.includes(user.role)) {
      if (!user.branchId || user.branchId !== order.branchId) {
        throw new ForbiddenException(
          'You can only settle cash orders from your own branch',
        );
      }
    }
    if (!(await this.shifts.getCurrent(order.branchId))) {
      throw new ConflictException(
        'Open a cashier shift before accepting a cash payment',
      );
    }
    return {
      data: await this.payments.settleCash(order, body.cashReceived),
      message: 'Cash payment settled',
    };
  }
}
