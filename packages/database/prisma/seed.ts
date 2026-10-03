/**
 * Warkop Ya'reh — Truthful Reality Database Seed (Phase 1.5)
 * =========================================================
 * Authoritative Business Domain Seed
 *
 * Rules:
 * 1. Seed ONLY verified branches (Jetis Kulon & Prapen)
 * 2. Menu seed is strictly EMPTY (spending range: Rp1–25.000/person; item prices unverified)
 * 3. Administrative accounts use neutral domain (@warkopyareh.local)
 * 4. Never delete historical data or invent coordinates/capacity
 *
 * Run: pnpm --filter @warkop-yareh/database run db:seed
 */

import {
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { VERIFIED_BRANCHES } from '@warkop-yareh/types';

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

async function main() {
  console.log("Starting Warkop Ya'reh verified branch seed");

  // This seed is additive. Legacy data must be classified before any cleanup.
  for (const fixture of VERIFIED_BRANCHES) {
    const b = {
      id: fixture.id,
      name: fixture.name,
      slug: fixture.slug,
      brandName: fixture.brandName,
      address: [
        fixture.address.street,
        fixture.address.subdistrict,
        fixture.address.district,
        fixture.address.city,
        `${fixture.address.province} ${fixture.address.postalCode}`,
      ].join(', '),
      city: fixture.address.city,
      province: fixture.address.province,
      postalCode: fixture.address.postalCode,
      plusCode: fixture.plusCode,
      phone: fixture.phone,
      email: null,
      latitude: null,
      longitude: null,
      isMainBranch: fixture.isMainBranch,
      isActive: true,
      capacity: null,
      features: fixture.servicesSupported.map((mode) =>
        mode === 'DINE_IN' ? 'Dine-in' : 'Takeaway',
      ),
      weekdayHours: null,
      weekendHours: null,
    };
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
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      await prisma.businessHour.upsert({
        where: { branchId_dayOfWeek: { branchId: upserted.id, dayOfWeek } },
        update: { openTime: '00:00', closeTime: '24:00', is24Hours: true, isOpen: true },
        create: { branchId: upserted.id, dayOfWeek, openTime: '00:00', closeTime: '24:00', is24Hours: true, isOpen: true },
      });
    }
    console.log(`Verified branch: ${upserted.name} (${upserted.id})`);
  }

  // ── 2. Production Menu Seed: Intentionally Empty ──────────────────────────
  // Per docs/business/MENU.md: Venue spending range (Rp1–25.000/person) is verified,
  // but itemized catalog and prices are UNVERIFIED. Zero products are seeded.
  console.log('ℹ️  Menu Catalog: 0 products seeded (Production catalog pending physical menu verification).');

  // ── 3. Administrative Staff Accounts (Bootstrap / Technical Only — Non-Public) ──
  // IMPORTANT: These accounts are for initial local/staging system access only.
  // They are NOT public business contacts and MUST NEVER be exposed on customer surfaces.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_BOOTSTRAP_STAFF !== 'true') {
    console.log('Production staff bootstrap skipped; set SEED_BOOTSTRAP_STAFF=true with explicit passwords to opt in.');
    return;
  }

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
