import { test, expect, type Page } from 'playwright/test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const apiUrl = `${process.env.E2E_API_URL}/api/v1`;
const customerEmail = process.env.E2E_CUSTOMER_EMAIL!;
const password = process.env.E2E_CUSTOMER_PASSWORD!;
const quoteResponse = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().endsWith('/orders/quote') &&
      response.request().method() === 'POST' &&
      response.ok()
  );
const guestQuoteResponse = (page: Page) =>
  page.waitForResponse(
    (response) =>
      response.url().endsWith('/orders/quote/guest') &&
      response.request().method() === 'POST' &&
      response.ok()
  );

async function addCoffee(page: Page) {
  await page.goto('/menu');
  await page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: 'Browser Test Latte' }) })
    .getByRole('button', { name: 'Customize' })
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Tambah · Rp/ })
    .click();
  await page.goto('/cart');
  await expect(
    page.getByRole('heading', { name: 'Browser Test Latte' })
  ).toBeVisible();
}

async function login(page: Page, email = customerEmail) {
  const authenticated = page.waitForResponse(
    (response) =>
      response.url().endsWith('/auth/login') &&
      response.request().method() === 'POST'
  );
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await authenticated).status()).toBe(200);
}

async function expectCartPrice(page: Page, total = '13.920') {
  await expect(
    page.getByText('Pajak Restoran (11%)', { exact: true }).locator('..')
  ).toContainText('1.320');
  await expect(
    page.getByText('Service Fee (5%)', { exact: true }).locator('..')
  ).toContainText('600');
  await expect(
    page.getByText('Estimasi Total', { exact: true }).locator('..')
  ).toContainText(total);
}

test('guest quote is public, server-authoritative, and rejects personal discounts', async ({
  page,
}) => {
  const payload = {
    branchId: 'browser-branch',
    type: 'TAKE_AWAY',
    items: [{ productId: 'browser-coffee', quantity: 1 }],
  };
  const response = await page.request.post(`${apiUrl}/orders/quote/guest`, {
    data: payload,
  });
  expect(response.status()).toBe(200);
  expect((await response.json()).data).toMatchObject({
    subtotal: 12_000,
    tax: 1_320,
    serviceFee: 600,
    voucherDiscount: 0,
    pointsDiscount: 0,
    total: 13_920,
  });

  for (const forbidden of [
    { userId: 'browser-customer' },
    { voucherCode: 'PRIVATE' },
    { loyaltyPointsUsed: 10 },
  ]) {
    const rejected = await page.request.post(`${apiUrl}/orders/quote/guest`, {
      data: { ...payload, ...forbidden },
    });
    expect(rejected.status()).toBe(400);
  }
});

