const { Client } = require('pg');
const c = new Client('postgresql://postgres:postgres@localhost:5433/warkopyareh_db');
c.connect()
  .then(() => c.query("SELECT rolname, rolsuper FROM pg_roles WHERE rolname = 'app_runtime_test'"))
  .then((res) => { console.log(res.rows); c.end(); })
  .catch(console.error);
