const http = require('http');

http.get('http://localhost:4000/api/v1/branches/branch_123/tables', {
  headers: { 'X-Branch-Id': 'branch_123' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', err => console.error('Error:', err.message));
