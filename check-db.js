const { Client } = require('pg');

async function checkDb() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5433/warkopyareh_db'
  });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");
    const res = await client.query("SELECT current_setting('app.current_branch_id', true) as branch_id");
    console.log("current_setting('app.current_branch_id', true):", res.rows[0].branch_id);
    await client.end();
  } catch (err) {
    console.error("Connection error", err.stack);
  }
}

checkDb();
