const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  const res = await client.query('SELECT email, role, "branchId" FROM users');
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
