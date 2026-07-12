import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { LoyaltyService } from './application/services/loyalty.service';


@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
