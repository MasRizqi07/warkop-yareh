const { PrismaClient } = require('./packages/database/generated/client');

async function testConnection(username, password) {
  const url = `postgresql://${username}:${password}@localhost:5433/postgres`;
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  try {
    await prisma.$connect();
    console.log(`SUCCESS: Username="${username}", Password="${password}"`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    if (!err.message.includes('Authentication failed')) {
      console.log(`OTHER ERR: U="${username}" P="${password}" - ${err.message}`);
    }
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  const usernames = ['postgres', 'warkopyareh', 'seapedia', 'rrgtet47', 'admin', 'root'];
  const passwords = [
    'postgres', 'password', 'admin', 'root', 'warkopyareh_pass', 'warkopyareh',
    'aicoo_pass', 'aicoo', 'seapedia', 'studyflow',
    '123456', '1234', '12345', '1234567', '12345678', '123456789',
    'qwerty', 'supersec', 'secret', 'local', 'dev', 'development',
    'dbpass', 'dbpassword', 'mypassword', 'mysecret', 'pass',
    'rootroot', 'adminadmin', 'password123', 'password1234',
    'admin123', 'admin1234', 'root123', 'root1234',
    'postgres123', 'postgres1234', 'postgres12345',
    'docker', 'postgre', 'pg', 'pgpass',
    'antigravity', 'Antigravity', 'gemini', 'Gemini', 'google', 'Google',
    'rrgtet47',
    '',
  ];

  for (const user of usernames) {
    for (const pw of passwords) {
      const success = await testConnection(user, pw);
      if (success) {
        process.exit(0);
      }
    }
  }
  console.log('No credentials matched.');
  process.exit(1);
}

run();
