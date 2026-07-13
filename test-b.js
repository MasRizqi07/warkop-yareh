const { Client } = require('pg');
const http = require('http');

function request(path, method, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function requestPost(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db'
  });
  await client.connect();

  const branchA = 'branch_a_rls';
  const branchB = 'branch_b_rls';
  const now = new Date().toISOString();

  // 1. Seed two branches (Branch A, Branch B)
  await client.query(`INSERT INTO branches (id, name, slug, address, city, province, "updatedAt") VALUES ('${branchA}', 'A', 'a-rls', 'A', 'A', 'A', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO branches (id, name, slug, address, city, province, "updatedAt") VALUES ('${branchB}', 'B', 'b-rls', 'B', 'B', 'B', '${now}') ON CONFLICT DO NOTHING`);
  
  // Seed tables
  await client.query(`INSERT INTO tables (id, "branchId", number, status, name, capacity, "qrCode", "updatedAt") VALUES ('table_a_1_rls', '${branchA}', 'A1', 'AVAILABLE', 'Table A1', 4, 'qr_A1_rls', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO tables (id, "branchId", number, status, name, capacity, "qrCode", "updatedAt") VALUES ('table_b_1_rls', '${branchB}', 'B1', 'AVAILABLE', 'Table B1', 4, 'qr_B1_rls', '${now}') ON CONFLICT DO NOTHING`);

  // Seed events
  await client.query(`INSERT INTO events (id, "branchId", title, slug, description, date, "startTime", "endTime", location, capacity, status, "updatedAt") VALUES ('event_a_rls', '${branchA}', 'Event A', 'evt-a-rls', 'Desc', '${now}', '10:00', '12:00', 'Room A', 100, 'UPCOMING', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO events (id, "branchId", title, slug, description, date, "startTime", "endTime", location, capacity, status, "updatedAt") VALUES ('event_b_rls', '${branchB}', 'Event B', 'evt-b-rls', 'Desc', '${now}', '10:00', '12:00', 'Room B', 100, 'UPCOMING', '${now}') ON CONFLICT DO NOTHING`);

  // Seed branch_products
  await client.query(`INSERT INTO categories (id, name, slug, "updatedAt") VALUES ('cat_rls', 'Cat', 'cat-rls', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO products (id, name, slug, description, price, "categoryId", "isActive", "updatedAt") VALUES ('prod_1_rls', 'Prod1', 'p1-rls', 'Desc', 1000, 'cat_rls', true, '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO branch_products (id, "branchId", "productId", "isAvailable", "priceOverride") VALUES ('bp_a_rls', '${branchA}', 'prod_1_rls', true, 1000) ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO branch_products (id, "branchId", "productId", "isAvailable", "priceOverride") VALUES ('bp_b_rls', '${branchB}', 'prod_1_rls', true, 1000) ON CONFLICT DO NOTHING`);

  // Seed franchise_agreements
  await client.query(`INSERT INTO franchise_agreements (id, "branchId", "ownerName", "ownerEmail", "agreementStart", "monthlyFee", status, "updatedAt") VALUES ('fa_a_rls', '${branchA}', 'Owner A', 'a@a.com', '${now}', 500, 'ACTIVE', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO franchise_agreements (id, "branchId", "ownerName", "ownerEmail", "agreementStart", "monthlyFee", status, "updatedAt") VALUES ('fa_b_rls', '${branchB}', 'Owner B', 'b@b.com', '${now}', 500, 'ACTIVE', '${now}') ON CONFLICT DO NOTHING`);

  // Seed users
  await client.query(`INSERT INTO users (id, email, name, role, "referralCode", "updatedAt") VALUES ('usr1', 'usr1@test.com', 'User 1', 'CUSTOMER', 'ref1', '${now}') ON CONFLICT DO NOTHING`);

  // Seed reservations
  await client.query(`INSERT INTO reservations (id, "userId", "branchId", date, "startTime", "endTime", "guestCount", status, "updatedAt") VALUES ('res_a_rls', 'usr1', '${branchA}', '2026-07-20', '18:00', '20:00', 2, 'PENDING', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO reservations (id, "userId", "branchId", date, "startTime", "endTime", "guestCount", status, "updatedAt") VALUES ('res_b_rls', 'usr1', '${branchB}', '2026-07-20', '18:00', '20:00', 2, 'PENDING', '${now}') ON CONFLICT DO NOTHING`);

  // 2. Authenticate as Branch A staff
  const emailStaff = `staff_${Date.now()}@test.com`;
  await requestPost('/api/v1/auth/register', 'POST', { name: 'Staff A RLS', email: emailStaff, password: 'password' });
  await client.query(`UPDATE users SET role = 'STAFF', "branchId" = '${branchA}' WHERE email = '${emailStaff}'`);
  const login = await requestPost('/api/v1/auth/login', 'POST', { email: emailStaff, password: 'password' });
  const token = login.data?.data?.accessToken;

  console.log("\\n=== TESTING reservations ===");
  const resSame = await request(`/api/v1/reservations?branchId=${branchA}`, 'GET', token);
  console.log("Same-branch:", JSON.stringify(resSame.data));
  const resCross = await request(`/api/v1/reservations?branchId=${branchB}`, 'GET', token);
  console.log("Cross-branch:", JSON.stringify(resCross.data));

  console.log("\\n=== TESTING tables ===");
  const tabSame = await request(`/api/v1/branches/${branchA}/tables`, 'GET', token);
  console.log("Same-branch:", JSON.stringify(tabSame.data));
  const tabCross = await request(`/api/v1/branches/${branchB}/tables`, 'GET', token);
  console.log("Cross-branch:", JSON.stringify(tabCross.data));

  console.log("\\n=== TESTING events ===");
  const evt = await request(`/api/v1/test-rls/events`, 'GET', token);
  console.log("Events returned:", evt.data?.data?.map(e => e.id));
  console.log("Raw info:", evt.data?.raw);

  console.log("\\n=== TESTING branch_products ===");
  const bp = await request(`/api/v1/test-rls/branch_products`, 'GET', token);
  console.log("Branch products returned:", bp.data?.data?.map(e => e.id));

  console.log("\\n=== TESTING franchise_agreements ===");
  const fa = await request(`/api/v1/test-rls/franchise_agreements`, 'GET', token);
  console.log("Franchise agreements returned:", fa.data?.data?.map(e => e.id));

  await client.end();
}
main();
