import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ShiftService } from './application/services/shift.service';
import { ShiftController } from './presentation/controllers/shift.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ShiftController],
  providers: [ShiftService],
  exports: [ShiftService],
})
export class OperationsModule {}
