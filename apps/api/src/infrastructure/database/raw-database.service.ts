import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@warkop-yareh/database';

/**
 * RawDatabaseService is a direct extension of PrismaClient WITHOUT the RLS
 * $allOperations wrapper.
 *
 * WARNING: This service MUST ONLY be used for non-tenant-scoped queries,
 * specifically identity resolution during authentication (e.g. JwtStrategy).
 * NEVER use this service for business logic or data retrieval, as it bypasses
 * the Row-Level Security tenant isolation policies.
 */
@Injectable()
export class RawDatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
