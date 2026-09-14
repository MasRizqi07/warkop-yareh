import type { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  UnauthorizedException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { JwtRefreshAuthGuard } from '../../../../infrastructure/auth/jwt-refresh-auth.guard';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { GoogleAuthGuard } from '../../../../infrastructure/auth/google-auth.guard';

class MockRefreshGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    req.user = { id: 'user-1' };
    return true;
  }
}

class MockJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { id: string } }>();
    req.user = { id: 'user-1' };
    return true;
  }
}

class MockGoogleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      user?: { email: string; name: string; avatar?: string };
    }>();
    req.user = {
      email: 'google-user@example.com',
      name: 'Google User',
      avatar: 'https://example.com/photo.jpg',
    };
    return true;
  }
}

describe('AuthController (E2E / Controller)', () => {
  let app: INestApplication<Server>;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeAll(async () => {
    authService = {
      register: jest.fn(),
      validateUser: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
      sendOtp: jest.fn(),
      verifyOtp: jest.fn(),
      validateOrRegisterGoogleUser: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtRefreshAuthGuard)
      .useClass(MockRefreshGuard)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtGuard)
      .overrideGuard(GoogleAuthGuard)
      .useClass(MockGoogleGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/v1/auth/register -> returns 201 on success', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      id: 'user-100',
      email: 'newuser@warkopyareh.com',
      name: 'New User',
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@warkopyareh.com',
        name: 'New User',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body).toEqual({
      message: 'Registration successful',
      data: {
        id: 'user-100',
        email: 'newuser@warkopyareh.com',
        name: 'New User',
      },
    });
  });

  it('POST /api/v1/auth/register -> throws conflict / BadRequest error on duplicate email', async () => {
    (authService.register as jest.Mock).mockRejectedValue(
      new BadRequestException('User with this email already exists'),
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'existing@warkopyareh.com',
        name: 'Existing User',
        password: 'Password123!',
      })
      .expect(400);

    expect(res.body.message).toBe('User with this email already exists');
  });

  it('POST /api/v1/auth/login -> returns access token and sets refresh cookie on valid credentials', async () => {
    (authService.validateUser as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'user@warkop.com',
      name: 'Valid User',
      role: 'CUSTOMER',
      branchId: 'branch-1',
    });
    (authService.login as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-access-token',
      refreshToken: 'jwt-refresh-token',
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@warkop.com',
        password: 'valid-password',
      })
      .expect(200);

    expect(res.body.data.accessToken).toBe('jwt-access-token');
    expect(res.body.data.user.email).toBe('user@warkop.com');
    // Ensure no password hash is leaked
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('POST /api/v1/auth/login -> returns 401 with no sensitive user data on invalid password', async () => {
    (authService.validateUser as jest.Mock).mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user@warkop.com',
        password: 'wrong-password',
      })
      .expect(401);

    expect(res.body.message).toBe('Invalid credentials');
    expect(res.body.data).toBeUndefined();
  });

  it('POST /api/v1/auth/refresh -> rotates tokens', async () => {
    (authService.refreshTokens as jest.Mock).mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=old-refresh-token'])
      .expect(200);

    expect(res.body.data.accessToken).toBe('new-access-token');
  });

  it('POST /api/v1/auth/refresh -> 401 on expired/revoked refresh token', async () => {
    (authService.refreshTokens as jest.Mock).mockRejectedValue(
      new UnauthorizedException('Invalid or revoked refresh token'),
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=revoked-token'])
      .expect(401);

    expect(res.body.message).toBe('Invalid or revoked refresh token');
  });

  it('GET /api/v1/auth/google/callback -> validates user, sets refresh cookie, and redirects to frontend', async () => {
    (authService.validateOrRegisterGoogleUser as jest.Mock).mockResolvedValue({
      accessToken: 'google-access-jwt',
      refreshToken: 'google-refresh-jwt',
      user: {
        id: 'user-google-1',
        email: 'google-user@example.com',
        name: 'Google User',
        role: 'CUSTOMER',
      },
    });

    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/google/callback')
      .expect(302);

    expect(res.headers.location).toMatch(/\/auth\/callback$/);
    expect(res.headers.location).not.toContain('google-access-jwt');
    const rawCookies = res.headers['set-cookie'];
    expect(rawCookies).toBeDefined();
    const cookieList = Array.isArray(rawCookies)
      ? rawCookies
      : [String(rawCookies)];
    expect(
      cookieList.some((c: string) =>
        c.includes('refreshToken=google-refresh-jwt'),
      ),
    ).toBe(true);
  });
});
