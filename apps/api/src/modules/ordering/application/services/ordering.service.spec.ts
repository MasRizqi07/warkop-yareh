import { Test, TestingModule } from '@nestjs/testing';
import { OrderingService } from './ordering.service';
import { EventsGateway } from '../../../websockets/events.gateway';
import { BadRequestException } from '@nestjs/common';
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

  it('should create an order and calculate totals correctly', async () => {
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
