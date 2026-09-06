import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RawDatabaseService } from '../database/raw-database.service';
import { Role } from '@warkop-yareh/database';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly databaseService: RawDatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return process.env.JWT_SECRET;
      })(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.databaseService.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        branchId: true,
        phone: true,
        avatar: true,
        membershipTier: true,
        loyaltyPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or disabled');
    }

    return { ...user, joinedAt: user.createdAt };
  }
}
