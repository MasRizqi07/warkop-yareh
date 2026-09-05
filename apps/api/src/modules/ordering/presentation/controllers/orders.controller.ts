import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderStatus, Role } from '@warkop-yareh/database';
import { OrderingService } from '../../application/services/ordering.service';
import { paginate } from '../../../../common/interfaces/paginated-response.interface';
import {
  CreateOrderDto,
  ListOrdersQueryDto,
  SubmitFeedbackDto,
  UpdateOrderStatusDto,
} from '../dtos/order.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import type { OrderDetails } from '../../domain/repositories/ordering.repository.interface';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';

const ORDER_OPERATOR_ROLES: readonly Role[] = [
  Role.STAFF,
  Role.CASHIER,
  Role.KITCHEN,
  Role.MANAGER,
  Role.ADMIN,
  Role.OWNER,
  Role.SUPERADMIN,
];
const GLOBAL_ORDER_ROLES: readonly Role[] = [Role.SUPERADMIN, Role.ADMIN];
const BRANCH_ORDER_ROLES: readonly Role[] = [
  Role.STAFF,
  Role.CASHIER,
  Role.KITCHEN,
  Role.MANAGER,
  Role.OWNER,
];

@ApiTags('orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly orderingService: OrderingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateOrderDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
  ) {
    const idempotencyKey = idempotencyHeader ?? body.idempotencyKey;
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const isGlobal = this.hasRole(user, GLOBAL_ORDER_ROLES);
    const isBranchOperator = this.hasRole(user, BRANCH_ORDER_ROLES);
    const branchId = isGlobal
      ? body.branchId
      : isBranchOperator
        ? this.requireAssignedBranch(user)
        : body.branchId;
    const userId =
      isGlobal || isBranchOperator ? (body.userId ?? user.id) : user.id;

    const order = await this.orderingService.createOrder({
      userId,
      branchId,
      items: body.items,
      type: body.type,
      tableId: body.tableId,
      notes: body.notes,
      idempotencyKey,
    });
    return { data: order };
  }

  @Get(':id/payment-status')
  @ApiOperation({ summary: 'Get order payment status' })
  async getPaymentStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.getAuthorizedOrder(id, user);
    const gatewayStatus =
      await this.orderingService.getPaymentStatusFromMidtrans(
        order.orderNumber,
      );
    return {
      data: {
        paymentStatus: order.paymentStatus,
        gatewayStatus,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID or order number' })
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.getAuthorizedOrder(id, user);
    return { data: order };
  }

  @Get()
  @ApiOperation({ summary: 'List orders with pagination' })
  async listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    const isGlobal = this.hasRole(user, GLOBAL_ORDER_ROLES);
    const isBranchOperator = this.hasRole(user, BRANCH_ORDER_ROLES);
    const userId = isGlobal
      ? query.userId
      : isBranchOperator
        ? query.userId
        : user.id;
    const branchId = isGlobal
      ? query.branchId
      : isBranchOperator
        ? this.requireAssignedBranch(user)
        : query.branchId;

    const result = await this.orderingService.listOrders({
      userId,
      branchId,
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
    return paginate(result.data, result.total, query.page, query.limit);
  }

  @Patch(':id/status')
  @Roles(...ORDER_OPERATOR_ROLES)
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.getAuthorizedOrder(id, user);
    const order = await this.orderingService.updateOrderStatus(id, body.status);
    return { data: order };
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a completed order' })
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: SubmitFeedbackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const order = await this.orderingService.getOrder(id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== user.id) {
      throw new ForbiddenException('You can only review your own orders');
    }
    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Only completed orders can be reviewed');
    }

    const feedback = await this.orderingService.createFeedback(id, body);
    return { data: feedback, message: 'Feedback submitted successfully' };
  }

  private async getAuthorizedOrder(
    id: string,
    user: AuthenticatedUser,
  ): Promise<OrderDetails> {
    const order = await this.orderingService.getOrder(id);
    if (!order) throw new NotFoundException('Order not found');
    if (this.hasRole(user, GLOBAL_ORDER_ROLES)) return order;

    if (this.hasRole(user, BRANCH_ORDER_ROLES)) {
      const branchId = this.requireAssignedBranch(user);
      if (order.branchId !== branchId) {
        throw new ForbiddenException(
          'You can only access orders from your own branch',
        );
      }
      return order;
    }

    if (order.userId !== user.id) {
      throw new ForbiddenException('You can only access your own orders');
    }
    return order;
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
