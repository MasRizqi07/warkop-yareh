/* eslint-disable */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
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
    const baseClient = this;

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenant = tenantContext.getStore();
            if (!tenant || (!tenant.branchId && !tenant.userId)) {
              return query(args);
            }

            // Prisma client extension transaction context typing
            return baseClient.$transaction(async (tx: any) => {
              await tx.$executeRawUnsafe(`SET LOCAL ROLE api_user`);
              if (tenant.branchId) {
                await tx.$executeRawUnsafe(
                  `SELECT set_config('app.current_branch_id', $1, true)`,
                  tenant.branchId,
                );
              }
              if (tenant.userId) {
                await tx.$executeRawUnsafe(
                  `SELECT set_config('app.current_user_id', $1, true)`,
                  tenant.userId,
                );
              }
              if (tenant.role) {
                await tx.$executeRawUnsafe(
                  `SELECT set_config('app.current_user_role', $1, true)`,
                  tenant.role,
                );
              }
              return tx[model][operation](args);
            });
          },
        },
      },
    });

    (extended as any).onModuleInit = async () => {
      await this.$connect();
    };

    (extended as any).onModuleDestroy = async () => {
      await this.$disconnect();
    };

    const extendedProxy = extended as unknown as this;

    // Bind lifecycle hooks to the proxy so NestJS can call them
    (extendedProxy as any).onModuleInit = async () => {
      await this.$connect();

      try {
        await (extendedProxy as any).$transaction(async (tx: any) => {
          await tx.$executeRawUnsafe(`SET LOCAL ROLE api_user`);
        });
        this.logger.log('Database role api_user check passed successfully.');
      } catch (error: any) {
        if (
          error?.message?.includes('permission denied to set role') ||
          error?.code === 'P2010' ||
          String(error).includes('permission denied')
        ) {
          const msg = `FATAL: The database role does not have membership in 'api_user'. Run: GRANT api_user TO <role>; See docs/deployment.md for details.`;
          this.logger.error(msg);
          console.error(msg);
          process.exit(1);
        }
        throw error;
      }
    };

    (extendedProxy as any).onModuleDestroy = async () => {
      await this.$disconnect();
    };

    return extendedProxy;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
}
