import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ReservationService } from './application/services/reservation.service';
import { ReservationsController } from './presentation/controllers/reservations.controller';
import { BookingService } from './application/services/booking.service';
import { BookingController } from './presentation/controllers/booking.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController, BookingController],
  providers: [ReservationService, BookingService],
  exports: [ReservationService],
})
export class ReservationModule {}
