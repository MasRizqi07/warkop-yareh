const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const screenshotsDir = 'C:\\Users\\rrgtet47\\.gemini\\antigravity\\brain\\01d7557e-5ed3-4310-ab07-6dce7dcb2629\\screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Set refreshToken cookies for both ports
  await context.addCookies([
    {
      name: 'refreshToken',
      value: 'mock-refresh-token-active',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  const screens = [
    { key: 'phase3_checkout', url: 'http://localhost:3000/checkout?mock=true', isWeb: true },
    { key: 'phase3_track_order', url: 'http://localhost:3000/order/track/YR-89241', isWeb: true },
    { key: 'phase3_account', url: 'http://localhost:3000/account', isWeb: true },
    { key: 'phase4_admin_analytics', url: 'http://localhost:3001/analytics', isWeb: false },
    { key: 'phase4_admin_inventory', url: 'http://localhost:3001/inventory', isWeb: false },
    { key: 'phase4_admin_crm', url: 'http://localhost:3001/crm', isWeb: false },
    { key: 'phase4_admin_marketing', url: 'http://localhost:3001/marketing', isWeb: false },
    { key: 'phase4_admin_branches', url: 'http://localhost:3001/branches', isWeb: false },
    { key: 'phase4_admin_pos_shifts', url: 'http://localhost:3001/pos/shifts', isWeb: false },
    { key: 'phase4_community_group', url: 'http://localhost:3000/community/groups/tech-circle', isWeb: true },
    { key: 'phase5_loyalty', url: 'http://localhost:3000/loyalty', isWeb: true },
  ];

  console.log('Capturing authenticated screenshots...');

  for (const screen of screens) {
    const page = await context.newPage();
    try {
      // Pre-seed localStorage auth state for apps/web
      if (screen.isWeb) {
        await page.addInitScript(() => {
          const mockUser = {
            id: 'usr-patron-01',
            email: 'reyhan.arisandi@surabayatech.id',
            name: 'Reyhan Arisandi',
            role: 'CUSTOMER',
            branchId: 'branch-darmo',
            phone: '081234567890',
            avatar: null,
            membershipTier: 'GOLD',
            loyaltyPoints: 1450,
          };
          window.localStorage.setItem('coldnbrew-auth', JSON.stringify({ state: { user: mockUser }, version: 2 }));
          window.localStorage.setItem('warkop-cart', JSON.stringify({
            state: {
              items: [
                {
                  product: {
                    id: 'prod-coldbrew-aren',
                    name: 'Cold Brew Aren Brulee',
                    description: '18-hour cold drip infused with organic East Java palm sugar and torched brulee foam crust.',
                    price: 38000,
                    image: '/images/cold-brew-aren-brulee.png',
                    category: 'Specialty Coffee',
                    tags: ['Signature', 'Cold Brew'],
                    isPopular: true,
                    isNew: false,
                    rating: 4.9,
                    reviewCount: 120,
                    preparationTime: 4,
                    branchAvailability: ['branch-darmo', 'branch-gubeng'],
                  },
                  quantity: 2,
                  unitPrice: 38000,
                  customizations: { Size: 'Large 16oz', Sweetness: 'Less Sweet (70%)' },
                  notes: 'Torch wild aren foam extra caramelized',
                },
                {
                  product: {
                    id: 'prod-toast-pastrami',
                    name: 'Smoked Pastrami Brioche Toast',
                    description: 'Artisan sourdough brioche, house-smoked beef pastrami, and melted raclette.',
                    price: 48000,
                    image: '/images/artisan-toasted-sourdough.png',
                    category: 'Artisan Eats',
                    tags: ['Food', 'Signature'],
                    isPopular: true,
                    isNew: false,
                    rating: 4.8,
                    reviewCount: 95,
                    preparationTime: 6,
                    branchAvailability: ['branch-darmo'],
                  },
                  quantity: 1,
                  unitPrice: 48000,
                  customizations: { Option: 'Raclette Melt' },
                  notes: 'Extra mustard sauce',
                }
              ],
              isOpen: false,
            },
            version: 2,
          }));
        });
      }

      await page.goto(screen.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      // Force dark theme
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.className = 'dark';
      });
      await page.waitForTimeout(600);

      const filePath = path.join(screenshotsDir, `${screen.key}_dark.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`✓ Captured: ${screen.key}_dark.png`);
    } catch (err) {
      console.error(`Error capturing ${screen.key}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('All authenticated evidence screenshots saved cleanly!');
}

main().catch(console.error);

