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
  const loginRes = await request('/api/v1/auth/login', 'POST', {
    email: 'staff_a3_rls@test.com',
    password: 'password'
  });
  console.log("Login:", loginRes);
  const token = loginRes.data?.data?.tokens?.accessToken;
  
  if (token) {
    const tablesRes = await request('/api/v1/tables/branch/cmrgoocny0000126usfbbf4u8', 'GET', null, token);
    console.log("Tables:", tablesRes);
  }
}
main();
