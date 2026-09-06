import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const webBaseUrl = process.env.UI_AUDIT_WEB_URL ?? 'http://localhost:3000';
const adminBaseUrl = process.env.UI_AUDIT_ADMIN_URL ?? 'http://localhost:3001';
const apiBaseUrl =
  process.env.UI_AUDIT_API_URL ?? 'http://localhost:4000/api/v1';
const email = process.env.UI_AUDIT_ADMIN_EMAIL;
const password = process.env.UI_AUDIT_ADMIN_PASSWORD;
const runAxeOnEveryRoute = process.env.UI_AUDIT_FULL_AXE === 'true';

if (!email || !password) {
  throw new Error(
    'UI_AUDIT_ADMIN_EMAIL and UI_AUDIT_ADMIN_PASSWORD are required'
  );
}

const webRoutes = [
  '/',
  '/about',
  '/account',
  '/admin',
  '/admin/branches',
  '/admin/crm',
  '/admin/inventory',
  '/admin/marketing',
  '/auth',
  '/blog',
  '/booking',
  '/cart',
  '/checkout',
  '/checkout/status',
  '/checkout/success',
  '/community',
  '/community/groups/demo',
  '/contact',
  '/events',
  '/loyalty',
  '/menu',
  '/ops/kds',
  '/ops/pos',
  '/ops/shift',
  '/order/track/demo-order',
  '/orders',
  '/orders/demo-order',
  '/orders/demo-order/thankyou',
  '/payment/status',
  '/profile',
  '/reservations',
];

const adminRoutes = [
  '/',
  '/analytics',
  '/branches',
  '/community',
  '/crm',
  '/events',
  '/events/demo',
  '/inventory',
  '/kitchen',
  '/loyalty',
  '/marketing',
  '/orders',
  '/pos',
  '/pos/shifts',
  '/products',
  '/reservations',
  '/settings',
  '/shifts',
  '/tables',
  '/users',
];

const axeRoutes = new Set([
  'admin:/login:desktop',
  'web:/:desktop',
  'web:/menu:desktop',
  'web:/cart:desktop',
  'web:/profile:desktop',
  'web:/reservations:desktop',
  'admin:/:desktop',
  'admin:/orders:desktop',
  'admin:/products:desktop',
  'admin:/settings:desktop',
]);

const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];
const screenshotDir = join(tmpdir(), 'warkop-yareh-ui-audit');
await mkdir(screenshotDir, { recursive: true });

function message(error) {
  return error instanceof Error ? error.message : String(error);
}

