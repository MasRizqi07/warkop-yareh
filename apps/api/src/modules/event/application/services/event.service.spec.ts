import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventRegistrationStatus, EventStatus } from '@warkop-yareh/database';
import { EventService } from './event.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('EventService', () => {
  let service: EventService;
  let mockPrisma: {
    $transaction: jest.Mock;
    withTenantTransaction: jest.Mock;
    $executeRaw: jest.Mock;
    branch: { findFirst: jest.Mock };
    user: { findFirst: jest.Mock };
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    eventRegistration: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    outboxEvent: { create: jest.Mock };
  };

  const mockEvent = {
    id: 'event-1',
    title: 'Warkop Live Music',
    slug: 'warkop-live-music',
    capacity: 1,
    branchId: 'branch-1',
    date: new Date('2099-08-15'),
    startTime: '19:00',
    endTime: '22:00',
    location: 'Main Lounge',
    price: 0,
    isFree: true,
    status: EventStatus.UPCOMING,
    _count: { registrations: 0 },
  };

  beforeEach(async () => {
    const transaction = jest.fn((input: unknown) =>
      Array.isArray(input)
        ? Promise.all(input)
        : (input as (client: typeof mockPrisma) => unknown)(mockPrisma),
    );
    mockPrisma = {
      $transaction: transaction,
      withTenantTransaction: transaction,
      $executeRaw: jest.fn(),
      branch: { findFirst: jest.fn().mockResolvedValue({ id: 'branch-1' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      eventRegistration: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn(),
        update: jest.fn(),
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
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.count.mockResolvedValue(1); // Capacity is 1

      await expect(
        service.registerForEvent('user-1', 'event-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should translate Prisma P2002 error to ConflictException on double registration', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
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
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
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

    it('reactivates a cancelled registration instead of violating the unique key', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: EventRegistrationStatus.CANCELLED,
      });
      mockPrisma.eventRegistration.count.mockResolvedValue(0);
      mockPrisma.eventRegistration.update.mockResolvedValue({
        id: 'reg-1',
        userId: 'user-1',
        eventId: 'event-1',
        status: EventRegistrationStatus.REGISTERED,
      });

      await expect(
        service.registerForEvent('user-1', 'event-1'),
      ).resolves.toEqual(expect.objectContaining({ id: 'reg-1' }));
      expect(mockPrisma.eventRegistration.create).not.toHaveBeenCalled();
      expect(mockPrisma.eventRegistration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: EventRegistrationStatus.REGISTERED, paidAmount: 0 },
      });
    });

    it('rejects an already active registration before changing capacity', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
      mockPrisma.eventRegistration.findUnique.mockResolvedValue({
        id: 'reg-1',
        status: EventRegistrationStatus.REGISTERED,
      });

      await expect(
        service.registerForEvent('user-1', 'event-1'),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.eventRegistration.count).not.toHaveBeenCalled();
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
        date: '2099-08-15',
        startTime: '19:00',
        endTime: '22:00',
        capacity: 50,
      });

      expect(result.id).toBe('event-new');
      expect(mockPrisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: expect.stringMatching(
              /^warkop-live-music-20990815-[a-f0-9]{8}$/,
            ),
            isFree: true,
          }),
        }),
      );
    });

    it('should list events with pagination and branch filter', async () => {
      mockPrisma.event.findMany.mockResolvedValue([mockEvent]);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.listEvents({
        branchId: 'branch-1',
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            _count: {
              select: {
                registrations: {
                  where: {
                    status: { in: ['REGISTERED', 'ATTENDED'] },
                  },
                },
              },
            },
          },
        }),
      );
    });

    it('rejects event creation for an inactive branch', async () => {
      mockPrisma.branch.findFirst.mockResolvedValue(null);

      await expect(
        service.createEvent({
          title: 'Invalid branch event',
          branchId: 'inactive',
          date: '2099-08-15',
          startTime: '19:00',
          endTime: '22:00',
          capacity: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects paid event authoring until a payment workflow exists', async () => {
      await expect(
        service.createEvent({
          title: 'Paid workshop',
          branchId: 'branch-1',
          date: '2099-08-15',
          startTime: '19:00',
          endTime: '22:00',
          capacity: 50,
          price: 50_000,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.event.create).not.toHaveBeenCalled();
    });

    it('does not allow capacity below active registrations', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        ...mockEvent,
        _count: { registrations: 2 },
      });

      await expect(
        service.updateEvent('event-1', { capacity: 1 }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.event.update).not.toHaveBeenCalled();
    });
  });

  describe('registration status capacity', () => {
    it('prevents an inactive registration from overfilling an event', async () => {
      mockPrisma.eventRegistration.findFirst.mockResolvedValue({
        id: 'reg-1',
        status: EventRegistrationStatus.WAITLISTED,
      });
      mockPrisma.event.findFirst.mockResolvedValue({ capacity: 1 });
      mockPrisma.eventRegistration.count.mockResolvedValue(1);

      await expect(
        service.updateRegistrationStatus(
          'event-1',
          'reg-1',
          EventRegistrationStatus.REGISTERED,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrisma.eventRegistration.update).not.toHaveBeenCalled();
    });
  });

  describe('public detail visibility', () => {
    it('returns only an active public event and its active registration count', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);
      await expect(service.getPublicEvent('event-1')).resolves.toEqual(
        mockEvent,
      );
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'event-1',
            status: { in: ['UPCOMING', 'ONGOING'] },
            branch: { isActive: true, deletedAt: null },
          }),
        }),
      );
    });

    it('does not expose cancelled, deleted, or inactive-branch events by direct URL', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.getPublicEvent('hidden-event')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
