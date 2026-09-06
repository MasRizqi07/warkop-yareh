import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@warkop-yareh/database';
import { tenantContext } from './tenant-context';

type TransactionOptions = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

export interface DatabaseService {
  /**
   * Runs every operation, including raw locks, on one RLS-configured connection.
   * Use this instead of `$transaction(callback)` for application transactions.
   */
  withTenantTransaction<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
}

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    super();
    const baseClient = this;

    const configureTransaction = async (
      transaction: Prisma.TransactionClient,
    ): Promise<void> => {
      const tenant = tenantContext.getStore();
      await transaction.$executeRawUnsafe('SET LOCAL ROLE api_user');
      await transaction.$executeRaw`SELECT set_config('app.current_branch_id', ${tenant?.branchId ?? ''}, true)`;
      await transaction.$executeRaw`SELECT set_config('app.current_user_id', ${tenant?.userId ?? ''}, true)`;
      await transaction.$executeRaw`SELECT set_config('app.current_user_role', ${tenant?.role ?? ''}, true)`;
    };

    const runModelOperation = (
      transaction: Prisma.TransactionClient,
      model: string,
      operation: string,
      args: unknown,
    ): unknown => {
      const delegate = Reflect.get(transaction, model);
      const handler = Reflect.get(delegate, operation);
      return Reflect.apply(handler, delegate, [args]);
    };

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenant = tenantContext.getStore();
            if (
              !tenant ||
              (!tenant.branchId && !tenant.userId && !tenant.role)
            ) {
              return query(args);
            }

            return baseClient.$transaction(async (transaction) => {
              await configureTransaction(transaction);
              return runModelOperation(
                transaction,
                model,
                operation,
                args,
              ) as ReturnType<typeof query>;
            });
          },
        },
      },
      client: {
        withTenantTransaction<T>(
          operation: (transaction: Prisma.TransactionClient) => Promise<T>,
          options?: TransactionOptions,
        ): Promise<T> {
          return baseClient.$transaction(async (transaction) => {
            await configureTransaction(transaction);
            return operation(transaction);
          }, options);
        },
      },
    });

    const proxy = extended as unknown as DatabaseService;
    proxy.onModuleInit = async () => {
      await baseClient.$connect();
      try {
        await baseClient.$transaction(async (transaction) => {
          await configureTransaction(transaction);
        });
        this.logger.log('Database role api_user check passed successfully.');
      } catch (error: unknown) {
        const detail = error instanceof Error ? error.message : String(error);
        if (
          detail.includes('permission denied to set role') ||
          (typeof error === 'object' &&
            error !== null &&
            Reflect.get(error, 'code') === 'P2010')
        ) {
          const message =
            "FATAL: The database role does not have membership in 'api_user'. " +
            'Run: GRANT api_user TO <role>; See docs/deployment.md for details.';
          this.logger.error(message);
          throw new Error(message, { cause: error });
        }
        throw error;
      }
    };
    proxy.onModuleDestroy = async () => {
      await baseClient.$disconnect();
    };

    return proxy;
  }

  async onModuleInit(): Promise<void> {}

  async onModuleDestroy(): Promise<void> {}
}
