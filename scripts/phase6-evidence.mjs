import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';

const webBaseUrl = process.env.PHASE6_WEB_URL ?? 'http://localhost:3000';
const adminBaseUrl = process.env.PHASE6_ADMIN_URL ?? 'http://localhost:3001';
const apiBaseUrl = process.env.PHASE6_API_URL ?? 'http://localhost:4000/api/v1';
const adminEmail = process.env.PHASE6_ADMIN_EMAIL;
const adminPassword = process.env.PHASE6_ADMIN_PASSWORD;
const runId = Date.now().toString();
const customerEmail =
  process.env.PHASE6_CUSTOMER_EMAIL ??
  `phase6.proof.${runId}@warkopyareh.local`;
const customerPassword =
  process.env.PHASE6_CUSTOMER_PASSWORD ?? 'Phase6Proof!2026';
const customerPhone =
  process.env.PHASE6_CUSTOMER_PHONE ?? `0812${runId.slice(-9)}`;
const evidenceDir = resolve(
  process.env.PHASE6_EVIDENCE_DIR ?? 'test-results/phase6'
);
const videoStagingDir = join(evidenceDir, '.video-staging');

const mutationConfirmation =
  'I_UNDERSTAND_PHASE6_MUTATES_AN_ISOLATED_LOCAL_DATABASE';
if (process.env.PHASE6_MUTATION_CONFIRMATION !== mutationConfirmation) {
  throw new Error(
    `Set PHASE6_MUTATION_CONFIRMATION=${mutationConfirmation} only when the API uses a disposable local database`
  );
}

for (const [label, rawUrl] of [
  ['PHASE6_WEB_URL', webBaseUrl],
  ['PHASE6_ADMIN_URL', adminBaseUrl],
  ['PHASE6_API_URL', apiBaseUrl],
]) {
  const url = new URL(rawUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  ) {
    throw new Error(`${label} must point to a loopback HTTP service`);
  }
}

if (!adminEmail || !adminPassword) {
  throw new Error(
    'PHASE6_ADMIN_EMAIL and PHASE6_ADMIN_PASSWORD are required for local runtime proof'
  );
}

await mkdir(evidenceDir, { recursive: true });
await mkdir(videoStagingDir, { recursive: true });

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function api(path, options = {}, expectedStatuses = [200, 201]) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!expectedStatuses.includes(response.status)) {
    throw new Error(
      `${options.method ?? 'GET'} ${path} returned ${response.status}: ${JSON.stringify(body)}`
    );
  }
  return { status: response.status, body };
}

