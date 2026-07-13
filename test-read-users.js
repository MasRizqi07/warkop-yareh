const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://app_runtime_test:password@localhost:5433/warkopyareh_db' });
  await client.connect();
  const res = await client.query('SELECT email, "passwordHash" FROM users');
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
