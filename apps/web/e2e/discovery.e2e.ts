import { expect, test } from 'playwright/test';
import AxeBuilder from '@axe-core/playwright';

const jetis = 'Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243';
const prapen = 'Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239';

test('public discovery has two verified 24-hour outlets', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: "Warkop Ya'reh" })).toBeVisible();
  await expect(page.getByText('Buka 24 Jam di Surabaya (Jetis Kulon & Prapen)')).toBeVisible();
  await page.goto('/outlets');
  await expect(page.getByRole('heading', { level: 1, name: "Outlet Warkop Ya'reh" })).toBeVisible();
  await expect(page.getByText(jetis).first()).toBeVisible();
  await expect(page.getByText(prapen).first()).toBeVisible();
});

test('outlet details expose exact address, Plus Code and only verified phone', async ({ page }) => {
  await page.goto('/outlets/jetis-kulon');
  await expect(page.getByRole('heading', { level: 1, name: "WARKOP YA'REH", exact: true })).toBeVisible();
  await expect(page.getByText(jetis).first()).toBeVisible();
  await expect(page.getByText('MPVJ+2G Wonokromo, Surabaya, Jawa Timur')).toBeVisible();
  await expect(page.locator('main a[href^="tel:"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Petunjuk Arah Google Maps' })).toHaveAttribute('href', /MPVJ%2B2G/);
  await page.goto('/outlets/prapen');
  await expect(page.getByRole('heading', { level: 1, name: "WARKOP YA'REH 2 PRAPEN" })).toBeVisible();
  await expect(page.getByText(prapen).first()).toBeVisible();
  await expect(page.getByText('MQM3+XJ Prapen, Surabaya, Jawa Timur')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Telepon Outlet' })).toHaveAttribute('href', 'tel:0821-3735-4606');
});

test('empty verified branch menu and published isolated fixture are distinct', async ({ page }) => {
  await page.goto('/menu');
  await page.getByRole('button', { name: "WARKOP YA'REH (24 Jam)", exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Menu Lengkap Sedang Diverifikasi Langsung' })).toBeVisible();
  await expect(page.locator('[data-testid="published-menu"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Browser Test Cafe (24 Jam)' }).click();
  await expect(page.getByRole('heading', { name: 'Browser Test Latte' })).toBeVisible();
  await expect(page.locator('[data-testid="published-menu"]')).toBeVisible();
});

test('retired routes redirect and account entry is noindex', async ({ page }) => {
  await page.goto('/community');
  await expect(page).toHaveURL('/');
  await page.goto('/reservations');
  await expect(page).toHaveURL('/outlets');
  await page.goto('/login');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('core discovery pages have no serious axe findings at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of ['/', '/outlets', '/outlets/jetis-kulon', '/menu', '/login']) {
    await page.goto(path);
    if (path === '/login') {
      await expect.poll(() => page.locator('form').evaluate((form) => getComputedStyle(form.parentElement!).opacity)).toBe('1');
    }
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(violations, `${path}: ${violations.map((item) => item.id).join(', ')}`).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `${path} overflows 320px viewport`).toBe(false);
  }
});
