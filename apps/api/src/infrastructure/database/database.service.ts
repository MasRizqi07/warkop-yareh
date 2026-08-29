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

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            return query(args);
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
    // @ts-ignore - custom prisma dynamic client property mapping
    extendedProxy.onModuleInit = async () => {
      await this.$connect();

      try {
        await extendedProxy.$transaction(async (tx) => {
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

    // @ts-ignore - custom prisma dynamic client property mapping
    extendedProxy.onModuleDestroy = async () => {
      await this.$disconnect();
    };

    return extendedProxy;
  }

  async onModuleInit() {}
  async onModuleDestroy() {}
}
