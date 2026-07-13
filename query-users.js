const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db'
  });
  await client.connect();
  
  const users = await client.query('SELECT * FROM users WHERE "branchId" = $1', ['branch_123']);
  console.log("Users in branch_123:", users.rows);
  
  await client.end();
}
main();
