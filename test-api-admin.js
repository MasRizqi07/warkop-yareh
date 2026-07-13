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
  const email = 'superadmin_12345@test.com';
  // Login
  const loginRes = await request('/api/v1/auth/login', 'POST', { email, password: 'password' });
  const token = loginRes.data?.data?.accessToken;
  
  if (token) {
    // Fetch tables for branch_123
    const tablesRes = await request('/api/v1/tables/branch/branch_123', 'GET', null, token);
    console.log("API Tables Response:");
    console.log(JSON.stringify(tablesRes.data, null, 2));
  }
}
main();
