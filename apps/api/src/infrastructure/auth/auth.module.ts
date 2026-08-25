import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: (() => {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return process.env.JWT_SECRET;
      })(),
      signOptions: { expiresIn: '15m' }, // Access token 15min per PRD
    }),
  ],
  providers: [JwtStrategy, JwtRefreshStrategy],
  exports: [PassportModule, JwtModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
