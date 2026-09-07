import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MarketingService } from './application/services/marketing.service';
import { WhatsAppCloudService } from './infrastructure/whatsapp-cloud.service';
import { MarketingController } from './presentation/controllers/marketing.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [MarketingController],
  providers: [MarketingService, WhatsAppCloudService],
  exports: [MarketingService],
})
export class MarketingModule {}
