import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
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
  ) {
    const isEmployee = [
      'STAFF',
      'CASHIER',
      'MANAGER',
      'ADMIN',
      'OWNER',
      'SUPERADMIN',
    ].includes(user.role);
    const resolvedUserId = isEmployee ? body.userId : user.id;

    const order = await this.orderingService.createOrder({
      ...body,
      userId: resolvedUserId,
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
      throw new \u004E\u006F\u0074\u0046\u006F\u0075\u006E\u0064\u0045\u0078\u0063\u0065\u0070\u0074\u0069\u006F\u006E('Order not found');
    }

    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN'].includes(user.role);
    const isSuperAdmin = ['SUPERADMIN', 'ADMIN'].includes(user.role);

    if (!isSuperAdmin) {
      if (isEmployee) {
        if (order.branchId !== user.branchId) {
          throw new \u0046\u006F\u0072\u0062\u0069\u0064\u0064\u0065\u006E\u0045\u0078\u0063\u0065\u0070\u0074\u0069\u006F\u006E('You can only access orders from your own branch');
        }
      } else {
        if (order.userId !== user.id) {
          throw new \u0046\u006F\u0072\u0062\u0069\u0064\u0064\u0065\u006E\u0045\u0078\u0063\u0065\u0070\u0074\u0069\u006F\u006E('You can only access your own orders');
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

    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN'].includes(user.role);
    const isSuperAdmin = ['SUPERADMIN', 'ADMIN'].includes(user.role);

    if (!isSuperAdmin) {
      if (isEmployee) {
        if (order.branchId !== user.branchId) {
          throw new ForbiddenException('You can only access orders from your own branch');
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
    const isEmployee = ['STAFF', 'MANAGER', 'ADMIN'].includes(user.role);
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
  @Roles('STAFF', 'MANAGER', 'ADMIN')
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
