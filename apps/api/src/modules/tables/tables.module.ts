import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TableController } from './presentation/controllers/table.controller';
import { TableService } from './application/services/table.service';
import { PrismaTableRepository } from './infrastructure/repositories/prisma-table.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [TableController],
  providers: [
    TableService,
    {
      provide: 'ITableRepository',
      useClass: PrismaTableRepository,
    },
  ],
  exports: [TableService],
})
export class TablesModule {}
