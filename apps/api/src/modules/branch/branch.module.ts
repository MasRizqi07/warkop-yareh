import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BranchService } from './application/services/branch.service';
import { BranchController } from './presentation/controllers/branch.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
