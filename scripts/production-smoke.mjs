import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args = new Map(process.argv.slice(2).map((value) => { const at = value.indexOf('='); return at < 0 ? [value, true] : [value.slice(0, at), value.slice(at + 1)]; }));
const webUrl = args.get('--web') ?? 'http://127.0.0.1:3006';
const adminUrl = args.get('--admin') ?? 'http://127.0.0.1:3007';
const output = resolve(args.get('--out') ?? 'test-results/production-smoke');
const routes = ['/', '/menu', '/outlets', '/outlets/jetis-kulon', '/outlets/prapen', '/gallery', '/about', '/contact', '/login', '/register'];
const privateRoutes = ['/account', '/profile', '/orders', '/orders/unknown', '/order/track/unknown', '/cart', '/checkout', '/payment/status', '/qr/unknown', '/table/unknown', '/otp', '/auth/callback'];
const gatedOrderingRoutes = new Set(['/order/track/unknown', '/cart', '/checkout', '/qr/unknown', '/table/unknown']);
const forbidden = /\b(gubeng|darmo|dharmahusada|cold\s*['’]?n\s*brew|specialty coffee|coworking|VIP room|meeting room|franchise|loyalty points|membership tiers|AI recommendation)\b/i;
const report = { capturedAt: new Date().toISOString(), webUrl, adminUrl, routes: [], privateRoutes: [], redirects: [], issues: [], metrics: [], admin: {}, notes: ['Lab navigation measurements; field INP and Core Web Vitals are not certified.', 'Read-only audit. No production users, payments, catalog, or database records are mutated.'] };
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await context.newPage();
await page.addInitScript(() => {
  window.__readinessMetrics = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__readinessMetrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__readinessMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
});
let runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.name));
const issue = (route, category, detail) => report.issues.push({ route, category, detail });
try {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    runtimeErrors = [];
    const row = { route, runtime: 'PASS', mobile: 'PASS', a11y: 'PASS', seo: 'PASS', truth: 'PASS', errorState: 'NOT_APPLICABLE', status: 'PASS' };
    try {
      const response = await page.goto(new URL(route, webUrl).href, { waitUntil: 'load', timeout: 45_000 });
      row.http = response?.status();
      await page.evaluate(() => document.fonts.ready);
      if (route === '/gallery') {
        await page.getByText('Memuat dokumentasi…').waitFor({ state: 'hidden', timeout: 12_000 }).catch(() => undefined);
      }
      if (row.http !== 200 || new URL(page.url()).origin !== new URL(webUrl).origin) { row.runtime = 'FAIL'; issue(route, 'runtime', `HTTP ${row.http} or unexpected redirect`); }
      const content = await page.locator('body').innerText();
      if (route === '/gallery' && content.includes('Dokumentasi belum dapat dimuat.')) {
        row.errorState = 'FAIL';
        issue(route, 'gallery-network', 'Public gallery API unavailable');
      }
      const metadata = await page.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name="description"]')?.content ?? '', canonical: document.querySelector('link[rel="canonical"]')?.href ?? '', robots: document.querySelector('meta[name="robots"]')?.content ?? '', ogUrl: document.querySelector('meta[property="og:url"]')?.content ?? '', schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent)) }));
      row.metadata = metadata;
      if (!route.startsWith('/login') && !route.startsWith('/register')) {
        if (titles.has(metadata.title) || descriptions.has(metadata.description) || !metadata.description) { row.seo = 'FAIL'; issue(route, 'metadata', 'Missing or duplicated page title/description'); }
        titles.add(metadata.title); descriptions.add(metadata.description);
        if (new URL(metadata.canonical || webUrl).pathname !== route) { row.seo = 'FAIL'; issue(route, 'canonical', metadata.canonical || 'missing'); }
      } else if (!metadata.robots.includes('noindex')) { row.seo = 'FAIL'; issue(route, 'private-indexability', metadata.robots); }
      const truthText = `${content} ${metadata.title} ${metadata.description} ${JSON.stringify(metadata.schemas)}`;
      const forbiddenMatch = truthText.match(forbidden)?.[0];
      if (forbiddenMatch || metadata.schemas.some((schema) => schema.acceptsReservations !== undefined || schema.aggregateRating !== undefined || schema.geo !== undefined || schema.servesCuisine !== undefined)) { row.truth = 'FAIL'; issue(route, 'business-truth', forbiddenMatch ? `Unsupported rendered claim: ${forbiddenMatch}` : 'Unsupported structured-data claim'); }
      if (route.startsWith('/outlets/')) {
        const jetis = route.endsWith('jetis-kulon');
        const street = jetis ? 'Jl. Raya Jetis Kulon I No.38' : 'Jl. Raya Prapen No.39';
        const plusCode = jetis ? 'MPVJ+2G' : 'MQM3+XJ';
        if (!content.includes(street) || !content.includes(plusCode) || (!jetis && !content.includes('0821-3735-4606'))) { row.truth = 'FAIL'; issue(route, 'canonical-facts', 'Address, Plus Code, or Prapen contact mismatch'); }
        const business = metadata.schemas.find((schema) => schema['@type'] === 'CafeOrCoffeeShop');
        if (!business || (jetis && business.telephone) || business.address?.postalCode !== (jetis ? '60243' : '60239')) { row.seo = 'FAIL'; issue(route, 'structured-data', 'Missing or incorrect outlet schema'); }
      }
      if (route === '/menu' && /Browser Test Latte|browser-coffee|Katalog Pengujian/i.test(content)) { row.truth = 'FAIL'; issue(route, 'fixture-contamination', 'Public menu exposes isolated checkout fixture products'); }
      if (route === '/menu' && !content.includes('Pemesanan Langsung di Outlet') && !(await page.getByTestId('published-menu').count())) { row.truth = 'FAIL'; issue(route, 'menu-state', 'Neither truthful empty state nor published products rendered'); }
      if (route === '/gallery' && /suasana nyata|kurasi suasana riil|Mie instan|Konter Barista/i.test(content)) { row.truth = 'FAIL'; issue(route, 'gallery', 'Unverified gallery scene claims'); }
      const mapLinks = await page.locator('a[href*="maps.google"], a[href*="google.com/maps"]').evaluateAll((links) => links.map((link) => ({ href: link.href, rel: link.rel, target: link.target })));
      for (const link of mapLinks) {
        const destination = new URL(link.href).searchParams.get('q') ?? new URL(link.href).searchParams.get('query') ?? '';
        if (!/MPVJ\+2G|MQM3\+XJ|Jl\. Raya (Jetis Kulon I No\.38|Prapen No\.39)/.test(destination) || (link.target === '_blank' && !link.rel.includes('noopener'))) { row.truth = 'FAIL'; issue(route, 'maps', 'Wrong or unsafe branch directions'); }
      }
      const broken = await page.locator('img').evaluateAll((images) => images.filter((img) => img.complete && !img.naturalWidth).map((img) => img.getAttribute('src')?.split('?')[0]));
      if (broken.length) { row.runtime = 'FAIL'; issue(route, 'images', broken); }
      for (const width of [320, 360, 390, 430, 768]) {
        await page.setViewportSize({ width, height: 844 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        if (overflow) { row.mobile = 'FAIL'; issue(route, 'mobile-overflow', width); }
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      row.violations = axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }));
      if (row.violations.length) { row.a11y = 'FAIL'; issue(route, 'a11y', row.violations.map((item) => item.id)); }
      if (runtimeErrors.length) { row.runtime = 'FAIL'; issue(route, 'client-exception', runtimeErrors); }
      await page.screenshot({ path: resolve(output, `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-390.png`), fullPage: true });
      report.metrics.push({ route, ...await page.evaluate(() => ({ ...window.__readinessMetrics, domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd, scriptBytes: performance.getEntriesByType('resource').filter((item) => item.initiatorType === 'script').reduce((sum, item) => sum + item.encodedBodySize, 0) })) });
      if (Object.values(row).includes('FAIL')) row.status = 'FAIL';
    } catch (error) { row.runtime = 'FAIL'; row.status = 'FAIL'; issue(route, 'audit-error', error.message.slice(0, 250)); }
    report.routes.push(row);
    console.log(`${row.status} ${route} HTTP=${row.http} mobile=${row.mobile} a11y=${row.a11y} seo=${row.seo} truth=${row.truth}`);
  }
  for (const route of privateRoutes) {
    try {
      const response = await page.goto(new URL(route, webUrl).href, { waitUntil: 'domcontentloaded' });
      const robots = await page.locator('meta[name="robots"]').first().evaluateAll((nodes) => nodes[0]?.getAttribute('content') ?? null);
      const tag = response?.headers()['x-robots-tag'] ?? '';
      const finalPath = new URL(page.url()).pathname;
      const status = robots?.includes('noindex') || tag.includes('noindex') || (gatedOrderingRoutes.has(route) && finalPath === '/menu') ? 'PASS' : 'FAIL';
      report.privateRoutes.push({ route, http: response?.status(), finalPath, robots, tag, status });
      if (status === 'FAIL') issue(route, 'private-indexability', 'Private route is indexable');
    } catch (error) { issue(route, 'private-route', error.name); }
  }
  for (const [route, target] of [['/booking', '/outlets'], ['/reservations', '/outlets'], ['/community', '/'], ['/events', '/'], ['/loyalty', '/'], ['/blog', '/']]) {
    const response = await context.request.get(new URL(route, webUrl).href, { maxRedirects: 0 });
    const location = response.headers().location;
    const status = [301, 308].includes(response.status()) && location && new URL(location, webUrl).pathname === target ? 'PASS' : 'FAIL';
    report.redirects.push({ route, http: response.status(), location, status });
    if (status === 'FAIL') issue(route, 'decommissioned-route', `HTTP ${response.status()} -> ${location}`);
  }
  for (const path of ['/sitemap.xml', '/robots.txt']) {
    const response = await context.request.get(new URL(path, webUrl).href);
    const body = await response.text();
    if (response.status() !== 200 || body.includes('warkopyareh.id') || body.includes('localhost')) issue(path, 'discovery', 'Invalid discovery origin or response');
    report[path] = { http: response.status(), body };
  }
  await page.goto(new URL('/login', adminUrl).href, { waitUntil: 'load' });
  report.admin = { url: page.url(), title: await page.title(), robots: await page.locator('meta[name="robots"]').first().evaluateAll((nodes) => nodes[0]?.getAttribute('content') ?? null) };
  if (!report.admin.robots?.includes('noindex')) issue('admin', 'indexability', 'Admin login is indexable');
  await page.screenshot({ path: resolve(output, 'admin-login-390.png'), fullPage: true });
} finally {
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
console.log(`Audit evidence: ${output}; ${report.issues.length} issues`);
if (report.issues.length && !args.has('--report-only')) process.exitCode = 1;
