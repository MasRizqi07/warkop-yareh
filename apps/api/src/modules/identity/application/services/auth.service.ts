import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { IdentityService } from './identity.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import type {
  InternalUser,
  SafeUser,
} from '../../domain/repositories/user.repository.interface';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const OTP_TTL_SECONDS = 5 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const DUMMY_PASSWORD_HASH =
  '$2b$12$uz9xGcKgNzf.AitjDCLo5.dUOR/r/Q5IPXjpA25b7mNt.I2tgaLy.';

type SessionUser = Pick<SafeUser, 'id' | 'email' | 'role'>;

export interface TokenResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly identityService: IdentityService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.identityService.getUserByEmail(email);
    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isMatch = await bcrypt.compare(password, passwordHash);
    if (!user?.passwordHash || !isMatch) return null;
    return this.toSafeUser(user);
  }

  async login(
    user: SessionUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      jwtid: randomUUID(),
      secret: this.requireRefreshSecret(),
      expiresIn: '7d',
    });

    await this.redisService.set(
      this.refreshTokenKey(user.id, refreshToken),
      'valid',
      REFRESH_TOKEN_TTL_SECONDS,
    );
    return { accessToken, refreshToken };
  }

  async register(data: {
    email: string;
    name: string;
    phone?: string;
    password: string;
  }) {
    const email = this.normalizeEmail(data.email);
    const existing = await this.identityService.getUserByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    return this.identityService.createUser({
      email,
      name: data.name,
      phone: data.phone,
      passwordHash,
    });
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.redisService.del(this.refreshTokenKey(userId, refreshToken));
    }
  }

  async refreshTokens(
    userId: string,
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }
    const tokenKey = this.refreshTokenKey(userId, oldRefreshToken);
    const isValid = await this.redisService.take(tokenKey);
    if (!isValid) {
      await this.redisService.delPattern(`refresh_token:${userId}:*`);
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    const user = await this.identityService.getUserProfile(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.login(user);
  }

  async sendOtp(rawEmail: string): Promise<void> {
    const email = this.normalizeEmail(rawEmail);
    const subjectHash = this.subjectHash(email);
    const cooldownKey = `otp:cooldown:${subjectHash}`;
    const acquired = await this.redisService.setIfAbsent(
      cooldownKey,
      '1',
      OTP_RESEND_COOLDOWN_SECONDS,
    );
    if (!acquired) {
      throw new HttpException(
        'Please wait before requesting another verification code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = randomInt(100_000, 1_000_000).toString();
    const otpKey = `otp:${subjectHash}`;
    const attemptsKey = `otp:attempts:${subjectHash}`;
    await this.redisService.set(
      otpKey,
      this.hashOtp(email, otp),
      OTP_TTL_SECONDS,
    );
    await this.redisService.del(attemptsKey);

    try {
      await this.deliverOtp(email, otp);
    } catch (error: unknown) {
      await Promise.all([
        this.redisService.del(otpKey),
        this.redisService.del(cooldownKey),
      ]);
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(
        'Verification code delivery is temporarily unavailable',
        { cause: error },
      );
    }
  }

  async verifyOtp(
    rawEmail: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const email = this.normalizeEmail(rawEmail);
    const subjectHash = this.subjectHash(email);
    const otpKey = `otp:${subjectHash}`;
    const attemptsKey = `otp:attempts:${subjectHash}`;
    const expectedHash = await this.redisService.get(otpKey);
    if (!expectedHash || !this.otpMatches(expectedHash, email, code)) {
      const attempts = await this.redisService.incrementWithTtl(
        attemptsKey,
        OTP_TTL_SECONDS,
      );
      if (attempts >= OTP_MAX_ATTEMPTS) await this.redisService.del(otpKey);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const claimedHash = await this.redisService.take(otpKey);
    if (!claimedHash || !this.otpMatches(claimedHash, email, code)) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.redisService.del(attemptsKey);

    let user: InternalUser | SafeUser | null =
      await this.identityService.getUserByEmail(email);
    if (!user) {
      user = await this.identityService.createUser({
        email,
        name: email.split('@')[0],
      });
    }
    return this.login(user);
  }

  private async deliverOtp(email: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`[DEV ONLY] OTP for ${email}: ${otp}`);
    }
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException(
          'Verification code delivery is not configured',
        );
      }
      return;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: "Your Warkop Ya'reh Verification Code",
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL ?? 'no-reply@warkopyareh.com',
          name: "Warkop Ya'reh",
        },
        content: [
          {
            type: 'text/html',
            value:
              '<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:20px">' +
              "<h2>Warkop Ya'reh</h2><p>Your 6-digit login verification code is:</p>" +
              `<p style="font-size:32px;font-weight:bold;letter-spacing:4px">${otp}</p>` +
              '<p>This code expires in 5 minutes. Do not share it.</p></div>',
          },
        ],
      }),
    });
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Verification provider rejected the request (${response.status})`,
      );
    }
  }

  private otpMatches(
    expectedHash: string,
    email: string,
    code: string,
  ): boolean {
    const actualHash = this.hashOtp(email, code);
    const expected = Buffer.from(expectedHash, 'hex');
    const actual = Buffer.from(actualHash, 'hex');
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }

  private hashOtp(email: string, code: string): string {
    return createHmac('sha256', this.requireOtpSecret())
      .update(`${email}:${code}`)
      .digest('hex');
  }

  private subjectHash(email: string): string {
    return createHash('sha256').update(email).digest('hex');
  }

  private refreshTokenKey(userId: string, token: string): string {
    const fingerprint = createHash('sha256').update(token).digest('hex');
    return `refresh_token:${userId}:${fingerprint}`;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLocaleLowerCase('en-US');
  }

  private requireRefreshSecret(): string {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }
    return process.env.JWT_REFRESH_SECRET;
  }

  private requireOtpSecret(): string {
    const secret = process.env.OTP_HMAC_SECRET ?? process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('OTP_HMAC_SECRET or JWT_SECRET is required');
    }
    return secret;
  }

  private toSafeUser(user: InternalUser): SafeUser {
    const { passwordHash, ...safeUser } = user;
    void passwordHash;
    return safeUser;
  }
}
