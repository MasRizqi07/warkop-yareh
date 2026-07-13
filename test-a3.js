const { Client } = require('pg');
const http = require('http');

function request(path, method, body, token, branchId) {
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
          ...(branchId ? { 'X-Branch-Id': branchId } : {}),
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

  console.log("=== MANUAL PSQL CHECK ===");
  const res = await client.query("SELECT current_setting('app.current_branch_id', true) as branch_id");
  console.log("current_setting('app.current_branch_id', true):", res.rows[0].branch_id);

  // Set up data via pg
  const branchA = 'branch_A_test';
  const branchB = 'branch_B_test';
  const now = new Date().toISOString();
  
  await client.query(`INSERT INTO branches (id, name, slug, address, city, province, "updatedAt") VALUES ('${branchA}', 'A', 'a', 'A', 'A', 'A', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO branches (id, name, slug, address, city, province, "updatedAt") VALUES ('${branchB}', 'B', 'b', 'B', 'B', 'B', '${now}') ON CONFLICT DO NOTHING`);
  
  await client.query(`INSERT INTO tables (id, "branchId", number, status, name, capacity, "qrCode", "updatedAt") VALUES ('table_A_1', '${branchA}', 'A1', 'AVAILABLE', 'Table A1', 4, 'qr_A1', '${now}') ON CONFLICT DO NOTHING`);
  await client.query(`INSERT INTO tables (id, "branchId", number, status, name, capacity, "qrCode", "updatedAt") VALUES ('table_B_1', '${branchB}', 'B1', 'AVAILABLE', 'Table B1', 4, 'qr_B1', '${now}') ON CONFLICT DO NOTHING`);

  // Direct queries
  const aTables = await client.query(`SELECT * FROM tables WHERE "branchId" = '${branchA}'`);
  console.log("\\n=== DIRECT DB QUERY (Branch A) ===");
  console.log(aTables.rows.map(t => t.id));

  // Register staff A
  await request('/api/v1/auth/register', 'POST', { name: 'Staff A', email: 'staffa12345678@test.com', password: 'password' });
  await client.query(`UPDATE users SET role = 'STAFF', "branchId" = '${branchA}' WHERE email = 'staffa12345678@test.com'`);
  
  const loginA = await request('/api/v1/auth/login', 'POST', { email: 'staffa12345678@test.com', password: 'password' });
  const tokenA = loginA.data?.data?.accessToken;

  console.log("\\n=== SAME-BRANCH API TEST (Staff A -> Branch A) ===");
  const apiA = await request(`/api/v1/tables/branch/${branchA}`, 'GET', null, tokenA);
  console.log("Status:", apiA.status);
  console.log("Data length:", apiA.data.data?.length);
  if (apiA.data.data) console.log("Table IDs:", apiA.data.data.map(t => t.id));

  console.log("\\n=== CROSS-BRANCH API TEST (Staff A -> Branch B) ===");
  const apiB = await request(`/api/v1/tables/branch/${branchB}`, 'GET', null, tokenA);
  console.log("Status:", apiB.status);
  console.log("Response:", JSON.stringify(apiB.data));

  await client.end();
}
main();
