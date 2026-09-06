/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { IdentityService } from './identity.service';

describe('IdentityService', () => {
  let service: IdentityService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        { provide: 'IUserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<IdentityService>(IdentityService);
  });

  it('should get user profile by userId', async () => {
    mockUserRepository.findById.mockResolvedValue({ id: 'user-1', name: 'Rizqi' });

    const result = await service.getUserProfile('user-1');

    expect(result).toEqual({ id: 'user-1', name: 'Rizqi' });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
  });

  it('should get user by email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ email: 'rizqi@warkop.com' });

    const result = await service.getUserByEmail('rizqi@warkop.com');

    expect(result).toEqual({ email: 'rizqi@warkop.com' });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('rizqi@warkop.com');
  });

  it('should create user', async () => {
    const userData = { email: 'new@warkop.com', name: 'New User' };
    mockUserRepository.create.mockResolvedValue({ id: 'user-2', ...userData });

    const result = await service.createUser(userData);

    expect(result.id).toBe('user-2');
    expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
  });

  it('should update user profile', async () => {
    const updateData = { name: 'Updated Name' };
    mockUserRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Before Update',
    });
    mockUserRepository.update.mockResolvedValue({ id: 'user-1', name: 'Updated Name' });

    const result = await service.updateUser('user-1', updateData);

    expect(result.name).toBe('Updated Name');
    expect(mockUserRepository.update).toHaveBeenCalledWith('user-1', updateData);
  });

  it('should list users with pagination params', async () => {
    mockUserRepository.findAll.mockResolvedValue({
      data: [{ id: 'user-1' }],
      total: 1,
    });

    const result = await service.listUsers({ page: 1, limit: 10, role: 'CUSTOMER' });

    expect(result.data).toHaveLength(1);
    expect(mockUserRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      role: 'CUSTOMER',
    });
  });
});
