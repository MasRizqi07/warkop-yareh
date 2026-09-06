import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.UI_AUDIT_WEB_URL ?? 'http://localhost:3000';
const apiBase = process.env.UI_AUDIT_API_URL ?? 'http://localhost:4000/api/v1';
if (!['localhost', '127.0.0.1'].includes(new URL(apiBase).hostname)) throw new Error('This audit creates test records and requires a local API');
const output = 'test-results/commerce-browser';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const results = [];
try {
  const identity = { email: `commerce-${randomUUID()}@example.test`, password: `Audit-${randomUUID()}!`, name: 'Commerce QA' };
  const registered = await context.request.post(`${apiBase}/auth/register`, { data: identity });
  if (!registered.ok()) throw new Error(`Register failed: ${registered.status()}`);
  const login = await context.request.post(`${apiBase}/auth/login`, { data: { email: identity.email, password: identity.password } });
  if (!login.ok()) throw new Error(`Login failed: ${login.status()}`);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/menu', '/account', '/loyalty', '/booking', '/orders']) {
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      if (!response?.ok()) throw new Error(`${route}: HTTP ${response?.status()}`);
      await page.locator('main').first().waitFor();
      const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const violations = axe.violations.map((item) => ({ id: item.id, impact: item.impact, targets: item.nodes.map((node) => node.target) }));
      await page.screenshot({ path: `${output}/${route.slice(1)}-${width}.png`, fullPage: true });
      results.push({ route, width, overflow, violations, errors: errors.splice(0) });
      console.log(`${route} ${width}px: overflow=${overflow}, accessibility=${violations.length}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/menu`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Customize', exact: true }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: /^Tambah · Rp/ }).click();
  await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Self-pickup', exact: true }).click();
  await page.getByRole('button', { name: 'Lanjut ke pembayaran', exact: true }).click();
  await page.getByRole('heading', { name: 'Pembayaran belum dimulai' }).waitFor();
  const retained = await page.evaluate(() => JSON.parse(localStorage.getItem('warkop-cart') ?? '{}').state?.items?.length ?? 0);
  if (retained < 1) throw new Error('Cart was lost after payment failure');
  const orderLink = page.getByRole('link', { name: /Pesanan tersimpan/ });
  await orderLink.waitFor();
  const target = await orderLink.getAttribute('href');
  await page.screenshot({ path: `${output}/checkout-payment-failure.png`, fullPage: true });
  results.push({ scenario: 'payment failure preserves cart and real order', passed: true, target });
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  const failed = results.some((result) => result.overflow > 1 || result.violations?.length || result.errors?.length);
  if (failed) process.exitCode = 1;
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
