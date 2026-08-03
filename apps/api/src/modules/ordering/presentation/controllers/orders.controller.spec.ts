/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrderingService } from '../../application/services/ordering.service';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';

let mockUser: any = { id: 'user_A', role: 'CUSTOMER', branchId: 'branch_A' };

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = mockUser;
    return true;
  }
}

describe('OrdersController (E2E / Controller)', () => {
  let app: INestApplication;
  let orderingService: jest.Mocked<Partial<OrderingService>>;

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
      providers: [
        { provide: OrderingService, useValue: orderingService },
      ],
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
    mockUser = { id: 'user_A', role: 'CUSTOMER', branchId: 'branch_A' };
  });

  it('POST /api/v1/orders -> ignores body.userId (User B) and uses authenticated user (User A) for CUSTOMER', async () => {
    (orderingService.createOrder as jest.Mock).mockResolvedValue({
      id: 'order_1',
      userId: 'user_A',
    });

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send({ userId: 'user_B', branchId: 'branch_A', items: [] })
      .expect(201);

    expect(orderingService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user_A' }),
    );
  });

  it('GET /api/v1/orders/:id -> tenant isolation: STAFF from branch_A cannot access order from branch_B (returns 403)', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF', branchId: 'branch_A' };
    (orderingService.getOrder as jest.Mock).mockResolvedValue({
      id: 'order_branch_b',
      userId: 'user_other',
      branchId: 'branch_B', // Different branch!
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/orders/order_branch_b')
      .expect(403);

    expect(res.body.message).toContain('You can only access orders from your own branch');
  });

  it('GET /api/v1/orders/:id -> STAFF from branch_A can access order from branch_A (returns 200)', async () => {
    mockUser = { id: 'staff_1', role: 'STAFF', branchId: 'branch_A' };
    (orderingService.getOrder as jest.Mock).mockResolvedValue({
      id: 'order_branch_a',
      userId: 'user_other',
      branchId: 'branch_A',
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/orders/order_branch_a')
      .expect(200);

    expect(res.body.data.id).toBe('order_branch_a');
  });
});
