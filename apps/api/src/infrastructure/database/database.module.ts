import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { RawDatabaseService } from './raw-database.service';

@Global()
@Module({
  providers: [DatabaseService, RawDatabaseService],
  exports: [DatabaseService, RawDatabaseService],
})
export class DatabaseModule {}
