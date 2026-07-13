const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db'
  });
  await client.connect();
  
  const res = await client.query('SELECT * FROM branches LIMIT 1');
  if (res.rows.length === 0) {
    console.log("No branches found");
    await client.end();
    return;
  }
  const branch = res.rows[0];
  console.log("Branch:", branch);
  
  const tables = await client.query('SELECT * FROM tables WHERE "branchId" = $1', [branch.id]);
  console.log("Tables:", tables.rows);
  
  await client.end();
}
main();
