import { Module, forwardRef } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { PaymentController } from './payment.controller';
import { OrderingModule } from '../../modules/ordering/ordering.module';

@Module({
  imports: [forwardRef(() => OrderingModule)],
  controllers: [PaymentController],
  providers: [MidtransService],
  exports: [MidtransService],
})
export class PaymentModule {}
