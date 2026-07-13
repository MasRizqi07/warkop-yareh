const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  
  console.log("Dropping existing app_runtime_test role...");
  await client.query(`DROP ROLE IF EXISTS app_runtime_test`);
  
  console.log("Creating NOSUPERUSER role app_runtime_test...");
  await client.query(`CREATE ROLE app_runtime_test LOGIN PASSWORD 'password' NOSUPERUSER`);
  await client.query(`GRANT USAGE ON SCHEMA public TO app_runtime_test`);
  await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_runtime_test`);
  await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_runtime_test`);
  
  console.log("Done provisioning app_runtime_test role.");
  await client.end();
}

main().catch(console.error);
