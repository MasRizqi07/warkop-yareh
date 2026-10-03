import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { RealityController } from './reality.controller';
import { RealityService } from './reality.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RealityController],
  providers: [RealityService],
})
export class RealityModule {}
