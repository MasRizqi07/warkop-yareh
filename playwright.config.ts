import { defineConfig } from 'playwright/test';
import { resolve } from 'node:path';

// Local, disposable fixtures only. CI supplies DATABASE_URL and REDIS_URL.
const webUrl = process.env.E2E_WEB_URL ?? 'http://127.0.0.1:3006';
const apiUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:4006';
Object.assign(process.env, {
  E2E_WEB_URL: webUrl,
  E2E_API_URL: apiUrl,
  E2E_CUSTOMER_EMAIL: 'browser-customer@example.test',
  E2E_CUSTOMER_PASSWORD: 'Browser-fixture-password-2026',
  E2E_PROVIDER_OUTBOX: resolve('test-results/browser-provider-outbox.jsonl'),
});

export default defineConfig({
  testDir: './apps/web/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: 'test-results/browser',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  use: {
    baseURL: webUrl,
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @warkop-yareh/api run test:browser-server',
      url: `${apiUrl}/api/v1/health/live`,
      reuseExistingServer: false,
      timeout: 90_000,
      env: {
        NODE_ENV: 'test',
        JWT_SECRET: 'browser-test-access-secret-not-for-production',
        JWT_REFRESH_SECRET: 'browser-test-refresh-secret-not-for-production',
        MIDTRANS_SERVER_KEY: 'browser-test-server-key',
        MIDTRANS_CLIENT_KEY: 'browser-test-client-key',
        MIDTRANS_IS_PRODUCTION: 'false',
        SENDGRID_API_KEY: 'browser-test-email-key',
        THROTTLE_LIMIT: '1000',
      },
    },
    {
      command: `pnpm --filter @warkop-yareh/web exec next start --hostname 127.0.0.1 --port ${new URL(webUrl).port}`,
      url: `${webUrl}/login`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
