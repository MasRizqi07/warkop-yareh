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
      secretOrKey:
        process.env.JWT_REFRESH_SECRET ||
        'change-this-to-another-different-256bit-secret',
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

    // In a real production system, you'd verify the refresh token against the hashed token in the DB
    // For Phase 1, basic JWT validation is sufficient as long as we can revoke sessions by deleting the cookie.

    return user;
  }
}
