import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderingService } from '../../application/services/ordering.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  SubmitFeedbackDto,
} from '../dtos/order.dto';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

const ORDER_OPERATOR_ROLES = [
  'STAFF',
  'CASHIER',
  'KITCHEN',
  'MANAGER',
  'ADMIN',
  'OWNER',
  'SUPERADMIN',
];
const GLOBAL_ORDER_ROLES = ['SUPERADMIN', 'ADMIN'];
const BRANCH_ORDER_ROLES = ['STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'OWNER'];

@ApiTags('orders')
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly orderingService: OrderingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @CurrentUser() user: { id: string; role: string },
    @Body() body: CreateOrderDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const isEmployee = ORDER_OPERATOR_ROLES.includes(user.role);
    const resolvedUserId = isEmployee ? body.userId || user.id : user.id;

    const order = await this.orderingService.createOrder({
      ...body,
      userId: resolvedUserId,
      idempotencyKey: idempotencyKey || (body as any).idempotencyKey,
    });
    return { data: order };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get order details by ID' })
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string; branchId: string },
  ) {
    const order = await this.orderingService.getOrder(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (user) {
      const isSuperAdmin = GLOBAL_ORDER_ROLES.includes(user.role);
      const isEmployee = BRANCH_ORDER_ROLES.includes(user.role);

      if (!isSuperAdmin) {
        if (isEmployee) {
          if (order.branchId !== user.branchId) {
            throw new ForbiddenException(
              'You can only access orders from your own branch',
            );
          }
        } else {
          if (order.userId !== user.id) {
            throw new ForbiddenException('You can only access your own orders');
          }
        }
      }
    }

    return { data: order };
  }

  @Get(':id/payment-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get order payment status' })
  async getPaymentStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string; branchId: string },
  ) {
    const order = await this.orderingService.getOrder(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isEmployee = ORDER_OPERATOR_ROLES.includes(user.role);
    const isSuperAdmin = GLOBAL_ORDER_ROLES.includes(user.role);

    if (!isSuperAdmin) {
      if (isEmployee) {
        if (order.branchId !== user.branchId) {
          throw new ForbiddenException(
            'You can only access orders from your own branch',
          );
        }
      } else {
        if (order.userId !== user.id) {
          throw new ForbiddenException('You can only access your own orders');
        }
      }
    }

    const status = await this.orderingService.getPaymentStatusFromMidtrans(id);
    return { data: { paymentStatus: status } };
  }

  @Get()
  @ApiOperation({ summary: 'List orders with pagination' })
  async listOrders(
    @CurrentUser() user: { id: string; role: string },
    @Query('userId') queryUserId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const isEmployee = ORDER_OPERATOR_ROLES.includes(user.role);
    const resolvedUserId = isEmployee ? queryUserId : user.id;
    const result = await this.orderingService.listOrders({
      userId: resolvedUserId,
      branchId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    return paginate(result.data, result.total, parseInt(page), parseInt(limit));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @Roles(...ORDER_OPERATOR_ROLES)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    const order = await this.orderingService.updateOrderStatus(id, body.status);
    return { data: order };
  }

  @Post(':id/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit feedback for an order' })
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: SubmitFeedbackDto,
  ) {
    const feedback = await this.orderingService.createFeedback(id, body);
    return { data: feedback, message: 'Feedback submitted successfully' };
  }
}
