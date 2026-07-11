import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CatalogService } from './application/services/catalog.service';
import { CatalogController } from './presentation/controllers/catalog.controller';
import { PrismaCatalogRepository } from './infrastructure/repositories/prisma-catalog.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: 'ICatalogRepository',
      useClass: PrismaCatalogRepository,
    },
  ],
  exports: [CatalogService],
})
export class CatalogModule {}
