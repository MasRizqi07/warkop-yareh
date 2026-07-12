const crypto = require('crypto');
const http = require('http');
const { PrismaClient } = require('./packages/database/generated/client');
const prisma = new PrismaClient();

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
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

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
  console.log('--- STARTING E2E MIDTRANS WEBHOOK TEST ---');
  try {
    const email = `test-e2e-${Date.now()}@example.com`;

    // 1. Register
    console.log('\n[1] Registering Customer...');
    const reg = await request('/auth/register', 'POST', {
      name: 'E2E Customer',
      email,
      password: 'password'
    });
    console.log('Register Response:', JSON.stringify(reg.data));
    const userId = reg.data.data.id;
    console.log('Registered User ID:', userId);

    // 2. Login
    console.log('\n[2] Logging in...');
    const login = await request('/auth/login', 'POST', {
      email,
      password: 'password'
    });
    console.log('Login Response:', JSON.stringify(login.data));
    const token = login.data.data.accessToken;
    console.log('Logged in successfully.');

    // 3. Create Order
    console.log('\n[3] Creating Order...');
    const orderRes = await request('/orders', 'POST', {
      userId,
      branchId: 'branch_123',
      items: [{ productId: 'prod_123', quantity: 1 }]
    }, token);
    console.log('Order Creation Response:', JSON.stringify(orderRes.data));
    const order = orderRes.data.data;
    const orderNumber = order.orderNumber;
    console.log(`Created Order Number: ${orderNumber} (ID: ${order.id})`);

    // Verify DB state before Webhook
    console.log('\n[4] Querying DB status before webhook...');
    let orderDb = await prisma.order.findUnique({ where: { id: order.id } });
    console.log(`BEFORE Webhook -> Status: "${orderDb.status}", PaymentStatus: "${orderDb.paymentStatus}"`);

    // 4. Generate Snap Token
    console.log('\n[5] Generating Snap Token...');
    const snap = await request('/payments/midtrans/snap', 'POST', {
      orderId: orderNumber,
      grossAmount: 25000,
    });
    console.log('Snap Response:', JSON.stringify(snap.data));

    // 5. Simulate Webhook
    console.log('\n[6] Simulating Midtrans Webhook Callback...');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-xxxxxxxxxxxxxxxxxxxx';
    const statusCode = '200';
    const grossAmount = '25000.00';
    
    // Signature: SHA512(order_id + status_code + gross_amount + server_key)
    const signature = crypto
      .createHash('sha512')
      .update(`${orderNumber}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    const webhookPayload = {
      transaction_status: 'settlement', // 'settlement' automatically marks as PAID / CONFIRMED
      fraud_status: 'accept',
      order_id: orderNumber,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const webhookRes = await request('/payments/midtrans/webhook', 'POST', webhookPayload);
    console.log('Webhook Response status:', webhookRes.status);
    console.log('Webhook Response data:', JSON.stringify(webhookRes.data));

    // Verify DB state after Webhook
    console.log('\n[7] Querying DB status after webhook...');
    orderDb = await prisma.order.findUnique({ where: { id: order.id } });
    console.log(`AFTER Webhook  -> Status: "${orderDb.status}", PaymentStatus: "${orderDb.paymentStatus}"`);

    if (orderDb.status === 'CONFIRMED' && orderDb.paymentStatus === 'PAID') {
      console.log('\n✅ SUCCESS: End-to-End payment flow works perfectly!');
      process.exit(0);
    } else {
      console.log('\n❌ FAILED: Order status not updated correctly.');
      process.exit(1);
    }

  } catch (err) {
    console.error('Error during E2E test:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
