import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { EventService } from './application/services/event.service';
import { EventController } from './presentation/controllers/event.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