for (const mode of ['dine-in', 'delivery'] as const) {
  test(`guest cart -> authenticated ${mode} -> server quote -> persisted order -> payment`, async ({
    page,
  }, testInfo) => {
    // The PSP page is the only browser request mocked in the successful flow.
    await page.route('https://app.sandbox.midtrans.com/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<h1>Test payment provider</h1>',
      })
    );
    const publicQuote = guestQuoteResponse(page);
    await addCoffee(page);
    expect((await (await publicQuote).json()).data).toMatchObject({
      subtotal: 12_000,
      tax: 1_320,
      serviceFee: 600,
      total: 13_920,
    });
    await expectCartPrice(page);
    await expect(
      page.getByText('Masuk saat checkout untuk menerapkan voucher dan poin.')
    ).toBeVisible();
    await page
      .getByRole('button', {
        name: mode === 'dine-in' ? 'Dine-In' : 'Delivery',
        exact: true,
      })
      .click();
    await page
      .getByRole('link', { name: 'Lanjut ke Pembayaran', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Masuk untuk menyelesaikan pesanan' })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Masuk ke akun' }).click();
    const initialQuote = quoteResponse(page);
    await login(page);
    await initialQuote;
    const submittedOrders: string[] = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/orders') && request.method() === 'POST')
        submittedOrders.push(request.url());
    });
    await page
      .getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
      .click();
    await expect(
      page.getByText(
        mode === 'dine-in'
          ? 'Pindai QR meja untuk pesanan dine-in.'
          : 'Isi alamat lengkap, minimal 10 karakter.',
        { exact: true }
      )
    ).toBeVisible();
    expect(submittedOrders).toHaveLength(0);
    if (mode === 'dine-in') {
      await page.goto('/qr/browser-table-qr');
      await expect(page).toHaveURL(/\/table\/browser-table$/);
      await expect(
        page.getByText('Meja B-01', { exact: true }).first()
      ).toBeVisible();
    }
    const cartRequest = quoteResponse(page);
    await page.goto('/cart');
    const cartQuote = await (await cartRequest).json();
    expect(cartQuote.data).toMatchObject({
      subtotal: 12000,
      tax: 1320,
      serviceFee: 600,
      total: 13920,
    });
    await expectCartPrice(page);
    await page.screenshot({
      path: testInfo.outputPath(`${mode}-cart.png`),
      fullPage: true,
    });
    const checkoutRequest = quoteResponse(page);
    await page
      .getByRole('link', { name: 'Lanjut ke Pembayaran', exact: true })
      .click();
    const checkoutQuote = await (await checkoutRequest).json();
    expect(checkoutQuote.data).toEqual(cartQuote.data);
    await expect(
      page.getByText('Pajak 11%', { exact: true }).locator('..')
    ).toContainText('1.320');
    await expect(
      page.getByText('Service fee 5%', { exact: true }).locator('..')
    ).toContainText('600');
    if (mode === 'delivery') {
      const addressQuote = quoteResponse(page);
      await page
        .getByLabel('Alamat pengantaran')
        .fill('Jalan Pengujian Nomor 10, Surabaya');
      await addressQuote;
    }
    await expect(
      page.getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
    ).toBeEnabled();
    await page.screenshot({
      path: testInfo.outputPath(`${mode}-checkout.png`),
      fullPage: true,
    });
    const orderResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/orders') &&
        response.request().method() === 'POST'
    );
    const paymentResponse = page.waitForResponse((response) =>
      response.url().endsWith('/payments/midtrans/snap')
    );
    await page
      .getByRole('button', { name: 'Lanjut ke pembayaran', exact: true })
      .click();
    const response = await orderResponse;
    expect(response.status()).toBe(201);
    const order = (await response.json()).data;
    const payload = response.request().postDataJSON();
    expect(payload).not.toHaveProperty('userId');
    expect(payload).toMatchObject({
      expectedTotal: 13920,
      type: mode === 'dine-in' ? 'DINE_IN' : 'DELIVERY',
    });
    if (mode === 'dine-in') expect(payload.tableId).toBe('browser-table');
    else expect(payload.notes).toContain('Jalan Pengujian Nomor 10, Surabaya');
    expect(order).toMatchObject({
      subtotal: 12000,
      tax: 1320,
      serviceFee: 600,
      total: 13920,
    });
    expect((await paymentResponse).ok()).toBe(true);
    await expect(page).toHaveURL(
      /https:\/\/app\.sandbox\.midtrans\.com\/snap\/v2\/vtweb\/browser-/
    );
    const headers = response.request().headers();
    expect(headers['idempotency-key']).toMatch(/^[\da-f-]{36}$/);
    const replay = await page.request.post(`${apiUrl}/orders`, {
      data: payload,
      headers: {
        authorization: headers.authorization,
        'idempotency-key': headers['idempotency-key'],
      },
    });
    expect(replay.ok()).toBe(true);
    expect((await replay.json()).data.id).toBe(order.id);
    const persisted = await page.request.get(`${apiUrl}/orders/${order.id}`, {
      headers: { authorization: headers.authorization },
    });
    expect(persisted.ok()).toBe(true);
    expect((await persisted.json()).data).toMatchObject({
      id: order.id,
      total: 13920,
      payment: { amount: 13920 },
    });
    await testInfo.attach('persisted-order.json', {
      body: await persisted.body(),
      contentType: 'application/json',
    });
  });
}

