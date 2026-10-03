import { Test, TestingModule } from '@nestjs/testing';
import { BranchService } from './branch.service';
import { DatabaseService } from '../../../../infrastructure/database/database.service';

describe('BranchService', () => {
  let service: BranchService;
  let mockPrisma: {
    branch: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockBranch = {
    id: 'branch-1',
    name: "WARKOP YA'REH",
    slug: 'jetis-kulon',
    address: 'Jl. Raya Jetis Kulon I No.38',
    city: 'Surabaya',
    province: 'Jawa Timur',
    weekdayHours: null,
    weekendHours: null,
  };

  beforeEach(async () => {
    mockPrisma = {
      branch: {
        create: jest.fn(),
        findFirst: jest.fn(),
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
    mockPrisma.branch.create.mockResolvedValue(mockBranch);

    const result = await service.createBranch({
      name: "WARKOP YA'REH",
      address: 'Jl. Raya Jetis Kulon I No.38',
    });

    expect(result.city).toBe('Surabaya');
    expect(result.province).toBe('Jawa Timur');
    expect(result.weekdayHours).toBeNull();
    expect(result.weekendHours).toBeNull();
    expect(mockPrisma.branch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          city: 'Surabaya',
          province: 'Jawa Timur',
          weekdayHours: null,
          weekendHours: null,
          capacity: null,
        }),
      }),
    );
  });

  it('getBranch & listBranches & updateBranch', async () => {
    mockPrisma.branch.findFirst.mockResolvedValue(mockBranch);
    mockPrisma.branch.findMany.mockResolvedValue([mockBranch]);
    mockPrisma.branch.update.mockResolvedValue({
      ...mockBranch,
      name: 'Updated Name',
    });

    const getRes = await service.getBranch('branch-1');
    expect(getRes?.id).toBe('branch-1');

    const listRes = await service.listBranches();
    expect(listRes).toHaveLength(1);

    const updateRes = await service.updateBranch('branch-1', {
      name: 'Updated Name',
    });
    expect(updateRes.name).toBe('Updated Name');
  });
});
