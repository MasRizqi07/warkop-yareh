import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, OrderType, Role } from '@warkop-yareh/database';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrderingService } from '../../application/services/ordering.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import type { OrderDetails } from '../../domain/repositories/ordering.repository.interface';

let mockUser: AuthenticatedUser = {
  id: 'user_A',
  name: 'Customer A',
  email: 'customer@example.com',
  role: Role.CUSTOMER,
  branchId: null,
};

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    context.switchToHttp().getRequest().user = mockUser;
    return true;
  }
}

const orderResult = (overrides: Record<string, unknown> = {}): OrderDetails =>
  ({
    id: 'order_1',
    orderNumber: 'WY-20260905-0011223344556677',
    userId: 'user_A',
    branchId: 'branch_A',
    status: OrderStatus.COMPLETED,
    type: OrderType.DINE_IN,
    items: [],
    payment: null,
    feedback: null,
    user: null,
    paymentStatus: 'PAID',
    ...overrides,
  }) as unknown as OrderDetails;

describe('OrdersController', () => {
  let app: INestApplication;
  let orderingService: {
    createOrder: jest.MockedFunction<OrderingService['createOrder']>;
    getOrder: jest.MockedFunction<OrderingService['getOrder']>;
    listOrders: jest.MockedFunction<OrderingService['listOrders']>;
    updateOrderStatus: jest.MockedFunction<
      OrderingService['updateOrderStatus']
    >;
    getPaymentStatusFromMidtrans: jest.MockedFunction<
      OrderingService['getPaymentStatusFromMidtrans']
    >;
    createFeedback: jest.MockedFunction<OrderingService['createFeedback']>;
  };

  beforeAll(async () => {
    orderingService = {
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      listOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      getPaymentStatusFromMidtrans: jest.fn(),
      createFeedback: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrderingService, useValue: orderingService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      id: 'user_A',
      name: 'Customer A',
      email: 'customer@example.com',
      role: Role.CUSTOMER,
      branchId: null,
    };
  });

  it('requires an idempotency key for order creation', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({ branchId: 'branch_A', items: [{ productId: 'prod_1', quantity: 1 }] })
      .expect(400);

    expect(orderingService.createOrder).not.toHaveBeenCalled();
  });

  it('ignores a spoofed body userId for customers', async () => {
    orderingService.createOrder.mockResolvedValue(orderResult());

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Idempotency-Key', 'controller-idem-001')
      .send({
        userId: 'user_B',
        branchId: 'branch_A',
        items: [{ productId: 'prod_1', quantity: 1 }],
      })
      .expect(201);

    expect(orderingService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_A',
        idempotencyKey: 'controller-idem-001',
      }),
    );
  });

  it('forces branch-scoped employees to their assigned branch', async () => {
    mockUser = {
      id: 'staff_1',
      name: 'Staff',
      email: 'staff@example.com',
      role: Role.STAFF,
      branchId: 'branch_A',
    };
    orderingService.createOrder.mockResolvedValue(orderResult());

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Idempotency-Key', 'controller-idem-002')
      .send({
        branchId: 'branch_B',
        items: [{ productId: 'prod_1', quantity: 1 }],
      })
      .expect(201);

    expect(orderingService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch_A' }),
    );
  });

  it('prevents branch staff from reading another branch order', async () => {
    mockUser = {
      id: 'staff_1',
      name: 'Staff',
      email: 'staff@example.com',
      role: Role.STAFF,
      branchId: 'branch_A',
    };
    orderingService.getOrder.mockResolvedValue(
      orderResult({ userId: 'other', branchId: 'branch_B' }),
    );

    const response = await request(app.getHttpServer())
      .get('/api/v1/orders/order_branch_b')
      .expect(403);

    expect(response.body.message).toContain('your own branch');
  });

  it('forces customer order listings to the authenticated user', async () => {
    orderingService.listOrders.mockResolvedValue({ data: [], total: 0 });

    await request(app.getHttpServer())
      .get('/api/v1/orders?userId=user_B&page=1&limit=20')
      .expect(200);

    expect(orderingService.listOrders).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('prevents feedback for another customer order', async () => {
    orderingService.getOrder.mockResolvedValue(
      orderResult({ userId: 'user_B' }),
    );

    await request(app.getHttpServer())
      .post('/api/v1/orders/order_1/feedback')
      .send({ productRating: 5, serviceRating: 5, atmosphereRating: 5 })
      .expect(403);

    expect(orderingService.createFeedback).not.toHaveBeenCalled();
  });
});
