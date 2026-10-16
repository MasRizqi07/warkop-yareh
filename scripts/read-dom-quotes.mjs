import { chromium } from 'playwright';

const webUrl = process.env.WEB_URL ?? 'http://127.0.0.1:3006';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = {};

  // 1. /outlets/jetis-kulon
  await page.goto(`${webUrl}/outlets/jetis-kulon`);
  results['/outlets/jetis-kulon'] = {
    address: await page.locator('main p').first().innerText(),
    plusCode: await page.locator('text=/MPVJ\\+2G/').first().innerText().catch(() => null),
    phoneLinkCount: await page.locator('main a[href^="tel:"]').count(),
    facilityCount: await page.locator('[data-testid="facilities"]').count(),
  };

  // 2. /outlets/prapen
  await page.goto(`${webUrl}/outlets/prapen`);
  results['/outlets/prapen'] = {
    address: await page.locator('main p').first().innerText(),
    plusCode: await page.locator('text=/MQM3\\+XJ/').first().innerText().catch(() => null),
    phoneText: await page.locator('main a[href^="tel:"]').first().innerText().catch(() => null),
    phoneHref: await page.locator('main a[href^="tel:"]').first().getAttribute('href').catch(() => null),
    facilityCount: await page.locator('[data-testid="facilities"]').count(),
  };

  // 3. /contact
  await page.goto(`${webUrl}/contact`);
  const contactParas = await page.locator('main p').allInnerTexts();
  results['/contact'] = {
    addresses: contactParas.filter((p) => p.includes('Jl. Raya')),
    phoneText: await page.locator('main a[href^="tel:"]').first().innerText().catch(() => null),
    phoneHref: await page.locator('main a[href^="tel:"]').first().getAttribute('href').catch(() => null),
    facilityCount: await page.locator('[data-testid="facilities"]').count(),
  };

  // 4. /menu
  await page.goto(`${webUrl}/menu`);
  results['/menu'] = {
    verificationHeading: await page.locator('h2').filter({ hasText: 'Menu Lengkap' }).innerText().catch(() => null),
    verificationSubtext: await page.locator('p').filter({ hasText: 'Katalog itemisasi' }).innerText().catch(() => null),
    facilityCount: await page.locator('[data-testid="facilities"]').count(),
  };

  // 5. /gallery
  await page.goto(`${webUrl}/gallery`);
  results['/gallery'] = {
    header: await page.locator('h1').innerText().catch(() => null),
    subtext: await page.locator('p').filter({ hasText: 'Dokumentasi visual' }).first().innerText().catch(() => null),
    facilityCount: await page.locator('[data-testid="facilities"]').count(),
  };

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
