import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthModule as InfraAuthModule } from '../../infrastructure/auth/auth.module';
import { IdentityService } from './application/services/identity.service';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [DatabaseModule, InfraAuthModule],
  controllers: [AuthController, UsersController],
  providers: [
    IdentityService,
    AuthService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [IdentityService, AuthService],
})
export class IdentityModule {}
