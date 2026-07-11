const http = require('http');
const { PrismaClient } = require('./packages/database/generated/client');
const prisma = new PrismaClient();

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/api/v1' + path,
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
  console.log('--- STARTING E2E SPOOFING VERIFICATION TEST ---');
  try {
    const email = `test-spoof-${Date.now()}@example.com`;

    // 1. Register UserA
    const reg = await request('/auth/register', 'POST', {
      name: 'UserA',
      email,
      password: 'password'
    });
    const userA_Id = reg.data.data.id;
    console.log('UserA Registered. ID:', userA_Id);

    // 2. Login UserA
    const login = await request('/auth/login', 'POST', {
      email,
      password: 'password'
    });
    const token = login.data.data.accessToken;

    // 3. Test ReservationsController UserId Spoofing
    console.log('\n[1] Testing ReservationsController userId spoofing...');
    const reservationRes = await request('/reservations', 'POST', {
      userId: 'spoofed_user_id',
      branchId: 'branch_123',
      date: '2026-07-11',
      startTime: '10:00',
      endTime: '11:00',
      guestCount: 2
    }, token);

    console.log('Reservation response userId:', reservationRes.data.data.userId);
    
    // Check DB
    const resDb = await prisma.reservation.findUnique({
      where: { id: reservationRes.data.data.id }
    });
    console.log('Reservation in DB userId:', resDb.userId);

    const reservationSecured = resDb.userId === userA_Id;
    console.log('Reservations Secured:', reservationSecured ? 'YES' : 'NO');

    // 4. Test CommunityController AuthorId Spoofing
    console.log('\n[2] Testing CommunityController authorId spoofing...');
    const postRes = await request('/community/posts', 'POST', {
      groupId: 'group_123',
      authorId: 'spoofed_author_id',
      content: 'Hello World from E2E spoof test'
    }, token);

    console.log('Post response authorId:', postRes.data.data.authorId);
    
    // Check DB
    const postDb = await prisma.communityPost.findUnique({
      where: { id: postRes.data.data.id }
    });
    console.log('Post in DB authorId:', postDb.authorId);

    const communitySecured = postDb.authorId === userA_Id;
    console.log('Community Posts Secured:', communitySecured ? 'YES' : 'NO');

    if (reservationSecured && communitySecured) {
      console.log('\n✅ ALL SPOOFING PROTECTION TESTS PASSED!');
      process.exit(0);
    } else {
      console.log('\n❌ SPOOFING PROTECTION TEST FAILED!');
      process.exit(1);
    }

  } catch (err) {
    console.error('Error during spoofing tests:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
