const crypto = require('crypto');
const { execSync } = require('child_process');
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
    const orderId = 'snap-test-' + Date.now();
    const orderNumber = 'CNB-20260706-' + Math.floor(Math.random() * 10000);
    const userId = 'cmr8twdko000kll9qcfsyxp7i'; // admin user id

    console.log(`\n--- 1. INSERTING ORDER ${orderId} ---`);
    execSync(`docker exec aicoo-postgres psql -U postgres -d warkopyareh_db -c "INSERT INTO orders (id, \\"orderNumber\\", status, \\"paymentStatus\\", \\"userId\\", subtotal, tax, discount, total, \\"updatedAt\\") VALUES ('${orderId}', '${orderNumber}', 'PENDING', 'UNPAID', '${userId}', 50000, 0, 0, 50000, NOW());"`);
    
    const beforeStr = execSync(`docker exec aicoo-postgres psql -U postgres -d warkopyareh_db -c "SELECT id, status, \\"paymentStatus\\" FROM orders WHERE id='${orderId}';"`);
    console.log(beforeStr.toString());

    console.log('\n--- 2. CREATING SNAP TRANSACTION ---');
    const snap = await request('/api/v1/payments/midtrans/snap', 'POST', {
      orderId,
      grossAmount: 50000,
    });
    console.log('Snap status:', snap.status, JSON.stringify(snap.data));

    console.log('\n--- 3. SIMULATING WEBHOOK ---');
    const serverKey = 'SB-Mid-server-xxxxxxxxxxxxxxxxxxxx';
    const statusCode = '200';
    const grossAmount = '50000.00';
    const signature = crypto.createHash('sha512').update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest('hex');

    const webhookPayload = {
      transaction_status: 'capture',
      fraud_status: 'accept',
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const wh = await request('/api/v1/payments/midtrans/webhook', 'POST', webhookPayload);
    console.log('Webhook status:', wh.status, wh.data);

    console.log('\n--- 4. QUERYING ORDER AFTER WEBHOOK ---');
    const afterStr = execSync(`docker exec aicoo-postgres psql -U postgres -d warkopyareh_db -c "SELECT id, status, \\"paymentStatus\\" FROM orders WHERE id='${orderId}';"`);
    console.log(afterStr.toString());

  } catch(e) {
    console.error(e);
  }
}
run();
