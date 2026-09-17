/**
 * Warkop Ya'reh — Truthful Reality Database Seed (Phase 1.5)
 * =========================================================
 * Authoritative Business Domain Seed
 *
 * Rules:
 * 1. Seed ONLY verified branches (Jetis Kulon & Prapen)
 * 2. Menu seed is strictly EMPTY (spending range: Rp1–25.000/person; item prices unverified)
 * 3. Administrative accounts use neutral domain (@warkopyareh.local)
 * 4. Automatic decontamination of legacy speculative fixtures (Cold 'N Brew)
 *
 * Run: pnpm --filter @warkop-yareh/database run db:seed
 */

import {
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

function getSeedPassword(environmentName: string, developmentFallback: string): string {
  const configuredPassword = process.env[environmentName];
  if (configuredPassword) return configuredPassword;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${environmentName} is required for production seeding`);
  }

  return developmentFallback;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function cleanupContaminatedFixtures() {
  console.log('🧹 Checking and decontaminating legacy speculative fixtures...');

  // 1. Reassign or delete references to legacy fictional branch 'coldnbrew-gubeng-001'
  const legacyBranch = await prisma.branch.findUnique({
    where: { id: 'coldnbrew-gubeng-001' },
  });

  if (legacyBranch) {
    console.log("  ⚠️  Found legacy branch 'coldnbrew-gubeng-001'. Cleaning references...");
    await prisma.user.updateMany({
      where: { branchId: 'coldnbrew-gubeng-001' },
      data: { branchId: null },
    });
    await prisma.branchProduct.deleteMany({
      where: { branchId: 'coldnbrew-gubeng-001' },
    });
    await prisma.table.deleteMany({
      where: { branchId: 'coldnbrew-gubeng-001' },
    });
    await prisma.review.deleteMany({
      where: { branchId: 'coldnbrew-gubeng-001' },
    });
    await prisma.event.deleteMany({
      where: { branchId: 'coldnbrew-gubeng-001' },
    });
    await prisma.branch.delete({
      where: { id: 'coldnbrew-gubeng-001' },
    }).catch((err) => {
      console.warn('  ⚠️  Could not delete legacy branch directly (may have foreign keys):', err.message);
    });
  }

  // 2. Remove legacy staff accounts
  const legacyStaffEmails = [
    'admin@coldnbrew.id',
    'kasir@coldnbrew.id',
    'kitchen@coldnbrew.id',
  ];
  const deletedStaff = await prisma.user.deleteMany({
    where: { email: { in: legacyStaffEmails } },
  });
  if (deletedStaff.count > 0) {
    console.log(`  ✅ Removed ${deletedStaff.count} legacy @coldnbrew.id staff accounts.`);
  }

  // 3. Remove speculative rewards, community groups, events, and fake reviews
  await prisma.review.deleteMany({
    where: { id: 'seed-verified-review' },
  });
  await prisma.communityPost.deleteMany({
    where: { id: 'seed-community-welcome-post' },
  });
  await prisma.communityMembership.deleteMany({
    where: { group: { slug: 'kawan-produk-surabaya' } },
  });
  await prisma.communityGroup.deleteMany({
    where: { slug: 'kawan-produk-surabaya' },
  });
  await prisma.event.deleteMany({
    where: { slug: 'ngopi-dan-bangun-produk' },
  });
  await prisma.reward.deleteMany({
    where: { id: { in: ['nitro-cold-brew', 'toraja-v60'] } },
  });

  // 4. Remove speculative menu items and categories
  const legacyCategories = ['espresso', 'cold-brew', 'non-coffee', 'snacks', 'main-course', 'desserts'];
  await prisma.branchProduct.deleteMany({
    where: { product: { category: { slug: { in: legacyCategories } } } },
  });
  await prisma.product.deleteMany({
    where: { category: { slug: { in: legacyCategories } } },
  });
  await prisma.category.deleteMany({
    where: { slug: { in: legacyCategories } },
  });
}

async function main() {
  console.log("🌱 Starting Warkop Ya'reh Reality Seed (Phase 1.5)...");

  // Decontaminate any existing legacy fixtures
  await cleanupContaminatedFixtures();

  // ── 1. Seed Verified Branches ─────────────────────────────────────────────
  // Source: docs/business/BRANCHES.md & packages/types/index.ts (VERIFIED_BRANCHES)
  const branches = [
    {
      id: 'jetis-kulon',
      name: "WARKOP YA'REH",
      slug: 'jetis-kulon',
      brandName: "Warkop Ya'reh",
      address: 'Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60243',
      plusCode: 'MPVJ+2G Wonokromo, Surabaya, Jawa Timur',
      phone: null,
      email: null,
      latitude: -7.311494,
      longitude: 112.730303,
      isMainBranch: true,
      isActive: true,
      capacity: 0,
      features: ['Dine-in', 'Takeaway', '24 Jam'],
      weekdayHours: '00:00-24:00',
      weekendHours: '00:00-24:00',
    },
    {
      id: 'prapen',
      name: "WARKOP YA'REH 2 PRAPEN",
      slug: 'prapen',
      brandName: "Warkop Ya'reh",
      address: 'Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60239',
      plusCode: 'MQM3+XJ Prapen, Surabaya, Jawa Timur',
      phone: '0821-3735-4606',
      email: null,
      latitude: -7.319762,
      longitude: 112.766167,
      isMainBranch: false,
      isActive: true,
      capacity: 0,
      features: ['Dine-in', 'Takeaway', '24 Jam'],
      weekdayHours: '00:00-24:00',
      weekendHours: '00:00-24:00',
    },
  ];

  for (const b of branches) {
    const upserted = await prisma.branch.upsert({
      where: { id: b.id },
      update: {
        name: b.name,
        slug: b.slug,
        brandName: b.brandName,
        address: b.address,
        city: b.city,
        province: b.province,
        postalCode: b.postalCode,
        plusCode: b.plusCode,
        phone: b.phone,
        email: b.email,
        latitude: b.latitude,
        longitude: b.longitude,
        isMainBranch: b.isMainBranch,
        isActive: b.isActive,
        capacity: b.capacity,
        features: b.features,
        weekdayHours: b.weekdayHours,
        weekendHours: b.weekendHours,
      },
      create: b,
    });
    console.log(`✅ Verified Branch: ${upserted.name} (${upserted.id})`);
  }

  // ── 2. Production Menu Seed: Intentionally Empty ──────────────────────────
  // Per docs/business/MENU.md: Venue spending range (Rp1–25.000/person) is verified,
  // but itemized catalog and prices are UNVERIFIED. Zero products are seeded.
  console.log('ℹ️  Menu Catalog: 0 products seeded (Production catalog pending physical menu verification).');

  // ── 3. Administrative Staff Accounts (Bootstrap / Technical Only — Non-Public) ──
  // IMPORTANT: These accounts are for initial local/staging system access only.
  // They are NOT public business contacts and MUST NEVER be exposed on customer surfaces.
  const staffAccounts = [
    {
      email: 'admin@warkopyareh.local',
      name: "Administrator Warkop Ya'reh",
      password: getSeedPassword('SEED_ADMIN_PASSWORD', 'Admin123!'),
      role: Role.ADMIN,
      branchId: 'jetis-kulon',
    },
    {
      email: 'kasir.jetiskulon@warkopyareh.local',
      name: 'Kasir Jetis Kulon',
      password: getSeedPassword('SEED_CASHIER_PASSWORD', 'Kasir123!'),
      role: Role.CASHIER,
      branchId: 'jetis-kulon',
    },
    {
      email: 'kasir.prapen@warkopyareh.local',
      name: 'Kasir Prapen',
      password: getSeedPassword('SEED_CASHIER_PASSWORD', 'Kasir123!'),
      role: Role.CASHIER,
      branchId: 'prapen',
    },
  ];

  for (const staff of staffAccounts) {
    const passwordHash = await hashPassword(staff.password);
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        role: staff.role,
        branchId: staff.branchId,
      },
      create: {
        email: staff.email,
        name: staff.name,
        passwordHash,
        role: staff.role,
        branchId: staff.branchId,
        membershipTier: 'BRONZE',
        loyaltyPoints: 0,
      },
    });
    console.log(`👤 Staff Account: ${user.email} (${user.role}) -> ${user.branchId}`);
  }

  console.log('\n🎉 Reality Seed completed successfully!');
  console.log('─────────────────────────────────────────');
  console.log("Branches: Jetis Kulon & Prapen (24 Hours)");
  console.log("Menu: Empty (Rp1–25.000/person spending range preserved)");
  console.log('Admin: admin@warkopyareh.local');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
