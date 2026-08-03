/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('BranchService', () => {
  let service: BranchService;
  let mockPrisma: any;

  const mockBranch = {
    id: 'branch-1',
    name: 'Warkop Gubeng',
    slug: 'warkop-gubeng',
    address: 'Jl. Gubeng No. 12',
    city: 'Surabaya',
    province: 'Jawa Timur',
    weekdayHours: '07:00-24:00',
    weekendHours: '07:00-01:00',
  };

  beforeEach(async () => {
    mockPrisma = {
      branch: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        { provide: DatabaseService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BranchService>(BranchService);
  });

  it('createBranch: should apply default values when optional fields are omitted', async () => {
    mockPrisma.branch.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'branch-1', ...data }));

    const result = await service.createBranch({
      name: 'Warkop Gubeng',
      address: 'Jl. Gubeng No. 12',
    });

    expect(result.city).toBe('Surabaya');
    expect(result.province).toBe('Jawa Timur');
    expect(result.weekdayHours).toBe('07:00-24:00');
    expect(result.weekendHours).toBe('07:00-01:00');
  });

  it('getBranch & listBranches & updateBranch', async () => {
    mockPrisma.branch.findUnique.mockResolvedValue(mockBranch);
    mockPrisma.branch.findMany.mockResolvedValue([mockBranch]);
    mockPrisma.branch.update.mockResolvedValue({ ...mockBranch, name: 'Updated Name' });

    const getRes = await service.getBranch('branch-1');
    expect(getRes?.id).toBe('branch-1');

    const listRes = await service.listBranches();
    expect(listRes).toHaveLength(1);

    const updateRes = await service.updateBranch('branch-1', { name: 'Updated Name' });
    expect(updateRes.name).toBe('Updated Name');
  });
});
