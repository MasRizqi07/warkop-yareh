const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1' + path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = Bearer ;
    if (body) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(options, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: resBody ? JSON.parse(resBody) : null
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(data);
    req.end();
  });
}

async function run() {
  const email = 'test-midtrans-1234@example.com';
  const reg = await request('/auth/register', 'POST', { name: 'Admin', email, password: 'password' });
  const login = await request('/auth/login', 'POST', { email, password: 'password' });
  const token = login.data.data.accessToken;

  console.log("Getting order that doesn't exist");
  const res1 = await request('/orders/123/payment-status', 'GET', null, token);
  console.log("res1 status:", res1.status, res1.data);
}
run();
