const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  await client.query('GRANT api_user TO app_runtime_test');
  console.log("Granted api_user to app_runtime_test");
  await client.end();
}
main().catch(console.error);
