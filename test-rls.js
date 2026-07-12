const fs = require('fs');
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

async function run() {
  try {
    // 1. Create two branches via admin
    console.log('Registering admin...');
    const admin = await request('/api/v1/auth/register', 'POST', { name: 'Admin', email: 'admin_rls@test.com', password: 'password' });
    const adminToken = admin.data?.tokens?.accessToken;
    
    console.log('Creating Branch A...');
    const branchA = await request('/api/v1/branches', 'POST', { name: 'Branch A', location: 'Loc A' }, adminToken);
    const branchAId = branchA.data.id;
    console.log('Branch A ID:', branchAId);

    console.log('Creating Branch B...');
    const branchB = await request('/api/v1/branches', 'POST', { name: 'Branch B', location: 'Loc B' }, adminToken);
    const branchBId = branchB.data.id;
    console.log('Branch B ID:', branchBId);

    // 2. Create tables in Branch B
    console.log('Creating Table in Branch B...');
    const tableRes = await request('/api/v1/tables', 'POST', { branchId: branchBId, tableNumber: 1, capacity: 4 }, adminToken);
    console.log('Table created:', tableRes.data);

    // 3. Register user for Branch A
    console.log('Registering Staff A...');
    const staffA = await request('/api/v1/auth/register', 'POST', { name: 'Staff A', email: 'staffa@test.com', password: 'password' });
    const staffAToken = staffA.data?.tokens?.accessToken;

    // 4. Staff A tries to read tables of Branch B
    console.log('Staff A fetching tables (expected empty or 403 due to RLS)...');
    const result = await request(`/api/v1/tables/branch/${branchBId}`, 'GET', null, staffAToken, branchAId);
    
    console.log('--- RAW RESULT ---');
    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(err);
  }
}
run();
