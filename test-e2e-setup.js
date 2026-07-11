const { PrismaClient } = require('./packages/database/generated/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dev database on port 5433...');

  // Create branch if not exists
  const branch = await prisma.branch.upsert({
    where: { id: 'branch_123' },
    update: {},
    create: {
      id: 'branch_123',
      name: 'Surabaya Main Branch',
      slug: 'surabaya-main',
      address: 'Jalan Raya Gubeng No. 123',
      city: 'Surabaya',
      province: 'Jawa Timur',
      isActive: true,
    }
  });
  console.log('Upserted branch:', branch.name);

  // Create category
  const category = await prisma.category.upsert({
    where: { slug: 'coffee' },
    update: {},
    create: {
      id: 'cat_coffee',
      name: 'Coffee',
      slug: 'coffee',
      isActive: true,
    }
  });
  console.log('Upserted category:', category.name);

  // Create product
  const product = await prisma.product.upsert({
    where: { id: 'prod_123' },
    update: {},
    create: {
      id: 'prod_123',
      name: 'Es Kopi Susu Yareh',
      slug: 'es-kopi-susu-yareh',
      description: 'Signature palm sugar iced coffee',
      price: 25000,
      categoryId: 'cat_coffee',
      isActive: true,
    }
  });
  console.log('Upserted product:', product.name);

  // Link product to branch
  await prisma.branchProduct.upsert({
    where: { branchId_productId: { branchId: 'branch_123', productId: 'prod_123' } },
    update: {},
    create: {
      branchId: 'branch_123',
      productId: 'prod_123',
      isAvailable: true,
    }
  });
  console.log('Linked product to branch');

  // Create table
  const table = await prisma.table.upsert({
    where: { id: 'table_123' },
    update: {},
    create: {
      id: 'table_123',
      branchId: 'branch_123',
      number: '1',
      name: 'Table 1',
      capacity: 4,
      type: 'INDOOR',
      qrCode: 'qr_table_1',
      status: 'AVAILABLE',
    }
  });
  console.log('Upserted table:', table.number);

  // Create CommunityGroup
  const group = await prisma.communityGroup.upsert({
    where: { slug: 'coffee-lovers' },
    update: {},
    create: {
      id: 'group_123',
      name: 'Coffee Lovers',
      slug: 'coffee-lovers',
      description: 'A community group for coffee enthusiasts.',
      category: 'Coffee',
      isActive: true,
    }
  });
  console.log('Upserted community group:', group.name);

  console.log('Database seeding complete!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
