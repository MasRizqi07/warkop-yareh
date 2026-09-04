import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RawDatabaseService } from '../database/raw-database.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly databaseService: RawDatabaseService) {
    super({
      // Look for the refresh token in the httpOnly cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: (() => {
        if (!process.env.JWT_REFRESH_SECRET) {
          throw new Error(
            'JWT_REFRESH_SECRET environment variable is required',
          );
        }
        return process.env.JWT_REFRESH_SECRET;
      })(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token malformed');
    }

    const user = await this.databaseService.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // The service verifies this exact token against the revocable Redis session
    // before rotating it, after Passport has validated its signature and expiry.

    return user;
  }
}
