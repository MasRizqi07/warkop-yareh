const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db'
  });
  await client.connect();
  
  const users = await client.query('SELECT * FROM users');
  console.log("All users:", users.rows.map(u => ({ email: u.email, role: u.role, branchId: u.branchId })));
  
  await client.end();
}
main();
