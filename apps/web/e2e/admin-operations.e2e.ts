import { expect, test, type Page } from 'playwright/test';
import { randomUUID } from 'node:crypto';

const adminUrl = process.env.E2E_ADMIN_URL!;
const apiUrl = process.env.E2E_API_URL!;
const adminEmail = process.env.E2E_ADMIN_EMAIL!;
const adminPassword = process.env.E2E_ADMIN_PASSWORD!;

async function login(page: Page) {
  await page.goto(`${adminUrl}/login`);
  const response = page.waitForResponse(
    (candidate) =>
      candidate.url().endsWith('/auth/login') &&
      candidate.request().method() === 'POST'
  );
  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in to terminal' }).click();
  expect((await response).status()).toBe(200);
  await expect(page).toHaveURL(`${adminUrl}/`);
}

async function readRevenue(page: Page) {
  return page.evaluate(async (baseUrl) => {
    const token = window.sessionStorage.getItem('admin_access_token');
    const response = await fetch(`${baseUrl}/api/v1/analytics/revenue`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Revenue request failed with HTTP ${response.status}`);
    }
    const body = (await response.json()) as {
      data: { totalRevenue: number; orderCount: number };
    };
    return body.data;
  }, apiUrl);
}

test.describe.serial('database-backed admin operations', () => {
  test('all retained admin routes load through authenticated APIs without request failures', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const responseFailures: string[] = [];
    const pageErrors: string[] = [];
    page.on('response', (response) => {
      if (
        response.url().startsWith(`${apiUrl}/api/v1/`) &&
        response.status() >= 400
      ) {
        responseFailures.push(`${response.status()} ${response.url()}`);
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await login(page);

    for (const route of [
      '/',
      '/analytics',
      '/branches',
      '/inventory',
      '/marketing',
      '/orders',
      '/products',
      '/settings',
      '/shifts',
      '/users',
      '/kitchen',
      '/pos',
      '/tables',
    ]) {
      await page.goto(`${adminUrl}${route}`, { waitUntil: 'networkidle' });
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
    }

    for (const route of ['/community', '/crm', '/events', '/loyalty', '/reservations']) {
      await page.goto(`${adminUrl}${route}`, { waitUntil: 'networkidle' });
      await expect(page).toHaveURL(`${adminUrl}/`);
    }

    expect(responseFailures).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('shift mutations survive full reloads and persist the final variance', async ({
    page,
  }) => {
    await login(page);
    const revenueBefore = await readRevenue(page);
    await page.goto(`${adminUrl}/shifts`, { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Buka shift' }).click();
    await page.getByLabel('Opening float').fill('100000');
    await page.getByRole('button', { name: 'Konfirmasi' }).click();
    await expect(
      page.getByText('Shift berhasil dibuka.', { exact: true })
    ).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText('Shift aktif', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Kas ekspektasi', { exact: true }).locator('..')
    ).toContainText('100.000');

    await page.getByRole('button', { name: 'Catat kas masuk/keluar' }).click();
    await page.getByLabel('Jumlah', { exact: true }).fill('20000');
    await page
      .getByLabel('Alasan', { exact: true })
      .fill('Browser audit cash in');
    await page.getByRole('button', { name: 'Konfirmasi' }).click();
    await expect(
      page.getByText('Pergerakan kas berhasil dicatat.', { exact: true })
    ).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.getByText('Kas masuk / keluar', { exact: true }).locator('..')
    ).toContainText('20.000');

    await page.goto(`${adminUrl}/pos`, { waitUntil: 'networkidle' });
    await page
      .getByRole('button', { name: 'Tambah Browser Test Latte' })
      .click();
    await page.getByRole('button', { name: 'Take away' }).click();
    await expect(
      page.getByText('Total', { exact: true }).locator('..')
    ).toContainText('13.920');
    await page.getByLabel('Kas diterima').fill('15000');
    await page.getByRole('button', { name: 'Bayar Rp 13.920' }).click();
    await expect(page.getByText(/^Pembayaran .* tersimpan/)).toBeVisible();
    const receipt = await page.getByText(/^Struk /).innerText();
    const orderNumber = receipt.match(/^Struk (.+?) ·/)?.[1];
    expect(orderNumber).toBeTruthy();

    await page.goto(`${adminUrl}/kitchen`, { waitUntil: 'networkidle' });
    const ticket = page.locator('li').filter({ hasText: orderNumber! }).first();
    await expect(ticket).toBeVisible();
    await expect(ticket).toContainText('Browser Test Latte');
    await ticket.getByRole('button', { name: 'Mulai siapkan' }).click();
    await expect(
      ticket.getByRole('button', { name: 'Tandai siap' })
    ).toBeVisible();
    await ticket.getByRole('button', { name: 'Tandai siap' }).click();
    await expect(
      ticket.getByRole('button', { name: 'Tandai disajikan' })
    ).toBeVisible();
    await ticket.getByRole('button', { name: 'Tandai disajikan' }).click();
    await expect(ticket).toHaveCount(0);

    await page.goto(`${adminUrl}/orders`, { waitUntil: 'networkidle' });
    const orderRow = page
      .getByRole('row')
      .filter({ hasText: orderNumber! })
      .first();
    await expect(orderRow).toBeVisible();
    await orderRow.getByRole('button', { name: 'COMPLETED' }).click();
    await expect(
      page.getByText(`${orderNumber} diperbarui menjadi COMPLETED.`, {
        exact: true,
      })
    ).toBeVisible();

    await page.goto(`${adminUrl}/shifts`, { waitUntil: 'networkidle' });
    await expect(
      page.getByText('Kas ekspektasi', { exact: true }).locator('..')
    ).toContainText('133.920');

    await page.getByRole('button', { name: 'Tutup shift' }).click();
    await page.getByLabel('Kas fisik penutupan').fill('135920');
    await page.getByLabel('Catatan (opsional)').fill('Browser audit handover');
    await page.getByRole('button', { name: 'Konfirmasi' }).click();
    await expect(
      page.getByText('Shift berhasil ditutup.', { exact: true })
    ).toBeVisible();

    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.getByText('Drawer tertutup', { exact: true })
    ).toBeVisible();
    const closedRow = page
      .getByRole('row')
      .filter({ hasText: 'CLOSED' })
      .first();
    await expect(closedRow).toContainText('133.920');
    await expect(closedRow).toContainText('135.920');
    await expect(closedRow).toContainText('2.000');

    const revenueAfter = await readRevenue(page);
    expect(revenueAfter).toEqual({
      totalRevenue: revenueBefore.totalRevenue + 13_920,
      orderCount: revenueBefore.orderCount + 1,
      averageOrderValue: expect.any(Number),
    });
    await page.goto(`${adminUrl}/analytics`, { waitUntil: 'networkidle' });
    await expect(
      page.locator('article').filter({ hasText: 'Pendapatan selesai' })
    ).toContainText(`Rp ${revenueAfter.totalRevenue.toLocaleString('id-ID')}`);
    await expect(
      page.locator('article').filter({ hasText: 'Order selesai' })
    ).toContainText(String(revenueAfter.orderCount));
  });

  test('branch and inventory edits are read back from the API after reload', async ({
    page,
  }) => {
    await login(page);
    await page.goto(`${adminUrl}/branches`, { waitUntil: 'networkidle' });
    const capacity = page.getByLabel('Browser Test Cafe capacity');
    await capacity.fill('41');
    await capacity.locator('..').getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText(/capacity persisted\./)).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByLabel('Browser Test Cafe capacity')).toHaveValue(
      '41'
    );

    await page.goto(`${adminUrl}/inventory`, { waitUntil: 'networkidle' });
    const row = page.getByTestId('inventory-row-browser-inventory');
    await row.getByRole('button', { name: 'Adjust' }).click();
    await page.getByLabel('Current quantity').fill('75');
    await page.getByRole('button', { name: 'Save inventory' }).click();
    await expect(page.getByText(/inventory persisted\./)).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.getByTestId('inventory-row-browser-inventory')
    ).toContainText('75 / 100 kg');
  });

  test('a marketing draft survives a full browser reload', async ({ page }) => {
    await login(page);
    await page.goto(`${adminUrl}/marketing`, { waitUntil: 'networkidle' });
    const campaignName = `Browser persistence ${randomUUID()}`;
    await page.getByLabel('Campaign name').fill(campaignName);
    await page.getByRole('button', { name: 'Save draft' }).click();
    await expect(
      page.getByText(/persisted and reloaded from the API\./)
    ).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(campaignName, { exact: true })).toBeVisible();
  });

  test('unverified gallery and site drafts persist privately after reload', async ({
    page,
  }) => {
    await login(page);
    const title = `Private venue draft ${randomUUID()}`;
    await page.goto(`${adminUrl}/gallery`, { waitUntil: 'networkidle' });
    await page.getByLabel('Judul Foto').fill(title);
    await page
      .getByLabel('URL Foto (HTTPS)')
      .fill('https://example.test/private-venue-draft.jpg');
    await page.getByRole('button', { name: 'Simpan Dokumentasi' }).click();
    await expect(page.getByText('Dokumentasi tersimpan.')).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(title, { exact: true })).toBeVisible();

    const unauthenticated = await page.request.get(
      `${apiUrl}/api/v1/reality/gallery`
    );
    expect([401, 403]).toContain(unauthenticated.status());
    const published = await page.request.get(
      `${apiUrl}/api/v1/reality/gallery/public`
    );
    expect(published.status()).toBe(200);
    expect(await published.text()).not.toContain(title);

    await page.goto(`${adminUrl}/site-content`, { waitUntil: 'networkidle' });
    const draftTitle = `Private story ${randomUUID()}`;
    await page.getByLabel('Judul Konten').fill(draftTitle);
    await page.getByLabel('Isi Konten').fill('Draft internal untuk tinjauan.');
    await page.getByRole('button', { name: 'Simpan Draft' }).click();
    await expect(page.getByText('Draft tersimpan dan tetap privat.')).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(draftTitle, { exact: true })).toBeVisible();
    await expect(page.getByText('Draft privat / UNVERIFIED')).toBeVisible();
  });
});
