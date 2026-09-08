import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { PaymentModule } from './infrastructure/payment/payment.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantIsolationInterceptor } from './common/interceptors/tenant-isolation.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';

// Bounded Contexts
import { IdentityModule } from './modules/identity/identity.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrderingModule } from './modules/ordering/ordering.module';
import { ReservationModule } from './modules/reservation/reservation.module';
import { CommunityModule } from './modules/community/community.module';
import { EventModule } from './modules/event/event.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BranchModule } from './modules/branch/branch.module';
import { FranchiseModule } from './modules/franchise/franchise.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';
import { TablesModule } from './modules/tables/tables.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { OperationsModule } from './modules/operations/operations.module';
import { ContentModule } from './modules/content/content.module';
import { validateEnvironment } from './config/environment.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
      },
    ]),
    DatabaseModule,
    RedisModule,
    PaymentModule,
    AuthModule,

    // Core Domain Contexts
    IdentityModule,
    CatalogModule,
    OrderingModule,
    ReservationModule,
    CommunityModule,
    EventModule,
    LoyaltyModule,
    AnalyticsModule,
    BranchModule,
    FranchiseModule,
    WebsocketsModule,
    TablesModule,
    AiModule,
    HealthModule,
    MarketingModule,
    OperationsModule,
    ContentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantIsolationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
