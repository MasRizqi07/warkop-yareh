/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('EventService', () => {
  let service: EventService;
  let mockPrisma: any;

  const mockEvent = {
    id: 'event-1',
    title: 'Warkop Live Music',
    slug: 'warkop-live-music',
    capacity: 1,
    branchId: 'branch-1',
    date: new Date('2026-08-15'),
    startTime: '19:00',
    endTime: '22:00',
    location: 'Main Lounge',
    price: 0,
    _count: { registrations: 0 },
  };

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
      eventRegistration: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('registerForEvent - Capacity & Conflict Handling', () => {
    it('should throw BadRequestException when event is fully booked', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.count.mockResolvedValue(1); // Capacity is 1

      await expect(
        service.registerForEvent('user-1', 'event-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should translate Prisma P2002 error to ConflictException on double registration', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.count.mockResolvedValue(0);
      mockPrisma.eventRegistration.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed on the fields: (`eventId`,`userId`)',
      });

      await expect(
        service.registerForEvent('user-1', 'event-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow successful registration when under capacity', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.count.mockResolvedValue(0);
      mockPrisma.eventRegistration.create.mockResolvedValue({
        id: 'reg-1',
        userId: 'user-1',
        eventId: 'event-1',
        status: 'REGISTERED',
      });

      const result = await service.registerForEvent('user-1', 'event-1');
      expect(result.id).toBe('reg-1');
    });
  });

  describe('createEvent & listEvents', () => {
    it('should create an event with formatted slug', async () => {
      mockPrisma.event.create.mockResolvedValue({
        ...mockEvent,
        id: 'event-new',
      });

      const result = await service.createEvent({
        title: 'Warkop Live Music',
        branchId: 'branch-1',
        date: '2026-08-15',
        startTime: '19:00',
        endTime: '22:00',
        capacity: 50,
      });

      expect(result.id).toBe('event-new');
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'warkop-live-music' }),
        }),
      );
    });

    it('should list events with pagination and branch filter', async () => {
      mockPrisma.event.findMany.mockResolvedValue([mockEvent]);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.listEvents('branch-1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
