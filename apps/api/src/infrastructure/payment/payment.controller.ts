import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  NotFoundException,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@warkop-yareh/database';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderingService } from '../../modules/ordering/application/services/ordering.service';
import type { OrderDetails } from '../../modules/ordering/domain/repositories/ordering.repository.interface';
import { CreateSnapPaymentDto } from './payment.dto';
import { PaymentService } from './payment.service';

const GLOBAL_PAYMENT_ROLES: readonly Role[] = [Role.ADMIN, Role.SUPERADMIN];
const BRANCH_PAYMENT_ROLES: readonly Role[] = [
  Role.STAFF,
  Role.CASHIER,
  Role.MANAGER,
  Role.OWNER,
];

@ApiTags('payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/payments/midtrans')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => OrderingService))
    private readonly orderingService: OrderingService,
  ) {}

  @Post('snap')
  @ApiOperation({ summary: 'Initialize or replay a Midtrans Snap transaction' })
  async generateSnapToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateSnapPaymentDto,
  ) {
    const order = await this.orderingService.getOrder(body.orderId);
    if (!order) throw new NotFoundException('Order not found');
    this.assertOrderAccess(user, order);
    return {
      data: await this.paymentService.initializeSnap(
        order,
        body.paymentMethod,
        body.grossAmount,
      ),
    };
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Receive a signed Midtrans webhook callback' })
  async handleWebhook(@Body() body: unknown) {
    return this.paymentService.handleWebhook(body);
  }

  private assertOrderAccess(
    user: AuthenticatedUser,
    order: OrderDetails,
  ): void {
    if (GLOBAL_PAYMENT_ROLES.includes(user.role)) return;
    if (BRANCH_PAYMENT_ROLES.includes(user.role)) {
      if (!user.branchId || order.branchId !== user.branchId) {
        throw new ForbiddenException(
          'You can only initialize payments for your own branch',
        );
      }
      return;
    }
    if (order.userId !== user.id) {
      throw new ForbiddenException(
        'You can only initialize payments for your own orders',
      );
    }
  }
}
