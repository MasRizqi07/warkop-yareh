// Test-only bootstrap: real Nest modules, JWT guards, Redis, Prisma and RLS.
// External SDK/email transport is replaced here; never imported by src/main.ts.
import { mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@warkop-yareh/database';
import * as bcrypt from 'bcrypt';
import * as midtrans from 'midtrans-client';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

async function bootstrap() {
  const databaseUrl = new URL(process.env.DATABASE_URL ?? 'invalid:');
  const apiUrl = new URL(process.env.E2E_API_URL ?? 'invalid:');
  const outbox = process.env.E2E_PROVIDER_OUTBOX;
  const email = process.env.E2E_CUSTOMER_EMAIL;
  const password = process.env.E2E_CUSTOMER_PASSWORD;
  if (
    process.env.NODE_ENV !== 'test' ||
    databaseUrl.pathname !== '/warkop_audit' ||
    apiUrl.hostname !== '127.0.0.1' ||
    !outbox ||
    !email ||
    !password
  ) {
    throw new Error(
      'Browser fixtures require NODE_ENV=test, warkop_audit, a loopback API and explicit fixture configuration',
    );
  }
  mkdirSync(dirname(outbox), { recursive: true });
  writeFileSync(outbox, '');
  const record = (event: unknown) =>
    appendFileSync(outbox, `${JSON.stringify(event)}\n`);

  Object.defineProperty(midtrans.Snap.prototype, 'createTransaction', {
    value: async (parameters: {
      transaction_details: { order_id: string; gross_amount: number };
      item_details: Array<{ price: number; quantity: number }>;
    }) => {
      const { order_id: orderId, gross_amount: amount } =
        parameters.transaction_details;
      const itemTotal = parameters.item_details.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      if (!Number.isSafeInteger(amount) || amount <= 0 || itemTotal !== amount)
        throw new Error('Midtrans itemization does not match the charge');
      record({ kind: 'midtrans', parameters });
      return {
        token: `browser-${orderId}`,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/browser-${orderId}`,
      };
    },
  });
  globalThis.fetch = async (input, init) => {
    if (
      String(input) !== 'https://api.sendgrid.com/v3/mail/send' ||
      typeof init?.body !== 'string'
    )
      throw new Error('Unexpected external provider request in browser tests');
    const mail = JSON.parse(init.body) as {
      personalizations: Array<{ to: Array<{ email: string }> }>;
      content: Array<{ value: string }>;
    };
    const code = mail.content[0].value.match(/>(\d{6})</)?.[1];
    if (!code) throw new Error('OTP email has no verification code');
    record({ kind: 'otp', email: mail.personalizations[0].to[0].email, code });
    return new Response(null, { status: 202 });
  };

  const prisma = new PrismaClient();
  const branchId = 'browser-branch';
  const productId = 'browser-coffee';
  await prisma.branch.upsert({
    where: { id: branchId },
    update: {},
    create: {
      id: branchId,
      slug: branchId,
      name: 'Browser Test Cafe',
      address: 'Test street',
      city: 'Surabaya',
      province: 'Jawa Timur',
      isMainBranch: true,
    },
  });
  await prisma.category.upsert({
    where: { id: 'browser-category' },
    update: {},
    create: {
      id: 'browser-category',
      slug: 'browser-coffee',
      name: 'Browser Coffee',
    },
  });
  await prisma.product.upsert({
    where: { id: productId },
    update: {},
    create: {
      id: productId,
      slug: productId,
      name: 'Browser Test Latte',
      description: 'Fresh coffee for isolated checkout tests',
      price: 10000,
      categoryId: 'browser-category',
      image: '/images/cold-brew-aren-brulee.png',
    },
  });
  await prisma.branchProduct.upsert({
    where: { branchId_productId: { branchId, productId } },
    update: { priceOverride: 12000, isAvailable: true },
    create: { branchId, productId, priceOverride: 12000, isAvailable: true },
  });
  await prisma.table.upsert({
    where: { id: 'browser-table' },
    update: {},
    create: {
      id: 'browser-table',
      branchId,
      number: 'B-01',
      name: 'Browser Table',
      capacity: 4,
      qrCode: 'browser-table-qr',
    },
  });
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 12) },
    create: {
      email,
      name: 'Browser Customer',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  await prisma.$disconnect();

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.E2E_WEB_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();
  await app.listen(Number(apiUrl.port), apiUrl.hostname);
}

void bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
