/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let mockPrisma: any;

  const mockReservation = {
    id: 'res-1',
    userId: 'user-1',
    branchId: 'branch-1',
    tableId: 'table-1',
    date: new Date('2026-08-10'),
    startTime: '14:00',
    endTime: '16:00',
    guestCount: 2,
    status: 'CONFIRMED',
    specialRequests: 'Window seat',
  };

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn((cb) => cb(mockPrisma)),
      reservation: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
      table: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  describe('createReservation - Double Booking Overlap Protection', () => {
    it('should reject reservation if another reservation overlaps on the same table and date', async () => {
      // Mock existing reservation on same table & date from 14:00 to 16:00
      mockPrisma.reservation.findMany.mockResolvedValue([mockReservation]);

      // Attempt booking overlapping slot: 15:00 to 17:00
      await expect(
        service.createReservation({
          userId: 'user-2',
          branchId: 'branch-1',
          tableId: 'table-1',
          date: '2026-08-10',
          startTime: '15:00',
          endTime: '17:00',
          guestCount: 4,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow non-overlapping booking on the same table (back-to-back)', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([mockReservation]);
      mockPrisma.reservation.create.mockResolvedValue({
        ...mockReservation,
        id: 'res-2',
        startTime: '16:00',
        endTime: '18:00',
      });

      const result = await service.createReservation({
        userId: 'user-2',
        branchId: 'branch-1',
        tableId: 'table-1',
        date: '2026-08-10',
        startTime: '16:00',
        endTime: '18:00',
        guestCount: 2,
      });

      expect(result.id).toBe('res-2');
    });

    it('should allow booking identical time slot on a different table', async () => {
      // Mock no existing reservations for table-2
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      mockPrisma.reservation.create.mockResolvedValue({
        ...mockReservation,
        id: 'res-3',
        tableId: 'table-2',
      });

      const result = await service.createReservation({
        userId: 'user-2',
        branchId: 'branch-1',
        tableId: 'table-2',
        date: '2026-08-10',
        startTime: '14:00',
        endTime: '16:00',
        guestCount: 2,
      });

      expect(result.id).toBe('res-3');
    });
  });

  describe('updateStatus - Authorization Matrix', () => {

    it('should throw NotFoundException if reservation does not exist', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);
      await expect(
        service.updateStatus('non-existent', 'CANCELLED', {
          id: 'user-1',
          role: 'CUSTOMER',
          branchId: 'branch-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow SUPERADMIN/ADMIN to update any reservation status', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'COMPLETED',
      });

      const result = await service.updateStatus('res-1', 'COMPLETED', {
        id: 'admin-1',
        role: 'ADMIN',
        branchId: 'branch-99',
      });

      expect(result.status).toBe('COMPLETED');
    });

    it('should allow STAFF/MANAGER/OWNER to update reservations in their own branch', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'SEATED',
      });

      const result = await service.updateStatus('res-1', 'SEATED', {
        id: 'staff-1',
        role: 'STAFF',
        branchId: 'branch-1',
      });

      expect(result.status).toBe('SEATED');
    });

    it('should throw ForbiddenException if employee updates reservation of another branch', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(
        service.updateStatus('res-1', 'SEATED', {
          id: 'staff-1',
          role: 'STAFF',
          branchId: 'other-branch',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow CUSTOMER to cancel their own reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'PENDING',
      });
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CANCELLED',
      });

      const result = await service.updateStatus('res-1', 'CANCELLED', {
        id: 'user-1',
        role: 'CUSTOMER',
        branchId: 'branch-1',
      });

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw ForbiddenException if CUSTOMER attempts to update another user reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(
        service.updateStatus('res-1', 'CANCELLED', {
          id: 'other-user',
          role: 'CUSTOMER',
          branchId: 'branch-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if CUSTOMER changes status to non-CANCELLED', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);

      await expect(
        service.updateStatus('res-1', 'CONFIRMED', {
          id: 'user-1',
          role: 'CUSTOMER',
          branchId: 'branch-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if CUSTOMER cancels COMPLETED or CANCELLED reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'COMPLETED',
      });

      await expect(
        service.updateStatus('res-1', 'CANCELLED', {
          id: 'user-1',
          role: 'CUSTOMER',
          branchId: 'branch-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listReservations', () => {
    it('should list reservations with filters and pagination', async () => {
      mockPrisma.reservation.findMany.mockResolvedValue([mockReservation]);
      mockPrisma.reservation.count.mockResolvedValue(1);

      const result = await service.listReservations({
        branchId: 'branch-1',
        userId: 'user-1',
        date: '2026-08-10',
        status: 'CONFIRMED',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
