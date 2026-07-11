import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { FranchiseService } from './application/services/franchise.service';
import { FranchiseController } from './presentation/controllers/franchise.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FranchiseController],
  providers: [FranchiseService],
  exports: [FranchiseService],
})
export class FranchiseModule {}
