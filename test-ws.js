const { io } = require('socket.io-client');
const http = require('http');

async function request(path, method = 'GET', body = null) {
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
    console.log('--- TEST 1: NO TOKEN ---');
    const socketNoToken = io('http://localhost:4000');
    
    socketNoToken.on('connect', () => {
      console.log('No-token socket connected (should not happen for long)');
    });

    socketNoToken.on('disconnect', (reason) => {
      console.log('No-token socket disconnected. Reason:', reason);
    });

    socketNoToken.on('connect_error', (err) => {
      console.log('No-token connection error:', err.message);
    });

    // Get a valid token
    console.log('\n--- GETTING VALID TOKEN ---');
    const login = await request('/api/v1/auth/login', 'POST', { email: 'cus7@test.com', password: 'password' });
    const token = login.data?.data?.accessToken;
    console.log('Token fetched:', !!token);

    if (token) {
      console.log('\n--- TEST 2: WITH TOKEN ---');
      const socketWithToken = io('http://localhost:4000', {
        auth: { token }
      });

      socketWithToken.on('connect', () => {
        console.log('With-token socket connected successfully. Socket ID:', socketWithToken.id);
        
        // Wait a bit to ensure it doesn't get kicked out
        setTimeout(() => {
          console.log('Socket connection maintained. Test complete.');
          process.exit(0);
        }, 1000);
      });

      socketWithToken.on('disconnect', (reason) => {
        console.log('With-token socket disconnected. Reason:', reason);
      });

      socketWithToken.on('connect_error', (err) => {
        console.log('With-token connection error:', err.message);
      });
    } else {
      console.log('Could not get token to run Test 2');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
