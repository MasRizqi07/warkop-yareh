/* eslint-disable */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IdentityService } from './identity.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

export interface TokenResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.identityService.getUserByEmail(email);
    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    // Refresh token lives for 7 days
    const refreshToken = this.jwtService.sign(payload, {
      secret: (() => {
        if (!process.env.JWT_REFRESH_SECRET) {
          throw new Error('JWT_REFRESH_SECRET environment variable is required');
        }
        return process.env.JWT_REFRESH_SECRET;
      })(),
      expiresIn: '7d',
    });

    // Store refresh token in Redis for revocation
    await this.redisService.set(
      `refresh_token:${user.id}:${refreshToken}`,
      'valid',
      7 * 24 * 60 * 60, // 7 days in seconds
    );

    return { accessToken, refreshToken };
  }

  async register(data: {
    email: string;
    name: string;
    phone?: string;
    password: string;
  }) {
    const existing = await this.identityService.getUserByEmail(data.email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.identityService.createUser({
      email: data.email,
      name: data.name,
      phone: data.phone,
      passwordHash,
    });

    return user;
  }

  async logout(userId: string, refreshToken: string) {
    if (refreshToken) {
      await this.redisService.del(`refresh_token:${userId}:${refreshToken}`);
    }
  }

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const isValid = await this.redisService.get(
      `refresh_token:${userId}:${oldRefreshToken}`,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    const user = await this.identityService.getUserProfile(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old
    await this.redisService.del(`refresh_token:${userId}:${oldRefreshToken}`);

    // Generate new
    return this.login(user);
  }

  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    await this.redisService.set(`otp:${email}`, otp, 300); // 5 minutes TTL

    // In dev, log it to console per PRD
    console.log(`\n\n=== OTP for ${email}: ${otp} ===\n\n`);
    // TODO: Send via SendGrid or WhatsApp API in production
  }

  async verifyOtp(
    email: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const storedOtp = await this.redisService.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== code) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.redisService.del(`otp:${email}`);

    let user = await this.identityService.getUserByEmail(email);
    if (!user) {
      // Auto register for OTP users
      user = await this.identityService.createUser({
        email,
        name: email.split('@')[0],
        passwordHash: await bcrypt.hash(
          Math.random().toString(36).slice(-10),
          12,
        ),
      });
    }

    return this.login(user);
  }
}
