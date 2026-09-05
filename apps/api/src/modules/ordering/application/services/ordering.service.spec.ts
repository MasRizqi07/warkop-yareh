import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { OrderStatus, OrderType } from '@warkop-yareh/database';
import { OrderingService } from './ordering.service';
import { EventsGateway } from '../../../websockets/events.gateway';
import {
  DuplicateIdempotencyKeyError,
  IOrderingRepository,
  OrderDetails,
} from '../../domain/repositories/ordering.repository.interface';
import { MidtransService } from '../../../../infrastructure/payment/midtrans.service';

const makeOrder = (
  overrides: Partial<OrderDetails> = {},
): OrderDetails =>
  ({
    id: 'order-1',
    orderNumber: 'WY-20260905-0011223344556677',
    userId: 'user-1',
    branchId: 'branch-1',
    tableId: null,
    type: OrderType.DINE_IN,
    status: OrderStatus.PENDING,
    subtotal: 10_000,
    tax: 1_100,
    discount: 0,
    total: 11_100,
    paymentStatus: 'UNPAID',
    pickupTime: null,
    notes: null,
    customerName: null,
    customerPhone: null,
    loyaltyPointsEarned: 0,
    loyaltyPointsUsed: 0,
    idempotencyKeyHash: 'hash',
    requestFingerprint: 'fingerprint',
    createdAt: new Date('2026-09-05T00:00:00.000Z'),
    updatedAt: new Date('2026-09-05T00:00:00.000Z'),
    deletedAt: null,
    items: [],
    payment: null,
    feedback: null,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
    },
    ...overrides,
  }) as OrderDetails;