async function authenticate(context) {
  const response = await context.request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`Admin login failed with HTTP ${response.status()}`);
  }

  const body = await response.json();
  const accessToken = body?.data?.accessToken;
  const user = body?.data?.user;
  if (!accessToken || !user?.branchId) {
    throw new Error('Admin login response is incomplete');
  }

  const tablesResponse = await context.request.get(
    `${apiBaseUrl}/tables/branch/${user.branchId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const tablesBody = tablesResponse.ok() ? await tablesResponse.json() : null;
  const table = tablesBody?.data?.[0];
  if (!table?.id || !table?.qrCode) {
    throw new Error(
      'Could not discover a valid seeded table for route auditing'
    );
  }

  await context.addInitScript(
    ({ authUser, token }) => {
      window.localStorage.setItem(
        'coldnbrew-auth',
        JSON.stringify({
          state: { user: authUser, isAuthenticated: true },
          version: 0,
        })
      );
      window.sessionStorage.setItem('admin_access_token', token);
    },
    { authUser: user, token: accessToken }
  );

  return table;
}

async function inspectRoute(context, app, baseUrl, route, viewport) {
  const page = await context.newPage();
  const issues = [];
  const localFailures = [];

  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
  page.on('console', (entry) => {
    if (['error', 'warning'].includes(entry.type())) {
      issues.push(`console ${entry.type()}: ${entry.text()}`);
    }
  });
  page.on('response', (response) => {
    const resourceType = response.request().resourceType();
    if (
      response.status() >= 400 &&
      [
        'document',
        'fetch',
        'xhr',
        'image',
        'stylesheet',
        'script',
        'font',
      ].includes(resourceType)
    ) {
      localFailures.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (
      request.url().startsWith('http://localhost') ||
      request.resourceType() === 'image'
    ) {
      localFailures.push(
        `request failed ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`
      );
    }
  });

  try {
    const response = await page.goto(`${baseUrl}${route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
    await page
      .waitForLoadState('networkidle', { timeout: 1_500 })
      .catch(() => {});

    if (!response || response.status() >= 400) {
      issues.push(`document HTTP ${response?.status() ?? 'no response'}`);
    }

    const dom = await page.evaluate(() => {
      const visible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const accessibleName = (element) =>
        (
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.textContent ||
          element.querySelector('img')?.getAttribute('alt') ||
          ''
        ).trim();

      const describe = (element) =>
        element.outerHTML.replace(/\s+/g, ' ').slice(0, 220);

      const unnamedButtons = [...document.querySelectorAll('button')]
        .filter((element) => visible(element) && !accessibleName(element))
        .map(describe);
      const unnamedLinks = [...document.querySelectorAll('a')]
        .filter((element) => visible(element) && !accessibleName(element))
        .map(describe);
      const unlabeledInputs = [
        ...document.querySelectorAll(
          'input:not([type="hidden"]), select, textarea'
        ),
      ].filter((element) => {
        if (!visible(element)) return false;
        if (
          element.getAttribute('aria-label') ||
          element.getAttribute('aria-labelledby') ||
          element.getAttribute('title')
        ) {
          return false;
        }
        if (element.closest('label')) return false;
        const id = element.getAttribute('id');
        return !id || !document.querySelector(`label[for="${CSS.escape(id)}"]`);
      }).map(describe);
      const imagesWithoutAlt = [
        ...document.querySelectorAll('img:not([alt])'),
      ].filter(visible).length;
      const brokenImages = [...document.images].filter(
        (image) => image.complete && image.naturalWidth === 0
      ).length;
      const overflow =
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth;
      const overflowElements = [...document.querySelectorAll('body *')]
        .filter((element) => {
          if (!visible(element)) return false;
          const rect = element.getBoundingClientRect();
          return rect.left < -2 || rect.right > window.innerWidth + 2;
        })
        .sort((first, second) => {
          const firstRect = first.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();
          const firstExcess = Math.max(-firstRect.left, firstRect.right - window.innerWidth);
          const secondExcess = Math.max(-secondRect.left, secondRect.right - window.innerWidth);
          return secondExcess - firstExcess;
        })
        .slice(0, 3)
        .map(describe);

      return {
        bodyTextLength: document.body.innerText.trim().length,
        brokenImages,
        imagesWithoutAlt,
        overflow,
        overflowElements,
        unnamedButtons,
        unnamedLinks,
        unlabeledInputs,
      };
    });

    if (dom.bodyTextLength === 0) issues.push('empty body');
    if (dom.brokenImages) issues.push(`${dom.brokenImages} broken image(s)`);
    if (dom.imagesWithoutAlt)
      issues.push(`${dom.imagesWithoutAlt} image(s) without alt`);
    if (dom.overflow > 2) {
      issues.push(
        `${Math.round(dom.overflow)}px horizontal overflow: ${dom.overflowElements.join(' | ')}`
      );
    }
    if (dom.unnamedButtons.length) {
      issues.push(
        `${dom.unnamedButtons.length} unnamed button(s): ${dom.unnamedButtons.slice(0, 3).join(' | ')}`
      );
    }
    if (dom.unnamedLinks.length) {
      issues.push(
        `${dom.unnamedLinks.length} unnamed link(s): ${dom.unnamedLinks.slice(0, 3).join(' | ')}`
      );
    }
    if (dom.unlabeledInputs.length) {
      issues.push(
        `${dom.unlabeledInputs.length} unlabeled form control(s): ${dom.unlabeledInputs.slice(0, 3).join(' | ')}`
      );
    }

    if (
      runAxeOnEveryRoute ||
      axeRoutes.has(`${app}:${route}:${viewport}`)
    ) {
      const axe = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .exclude('nextjs-portal')
        .analyze();
      for (const violation of axe.violations) {
        const targets = violation.nodes
          .slice(0, 3)
          .flatMap((node) => node.target)
          .join(', ');
        issues.push(
          `axe ${violation.id} [${violation.impact ?? 'unknown'}] x${violation.nodes.length}: ${targets}`
        );
      }

      const focusableCount = await page
        .locator(
          'a[href]:visible, button:visible, input:visible, select:visible, textarea:visible, [tabindex]:not([tabindex="-1"]):visible'
        )
        .count();
      const missingFocus = [];
      for (let index = 0; index < Math.min(focusableCount, 15); index += 1) {
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const element = document.activeElement;
          if (!(element instanceof HTMLElement)) return null;
          if (element.closest('nextjs-portal')) return null;
          const style = window.getComputedStyle(element);
          return {
            description:
              element.getAttribute('aria-label') ||
              element.getAttribute('title') ||
              element.textContent?.trim().slice(0, 40) ||
              element.tagName,
            visible:
              (style.outlineStyle !== 'none' &&
                Number.parseFloat(style.outlineWidth) > 0) ||
              style.boxShadow !== 'none',
          };
        });
        if (focus && !focus.visible) missingFocus.push(focus.description);
      }
      if (missingFocus.length) {
        issues.push(
          `missing visible focus indicator: ${[...new Set(missingFocus)].join(', ')}`
        );
      }
    }

    issues.push(...new Set(localFailures));
  } catch (error) {
    issues.push(`navigation: ${message(error)}`);
  } finally {
    await page.close();
  }

  const record = { app, route, viewport, issues };
  results.push(record);
  if (issues.length) failures.push(record);
}

