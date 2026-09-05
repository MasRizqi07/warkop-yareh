/* eslint-disable */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { IdentityService } from './identity.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import type {
  InternalUser,
  SafeUser,
} from '../../domain/repositories/user.repository.interface';

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
          throw new Error(
            'JWT_REFRESH_SECRET environment variable is required',
          );
        }
        return process.env.JWT_REFRESH_SECRET;
      })(),
      expiresIn: '7d',
    });

    // Store only a one-way fingerprint; never expose the bearer token in Redis keys.
    await this.redisService.set(
      this.refreshTokenKey(user.id, refreshToken),
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
      await this.redisService.del(this.refreshTokenKey(userId, refreshToken));
    }
  }

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenKey = this.refreshTokenKey(userId, oldRefreshToken);
    const isValid = await this.redisService.take(tokenKey);
    if (!isValid) {
      // A replayed or unknown token is treated as compromise: revoke the user's
      // remaining refresh sessions before rejecting the request.
      await this.redisService.delPattern(`refresh_token:${userId}:*`);
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    const user = await this.identityService.getUserProfile(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // The old token was atomically consumed above. Issue its replacement only
    // after the account is confirmed to still exist.
    return this.login(user);
  }

  async sendOtp(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    await this.redisService.set(`otp:${email}`, otp, 300); // 5 minutes TTL

    // In dev / non-production environments only, log OTP to console for local development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n\n=== [DEV] OTP for ${email}: ${otp} ===\n\n`);
    }

    // Real OTP delivery via SendGrid when configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const fromEmail =
          process.env.SENDGRID_FROM_EMAIL || 'no-reply@warkopyareh.com';
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email }],
                subject: "Your Warkop Ya'reh Verification Code",
              },
            ],
            from: { email: fromEmail, name: "Warkop Ya'reh" },
            content: [
              {
                type: 'text/html',
                value: `
                  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #c4622d;">Warkop Ya'reh</h2>
                    <p>Your 6-digit login verification code is:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111; padding: 12px 0;">${otp}</div>
                    <p style="color: #666; font-size: 12px;">This code is valid for 5 minutes. Do not share this code with anyone.</p>
                  </div>
                `,
              },
            ],
          }),
        });
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[OTP Delivery Error]', err);
        }
      }
    }
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

    let user: InternalUser | SafeUser | null =
      await this.identityService.getUserByEmail(email);
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

  private refreshTokenKey(userId: string, token: string): string {
    const fingerprint = createHash('sha256').update(token).digest('hex');
    return `refresh_token:${userId}:${fingerprint}`;
  }
}
