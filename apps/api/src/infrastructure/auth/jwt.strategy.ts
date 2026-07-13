import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RawDatabaseService } from '../database/raw-database.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly databaseService: RawDatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'change-this-to-a-random-256bit-secret-minimum-32-chars',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.databaseService.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        branchId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or disabled');
    }

    return user;
  }
}
