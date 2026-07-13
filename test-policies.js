const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  const res = await client.query('SELECT * FROM pg_policies WHERE tablename = \'users\'');
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
