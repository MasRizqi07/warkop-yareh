const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  const res = await client.query('SELECT * FROM branch_products');
  console.log("Branch Products:", res.rows);
  const ev = await client.query('SELECT * FROM events');
  console.log("Events:", ev.rows);
  const fa = await client.query('SELECT * FROM franchise_agreements');
  console.log("FA:", fa.rows);
  await client.end();
}
main().catch(console.error);
