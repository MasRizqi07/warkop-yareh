/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderingService } from './ordering.service';
import { EventsGateway } from '../../../websockets/events.gateway';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { IOrderingRepository } from '../../domain/repositories/ordering.repository.interface';
import { MidtransService } from '../../../../infrastructure/payment/midtrans.service';

describe('OrderingService', () => {
  let service: OrderingService;
  let mockOrderingRepo: jest.Mocked<IOrderingRepository>;
  let mockEventsGateway: jest.Mocked<EventsGateway>;
  let mockMidtransService: jest.Mocked<MidtransService>;

  beforeEach(async () => {
    mockOrderingRepo = {
      getProductsByIds: jest.fn(),
      createOrder: jest.fn(),
      getOrder: jest.fn(),
      listOrders: jest.fn(),
      updateOrderStatus: jest.fn(),
      updatePaymentStatus: jest.fn(),
      createFeedback: jest.fn(),
    };

    mockEventsGateway = {
      broadcastOrderCreated: jest.fn(),
      broadcastOrderUpdated: jest.fn(),
      broadcastPaymentUpdated: jest.fn(),
      broadcastWaiterCalled: jest.fn(),
      broadcastTableUpdated: jest.fn(),
    } as unknown as jest.Mocked<EventsGateway>;

    mockMidtransService = {
      getTransactionStatus: jest.fn(),
    } as unknown as jest.Mocked<MidtransService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderingService,
        { provide: 'IOrderingRepository', useValue: mockOrderingRepo },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: MidtransService, useValue: mockMidtransService },
      ],
    }).compile();

    service = module.get<OrderingService>(OrderingService);
  });

  it('should create an order and calculate totals correctly based on server catalog prices', async () => {
    mockOrderingRepo.getProductsByIds.mockResolvedValue([
      { id: 'prod-1', price: 10000, name: 'Kopi Susu' },
      { id: 'prod-2', price: 20000, name: 'Nasi Goreng' },
    ]);

    mockOrderingRepo.createOrder.mockResolvedValue({
      id: 'order-1',
      subtotal: 50000,
    });

    const result = await service.createOrder({
      userId: 'user-1',
      branchId: 'branch-1',
      items: [
        { productId: 'prod-1', quantity: 1 }, // 1 * 10000 = 10000
        { productId: 'prod-2', quantity: 2 }, // 2 * 20000 = 40000
      ], // subtotal = 50000, tax = 5500, total = 55500
    });

    expect(mockOrderingRepo.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        subtotal: 50000,
        tax: 5500,
        total: 55500,
      }),
      expect.any(Array),
      expect.any(Object),
    );
    expect(result.id).toBe('order-1');
  });

  it('idempotency: same Idempotency-Key + same payload submitted twice replays first response without creating duplicate order', async () => {
    mockOrderingRepo.getProductsByIds.mockResolvedValue([
      { id: 'prod-1', price: 15000, name: 'Es Teh' },
    ]);

    mockOrderingRepo.createOrder.mockResolvedValue({
      id: 'order-idempotent-1',
      subtotal: 15000,
    });

    const payload = {
      userId: 'user-1',
      branchId: 'branch-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
      idempotencyKey: 'idem-key-999',
    };

    const firstCall = await service.createOrder(payload);
    expect(mockOrderingRepo.createOrder).toHaveBeenCalledTimes(1);
    expect(firstCall.id).toBe('order-idempotent-1');

    // Second call with same idempotency key and same payload
    const secondCall = await service.createOrder(payload);
    expect(mockOrderingRepo.createOrder).toHaveBeenCalledTimes(1); // Not called again!
    expect(secondCall).toEqual(firstCall);
  });

  it('idempotency: different payload with same Idempotency-Key throws ConflictException', async () => {
    mockOrderingRepo.getProductsByIds.mockResolvedValue([
      { id: 'prod-1', price: 15000, name: 'Es Teh' },
      { id: 'prod-2', price: 25000, name: 'Kopi' },
    ]);

    mockOrderingRepo.createOrder.mockResolvedValue({
      id: 'order-idempotent-1',
      subtotal: 15000,
    });

    const initialPayload = {
      userId: 'user-1',
      branchId: 'branch-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
      idempotencyKey: 'idem-key-conflict',
    };

    await service.createOrder(initialPayload);

    const tamperedPayload = {
      userId: 'user-1',
      branchId: 'branch-1',
      items: [{ productId: 'prod-2', quantity: 1 }], // different item!
      idempotencyKey: 'idem-key-conflict',
    };

    await expect(service.createOrder(tamperedPayload)).rejects.toThrow(ConflictException);
  });

  it('should allow valid status transition', async () => {
    mockOrderingRepo.getOrder.mockResolvedValue({
      id: 'order-1',
      status: 'PENDING',
      items: [],
    });

    mockOrderingRepo.updateOrderStatus.mockResolvedValue({
      id: 'order-1',
      status: 'CONFIRMED',
    });

    await service.updateOrderStatus('order-1', 'CONFIRMED');

    expect(mockOrderingRepo.updateOrderStatus).toHaveBeenCalledWith(
      'order-1',
      'CONFIRMED',
    );
    expect(mockEventsGateway.broadcastOrderUpdated).toHaveBeenCalled();
  });

  it('should reject invalid status transition', async () => {
    mockOrderingRepo.getOrder.mockResolvedValue({
      id: 'order-1',
      status: 'PENDING',
      items: [],
    });

    await expect(
      service.updateOrderStatus('order-1', 'COMPLETED'),
    ).rejects.toThrow(BadRequestException);
    expect(mockOrderingRepo.updateOrderStatus).not.toHaveBeenCalled();
  });
});