describe('OrderingService', () => {
  let service: OrderingService;
  let repository: jest.Mocked<IOrderingRepository>;
  let eventsGateway: jest.Mocked<EventsGateway>;

  beforeEach(async () => {
    repository = {
      getAvailableProductsByIds: jest.fn(),
      getActiveTableForBranch: jest.fn(),
      findByIdempotencyKeyHash: jest.fn().mockResolvedValue(null),
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      listOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      updatePaymentStatus: jest.fn(),
      createFeedback: jest.fn(),
    };

    eventsGateway = {
      broadcastOrderCreated: jest.fn(),
      broadcastOrderUpdated: jest.fn(),
      broadcastPaymentUpdated: jest.fn(),
    } as unknown as jest.Mocked<EventsGateway>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderingService,
        { provide: 'IOrderingRepository', useValue: repository },
        { provide: EventsGateway, useValue: eventsGateway },
        {
          provide: MidtransService,
          useValue: { getTransactionStatus: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(OrderingService);
  });

  it('uses authoritative branch prices and calculates tax server-side', async () => {
    repository.getAvailableProductsByIds.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Kopi Susu',
        unitPrice: 12_000,
        customizations: [],
      },
      {
        id: 'prod-2',
        name: 'Nasi Goreng',
        unitPrice: 20_000,
        customizations: [],
      },
    ]);
    repository.createOrder.mockResolvedValue(makeOrder({ subtotal: 52_000 }));

    await service.createOrder({
      userId: 'user-1',
      branchId: 'branch-1',
      idempotencyKey: 'idem-key-001',
      items: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-2', quantity: 2 },
      ],
    });

    expect(repository.getAvailableProductsByIds).toHaveBeenCalledWith(
      'branch-1',
      ['prod-1', 'prod-2'],
    );
    expect(repository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        type: OrderType.DINE_IN,
        subtotal: 52_000,
        tax: 5_720,
        total: 57_720,
        idempotencyKeyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        requestFingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
      expect.any(Array),
      expect.any(Object),
    );
  });

  it('rejects missing or unavailable products instead of creating zero-price items', async () => {
    repository.getAvailableProductsByIds.mockResolvedValue([]);

    await expect(
      service.createOrder({
        userId: 'user-1',
        branchId: 'branch-1',
        idempotencyKey: 'idem-key-002',
        items: [{ productId: 'missing', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.createOrder).not.toHaveBeenCalled();
  });

  it('adds only customization prices configured in the catalog', async () => {
    repository.getAvailableProductsByIds.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Latte',
        unitPrice: 20_000,
        customizations: [
          {
            name: 'milkType',
            options: [
              { label: 'Fresh Milk', price: 0 },
              { label: 'Oat Milk', price: 6_000 },
            ],
          },
        ],
      },
    ]);
    repository.createOrder.mockResolvedValue(makeOrder({ subtotal: 26_000 }));

    await service.createOrder({
      userId: 'user-1',
      branchId: 'branch-1',
      idempotencyKey: 'idem-key-003',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          customizations: { milkType: 'Oat Milk' },
        },
      ],
    });

    expect(repository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 26_000 }),
      [expect.objectContaining({ unitPrice: 26_000, totalPrice: 26_000 })],
      expect.any(Object),
    );
  });

  it('replays the persisted response for the same idempotent request', async () => {
    const payload = {
      userId: 'user-1',
      branchId: 'branch-1',
      idempotencyKey: 'idem-key-004',
      items: [{ productId: 'prod-1', quantity: 1 }],
    };
    repository.getAvailableProductsByIds.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Espresso',
        unitPrice: 18_000,
        customizations: [],
      },
    ]);

    let persisted: OrderDetails | null = null;
    repository.findByIdempotencyKeyHash.mockImplementation(async () => persisted);
    repository.createOrder.mockImplementation(async (data) => {
      persisted = makeOrder({
        idempotencyKeyHash: data.idempotencyKeyHash,
        requestFingerprint: data.requestFingerprint,
      });
      return persisted;
    });

    const first = await service.createOrder(payload);
    const second = await service.createOrder(payload);

    expect(second).toEqual(first);
    expect(repository.createOrder).toHaveBeenCalledTimes(1);
  });

  it('rejects reusing an idempotency key with a different payload', async () => {
    repository.getAvailableProductsByIds.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Espresso',
        unitPrice: 18_000,
        customizations: [],
      },
    ]);
    repository.createOrder.mockImplementation(async (data) =>
      makeOrder({
        idempotencyKeyHash: data.idempotencyKeyHash,
        requestFingerprint: data.requestFingerprint,
      }),
    );

    const initial = await service.createOrder({
      userId: 'user-1',
      branchId: 'branch-1',
      idempotencyKey: 'idem-key-005',
      items: [{ productId: 'prod-1', quantity: 1 }],
    });
    repository.findByIdempotencyKeyHash.mockResolvedValue(initial);

    await expect(
      service.createOrder({
        userId: 'user-1',
        branchId: 'branch-1',
        idempotencyKey: 'idem-key-005',
        items: [{ productId: 'prod-1', quantity: 2 }],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('recovers a concurrent idempotency race by loading the winning order', async () => {
    repository.getAvailableProductsByIds.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Espresso',
        unitPrice: 18_000,
        customizations: [],
      },
    ]);
    let winningOrder: OrderDetails | null = null;
    repository.findByIdempotencyKeyHash.mockImplementation(
      async () => winningOrder,
    );
    repository.createOrder.mockImplementation(async (data) => {
      winningOrder = makeOrder({
        idempotencyKeyHash: data.idempotencyKeyHash,
        requestFingerprint: data.requestFingerprint,
      });
      throw new DuplicateIdempotencyKeyError();
    });

    const result = await service.createOrder({
      userId: 'user-1',
      branchId: 'branch-1',
      idempotencyKey: 'idem-key-006',
      items: [{ productId: 'prod-1', quantity: 1 }],
    });

    expect(result).toBe(winningOrder);
  });

  it('validates table ownership by branch', async () => {
    repository.getActiveTableForBranch.mockResolvedValue(null);

    await expect(
      service.createOrder({
        userId: 'user-1',
        branchId: 'branch-1',
        tableId: 'table-other-branch',
        idempotencyKey: 'idem-key-007',
        items: [{ productId: 'prod-1', quantity: 1 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows valid state transitions and broadcasts the update', async () => {
    repository.getOrder.mockResolvedValue(makeOrder());
    repository.updateOrderStatus.mockResolvedValue(
      makeOrder({ status: OrderStatus.CONFIRMED }),
    );

    await service.updateOrderStatus('order-1', OrderStatus.CONFIRMED);

    expect(repository.updateOrderStatus).toHaveBeenCalledWith(
      'order-1',
      OrderStatus.CONFIRMED,
    );
    expect(eventsGateway.broadcastOrderUpdated).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid state transitions', async () => {
    repository.getOrder.mockResolvedValue(makeOrder());

    await expect(
      service.updateOrderStatus('order-1', OrderStatus.COMPLETED),
    ).rejects.toThrow(BadRequestException);
    expect(repository.updateOrderStatus).not.toHaveBeenCalled();
  });
});
