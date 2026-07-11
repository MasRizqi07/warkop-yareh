import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CommunityService } from './application/services/community.service';
import { CommunityController } from './presentation/controllers/community.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
