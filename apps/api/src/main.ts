import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';

process.on('unhandledRejection', (reason) => {
  new Logger('Process').error(
    `Unhandled rejection (${reason instanceof Error ? reason.name : 'unknown'})`,
  );
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  new Logger('Process').error(`Uncaught exception (${error.name})`);
  process.exit(1);
});

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { requestCorrelation } from './common/request-correlation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.enableShutdownHooks();
  app.use(requestCorrelation);
  if (process.env.TRUST_PROXY === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // ── CORS ──────────────────────────────────────────────────────────────────
  const corsOrigins: string[] = [];
  if (process.env.FRONTEND_URL) corsOrigins.push(process.env.FRONTEND_URL);
  if (process.env.ADMIN_URL) corsOrigins.push(process.env.ADMIN_URL);
  if (process.env.NODE_ENV !== 'production') {
    // Allow localhost origins only in development
    corsOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    );
  }
  const uniqueCorsOrigins = [...new Set(corsOrigins)];
  if (process.env.NODE_ENV === 'production' && uniqueCorsOrigins.length === 0) {
    throw new Error(
      'FRONTEND_URL or ADMIN_URL must be configured in production',
    );
  }
  app.enableCors({
    origin: uniqueCorsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Requested-With',
      'X-Request-Id',
    ],
    exposedHeaders: ['X-Request-Id'],
  });

  // ── Global Prefix ─────────────────────────────────────────────────────────
  // app.setGlobalPrefix('api/v1'); // Removed to avoid double prefixing

  // ── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // Auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global Filters ────────────────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global Interceptors ───────────────────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Swagger API Docs ──────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle("Warkop Ya'reh API")
      .setDescription(
        "Warkop Ya'reh Product v3 API. Public catalog reads contain published, branch-available menu only. " +
          'Customer ordering, online payment and QR/table flows are feature-gated. ' +
          'Operations, analytics and marketing endpoints are internal; legacy reservation, event, community and loyalty modules are not registered.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .addTag('auth', 'Authentication & authorization')
      .addTag('menu', 'Verified menu categories and published items')
      .addTag('orders', 'Feature-gated customer orders and internal management')
      .addTag(
        'payments',
        'Feature-gated Midtrans initiation and signed webhook',
      )
      .addTag('tables', 'Feature-gated QR/table and staff management')
      .addTag('health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log('📖 Swagger docs available at /api/docs');
  }

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '4000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  await app.listen(port);

  logger.log(`🚀 Warkop Ya'reh API running at http://localhost:${port}`);
  logger.log(`📦 Environment: ${process.env.NODE_ENV ?? 'development'}`);
}

void bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error(
    'Failed to start application',
    error instanceof Error ? error.name : 'unknown',
  );
  process.exit(1);
});
