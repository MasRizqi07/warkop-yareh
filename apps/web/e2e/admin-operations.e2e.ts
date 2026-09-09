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
      '/community',
      '/crm',
      '/events',
      '/inventory',
      '/loyalty',
      '/marketing',
      '/orders',
      '/products',
      '/reservations',
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

    expect(responseFailures).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('shift mutations survive full reloads and persist the final variance', async ({
    page,
  }) => {
    await login(page);
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

    await page.goto(`${adminUrl}/orders`, { waitUntil: 'networkidle' });
    await expect(page.getByText(orderNumber!, { exact: true })).toBeVisible();

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
    const row = page.getByTestId('inventory-row-browser-coffee');
    await row.getByRole('button', { name: 'Adjust' }).click();
    await page.getByLabel('Current quantity').fill('75');
    await page.getByRole('button', { name: 'Save inventory' }).click();
    await expect(page.getByText(/inventory persisted\./)).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(
      page.getByTestId('inventory-row-browser-coffee')
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
});
