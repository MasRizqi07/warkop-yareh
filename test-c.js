const { Client } = require('pg');
const http = require('http');

function request(path, method, body, token) {
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

  const branchId = 'branch_A_test';

  // Create CUSTOMER
  const emailCust = `cust_${Date.now()}@test.com`;
  await request('/api/v1/auth/register', 'POST', { name: 'Customer C', email: emailCust, password: 'password' });
  const custLogin = await request('/api/v1/auth/login', 'POST', { email: emailCust, password: 'password' });
  const custToken = custLogin.data?.data?.accessToken;
  const custId = custLogin.data?.data?.user?.id;

  // Create STAFF
  const emailStaff = `staff_${Date.now()}@test.com`;
  await request('/api/v1/auth/register', 'POST', { name: 'Staff C', email: emailStaff, password: 'password' });
  await client.query(`UPDATE users SET role = 'STAFF', "branchId" = '${branchId}' WHERE email = '${emailStaff}'`);
  const staffLogin = await request('/api/v1/auth/login', 'POST', { email: emailStaff, password: 'password' });
  const staffToken = staffLogin.data?.data?.accessToken;

  // Create reservation for customer
  const resId = `res_${Date.now()}`;
  await client.query(`INSERT INTO reservations (id, "userId", "branchId", date, "startTime", "endTime", "guestCount", status, "updatedAt") 
    VALUES ('${resId}', '${custId}', '${branchId}', '2026-07-20', '18:00', '20:00', 2, 'PENDING', '${new Date().toISOString()}')`);

  console.log("\\n=== CUSTOMER ATTEMPTING TO SET CONFIRMED ===");
  const attempt1 = await request(`/api/v1/reservations/${resId}/status`, 'PATCH', { status: 'CONFIRMED' }, custToken);
  console.log("Status:", attempt1.status);
  console.log("Response:", JSON.stringify(attempt1.data));

  console.log("\\n=== CUSTOMER ATTEMPTING TO CANCEL ===");
  const attempt2 = await request(`/api/v1/reservations/${resId}/status`, 'PATCH', { status: 'CANCELLED' }, custToken);
  console.log("Status:", attempt2.status);
  console.log("Response:", JSON.stringify(attempt2.data));

  // Reset to PENDING for staff test
  await client.query(`UPDATE reservations SET status = 'PENDING' WHERE id = '${resId}'`);

  console.log("\\n=== STAFF ATTEMPTING TO SET CONFIRMED ===");
  const attempt3 = await request(`/api/v1/reservations/${resId}/status`, 'PATCH', { status: 'CONFIRMED' }, staffToken);
  console.log("Status:", attempt3.status);
  console.log("Response:", JSON.stringify(attempt3.data));

  await client.end();
}
main();