try {
  const anonymousAdmin = await browser.newContext();
  const loginPage = await anonymousAdmin.newPage();
  await loginPage.goto(`${adminBaseUrl}/orders`, {
    waitUntil: 'domcontentloaded',
  });
  if (!loginPage.url().startsWith(`${adminBaseUrl}/login?redirect_url=`)) {
    failures.push({
      app: 'admin',
      route: '/orders',
      viewport: 'auth-guard',
      issues: [`expected login redirect, got ${loginPage.url()}`],
    });
  }
  await loginPage.close();
  await inspectRoute(
    anonymousAdmin,
    'admin',
    adminBaseUrl,
    '/login',
    'desktop'
  );
  await anonymousAdmin.close();

  const anonymousWeb = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const protectedPage = await anonymousWeb.newPage();
  await protectedPage.goto(`${webBaseUrl}/profile`, {
    waitUntil: 'domcontentloaded',
  });
  if (!protectedPage.url().startsWith(`${webBaseUrl}/login?redirect_url=`)) {
    failures.push({
      app: 'web',
      route: '/profile',
      viewport: 'auth-guard',
      issues: [`expected login redirect, got ${protectedPage.url()}`],
    });
  }
  await protectedPage.close();
  for (const route of ['/login', '/register', '/otp']) {
    await inspectRoute(anonymousWeb, 'web', webBaseUrl, route, 'desktop');
  }
  await anonymousWeb.close();

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const table = await authenticate(desktop);
  const resolvedWebRoutes = [
    ...webRoutes,
    `/qr/${table.qrCode}`,
    `/table/${table.id}`,
  ];

  for (const route of resolvedWebRoutes) {
    await inspectRoute(desktop, 'web', webBaseUrl, route, 'desktop');
  }
  for (const route of adminRoutes) {
    await inspectRoute(desktop, 'admin', adminBaseUrl, route, 'desktop');
  }

  const proofPage = await desktop.newPage();
  await proofPage.goto(webBaseUrl, { waitUntil: 'networkidle' });
  await proofPage.screenshot({
    path: join(screenshotDir, 'web-home-desktop.png'),
    fullPage: true,
  });
  await proofPage.goto(`${adminBaseUrl}/orders`, { waitUntil: 'networkidle' });
  await proofPage.screenshot({
    path: join(screenshotDir, 'admin-orders-desktop.png'),
    fullPage: true,
  });
  await proofPage.close();
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  await authenticate(mobile);
  for (const [app, baseUrl, route] of [
    ['web', webBaseUrl, '/'],
    ['web', webBaseUrl, '/menu'],
    ['web', webBaseUrl, '/cart'],
    ['admin', adminBaseUrl, '/'],
    ['admin', adminBaseUrl, '/orders'],
    ['admin', adminBaseUrl, '/tables'],
  ]) {
    await inspectRoute(mobile, app, baseUrl, route, 'mobile');
  }

  const mobileProof = await mobile.newPage();
  await mobileProof.goto(webBaseUrl, { waitUntil: 'networkidle' });
  await mobileProof.screenshot({
    path: join(screenshotDir, 'web-home-mobile.png'),
    fullPage: false,
  });
  await mobileProof.goto(`${adminBaseUrl}/orders`, {
    waitUntil: 'networkidle',
  });
  await mobileProof.screenshot({
    path: join(screenshotDir, 'admin-orders-mobile.png'),
    fullPage: false,
  });
  await mobileProof.close();
  await mobile.close();

  const tablet = await browser.newContext({
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 1,
  });
  await authenticate(tablet);
  for (const [app, baseUrl, route] of [
    ['web', webBaseUrl, '/'],
    ['web', webBaseUrl, '/menu'],
    ['admin', adminBaseUrl, '/'],
    ['admin', adminBaseUrl, '/orders'],
  ]) {
    await inspectRoute(tablet, app, baseUrl, route, 'tablet');
  }
  await tablet.close();
} finally {
  await browser.close();
}

console.log(
  JSON.stringify(
    {
      audited: results.length,
      failed: failures.length,
      failures,
      screenshotDir,
    },
    null,
    2
  )
);

if (failures.length > 0) process.exitCode = 1;
