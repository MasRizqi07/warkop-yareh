import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'change-this-to-a-random-256bit-secret-minimum-32-chars',
      signOptions: { expiresIn: '15m' }, // Access token 15min per PRD
    }),
  ],
  providers: [JwtStrategy, JwtRefreshStrategy],
  exports: [PassportModule, JwtModule, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