let browser;
try {
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  const token = login.body?.data?.accessToken;
  const adminUser = login.body?.data?.user;
  invariant(token && adminUser?.id, 'Admin login response is incomplete');
  invariant(
    ['ADMIN', 'SUPERADMIN'].includes(adminUser.role),
    'Phase 6 persistence proof requires a global ADMIN or SUPERADMIN account'
  );
  const authorization = { Authorization: `Bearer ${token}` };

  let customerSearch = await api(
    `/analytics/customers?search=${encodeURIComponent(customerEmail)}&page=1&limit=10`,
    { headers: authorization }
  );
  if (!customerSearch.body?.data?.length) {
    await api(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email: customerEmail,
          name: 'Phase 6 Proof Customer',
          phone: customerPhone,
          password: customerPassword,
          whatsAppMarketingOptIn: true,
        }),
      },
      [201, 409]
    );
    customerSearch = await api(
      `/analytics/customers?search=${encodeURIComponent(customerEmail)}&page=1&limit=10`,
      { headers: authorization }
    );
  }
  const customer = customerSearch.body?.data?.[0];
  invariant(
    customer?.id,
    'Could not discover or create the Phase 6 CRM customer'
  );

  const branchesResponse = await api('/branches');
  const branch = branchesResponse.body?.data?.[0];
  invariant(branch?.id, 'No branch exists for Phase 6 persistence proof');

  const productsBefore = await api(
    `/catalog/branch_products?branchId=${encodeURIComponent(branch.id)}`,
    { headers: authorization }
  );
  const branchProduct = productsBefore.body?.data?.[0];
  invariant(
    branchProduct?.productId,
    'No branch product exists for inventory proof'
  );

  const inventoryMarker = {
    stockQuantity: 37.5,
    stockCapacity: 100,
    stockThreshold: 12.5,
    stockUnit: 'unit',
    supplier: 'Phase 6 Local Proof',
    leadTimeHours: 24,
    burnRatePerDay: 2.5,
  };
  await api(
    `/branches/${encodeURIComponent(branch.id)}/products/${encodeURIComponent(branchProduct.productId)}`,
    {
      method: 'PATCH',
      headers: authorization,
      body: JSON.stringify(inventoryMarker),
    }
  );
  const productsReloaded = await api(
    `/catalog/branch_products?branchId=${encodeURIComponent(branch.id)}`,
    { headers: authorization }
  );
  const inventoryReloaded = productsReloaded.body?.data?.find(
    (item) => item.productId === branchProduct.productId
  );
  invariant(
    inventoryReloaded?.supplier === inventoryMarker.supplier &&
      Number(inventoryReloaded?.stockQuantity) ===
        inventoryMarker.stockQuantity,
    'Inventory mutation did not survive an API reload'
  );

  const nextCapacity = branch.capacity === 96 ? 97 : 96;
  await api(`/branches/${encodeURIComponent(branch.id)}`, {
    method: 'PATCH',
    headers: authorization,
    body: JSON.stringify({ capacity: nextCapacity }),
  });
  const priceOverride = Number(branchProduct.product.price) + 777;
  await api(
    `/branches/${encodeURIComponent(branch.id)}/products/${encodeURIComponent(branchProduct.productId)}`,
    {
      method: 'PATCH',
      headers: authorization,
      body: JSON.stringify({ priceOverride, isAvailable: true }),
    }
  );
  const branchReloaded = await api(
    `/branches/${encodeURIComponent(branch.id)}`
  );
  const branchProductsReloaded = await api(
    `/catalog/branch_products?branchId=${encodeURIComponent(branch.id)}`,
    { headers: authorization }
  );
  const priceReloaded = branchProductsReloaded.body?.data?.find(
    (item) => item.productId === branchProduct.productId
  );
  invariant(
    branchReloaded.body?.data?.capacity === nextCapacity &&
      priceReloaded?.priceOverride === priceOverride,
    'Branch capacity or price mutation did not survive an API reload'
  );

  const campaignName = `Phase 6 Reload Proof ${new Date().toISOString()}`;
  const campaignCreated = await api('/marketing/campaigns', {
    method: 'POST',
    headers: authorization,
    body: JSON.stringify({
      name: campaignName,
      objective: 'retention',
      audience: 'single_customer',
      targetUserId: customer.id,
      branchId: branch.id,
      discountPercent: 10,
      expiresInHours: 48,
      message: 'Kami merindukan kunjunganmu. Nikmati penawaran Phase 6 ini.',
      includeHeaderMedia: false,
    }),
  });
  const campaign = campaignCreated.body?.data;
  invariant(campaign?.id, 'Campaign create response is incomplete');

  const campaignsReloaded = await api(
    `/marketing/campaigns?branchId=${encodeURIComponent(branch.id)}&page=1&limit=100`,
    { headers: authorization }
  );
  invariant(
    campaignsReloaded.body?.data?.some((item) => item.id === campaign.id),
    'Marketing campaign did not survive an API reload'
  );
  const crmReloaded = await api(
    `/analytics/customers?search=${encodeURIComponent(customerEmail)}&page=1&limit=10`,
    { headers: authorization }
  );
  invariant(
    crmReloaded.body?.data?.[0]?.lastCampaign?.id === campaign.id,
    'CRM did not expose the persisted retention campaign'
  );

  const providerStatus = await api('/marketing/provider-status', {
    headers: authorization,
  });
  let providerTest = { status: 'SKIPPED_CONFIGURED_PROVIDER' };
  if (!providerStatus.body?.data?.configured) {
    providerTest = await api(
      `/marketing/campaigns/${encodeURIComponent(campaign.id)}/test`,
      {
        method: 'POST',
        headers: authorization,
        body: JSON.stringify({ phone: customer.phone ?? customerPhone }),
      },
      [503]
    );
    invariant(
      providerTest.status === 503,
      'Unconfigured WhatsApp provider must fail loudly with HTTP 503'
    );
  }

  browser = await chromium.launch({ headless: true });
  const browserIssues = [];

  function monitor(page, label) {
    page.on('pageerror', (error) =>
      browserIssues.push(`${label} pageerror: ${error.message}`)
    );
    page.on('response', (response) => {
      if (
        response.status() >= 500 &&
        ['document', 'fetch', 'xhr', 'script', 'stylesheet'].includes(
          response.request().resourceType()
        )
      ) {
        browserIssues.push(
          `${label} HTTP ${response.status()}: ${response.url()}`
        );
      }
    });
  }

  async function settle(page) {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1_200);
  }

  const themeProof = [];
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: theme,
    });
    await context.addInitScript((isDark) => {
      window.localStorage.setItem(
        'warkop-theme',
        JSON.stringify({ state: { isDark }, version: 1 })
      );
    }, theme === 'dark');
    for (const route of ['/about', '/blog', '/contact']) {
      const page = await context.newPage();
      monitor(page, `web${route}:${theme}`);
      await page.goto(`${webBaseUrl}${route}`);
      await settle(page);
      await page.waitForFunction(
        (expectedTheme) =>
          document.documentElement.dataset.theme === expectedTheme,
        theme
      );
      const colors = await page.evaluate(() => ({
        canvas: getComputedStyle(document.documentElement)
          .getPropertyValue('--canvas-obsidian')
          .trim(),
        surface: getComputedStyle(document.documentElement)
          .getPropertyValue('--surface-card')
          .trim(),
        text: getComputedStyle(document.documentElement)
          .getPropertyValue('--text-primary')
          .trim(),
      }));
      const file = `${route.slice(1)}-${theme}.png`;
      await page.screenshot({ path: join(evidenceDir, file), fullPage: true });
      themeProof.push({ route, theme, file, colors });
      await page.close();
    }
    await context.close();
  }

  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await adminContext.addInitScript((accessToken) => {
    window.sessionStorage.setItem('admin_access_token', accessToken);
  }, token);
  const adminProof = [];
  for (const route of ['/inventory', '/crm', '/marketing', '/branches']) {
    const page = await adminContext.newPage();
    monitor(page, `admin${route}`);
    await page.goto(`${adminBaseUrl}${route}`);
    await settle(page);
    await page.reload();
    await settle(page);
    invariant(
      !page.url().includes('/login'),
      `Admin ${route} redirected to login after authenticated reload`
    );
    const text = await page.locator('body').innerText();
    const expectedText = {
      '/inventory': inventoryMarker.supplier,
      '/crm': customer.name,
      '/marketing': campaignName,
      '/branches': branch.name,
    }[route];
    invariant(
      text.includes(expectedText),
      `Admin ${route} did not render persisted marker: ${expectedText}`
    );
    const file = `admin-${route.slice(1)}-reloaded.png`;
    await page.screenshot({ path: join(evidenceDir, file), fullPage: true });
    adminProof.push({ route, file, persistedMarker: expectedText });
    await page.close();
  }
  await adminContext.close();

  async function record(name, action, init) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: { dir: videoStagingDir, size: { width: 1280, height: 800 } },
    });
    if (init) await init(context);
    const page = await context.newPage();
    monitor(page, name);
    const video = page.video();
    const metrics = await action(page);
    await page.close();
    invariant(video, `Playwright did not create ${name} video`);
    const file = `${name}.webm`;
    await video.saveAs(join(evidenceDir, file));
    await context.close();
    return { file, metrics };
  }

  const delightProof = {};
  delightProof.aurora = await record('aurora-motion', async (page) => {
    await page.goto(webBaseUrl, { waitUntil: 'domcontentloaded' });
    const blob = page.locator('[data-aurora="homepage"] .animate-aurora-1');
    await blob.waitFor();
    const before = await blob.evaluate(
      (node) => getComputedStyle(node).transform
    );
    await page.waitForTimeout(900);
    const after = await blob.evaluate(
      (node) => getComputedStyle(node).transform
    );
    invariant(before !== after, 'Aurora transform did not advance');
    return { before, after };
  });

  delightProof.menuStagger = await record('menu-stagger', async (page) => {
    await page.goto(`${webBaseUrl}/menu`, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('article.delight-card');
    await cards.first().waitFor();
    await cards.first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -180));
    await page.waitForTimeout(700);
    const delays = await cards.evaluateAll((nodes) =>
      nodes.slice(0, 4).map((node) => getComputedStyle(node).transitionDelay)
    );
    return { visibleCards: await cards.count(), transitionDelays: delays };
  });

  delightProof.ctaHover = await record('cta-hover', async (page) => {
    await page.goto(webBaseUrl, { waitUntil: 'domcontentloaded' });
    const cta = page.locator('a.primary-cta-motion[href="/menu"]');
    await cta.waitFor();
    const before = await cta.evaluate(
      (node) => getComputedStyle(node).transform
    );
    await cta.hover();
    await page.waitForTimeout(300);
    const after = await cta.evaluate(
      (node) => getComputedStyle(node).transform
    );
    invariant(
      before !== after,
      'Primary CTA transform did not change on hover'
    );
    return { before, after };
  });

  delightProof.homeCountUp = await record('homepage-countup', async (page) => {
    await page.goto(webBaseUrl, { waitUntil: 'domcontentloaded' });
    const counters = page.locator('[data-countup-value]');
    await counters.first().waitFor();
    const initial = await counters.first().textContent();
    await page.waitForTimeout(450);
    const final = await counters.first().textContent();
    return { count: await counters.count(), initial, final };
  });

  const addAdminToken = async (context) => {
    await context.addInitScript((accessToken) => {
      window.sessionStorage.setItem('admin_access_token', accessToken);
    }, token);
  };
  const addWebAuth = async (context) => {
    const response = await context.request.post(`${apiBaseUrl}/auth/login`, {
      data: { email: adminEmail, password: adminPassword },
    });
    invariant(
      response.ok(),
      `Web proof login returned HTTP ${response.status()}`
    );
    const body = await response.json();
    const accessToken = body?.data?.accessToken;
    const authUser = body?.data?.user;
    invariant(
      accessToken && authUser?.id,
      'Web proof login response is incomplete'
    );
    await context.addInitScript(
      ({ user, sessionToken }) => {
        window.localStorage.setItem(
          'coldnbrew-auth',
          JSON.stringify({
            state: {
              user,
              accessToken: sessionToken,
              isAuthenticated: true,
              isInitialized: true,
            },
            version: 2,
          })
        );
      },
      { user: authUser, sessionToken: accessToken }
    );
  };
  delightProof.adminCountUp = await record(
    'admin-countup',
    async (page) => {
      await page.goto(`${adminBaseUrl}/analytics`, {
        waitUntil: 'domcontentloaded',
      });
      const counters = page.locator('[data-countup-value]');
      await counters.first().waitFor();
      const initial = await counters.first().textContent();
      await page.waitForTimeout(450);
      const final = await counters.first().textContent();
      return { count: await counters.count(), initial, final };
    },
    addAdminToken
  );

  delightProof.cardLift = await record(
    'card-lift',
    async (page) => {
      const results = [];
      for (const [url, selector] of [
        [`${webBaseUrl}/menu`, 'article.delight-card'],
        [`${webBaseUrl}/loyalty`, 'article.delight-card'],
        [`${adminBaseUrl}/analytics`, '.delight-card'],
      ]) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const card = page.locator(selector).first();
        await card.waitFor();
        await card.scrollIntoViewIfNeeded();
        const before = await card.evaluate(
          (node) => getComputedStyle(node).transform
        );
        await card.hover();
        await page.waitForTimeout(260);
        const after = await card.evaluate(
          (node) => getComputedStyle(node).transform
        );
        invariant(before !== after, `Card lift did not activate on ${url}`);
        results.push({ url, before, after });
      }
      return results;
    },
    async (context) => {
      await addAdminToken(context);
      await addWebAuth(context);
    }
  );

  const reducedContext = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 800 },
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(webBaseUrl, { waitUntil: 'domcontentloaded' });
  const reducedMotionProof = await reducedPage.evaluate(() => {
    const aurora = document.querySelector('.animate-aurora-1');
    const counter = document.querySelector('[data-countup-value]');
    const counterText = counter?.textContent?.trim() ?? null;
    const counterTarget = counter?.getAttribute('data-countup-value') ?? null;
    return {
      auroraAnimation: aurora ? getComputedStyle(aurora).animationName : null,
      counterText,
      counterTarget,
      counterSettled:
        counterText !== null &&
        counterTarget !== null &&
        Math.abs(
          Number(counterText.replace(',', '.')) - Number(counterTarget)
        ) < 0.001,
    };
  });
  invariant(
    reducedMotionProof.auroraAnimation === 'none' &&
      reducedMotionProof.counterSettled,
    'Reduced-motion mode did not disable Aurora and settle count-up immediately'
  );
  await reducedPage.close();
  await reducedContext.close();

  invariant(browserIssues.length === 0, browserIssues.join('\n'));

  const report = {
    generatedAt: new Date().toISOString(),
    scope:
      'explicitly confirmed disposable database behind loopback-only development services',
    api: {
      loginStatus: login.status,
      branchId: branch.id,
      branchCapacity: {
        before: branch.capacity,
        afterReload: branchReloaded.body.data.capacity,
      },
      inventory: {
        productId: branchProduct.productId,
        supplierAfterReload: inventoryReloaded.supplier,
        stockAfterReload: Number(inventoryReloaded.stockQuantity),
      },
      crm: {
        customerId: customer.id,
        campaignAfterReload: crmReloaded.body.data[0].lastCampaign.id,
      },
      marketing: {
        campaignId: campaign.id,
        campaignFoundAfterReload: true,
        providerConfigured: providerStatus.body.data.configured,
        unconfiguredProviderTestStatus: providerTest.status,
      },
      branchProduct: {
        productId: branchProduct.productId,
        priceOverrideAfterReload: priceReloaded.priceOverride,
        availableAfterReload: priceReloaded.isAvailable,
      },
    },
    themeProof,
    adminProof,
    delightProof,
    reducedMotionProof,
    browserIssues,
  };

  await writeFile(
    join(evidenceDir, 'phase6-runtime-proof.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close().catch(() => undefined);
}
