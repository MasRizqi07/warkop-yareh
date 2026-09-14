import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
} from '../dtos/auth.dto';
import { JwtAuthGuard } from '../../../../infrastructure/auth/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../../../../infrastructure/auth/jwt-refresh-auth.guard';
import { GoogleAuthGuard } from '../../../../infrastructure/auth/google-auth.guard';
import { Public } from '../../../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import type { GoogleIdentity } from '../../../../infrastructure/auth/google.strategy';

type AuthenticatedRequest = Omit<Request, 'user' | 'cookies'> & {
  user: AuthenticatedUser;
  cookies: Record<string, string | undefined>;
};

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);
    return {
      message: 'Registration successful',
      data: { id: user.id, email: user.email, name: user.name },
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.login(user);
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          branchId: user.branchId,
          phone: user.phone,
          avatar: user.avatar,
          membershipTier: user.membershipTier,
          loyaltyPoints: user.loyaltyPoints,
          joinedAt: user.createdAt,
        },
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh access token using httpOnly cookie' })
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    const oldRefreshToken = req.cookies?.refreshToken;
    if (typeof oldRefreshToken !== 'string' || !oldRefreshToken)
      throw new UnauthorizedException('Refresh token is required');

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      oldRefreshToken,
    );
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: 'Token refreshed',
      data: { accessToken },
    };
  }

  @Public()
  @Post('otp/send')
  @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an OTP to the user email' })
  async sendOtp(@Body() body: SendOtpDto) {
    await this.authService.sendOtp(body.email);
    return {
      message: 'If the address is valid, a verification code will be sent',
      data: null,
    };
  }

  @Public()
  @Post('otp/verify')
  @Throttle({ default: { limit: 5, ttl: 5 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login/register' })
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.verifyOtp(
      body.email,
      body.code,
    );
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: 'OTP verified successfully',
      data: { accessToken },
    };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Passport redirect to Google consent handled automatically by GoogleAuthGuard
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  async googleAuthCallback(
    @Req()
    req: Request & { user: GoogleIdentity },
    @Res() res: Response,
  ) {
    const { refreshToken } =
      await this.authService.validateOrRegisterGoogleUser(req.user);
    this.setRefreshTokenCookie(res, refreshToken);

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    return res.redirect(`${frontendUrl}/auth/callback`);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.id;
    const refreshToken = req.cookies?.refreshToken;

    await this.authService.logout(userId, refreshToken);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/api/v1/auth',
    });

    return { message: 'Logged out successfully', data: null };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: AuthenticatedRequest) {
    return { data: req.user };
  }

  private setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
