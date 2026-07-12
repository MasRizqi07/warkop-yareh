const { PrismaClient } = require('./packages/database/generated/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  
  // 1. Create Branches
  const branchA = await prisma.branch.create({
    data: { name: 'Branch A6 - RLS Test', slug: 'branch-a6-rls', address: 'Addr A', city: 'City A', province: 'Prov A' }
  });
  const branchB = await prisma.branch.create({
    data: { name: 'Branch B6 - RLS Test', slug: 'branch-b6-rls', address: 'Addr B', city: 'City B', province: 'Prov B' }
  });
  
  console.log(`Branch A: ${branchA.id}`);
  console.log(`Branch B: ${branchB.id}`);

  // 2. Create tables in Branch B
  const table = await prisma.table.create({
    data: {
      branchId: branchB.id,
      number: '99',
      name: 'Table 99',
      capacity: 4
    }
  });

  // 3. Register a user via API
  const http = require('http');
  const email = 'staff_a6_rls@test.com';
  
  const registerReq = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', async () => {
      // 4. Update user role and branchId via Prisma
      const user = await prisma.user.update({
        where: { email },
        data: { role: 'STAFF', branchId: branchA.id }
      });
      
      // 5. Login via API to get token
      const loginReq = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res2) => {
        let body2 = '';
        res2.on('data', (c) => body2 += c);
        res2.on('end', () => {
          const data = JSON.parse(body2);
          const token = data.data?.accessToken;
          console.log(`\nexport BRANCH_B_ID=${branchB.id}`);
          console.log(`export STAFFA_TOKEN=${token}`);
          console.log(`\nTry curl:`);
          console.log(`curl.exe -s -i http://localhost:4000/api/v1/tables/branch/${branchB.id} -H "Authorization: Bearer ${token}" -H "x-branch-id: ${branchA.id}"`);
          prisma.$disconnect();
        });
      });
      loginReq.write(JSON.stringify({ email, password: 'password' }));
      loginReq.end();
    });
  });
  registerReq.write(JSON.stringify({ name: 'Staff A6 RLS', email, password: 'password' }));
  registerReq.end();
}
main().catch(console.error);
