/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TableService } from './table.service';
import { TableStatus } from '@warkop-yareh/database';
import { EventsGateway } from '../../../websockets/events.gateway';

describe('TableService', () => {
  let service: TableService;
  let mockTableRepo: any;
  let mockEventsGateway: any;

  const mockTable = {
    id: 'table-1',
    number: 'T1',
    branchId: 'branch-1',
    qrCode: 'QR_T1',
    isActive: true,
    status: TableStatus.AVAILABLE,
  };

  beforeEach(async () => {
    mockTableRepo = {
      getTableByQrCode: jest.fn(),
      getTablesByBranch: jest.fn(),
      getTableById: jest.fn(),
      updateTableStatus: jest.fn(),
      createWaiterCall: jest.fn(),
    };

    mockEventsGateway = {
      broadcastTableUpdated: jest.fn(),
      broadcastWaiterCalled: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        { provide: 'ITableRepository', useValue: mockTableRepo },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
  });

  describe('State Machine - Exhaustive Valid Transitions (11 transitions)', () => {
    it('1. AVAILABLE -> OCCUPIED', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });

      const res = await service.updateStatus('table-1', TableStatus.OCCUPIED);
      expect(res.status).toBe(TableStatus.OCCUPIED);
      expect(mockEventsGateway.broadcastTableUpdated).toHaveBeenCalled();
    });

    it('2. AVAILABLE -> RESERVED', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.RESERVED });

      const res = await service.updateStatus('table-1', TableStatus.RESERVED);
      expect(res.status).toBe(TableStatus.RESERVED);
    });

    it('3. AVAILABLE -> MAINTENANCE', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.MAINTENANCE });

      const res = await service.updateStatus('table-1', TableStatus.MAINTENANCE);
      expect(res.status).toBe(TableStatus.MAINTENANCE);
    });

    it('4. AVAILABLE -> AVAILABLE (same-state no-op)', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });

      const res = await service.updateStatus('table-1', TableStatus.AVAILABLE);
      expect(res.status).toBe(TableStatus.AVAILABLE);
    });

    it('5. OCCUPIED -> CLEANING', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.CLEANING });

      const res = await service.updateStatus('table-1', TableStatus.CLEANING);
      expect(res.status).toBe(TableStatus.CLEANING);
    });

    it('6. OCCUPIED -> OCCUPIED (same-state no-op)', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });

      const res = await service.updateStatus('table-1', TableStatus.OCCUPIED);
      expect(res.status).toBe(TableStatus.OCCUPIED);
    });

    it('7. RESERVED -> OCCUPIED', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.RESERVED });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });

      const res = await service.updateStatus('table-1', TableStatus.OCCUPIED);
      expect(res.status).toBe(TableStatus.OCCUPIED);
    });

    it('8. RESERVED -> AVAILABLE', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.RESERVED });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });

      const res = await service.updateStatus('table-1', TableStatus.AVAILABLE);
      expect(res.status).toBe(TableStatus.AVAILABLE);
    });

    it('9. RESERVED -> RESERVED (same-state no-op)', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.RESERVED });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.RESERVED });

      const res = await service.updateStatus('table-1', TableStatus.RESERVED);
      expect(res.status).toBe(TableStatus.RESERVED);
    });

    it('10. CLEANING -> AVAILABLE', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.CLEANING });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.AVAILABLE });

      const res = await service.updateStatus('table-1', TableStatus.AVAILABLE);
      expect(res.status).toBe(TableStatus.AVAILABLE);
    });

    it('11. CLEANING -> MAINTENANCE', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.CLEANING });
      mockTableRepo.updateTableStatus.mockResolvedValue({ ...mockTable, status: TableStatus.MAINTENANCE });

      const res = await service.updateStatus('table-1', TableStatus.MAINTENANCE);
      expect(res.status).toBe(TableStatus.MAINTENANCE);
    });
  });

  describe('State Machine - Invalid Transitions & Broadcast Suppression', () => {
    it('should reject OCCUPIED -> AVAILABLE (must pass through CLEANING) and NOT broadcast websocket event', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });

      await expect(
        service.updateStatus('table-1', TableStatus.AVAILABLE),
      ).rejects.toThrow(BadRequestException);
      expect(mockEventsGateway.broadcastTableUpdated).not.toHaveBeenCalled();
    });

    it('should reject OCCUPIED -> RESERVED', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.OCCUPIED });

      await expect(
        service.updateStatus('table-1', TableStatus.RESERVED),
      ).rejects.toThrow(BadRequestException);
      expect(mockEventsGateway.broadcastTableUpdated).not.toHaveBeenCalled();
    });

    it('should reject MAINTENANCE -> OCCUPIED', async () => {
      mockTableRepo.getTableById.mockResolvedValue({ ...mockTable, status: TableStatus.MAINTENANCE });

      await expect(
        service.updateStatus('table-1', TableStatus.OCCUPIED),
      ).rejects.toThrow(BadRequestException);
      expect(mockEventsGateway.broadcastTableUpdated).not.toHaveBeenCalled();
    });
  });

  describe('resolveQrCode', () => {
    it('should return table metadata when QR code is valid and active', async () => {
      mockTableRepo.getTableByQrCode.mockResolvedValue(mockTable);

      const table = await service.resolveQrCode('QR_T1');
      expect(table.id).toBe('table-1');
    });

    it('should throw NotFoundException when QR code is unknown', async () => {
      mockTableRepo.getTableByQrCode.mockResolvedValue(null);

      await expect(service.resolveQrCode('UNKNOWN')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when table is inactive', async () => {
      mockTableRepo.getTableByQrCode.mockResolvedValue({
        ...mockTable,
        isActive: false,
      });

      await expect(service.resolveQrCode('QR_T1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createWaiterCall', () => {
    it('should throw NotFoundException if table is not found', async () => {
      mockTableRepo.getTableById.mockResolvedValue(null);

      await expect(
        service.createWaiterCall('table-99', 'CALL_WAITER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create waiter call with priority and broadcast websocket event', async () => {
      mockTableRepo.getTableById.mockResolvedValue(mockTable);
      mockTableRepo.createWaiterCall.mockResolvedValue({
        id: 'call-1',
        tableId: 'table-1',
        type: 'NEED_ASSISTANCE',
      });

      const res = await service.createWaiterCall('table-1', 'NEED_ASSISTANCE');
      expect(res.priority).toBe('HIGH');
      expect(mockEventsGateway.broadcastWaiterCalled).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'HIGH' }),
      );
    });
  });
});
