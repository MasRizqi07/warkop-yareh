import test from 'node:test';
import assert from 'node:assert/strict';

const keys = ['NEXT_PUBLIC_TEST_CATALOG', 'NEXT_PUBLIC_API_URL', 'DATABASE_URL', 'VERCEL', 'VERCEL_ENV'];
async function configWith(env) {
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try { return (await import(`../apps/web/next.config.mjs?test=${crypto.randomUUID()}`)).default; }
  finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
}

const isolated = { NEXT_PUBLIC_TEST_CATALOG: 'true', NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4006/api/v1', DATABASE_URL: 'postgresql://ci:ci@127.0.0.1:5432/warkop_audit' };
test('a deployed build cannot expose the commerce fixture catalog', async () => {
  await assert.rejects(configWith({ ...isolated, VERCEL: '1', VERCEL_ENV: 'production' }), /cannot be deployed/);
  await assert.rejects(configWith({ ...isolated, VERCEL_ENV: 'preview' }), /cannot be deployed/);
});
test('test catalogs require loopback API and isolated database', async () => {
  await assert.rejects(configWith({ ...isolated, DATABASE_URL: 'postgresql://ci:ci@127.0.0.1:5432/application' }), /isolated/);
  await assert.rejects(configWith({ ...isolated, NEXT_PUBLIC_API_URL: 'https://api.example.test' }), /isolated/);
  assert.ok(await configWith(isolated));
});
test('all decommissioned public features use permanent, canonical redirects', async () => {
  const config = await configWith({});
  const redirects = await config.redirects();
  for (const source of ['/booking', '/reservations', '/community', '/events', '/loyalty', '/blog']) {
    const rule = redirects.find((item) => item.source === source);
    assert.equal(rule?.permanent, true);
    assert.ok(['/', '/outlets'].includes(rule.destination));
  }
});
test('private routes and protected previews have explicit noindex response headers', async () => {
  const privateRules = await (await configWith({})).headers();
  assert.ok(privateRules.some((rule) => rule.source.startsWith('/checkout') && rule.headers.some((header) => header.key === 'X-Robots-Tag' && header.value.includes('noindex'))));
  const previewRules = await (await configWith({ VERCEL_ENV: 'preview' })).headers();
  assert.ok(previewRules.some((rule) => rule.source === '/(.*)' && rule.headers.some((header) => header.key === 'X-Robots-Tag')));
});
