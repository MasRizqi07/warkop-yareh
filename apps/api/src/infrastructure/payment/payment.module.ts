import { Module, forwardRef } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { PaymentController } from './payment.controller';
import { OrderingModule } from '../../modules/ordering/ordering.module';
import { DatabaseModule } from '../database/database.module';
import { PaymentService } from './payment.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => OrderingModule)],
  controllers: [PaymentController],
  providers: [MidtransService, PaymentService],
  exports: [MidtransService, PaymentService],
})
export class PaymentModule {}
