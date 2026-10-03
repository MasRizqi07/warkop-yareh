/**
 * Business Domain Integrity Audit Script
 * =====================================
 * Validates repository compliance against Warkop Ya'reh reality rebuild rules:
 * - Branch integrity (only Jetis Kulon & Prapen)
 * - Seed safety (zero fake products, neutral staff emails, no Cold N Brew fixtures)
 * - Storage key namespace (warkop-yareh-auth)
 * - Navigation and route transition coverage
 * - No unauthorized AI or franchise modules in active app
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const { VERIFIED_BRANCHES, FEATURE_FLAGS } = await import('../packages/types/index.ts');

function check(title, assertion) {
  try {
    const result = assertion();
    if (result) {
      console.log(`  ✅ [PASS] ${title}`);
      return true;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      return false;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}: ${err.message}`);
    return false;
  }
}

function runAudit() {
  console.log("=================================================");
  console.log("  WARKOP YA'REH — BUSINESS INTEGRITY AUDIT");
  console.log("=================================================\n");

  let totalPassed = 0;
  let totalChecks = 0;

  function run(title, fn) {
    totalChecks++;
    if (check(title, fn)) totalPassed++;
  }

  run('Exactly two verified canonical branch fixtures', () =>
    VERIFIED_BRANCHES.length === 2 &&
    VERIFIED_BRANCHES.every(branch => branch.confidence === 'VERIFIED'));

  run('Jetis fixture matches verified business data', () => {
    const branch = VERIFIED_BRANCHES.find(item => item.id === 'jetis-kulon');
    return branch?.name === "WARKOP YA'REH" &&
      branch.slug === 'jetis-kulon' &&
      Object.values(branch.address).join(', ') === 'Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur, 60243' &&
      branch.plusCode === 'MPVJ+2G Wonokromo, Surabaya, Jawa Timur' &&
      branch.phone === null &&
      branch.operatingHours === '24 Hours' &&
      JSON.stringify(branch.servicesSupported) === JSON.stringify(['DINE_IN', 'TAKEAWAY']) &&
      branch.publicSpendingRange === 'Rp1–25.000 per orang';
  });

  run('Prapen fixture matches verified business data', () => {
    const branch = VERIFIED_BRANCHES.find(item => item.id === 'prapen');
    return branch?.name === "WARKOP YA'REH 2 PRAPEN" &&
      branch.slug === 'prapen' &&
      Object.values(branch.address).join(', ') === 'Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur, 60239' &&
      branch.plusCode === 'MQM3+XJ Prapen, Surabaya, Jawa Timur' &&
      branch.phone === '0821-3735-4606' &&
      branch.operatingHours === '24 Hours' &&
      JSON.stringify(branch.servicesSupported) === JSON.stringify(['DINE_IN', 'TAKEAWAY']) &&
      branch.publicSpendingRange === 'Rp1–25.000 per orang';
  });

  // 3. Rejection of Legacy Incorrect Values in Active Fixtures
  run("Active production fixtures reject legacy incorrect addresses and Plus Codes", () => {
    const filesToCheck = [
      path.join(ROOT_DIR, 'packages', 'types', 'index.ts'),
      path.join(ROOT_DIR, 'packages', 'database', 'prisma', 'seed.ts'),
      path.join(ROOT_DIR, 'apps', 'web', 'src', 'lib', 'constants.ts'),
    ];
    for (const file of filesToCheck) {
      const content = readFileSync(file, 'utf8');
      if (
        content.includes('JP7J+54') ||
        content.includes('HMQF+XX') ||
        content.includes('37A') ||
        content.includes('Prapen Indah')
      ) {
        return false;
      }
    }
    return true;
  });

  run('Seed consumes canonical fixtures without product writes or destructive cleanup', () => {
    const seed = readFileSync(path.join(ROOT_DIR, 'packages/database/prisma/seed.ts'), 'utf8');
    return seed.includes('for (const fixture of VERIFIED_BRANCHES)') &&
      seed.includes('latitude: null') && seed.includes('longitude: null') &&
      seed.includes('capacity: null') && seed.includes('businessHour.upsert') &&
      !/prisma\.(product|category|branchProduct)\.(create|upsert|delete|deleteMany)/.test(seed) &&
      !seed.includes('cleanupContaminatedFixtures');
  });

  // 3. Client LocalStorage Key
  run("Client web auth storage uses warkop-yareh-auth target key", () => {
    const storagePath = path.join(ROOT_DIR, 'apps', 'web', 'src', 'stores', 'persist-storage.ts');
    const content = readFileSync(storagePath, 'utf8');
    return content.includes("TARGET_AUTH_STORAGE_KEY = 'warkop-yareh-auth'");
  });

  // 6. Route Transitions Configured
  run("Web next.config.mjs configures redirects for decommissioned speculative routes", () => {
    const configPath = path.join(ROOT_DIR, 'apps', 'web', 'next.config.mjs');
    const content = readFileSync(configPath, 'utf8');
    return (
      content.includes("source: '/booking', destination: '/outlets'") &&
      content.includes("source: '/community") &&
      content.includes("source: '/loyalty")
    );
  });

  // 5. Customer Web Bundle Decontaminated
  run("Customer marketing layout does not mount speculative BaristaConciergeModal", () => {
    const layoutPath = path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', '(marketing)', 'layout.tsx');
    const content = readFileSync(layoutPath, 'utf8');
    return !content.includes("BaristaConciergeModal");
  });

  // 6. Ops Routes Removed from Customer Web
  run("Internal ops screens (/ops/kds, /ops/pos) removed from customer web app", () => {
    const opsDir = path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', 'ops');
    return !existsSync(opsDir);
  });

  // 7. Core Verified Models Present
  run("Prisma schema contains BusinessHour, GalleryAsset, SiteContent, and BusinessFact", () => {
    const schemaPath = path.join(ROOT_DIR, 'packages', 'database', 'prisma', 'schema.prisma');
    const content = readFileSync(schemaPath, 'utf8');
    return (
      content.includes("model BusinessHour") &&
      content.includes("model GalleryAsset") &&
      content.includes("model SiteContent") &&
      content.includes("model BusinessFact") &&
      content.includes("model SourceReference")
    );
  });

  run("Sitemap indexes the explicit verified public route set", () => {
    const sitemap = readFileSync(path.join(ROOT_DIR, 'apps/web/src/app/sitemap.ts'), 'utf8');
    const seo = readFileSync(path.join(ROOT_DIR, 'apps/web/src/lib/seo.ts'), 'utf8');
    return sitemap.includes('PUBLIC_PATHS.map') && ['/menu', '/outlets', '/gallery', '/about', '/contact', '/outlets/jetis-kulon', '/outlets/prapen'].every(route => seo.includes(`'${route}'`)) && !/\/events|\/community|\/loyalty|\/checkout/.test(seo.split('export const PRIVATE_METADATA')[0]);
  });

  // 9. Public Constants Truthfulness
  run("Constants SITE metadata has authentic 24h Surabaya tagline and verified Prapen phone", () => {
    const constPath = path.join(ROOT_DIR, 'apps', 'web', 'src', 'lib', 'constants.ts');
    const content = readFileSync(constPath, 'utf8');
    return (
      content.includes("24 Jam") &&
      content.includes("0821-3735-4606")
    );
  });

  // 10. Speculative API Module Decoupling
  run("API app.module.ts does not register AiModule or FranchiseModule", () => {
    const appModulePath = path.join(ROOT_DIR, 'apps', 'api', 'src', 'app.module.ts');
    const content = readFileSync(appModulePath, 'utf8');
    return (
      !content.includes("AiModule") &&
      !content.includes("FranchiseModule")
    );
  });

  // 11. Speculative Backend Code Tree Purged
  run("Speculative apps/api modules (ai, franchise) removed from tree", () => {
    const aiDir = path.join(ROOT_DIR, 'apps', 'api', 'src', 'modules', 'ai');
    const franchiseDir = path.join(ROOT_DIR, 'apps', 'api', 'src', 'modules', 'franchise');
    return !existsSync(aiDir) && !existsSync(franchiseDir);
  });

  // 12. Fictional Branch Names Banned in Marketing Code
  run("Public marketing pages do not mention fictional Gubeng, Darmo, or Dharmahusada branches", () => {
    const marketingPages = [
      path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', '(marketing)', 'page.tsx'),
      path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', '(marketing)', 'about', 'page.tsx'),
      path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', '(marketing)', 'contact', 'page.tsx'),
    ];
    for (const p of marketingPages) {
      if (!existsSync(p)) continue;
      const content = readFileSync(p, 'utf8').toLowerCase();
      if (content.includes("gubeng") || content.includes("darmo flagship") || content.includes("dharmahusada")) {
        return false;
      }
    }
    return true;
  });

  // 13. Production Menu Seed Empty Invariant
  run("Database seed does not seed fictional luxury items (Croissant, Nitro Cold Brew, etc.)", () => {
    const seedPath = path.join(ROOT_DIR, 'packages', 'database', 'prisma', 'seed.ts');
    const content = readFileSync(seedPath, 'utf8');
    return (
      !content.includes("Croissant Mentega") &&
      !content.includes("Nitro Cold Brew") &&
      !content.includes("Truffle Fries")
    );
  });

  run("Global marketing metadata and footer contain no speculative service claims", () => {
    const files = ['apps/web/src/app/layout.tsx', 'apps/web/src/components/layout/footer.tsx'];
    return files.every(file => !/coworking|specialty|single origin|acceptsReservations|servesCuisine|loyalty|workspace|reservasi|komunitas/i.test(readFileSync(path.join(ROOT_DIR, file), 'utf8')));
  });
  run("Production catalog cannot accidentally display browser fixtures", () => {
    const menu = readFileSync(path.join(ROOT_DIR, 'apps/web/src/app/(marketing)/menu/page.tsx'), 'utf8');
    const config = readFileSync(path.join(ROOT_DIR, 'apps/web/next.config.mjs'), 'utf8');
    return menu.includes('catalog.data?.products') &&
      !menu.includes('Browser Test Latte') &&
      menu.includes('TEST_CATALOG_ENABLED') &&
      menu.includes('runtimeBranches.map') &&
      config.includes('process.env.VERCEL') &&
      config.includes('/warkop_audit') &&
      config.includes('127.0.0.1');
  });
  run("Gallery publication starts unverified and requires primary dated evidence", () => {
    const schema = readFileSync(path.join(ROOT_DIR, 'packages/database/prisma/schema.prisma'), 'utf8');
    const model = schema.split('model GalleryAsset {')[1]?.split('model SiteContent')[0] ?? '';
    const service = readFileSync(path.join(ROOT_DIR, 'apps/api/src/modules/reality/reality.service.ts'), 'utf8');
    return /isVerified\s+Boolean\s+@default\(false\)/.test(model) && model.includes('UNVERIFIED') && service.includes('GALLERY_FRESHNESS_DAYS') && service.includes('PRIMARY_OPERATOR');
  });
  run("Customer account pages cannot inherit a legacy brand name from the environment", () => {
    const pages = [
      'apps/web/src/app/login/page.tsx',
      'apps/web/src/app/register/page.tsx',
      'apps/web/src/app/otp/page.tsx',
      'apps/web/src/app/orders/[id]/thankyou/page.tsx',
    ];
    return pages.every(file => !readFileSync(path.join(ROOT_DIR, file), 'utf8').includes('NEXT_PUBLIC_BRAND_NAME'));
  });

  run('Menu publication gates all public reads and ordering writes', () => {
    const repo = readFileSync(path.join(ROOT_DIR, 'apps/api/src/modules/catalog/infrastructure/repositories/prisma-catalog.repository.ts'), 'utf8');
    const ordering = readFileSync(path.join(ROOT_DIR, 'apps/api/src/modules/ordering/infrastructure/repositories/prisma-ordering.repository.ts'), 'utf8');
    const schema = readFileSync(path.join(ROOT_DIR, 'packages/database/prisma/schema.prisma'), 'utf8');
    return (repo.match(/publicationStatus: ProductPublicationStatus.PUBLISHED/g) ?? []).length >= 3 &&
      ordering.includes('publicationStatus: ProductPublicationStatus.PUBLISHED') &&
      schema.includes('publicationStatus ProductPublicationStatus @default(DRAFT)');
  });

  run('Feature flags default off and public order types reject unsupported modes', () => {
    const service = readFileSync(path.join(ROOT_DIR, 'apps/api/src/modules/ordering/application/services/ordering.service.ts'), 'utf8');
    const controller = readFileSync(path.join(ROOT_DIR, 'apps/api/src/modules/ordering/presentation/controllers/orders.controller.ts'), 'utf8');
    return FEATURE_FLAGS.length === 6 && controller.includes("isFeatureEnabled('PUBLIC_ORDERING', process.env)") &&
      service.includes('type !== OrderType.DINE_IN && type !== OrderType.TAKE_AWAY');
  });

  run('Customer cart and checkout expose only dine-in and takeaway', () => {
    const cart = readFileSync(path.join(ROOT_DIR, 'apps/web/src/app/cart/page.tsx'), 'utf8');
    const checkout = readFileSync(path.join(ROOT_DIR, 'apps/web/src/features/orders/checkout-page.tsx'), 'utf8');
    const state = readFileSync(path.join(ROOT_DIR, 'apps/web/src/stores/checkout.store.ts'), 'utf8');
    return !/DRIVE_THRU|DELIVERY|Drive-Thru|Delivery/.test(cart + checkout) &&
      !/drive-thru|delivery/.test(state.split('const initialState')[0]) &&
      !/Voucher &|Kawan Points|Tukar poin/.test(checkout);
  });

  run('Legacy customer modules are unregistered and admin routes redirect', () => {
    const app = readFileSync(path.join(ROOT_DIR, 'apps/api/src/app.module.ts'), 'utf8');
    const admin = readFileSync(path.join(ROOT_DIR, 'apps/admin/next.config.ts'), 'utf8');
    return !/ReservationModule|EventModule|CommunityModule|LoyaltyModule/.test(app) &&
      ['/community', '/crm', '/events/:path*', '/loyalty', '/reservations'].every(route => admin.includes(`'${route}'`));
  });

  run('Shared brand does not claim an unverified founding year', () => {
    const logo = readFileSync(path.join(ROOT_DIR, 'packages/ui/src/assets/brand-emblem.tsx'), 'utf8');
    return !logo.includes('1998') && logo.includes('Surabaya · 24 Jam');
  });

  run('Active account and order pages make no loyalty or member-pass claims', () => {
    const account = readFileSync(path.join(ROOT_DIR, 'apps/web/src/features/account/account-page.tsx'), 'utf8');
    const orders = readFileSync(path.join(ROOT_DIR, 'apps/web/src/app/orders/page.tsx'), 'utf8');
    return !/Poin member|Tier member|member pass|Sanctuary/i.test(account + orders) &&
      !account.includes('href="/loyalty"');
  });

  run("Active README and PRD describe Warkop Ya'reh without legacy business claims", () => {
    const active = ['README.md', 'PRD.md'].map(file => readFileSync(path.join(ROOT_DIR, file), 'utf8'));
    return active.every(text => /Warkop Ya.reh/i.test(text) && !/Cold .N Brew Gubeng|Premium Specialty Coffee Shop & Coworking Ecosystem|Darmo flagship|Dharmahusada/i.test(text));
  });

  console.log(`\nResults: ${totalPassed} / ${totalChecks} checks passed.`);

  if (totalPassed === totalChecks) {
    console.log("🎉 BUSINESS INTEGRITY AUDIT: 100% PASSED!\n");
    process.exit(0);
  } else {
    console.error("💥 BUSINESS INTEGRITY AUDIT: FAILED.\n");
    process.exit(1);
  }
}

runAudit();
