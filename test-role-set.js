const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://app_runtime_test:password@localhost:5433/warkopyareh_db' });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE api_user');
    console.log("SUCCESS: SET LOCAL ROLE api_user worked!");
    await client.query('COMMIT');
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
