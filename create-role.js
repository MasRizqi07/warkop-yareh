const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db' });
  await client.connect();
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'api_user') THEN
        CREATE ROLE api_user NOLOGIN;
      END IF;
    END
    $$;
  `);
  await client.query('GRANT USAGE ON SCHEMA public TO api_user');
  await client.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO api_user');
  await client.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO api_user');
  console.log("Role created");
  await client.end();
}
main();
