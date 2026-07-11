import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ReservationService } from './application/services/reservation.service';
import { ReservationsController } from './presentation/controllers/reservations.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
