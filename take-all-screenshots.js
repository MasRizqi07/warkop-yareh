const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const screenshotsDir = 'C:\\Users\\rrgtet47\\.gemini\\antigravity-ide\\brain\\ca118778-876b-4221-8c3a-37e0ad7aae06\\screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Check admin port
  let adminPort = 3001;
  const testPage = await context.newPage();
  try {
    const res = await testPage.goto('http://localhost:3001/kitchen', { timeout: 3000 });
    if (!res || res.status() >= 400) adminPort = 3002;
  } catch (e) {
    adminPort = 3002;
  }
  await testPage.close();
  console.log(`Detected Admin port: ${adminPort}`);

  const screens = [
    { key: 'landing', url: 'http://localhost:3000/' },
    { key: 'menu', url: 'http://localhost:3000/menu' },
    { key: 'loyalty', url: 'http://localhost:3000/loyalty' },
    { key: 'community', url: 'http://localhost:3000/community' },
    { key: 'booking', url: 'http://localhost:3000/booking' },
    { key: 'checkout', url: 'http://localhost:3000/checkout?mock=true' },
    { key: 'kitchen', url: `http://localhost:${adminPort}/kitchen` },
    { key: 'analytics', url: `http://localhost:${adminPort}/analytics` },
    { key: 'products', url: `http://localhost:${adminPort}/products` },
    { key: 'pos', url: `http://localhost:${adminPort}/pos` }
  ];

  const themes = [
    { name: 'dark', isDark: true },
    { name: 'light', isDark: false }
  ];

  console.log('Capturing screenshots for all screens in dark and light themes...');

  for (const screen of screens) {
    for (const theme of themes) {
      const page = await context.newPage();
      
      // Inject theme into localStorage before loading
      await page.addInitScript((isDark) => {
        window.localStorage.setItem('warkop-theme', JSON.stringify({ state: { isDark }, version: 0 }));
      }, theme.isDark);

      await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1500);

      // Force HTML attribute to guarantee correct visual state
      await page.evaluate((isDark) => {
        const themeVal = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', themeVal);
        document.documentElement.className = themeVal;
      }, theme.isDark);

      await page.waitForTimeout(500);

      const filePath = path.join(screenshotsDir, `${screen.key}_${theme.name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Captured: ${screen.key}_${theme.name}.png`);

      await page.close();
    }
  }

  // Measure computed pixel sizes
  console.log('\n--- Measuring Touch Target Dimensions ---');
  const measurePage = await context.newPage();

  // 1. Header Buttons on Landing
  await measurePage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await measurePage.waitForTimeout(1000);
  const themeToggleBox = await measurePage.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="mode"]');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log('Theme Toggle Button:', themeToggleBox);

  const cartBtnBox = await measurePage.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Shopping Cart"]');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log('Cart Button:', cartBtnBox);

  // 2. Booking Floor Plan Seat Buttons
  await measurePage.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
  await measurePage.waitForTimeout(1000);
  const bookingSeatBox = await measurePage.evaluate(() => {
    const seat = document.querySelector('section button.rounded-full');
    if (!seat) return null;
    const rect = seat.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log('Booking Seat Button:', bookingSeatBox);

  // 3. POS Steppers and Split Buttons
  await measurePage.goto(`http://localhost:${adminPort}/pos`, { waitUntil: 'domcontentloaded' });
  await measurePage.waitForTimeout(1000);
  const posQtyBoxes = await measurePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('svg.lucide-minus') || b.querySelector('svg.lucide-plus'));
    if (btns.length === 0) return null;
    const rect = btns[0].getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height), count: btns.length };
  });
  console.log('POS Quantity Stepper Button:', posQtyBoxes);

  const posSplitBox = await measurePage.evaluate(() => {
    const splitBtns = Array.from(document.querySelectorAll('button')).filter(b => /^\d+x$/.test(b.textContent.trim()));
    if (splitBtns.length === 0) return null;
    const rect = splitBtns[0].getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height), count: splitBtns.length };
  });
  console.log('POS Split Bill Button:', posSplitBox);

  await measurePage.close();
  await browser.close();
  console.log('Finished capturing screenshots and measuring dimensions!');
}

main().catch(console.error);