test('cart hides stale totals while loading, reports quote errors, and retries with a server split bill', async ({
  page,
}) => {
  await addCoffee(page);
  await page.goto('/login?returnTo=/cart');
  await login(page);
  await expectCartPrice(page);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/orders/quote', async (route) => {
    await pending;
    await route.fulfill({
      status: 503,
      json: { error: { message: 'Quote unavailable for test' } },
    });
  });
  await page
    .getByRole('button', { name: 'Tambah Browser Test Latte', exact: true })
    .click();
  await expect(
    page.getByText('Memperbarui harga...', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('Estimasi Total', { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText('Belum tersedia', { exact: true })).toBeVisible();
  release();
  await expect(
    page.getByRole('heading', { name: 'Harga belum dapat dikonfirmasi' })
  ).toBeVisible();
  await expect(page.getByText('Estimasi Total', { exact: true })).toHaveCount(
    0
  );
  await page.unroute('**/orders/quote');
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(
    page.getByText('Estimasi Total', { exact: true }).locator('..')
  ).toContainText('27.840');
  await page
    .getByRole('slider', { name: 'Jumlah orang untuk split bill' })
    .press('ArrowRight');
  await expect(
    page.getByText('Estimasi per orang:', { exact: true }).locator('..')
  ).toContainText('13.920');
});

test('register -> rejected password -> login -> HttpOnly refresh rotation -> logout', async ({
  page,
  context,
}) => {
  const email = `browser-${randomUUID()}@example.test`;
  await page.goto('/register');
  await page
    .getByLabel('Full Name', { exact: true })
    .fill('Browser New Customer');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(
    page.getByText('Account Created!', { exact: true })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/login?returnTo=/cart');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page
    .getByLabel('Password', { exact: true })
    .fill('Incorrect-password-2026');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByText('Invalid credentials', { exact: true })
  ).toBeVisible();
  await login(page, email);
  await expect(page).toHaveURL(/\/cart$/);
  await expect
    .poll(async () =>
      (await context.cookies()).find((cookie) => cookie.name === 'refreshToken')
    )
    .toMatchObject({ httpOnly: true, path: '/api/v1/auth' });
  const oldCookie = (await context.cookies()).find(
    (cookie) => cookie.name === 'refreshToken'
  )!;
  expect(oldCookie).toMatchObject({ httpOnly: true, path: '/api/v1/auth' });
  const refreshed = page.waitForResponse(
    (response) => response.url().endsWith('/auth/refresh') && response.ok()
  );
  const profile = page.waitForResponse(
    (response) => response.url().endsWith('/auth/me') && response.ok()
  );
  await page.reload();
  const token = (await (await refreshed).json()).data.accessToken;
  expect((await (await profile).json()).data.email).toBe(email);
  const newCookie = (await context.cookies()).find(
    (cookie) => cookie.name === 'refreshToken'
  )!;
  expect(newCookie.value).not.toBe(oldCookie.value);
  const storedAuth = await page.evaluate(() =>
    localStorage.getItem('coldnbrew-auth')
  );
  expect(storedAuth).not.toContain(token);
  expect(storedAuth).not.toContain('accessToken');
  const logout = await page.request.post(`${apiUrl}/auth/logout`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(logout.ok()).toBe(true);
  expect(
    (await context.cookies()).some((cookie) => cookie.name === 'refreshToken')
  ).toBe(false);
  await page.goto('/checkout');
  await expect(
    page.getByRole('heading', { name: 'Masuk untuk menyelesaikan pesanan' })
  ).toBeVisible();
});

test('OTP rejects an invalid code, authenticates once, and rejects replay', async ({
  page,
}) => {
  const email = `browser-otp-${randomUUID()}@example.test`;
  await page.goto('/otp');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page
    .getByRole('button', { name: 'Send Magic Code', exact: true })
    .click();
  await expect(
    page.getByLabel('6-Digit OTP Code', { exact: true })
  ).toBeVisible();
  const outbox = (await readFile(process.env.E2E_PROVIDER_OUTBOX!, 'utf8'))
    .trim()
    .split('\n')
    .map(
      (line) =>
        JSON.parse(line) as { kind: string; email?: string; code?: string }
    );
  const code = outbox.find(
    (event) => event.kind === 'otp' && event.email === email
  )?.code;
  expect(code).toMatch(/^\d{6}$/);
  await page.getByLabel('6-Digit OTP Code', { exact: true }).fill('000000');
  await page
    .getByRole('button', { name: 'Verify & Sign In', exact: true })
    .click();
  await expect(
    page.getByText('Invalid or expired OTP', { exact: true })
  ).toBeVisible();
  await page.getByLabel('6-Digit OTP Code', { exact: true }).fill(code!);
  const profile = page.waitForResponse(
    (response) => response.url().endsWith('/auth/me') && response.ok()
  );
  await page
    .getByRole('button', { name: 'Verify & Sign In', exact: true })
    .click();
  expect((await (await profile).json()).data.email).toBe(email);
  await expect(page).toHaveURL(`${process.env.E2E_WEB_URL}/`);
  const replay = await page.request.post(`${apiUrl}/auth/otp/verify`, {
    data: { email, code },
  });
  expect(replay.status()).toBe(401);
});
