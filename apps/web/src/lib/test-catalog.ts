// Enabled only by the validated loopback, disposable database build used by E2E.
// next.config.mjs rejects this flag on Vercel and outside the isolated target.
export const TEST_CATALOG_ENABLED =
  process.env.NEXT_PUBLIC_TEST_CATALOG === 'true';
