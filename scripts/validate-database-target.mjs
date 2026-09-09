const environment = process.argv[2];

if (!['integration', 'production'].includes(environment)) {
  throw new Error(
    'Usage: node scripts/validate-database-target.mjs <integration|production>'
  );
}

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error('DATABASE_URL is required');

let databaseUrl;
try {
  databaseUrl = new URL(rawUrl);
} catch {
  throw new Error('DATABASE_URL is not a valid URL');
}

if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
  throw new Error('DATABASE_URL must use PostgreSQL');
}

if (!databaseUrl.username || !databaseUrl.hostname) {
  throw new Error('DATABASE_URL must include a username and hostname');
}

const databaseName = databaseUrl.pathname.replace(/^\//, '').toLowerCase();
if (!databaseName) throw new Error('DATABASE_URL must select a database');

const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);
const disposableNames = new Set([
  'postgres',
  'template0',
  'template1',
  'test',
  'warkop_audit',
]);

if (environment === 'production') {
  if (localHosts.has(databaseUrl.hostname.toLowerCase())) {
    throw new Error('Production migration cannot target a local database host');
  }
  if (disposableNames.has(databaseName)) {
    throw new Error(
      'Production migration cannot target a default or disposable database'
    );
  }
} else if (databaseName !== 'warkop_audit') {
  throw new Error(
    'Integration gates must target the disposable warkop_audit database'
  );
}

console.log(`${environment} database target validation passed`);
