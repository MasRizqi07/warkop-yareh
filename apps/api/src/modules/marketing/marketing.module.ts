import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MarketingDispatchProcessor } from './application/processors/marketing-dispatch.processor';
import { MarketingService } from './application/services/marketing.service';
import { WhatsAppCloudService } from './infrastructure/whatsapp-cloud.service';
import { MARKETING_DISPATCH_QUEUE } from './marketing.constants';
import { MarketingController } from './presentation/controllers/marketing.controller';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({ name: MARKETING_DISPATCH_QUEUE }),
  ],
  controllers: [MarketingController],
  providers: [
    MarketingService,
    MarketingDispatchProcessor,
    WhatsAppCloudService,
  ],
  exports: [MarketingService],
})
export class MarketingModule {}
