const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (body) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(options, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: resBody ? JSON.parse(resBody) : null });
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    // 1. Register Customer
    const cus = await request('/api/v1/auth/register', 'POST', { name: 'Customer', email: 'cus7@test.com', password: 'password' });
    console.log('Customer Register:', cus.status);
    console.log(JSON.stringify(cus.data, null, 2));

    const cusLog = await request('/api/v1/auth/login', 'POST', { email: 'cus7@test.com', password: 'password' });
    const cusToken = cusLog.data?.data?.accessToken;
    console.log('Customer Token:', cusToken ? 'RECEIVED' : 'FAILED');

    // 2. Register Admin
    const adm = await request('/api/v1/auth/register', 'POST', { name: 'Admin', email: 'adm8@test.com', password: 'password' });
    console.log('Admin Register:', adm.status);
    const admId = adm.data?.data?.id || adm.data?.id;
    console.log('Admin ID:', admId);

    // 3. Update Admin Role in DB
    const { execSync } = require('child_process');
    execSync(`docker exec aicoo-postgres psql -U postgres -d warkopyareh_db -c "UPDATE users SET role='ADMIN' WHERE email='adm8@test.com';"`);
    console.log('Admin role updated in DB.');

    // 4. Login Admin
    const admLog = await request('/api/v1/auth/login', 'POST', { email: 'adm8@test.com', password: 'password' });
    const admToken = admLog.data?.data?.accessToken;
    console.log('Admin Token:', admToken ? 'RECEIVED' : 'FAILED');

    // 5. Customer hits Admin endpoint
    console.log('--- CUSTOMER HITS ADMIN ENDPOINT ---');
    const cusHit = await request('/api/v1/products', 'POST', {}, cusToken);
    console.log('Status:', cusHit.status, cusHit.data);

    // 6. Admin hits Admin endpoint
    console.log('--- ADMIN HITS ADMIN ENDPOINT ---');
    const admHit = await request('/api/v1/products', 'POST', {}, admToken);
    console.log('Status:', admHit.status, admHit.data);

  } catch(e) {
    console.error(e);
  }
}
run();
