/**
 * Cold 'N Brew Gubeng — Database Seed
 * =====================================
 * Seeds: categories, products (menu items), tables, branch, staff accounts
 *
 * Run: pnpm --filter @warkop-yareh/database db:seed
 */

import { PrismaClient, Role, TableType, TableStatus } from '../generated/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const BRANCH_ID = 'coldnbrew-gubeng-001'; // Fixed ID for single-branch

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting Cold \'N Brew seed...');

  // ── 1. Upsert Branch ─────────────────────────────────────────────────────
  const branch = await prisma.branch.upsert({
    where: { id: BRANCH_ID },
    update: {},
    create: {
      id: BRANCH_ID,
      name: "Cold 'N Brew Gubeng",
      slug: 'coldnbrew-gubeng',
      address: 'Jl. Gubeng Pojok No. 10',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60281',
      phone: '+62 812-3456-7890',
      email: 'gubeng@coldnbrew.id',
      latitude: -7.265,
      longitude: 112.7508,
      isMainBranch: true,
      isActive: true,
      capacity: 80,
      features: ['WiFi Kencang', 'Meeting Room', 'Drive Thru', 'Indoor & Outdoor'],
      weekdayHours: '00:00-24:00', // 24 hours
      weekendHours: '00:00-24:00',
    },
  });
  console.log(`✅ Branch: ${branch.name}`);

  // ── 2. Categories ─────────────────────────────────────────────────────────
  const categories = [
    { slug: 'espresso',    name: 'Espresso',    icon: '☕', sortOrder: 1 },
    { slug: 'cold-brew',   name: 'Cold Brew',   icon: '🧊', sortOrder: 2 },
    { slug: 'non-coffee',  name: 'Non-Coffee',  icon: '🧋', sortOrder: 3 },
    { slug: 'snacks',      name: 'Snacks',      icon: '🍪', sortOrder: 4 },
    { slug: 'main-course', name: 'Main Course', icon: '🍽️', sortOrder: 5 },
    { slug: 'desserts',    name: 'Desserts',    icon: '🍰', sortOrder: 6 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { ...cat, isActive: true },
    });
    categoryMap[cat.slug] = created.id;
    console.log(`  📂 Category: ${cat.name}`);
  }

  // ── 3. Products (Menu Items) ──────────────────────────────────────────────
  const products = [
    // Espresso (8 items)
    { name: 'Americano', slug: 'americano', description: 'Espresso shots diluted with hot water. Clean, bold, refreshing.', price: 22000, categorySlug: 'espresso', isPopular: true, preparationTime: 3 },
    { name: 'Cappuccino', slug: 'cappuccino', description: 'Double espresso with steamed milk and velvety microfoam.', price: 28000, categorySlug: 'espresso', isPopular: true, preparationTime: 5 },
    { name: 'Caramel Latte', slug: 'caramel-latte', description: 'Espresso, steamed milk, house-made caramel sauce.', price: 32000, categorySlug: 'espresso', isPopular: true, preparationTime: 5 },
    { name: 'Flat White', slug: 'flat-white', description: 'Ristretto shots with microfoam — stronger than latte, silkier than cappuccino.', price: 32000, categorySlug: 'espresso', preparationTime: 5 },
    { name: 'Espresso', slug: 'espresso-shot', description: 'Pure single or double shot. Intense, aromatic, the foundation.', price: 18000, categorySlug: 'espresso', preparationTime: 2 },
    { name: 'Macchiato', slug: 'macchiato', description: 'Espresso marked with a dollop of foamed milk.', price: 24000, categorySlug: 'espresso', preparationTime: 3 },
    { name: 'Cortado', slug: 'cortado', description: 'Equal parts espresso and warm milk to reduce acidity.', price: 26000, categorySlug: 'espresso', preparationTime: 4 },
    { name: 'Long Black', slug: 'long-black', description: 'Hot water with double ristretto on top. Crema preserved.', price: 24000, categorySlug: 'espresso', preparationTime: 3 },

    // Cold Brew (6 items)
    { name: 'Classic Cold Brew', slug: 'classic-cold-brew', description: '18-hour cold-steeped Colombian single origin. Smooth, no bitterness.', price: 35000, categorySlug: 'cold-brew', isPopular: true, preparationTime: 2 },
    { name: 'Cold Brew Tonic', slug: 'cold-brew-tonic', description: 'Cold brew over sparkling tonic water. Bright, effervescent, addictive.', price: 38000, categorySlug: 'cold-brew', isPopular: true, preparationTime: 3 },
    { name: 'Salted Caramel Cold Brew', slug: 'salted-caramel-cold-brew', description: 'Cold brew with house salted caramel syrup and cream float.', price: 42000, categorySlug: 'cold-brew', preparationTime: 4 },
    { name: 'Cold Brew Latte', slug: 'cold-brew-latte', description: 'Cold brew concentrate over fresh milk. Creamy, cold perfection.', price: 38000, categorySlug: 'cold-brew', preparationTime: 3 },
    { name: 'Nitro Cold Brew', slug: 'nitro-cold-brew', description: 'Cold brew infused with nitrogen for creamy texture without dairy.', price: 45000, categorySlug: 'cold-brew', preparationTime: 2 },
    { name: 'Cold Brew Float', slug: 'cold-brew-float', description: 'Cold brew with vanilla ice cream float. Dessert meets coffee.', price: 48000, categorySlug: 'cold-brew', preparationTime: 5 },

    // Non-Coffee (7 items)
    { name: 'Matcha Latte', slug: 'matcha-latte', description: 'Ceremonial grade Japanese matcha with oat milk. Earthy, creamy.', price: 35000, categorySlug: 'non-coffee', isPopular: true, preparationTime: 5 },
    { name: 'Taro Latte', slug: 'taro-latte', description: 'Purple taro blend with fresh milk. Sweet, nutty, vibrant.', price: 32000, categorySlug: 'non-coffee', isPopular: true, preparationTime: 5 },
    { name: 'Chocolate Avocado', slug: 'chocolate-avocado', description: 'Blended fresh avocado with dark chocolate and milk. Rich, indulgent.', price: 38000, categorySlug: 'non-coffee', preparationTime: 7 },
    { name: 'Strawberry Milk', slug: 'strawberry-milk', description: 'Fresh strawberry puree with cold milk. Simple and refreshing.', price: 28000, categorySlug: 'non-coffee', preparationTime: 4 },
    { name: 'Es Jeruk Peras', slug: 'es-jeruk-peras', description: 'Freshly squeezed Indonesian orange juice over ice. Vitamin-packed.', price: 22000, categorySlug: 'non-coffee', preparationTime: 3 },
    { name: 'Lychee Sparkling', slug: 'lychee-sparkling', description: 'Lychee syrup with sparkling water and basil seeds.', price: 28000, categorySlug: 'non-coffee', preparationTime: 3 },
    { name: 'Blue Lemonade', slug: 'blue-lemonade', description: 'Butterfly pea flower lemonade. Color-changing, Instagram-worthy.', price: 30000, categorySlug: 'non-coffee', isNew: true, preparationTime: 4 },

    // Snacks (6 items)
    { name: 'Croissant Mentega', slug: 'croissant-mentega', description: 'Flaky, buttery French croissant baked daily in-house.', price: 25000, categorySlug: 'snacks', preparationTime: 2 },
    { name: 'Banana Bread', slug: 'banana-bread', description: 'Moist house-baked banana bread with walnut topping.', price: 22000, categorySlug: 'snacks', preparationTime: 2 },
    { name: 'Cheese Toast', slug: 'cheese-toast', description: 'Thick toast with premium melted cheese. Perfect with coffee.', price: 28000, categorySlug: 'snacks', isPopular: true, preparationTime: 5 },
    { name: 'Cookies & Cream Brownie', slug: 'cookies-cream-brownie', description: 'Dense fudgy brownie with cookies & cream topping.', price: 28000, categorySlug: 'snacks', preparationTime: 2 },
    { name: 'Granola Bar', slug: 'granola-bar', description: 'House-made oat granola bar with honey and dried fruits.', price: 18000, categorySlug: 'snacks', preparationTime: 1 },
    { name: 'Karipap (Curry Puff)', slug: 'karipap', description: 'Crispy pastry filled with spiced chicken potato curry.', price: 20000, categorySlug: 'snacks', preparationTime: 3 },

    // Main Course (5 items)
    { name: 'Nasi Goreng Kampung', slug: 'nasi-goreng-kampung', description: 'Indonesian village-style fried rice with egg, acar, and kerupuk.', price: 38000, categorySlug: 'main-course', isPopular: true, preparationTime: 12 },
    { name: 'Mie Goreng Spesial', slug: 'mie-goreng-spesial', description: 'Wok-fried noodles with chicken, vegetables, and spicy sambal.', price: 35000, categorySlug: 'main-course', preparationTime: 12 },
    { name: 'Sandwich Club', slug: 'sandwich-club', description: 'Triple-decker with chicken, egg, tomato, lettuce, and mayo.', price: 42000, categorySlug: 'main-course', preparationTime: 10 },
    { name: 'Pasta Aglio e Olio', slug: 'pasta-aglio-olio', description: 'Spaghetti with garlic, olive oil, chili flakes, and parmesan.', price: 45000, categorySlug: 'main-course', preparationTime: 15 },
    { name: 'Ayam Geprek Sambal Matah', slug: 'ayam-geprek-sambal-matah', description: 'Crispy smashed fried chicken with Balinese raw sambal matah.', price: 40000, categorySlug: 'main-course', isPopular: true, preparationTime: 15 },

    // Desserts (5 items)
    { name: 'Lava Cake', slug: 'lava-cake', description: 'Warm dark chocolate molten cake with vanilla ice cream.', price: 45000, categorySlug: 'desserts', isPopular: true, preparationTime: 12 },
    { name: 'Crème Brûlée', slug: 'creme-brulee', description: 'Classic French custard with caramelized sugar crust.', price: 48000, categorySlug: 'desserts', preparationTime: 5 },
    { name: 'Tiramisu', slug: 'tiramisu', description: 'House tiramisu with mascarpone and cold brew soaked ladyfingers.', price: 45000, categorySlug: 'desserts', preparationTime: 3 },
    { name: 'Mochi Ice Cream', slug: 'mochi-ice-cream', description: 'Japanese mochi filled with premium ice cream (3 pcs).', price: 35000, categorySlug: 'desserts', preparationTime: 2 },
    { name: 'Pudding Susu', slug: 'pudding-susu', description: 'Silky Indonesian milk pudding with caramel sauce.', price: 25000, categorySlug: 'desserts', preparationTime: 2 },
  ];

  for (const item of products) {
    const { categorySlug, ...productData } = item;
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        isPopular: item.isPopular ?? false,
        isNew: (item as { isNew?: boolean }).isNew ?? false,
        preparationTime: item.preparationTime,
      },
      create: {
        ...productData,
        description: item.description,
        categoryId: categoryMap[categorySlug]!,
        isPopular: item.isPopular ?? false,
        isNew: (item as { isNew?: boolean }).isNew ?? false,
        isActive: true,
        rating: 0,
        reviewCount: 0,
        preparationTime: item.preparationTime,
        sortOrder: 0,
      },
    });

    // Create BranchProduct entry (availability at this branch)
    await prisma.branchProduct.upsert({
      where: { branchId_productId: { branchId: BRANCH_ID, productId: product.id } },
      update: { isAvailable: true },
      create: { branchId: BRANCH_ID, productId: product.id, isAvailable: true },
    });
  }
  console.log(`✅ Products: ${products.length} items seeded`);

  // ── 4. Tables ─────────────────────────────────────────────────────────────
  const tables = [
    { number: '1', name: 'Table 1', type: TableType.INDOOR, capacity: 4, zone: 'Main Hall' },
    { number: '2', name: 'Table 2', type: TableType.INDOOR, capacity: 4, zone: 'Main Hall' },
    { number: '3', name: 'Table 3', type: TableType.INDOOR, capacity: 4, zone: 'Main Hall' },
    { number: '4', name: 'Table 4', type: TableType.INDOOR, capacity: 6, zone: 'Main Hall' },
    { number: '5', name: 'Table 5', type: TableType.INDOOR, capacity: 2, zone: 'Window Seat' },
    { number: '6', name: 'Table 6', type: TableType.INDOOR, capacity: 2, zone: 'Window Seat' },
    { number: '7', name: 'Table 7', type: TableType.OUTDOOR, capacity: 4, zone: 'Outdoor' },
    { number: '8', name: 'Table 8', type: TableType.OUTDOOR, capacity: 6, zone: 'Outdoor' },
    { number: 'MR-A', name: 'Meeting Room A', type: TableType.MEETING_ROOM, capacity: 10, zone: 'Meeting' },
    { number: 'MR-B', name: 'Meeting Room B', type: TableType.MEETING_ROOM, capacity: 6, zone: 'Meeting' },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { branchId_number: { branchId: BRANCH_ID, number: table.number } },
      update: { status: TableStatus.AVAILABLE },
      create: {
        branchId: BRANCH_ID,
        number: table.number,
        name: table.name,
        type: table.type,
        capacity: table.capacity,
        zone: table.zone,
        status: TableStatus.AVAILABLE,
        isActive: true,
      },
    });
  }
  console.log(`✅ Tables: ${tables.length} tables seeded`);

  // ── 4.5 Rewards ───────────────────────────────────────────────────────────
  const rewards = [
    {
      name: 'Nitro Cold Brew',
      description: '12-hour steeped Arabica infused with nitrogen for a silky, stout-like finish.',
      pointsCost: 500,
      category: 'Beverage',
      tier: 'BRONZE' as const,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYw602AtnbJJESMy_bdiuZotsmjhWjgb1zYnkFm8Jv7mcz0mhNhUzQbEM8MiZDyIoORvjmKYYUFqP-tLrTv3ForjZjgbs157Mgdp3wlCzk2sd99lc2Q0eBZYE1JqZOTW9VG54gUA5e9eYZA_3rzhKIySMKzCFu_K4mwlkk0_oBjtxOGVPAiUT5Axje5CkB-v2drmsLa_NA2fxTtc1LaAI2UOHz8Ub4kDAfRGdY7Y2s7F-kIJEiuFG92Os5BLrVRZ80k7mTWW_20uM',
    },
    {
      name: 'Toraja V60',
      description: 'Single origin Toraja beans with notes of dark chocolate and spice.',
      pointsCost: 400,
      category: 'Beverage',
      tier: 'BRONZE' as const,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsM3-HY4GAvMpIfbfFT0aBkFCSTAcRQNEJybzNt50RN_34cUanMbufTtS6q2pYs4puDX-TocpHvqncY7mZyrgeyWn4t7A6stWlS2U0Hmd9Tm8lhukWAcjCAm8wZcNCXvSSa01fcfVDJudwPPxOIZKJeAn-6qv_7_T-Ja9xvpg4VfkGdEjlIPC0ExGjNKFWpbHZX1C1ilqjL-U38pGCVJk49XcrkRS5l4LBHwdtvLJFthybooFUCJN7FO2JccoIcprlkW3pH4E3uuY',
    },
  ];

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.name.toLowerCase().replace(/\s+/g, '-') },
      update: {
        pointsCost: r.pointsCost,
        isAvailable: true,
      },
      create: {
        id: r.name.toLowerCase().replace(/\s+/g, '-'),
        name: r.name,
        description: r.description,
        pointsCost: r.pointsCost,
        category: r.category,
        tier: r.tier,
        image: r.image,
        isAvailable: true,
      },
    });
  }
  console.log(`✅ Rewards: ${rewards.length} rewards seeded`);

  // ── 5. Staff Accounts ─────────────────────────────────────────────────────
  const staffAccounts = [
    {
      email: 'admin@coldnbrew.id',
      name: 'Admin Cold N Brew',
      password: 'Admin123!',
      role: Role.ADMIN,
    },
    {
      email: 'kasir@coldnbrew.id',
      name: 'Kasir Gubeng',
      password: 'Kasir123!',
      role: Role.CASHIER,
    },
    {
      email: 'kitchen@coldnbrew.id',
      name: 'Kitchen Staff',
      password: 'Kitchen123!',
      role: Role.KITCHEN,
    },
  ];

  for (const staff of staffAccounts) {
    const passwordHash = await hashPassword(staff.password);
    await prisma.user.upsert({
      where: { email: staff.email },
      update: { role: staff.role },
      create: {
        email: staff.email,
        name: staff.name,
        passwordHash,
        role: staff.role,
        branchId: BRANCH_ID,
        membershipTier: 'BRONZE',
        loyaltyPoints: 0,
      },
    });
    console.log(`  👤 Staff: ${staff.email} (${staff.role}) — password: ${staff.password}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────────');
  console.log('Test credentials:');
  console.log('  Admin:   admin@coldnbrew.id  / Admin123!');
  console.log('  Kasir:   kasir@coldnbrew.id  / Kasir123!');
  console.log('  Kitchen: kitchen@coldnbrew.id / Kitchen123!');
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
