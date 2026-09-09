import { Module, forwardRef } from '@nestjs/common';
import { MidtransService } from './midtrans.service';
import { PaymentController } from './payment.controller';
import { OrderingModule } from '../../modules/ordering/ordering.module';
import { DatabaseModule } from '../database/database.module';
import { PaymentService } from './payment.service';
import { CashPaymentController } from './cash-payment.controller';
import { OperationsModule } from '../../modules/operations/operations.module';

@Module({
  imports: [DatabaseModule, OperationsModule, forwardRef(() => OrderingModule)],
  controllers: [PaymentController, CashPaymentController],
  providers: [MidtransService, PaymentService],
  exports: [MidtransService, PaymentService],
})
export class PaymentModule {}
