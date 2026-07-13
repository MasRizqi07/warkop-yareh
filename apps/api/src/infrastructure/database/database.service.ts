import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@warkop-yareh/database';
import { tenantContext } from './tenant-context';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

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
              if (tenant.role) {
                await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_role', $1, true)`, tenant.role);
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

    const extendedProxy = extended as unknown as this;
    
    // Bind lifecycle hooks to the proxy so NestJS can call them
    // @ts-ignore
    extendedProxy.onModuleInit = async () => {
      await self.$connect();
      
      try {
        await extendedProxy.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL ROLE api_user`);
        });
        self.logger.log('Database role api_user check passed successfully.');
      } catch (error: any) {
        if (error?.message?.includes('permission denied to set role') || error?.code === 'P2010' || String(error).includes('permission denied')) {
          const msg = `FATAL: The database role does not have membership in 'api_user'. Run: GRANT api_user TO <role>; See docs/deployment.md for details.`;
          self.logger.error(msg);
          console.error(msg);
          process.exit(1);
        }
        throw error;
      }
    };
    
    // @ts-ignore
    extendedProxy.onModuleDestroy = async () => {
      await self.$disconnect();
    };

    return extendedProxy;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
}
