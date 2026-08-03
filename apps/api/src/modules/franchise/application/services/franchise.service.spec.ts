import { Test, TestingModule } from '@nestjs/testing';
import { FranchiseService } from './franchise.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('FranchiseService', () => {
  let service: FranchiseService;
  let mockPrisma: any;

  const mockAgreement = {
    id: 'agr-1',
    ownerName: 'Budi Santoso',
    ownerEmail: 'budi@example.com',
    branchId: 'branch-1',
    revenueShare: 5,
    monthlyFee: 5000000,
    agreementStart: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    mockPrisma = {
      franchiseAgreement: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      franchiseBilling: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FranchiseService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FranchiseService>(FranchiseService);
  });

  it('createAgreement & getAgreement & listAgreements', async () => {
    mockPrisma.franchiseAgreement.create.mockResolvedValue(mockAgreement);
    mockPrisma.franchiseAgreement.findUnique.mockResolvedValue(mockAgreement);
    mockPrisma.franchiseAgreement.findMany.mockResolvedValue([mockAgreement]);

    const createRes = await service.createAgreement({
      ownerName: 'Budi Santoso',
      ownerEmail: 'budi@example.com',
      branchId: 'branch-1',
      monthlyFee: 5000000,
      agreementStart: '2026-01-01',
    });
    expect(createRes.id).toBe('agr-1');

    const getRes = await service.getAgreement('agr-1');
    expect(getRes?.id).toBe('agr-1');

    const listRes = await service.listAgreements();
    expect(listRes).toHaveLength(1);
  });

  it('createBilling', async () => {
    mockPrisma.franchiseBilling.create.mockResolvedValue({
      id: 'bill-1',
      agreementId: 'agr-1',
      period: '2026-08',
      amount: 5000000,
    });

    const res = await service.createBilling({
      agreementId: 'agr-1',
      period: '2026-08',
      amount: 5000000,
      dueDate: '2026-08-10',
    });
    expect(res.id).toBe('bill-1');
  });
});
