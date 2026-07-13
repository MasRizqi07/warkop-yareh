import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@warkop-yareh/database';
import { tenantContext } from './tenant-context';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    const self = this;
    
    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenant = tenantContext.getStore();
            if (!tenant || (!tenant.branchId && !tenant.userId)) {
              return query(args);
            }
            
            return self.$transaction(async (tx) => {
              if (tenant.branchId) {
                await tx.$executeRawUnsafe(`SELECT set_config('app.current_branch_id', '${tenant.branchId}', true)`);
              }
              if (tenant.userId) {
                await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', '${tenant.userId}', true)`);
              }
              // @ts-ignore
              return tx[model][operation](args);
            });
          }
        }
      }
    });

    (extended as any).onModuleInit = async () => {
      await self.$connect();
    };

    (extended as any).onModuleDestroy = async () => {
      await self.$disconnect();
    };

    return extended as unknown as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
