import { Module, forwardRef } from '@nestjs/common';
import { PaymentModule } from '../../infrastructure/payment/payment.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { OrderingService } from './application/services/ordering.service';
import { OrdersController } from './presentation/controllers/orders.controller';
import { PrismaOrderingRepository } from './infrastructure/repositories/prisma-ordering.repository';

@Module({
  imports: [DatabaseModule, forwardRef(() => PaymentModule)],
  controllers: [OrdersController],
  providers: [
    OrderingService,
    {
      provide: 'IOrderingRepository',
      useClass: PrismaOrderingRepository,
    },
  ],
  exports: [OrderingService],
})
export class OrderingModule {}
