const http = require('http');

function request(path, method, branchIdHeader) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: path,
        method: method,
        headers: {
          'x-branch-id': branchIdHeader,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, data: body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log("=== SQL INJECTION PROOF ===");
  // We send a single quote to break the string interpolation
  const payload = "test_branch'; SELECT 1; --";
  console.log("Sending payload in x-branch-id:", payload);
  
  const res = await request('/api/v1/tables/qr/dummy_code', 'GET', payload);
  console.log("Status:", res.status);
  console.log("Response:", res.data);
}
main();
