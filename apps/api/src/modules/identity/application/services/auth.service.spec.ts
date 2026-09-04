import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { IdentityService } from './identity.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockIdentityService: any;
  let mockJwtService: any;
  let mockRedisService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@warkopyareh.com',
    name: 'Test User',
    role: 'CUSTOMER',
    passwordHash: '',
  };

  beforeEach(async () => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-minimum-32-chars';
    process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-chars';
    const salt = await bcrypt.genSalt(10);
    mockUser.passwordHash = await bcrypt.hash('secret123', salt);

    mockIdentityService = {
      getUserByEmail: jest.fn(),
      getUserProfile: jest.fn(),
      createUser: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockRedisService = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      take: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      delPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: IdentityService, useValue: mockIdentityService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user without passwordHash on correct credentials', async () => {
      mockIdentityService.getUserByEmail.mockResolvedValue(mockUser as any);

      const result = await service.validateUser(
        'test@warkopyareh.com',
        'secret123',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
      expect(result.passwordHash).toBeUndefined();
    });

    it('should return null on wrong password', async () => {
      mockIdentityService.getUserByEmail.mockResolvedValue(mockUser as any);

      const result = await service.validateUser(
        'test@warkopyareh.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      mockIdentityService.getUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@warkopyareh.com',
        'secret123',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate access token and refresh token and store refresh token in Redis', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token-abc')
        .mockReturnValueOnce('refresh-token-xyz');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: 'access-token-abc',
        refreshToken: 'refresh-token-xyz',
      });
      const storedKey = mockRedisService.set.mock.calls[0][0] as string;
      expect(storedKey).toMatch(/^refresh_token:user-123:[a-f0-9]{64}$/);
      expect(storedKey).not.toContain('refresh-token-xyz');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        storedKey,
        'valid',
        7 * 24 * 60 * 60,
      );
    });
  });

  describe('register', () => {
    it('should throw BadRequestException if user email already exists', async () => {
      mockIdentityService.getUserByEmail.mockResolvedValue(mockUser as any);

      await expect(
        service.register({
          email: 'test@warkopyareh.com',
          name: 'Test User',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should hash password and create new user on valid registration', async () => {
      mockIdentityService.getUserByEmail.mockResolvedValue(null);
      mockIdentityService.createUser.mockResolvedValue({
        id: 'user-new',
        email: 'new@warkopyareh.com',
        name: 'New User',
      } as any);

      const result = await service.register({
        email: 'new@warkopyareh.com',
        name: 'New User',
        password: 'password123',
      });

      expect(result.id).toBe('user-new');
      expect(mockIdentityService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@warkopyareh.com',
          name: 'New User',
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens when valid refresh token is provided', async () => {
      mockRedisService.take.mockResolvedValue('valid');
      mockIdentityService.getUserProfile.mockResolvedValue(mockUser as any);
      mockJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshTokens(
        'user-123',
        'old-refresh-token',
      );

      expect(mockRedisService.take).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh_token:user-123:[a-f0-9]{64}$/),
      );
      expect(mockRedisService.take.mock.calls[0][0]).not.toContain(
        'old-refresh-token',
      );
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is invalid or revoked', async () => {
      mockRedisService.take.mockResolvedValue(null);

      await expect(
        service.refreshTokens('user-123', 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockRedisService.delPattern).toHaveBeenCalledWith(
        'refresh_token:user-123:*',
      );
    });

    it('should throw UnauthorizedException when user profile is not found', async () => {
      mockRedisService.take.mockResolvedValue('valid');
      mockIdentityService.getUserProfile.mockResolvedValue(null);

      await expect(
        service.refreshTokens('user-123', 'valid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token from Redis', async () => {
      await service.logout('user-123', 'token-to-revoke');

      expect(mockRedisService.del).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh_token:user-123:[a-f0-9]{64}$/),
      );
      expect(mockRedisService.del.mock.calls[0][0]).not.toContain(
        'token-to-revoke',
      );
    });
  });

  describe('sendOtp and verifyOtp', () => {
    it('should store 6-digit OTP in Redis', async () => {
      await service.sendOtp('test@warkopyareh.com');

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'otp:test@warkopyareh.com',
        expect.stringMatching(/^\d{6}$/),
        300,
      );
    });

    it('should verify OTP and issue tokens', async () => {
      mockRedisService.get.mockResolvedValue('123456');
      mockIdentityService.getUserByEmail.mockResolvedValue(mockUser as any);
      mockJwtService.sign
        .mockReturnValueOnce('otp-access-token')
        .mockReturnValueOnce('otp-refresh-token');

      const result = await service.verifyOtp('test@warkopyareh.com', '123456');

      expect(mockRedisService.del).toHaveBeenCalledWith(
        'otp:test@warkopyareh.com',
      );
      expect(result).toEqual({
        accessToken: 'otp-access-token',
        refreshToken: 'otp-refresh-token',
      });
    });

    it('should throw UnauthorizedException on wrong OTP code', async () => {
      mockRedisService.get.mockResolvedValue('123456');

      await expect(
        service.verifyOtp('test@warkopyareh.com', '654321'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
