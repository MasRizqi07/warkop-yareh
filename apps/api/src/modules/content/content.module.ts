import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ContentService } from './application/services/content.service';
import { ContentController } from './presentation/controllers/content.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
