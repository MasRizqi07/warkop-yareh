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

  // 1. Branch Fixture Invariant
  run("packages/types exports VERIFIED_BRANCHES with Jetis Kulon and Prapen only", () => {
    const typesPath = path.join(ROOT_DIR, 'packages', 'types', 'index.ts');
    const content = readFileSync(typesPath, 'utf8');
    return (
      content.includes("id: 'jetis-kulon'") &&
      content.includes("id: 'prapen'") &&
      !content.includes("coldnbrew-gubeng-001")
    );
  });

  // 2. Database Seed Invariant
  run("Database seed does not seed fictional Cold 'N Brew branches or luxury items", () => {
    const seedPath = path.join(ROOT_DIR, 'packages', 'database', 'prisma', 'seed.ts');
    const content = readFileSync(seedPath, 'utf8');
    // Ensure only jetis-kulon and prapen are created
    const doesNotCreateFakeBranch = !content.includes("create: {\n      id: BRANCH_ID");
    const doesNotUpsertProducts = !content.includes("prisma.product.upsert");
    const doesNotSeedColdNBrewStaff = !content.includes("email: 'admin@coldnbrew.id'");
    return (
      content.includes("'jetis-kulon'") &&
      content.includes("'prapen'") &&
      doesNotCreateFakeBranch &&
      doesNotUpsertProducts &&
      doesNotSeedColdNBrewStaff
    );
  });

  // 3. Client LocalStorage Key
  run("Client web auth storage uses warkop-yareh-auth target key", () => {
    const storagePath = path.join(ROOT_DIR, 'apps', 'web', 'src', 'stores', 'persist-storage.ts');
    const content = readFileSync(storagePath, 'utf8');
    return content.includes("TARGET_AUTH_STORAGE_KEY = 'warkop-yareh-auth'");
  });

  // 4. Route Transitions Configured
  run("Web next.config.mjs configures redirects for decommissioned and parked routes", () => {
    const configPath = path.join(ROOT_DIR, 'apps', 'web', 'next.config.mjs');
    const content = readFileSync(configPath, 'utf8');
    return (
      content.includes("source: '/booking', destination: '/outlets'") &&
      content.includes("source: '/community") &&
      content.includes("source: '/loyalty") &&
      content.includes("source: '/cart', destination: '/menu'")
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

  // 8. Sitemap Truthfulness
  run("Sitemap indexes only verified routes (menu, outlets, gallery, about, contact)", () => {
    const sitemapPath = path.join(ROOT_DIR, 'apps', 'web', 'src', 'app', 'sitemap.ts');
    const content = readFileSync(sitemapPath, 'utf8');
    return (
      content.includes("/menu`") &&
      content.includes("/outlets`") &&
      content.includes("/gallery`") &&
      !content.includes("/events`") &&
      !content.includes("/community`") &&
      !content.includes("/loyalty`")
    );
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
