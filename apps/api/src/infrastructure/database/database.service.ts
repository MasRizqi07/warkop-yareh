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
            console.log(`[RLS] ${model}.${operation} tenant:`, tenant);
            if (!tenant || (!tenant.branchId && !tenant.userId)) {
              return query(args);
            }
            
            return self.$transaction(async (tx) => {
              await tx.$executeRawUnsafe(`SET LOCAL ROLE api_user`);
              if (tenant.branchId) {
                await tx.$executeRawUnsafe(`SELECT set_config('app.current_branch_id', $1, true)`, tenant.branchId);
              }
              if (tenant.userId) {
                await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', $1, true)`, tenant.userId);
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
