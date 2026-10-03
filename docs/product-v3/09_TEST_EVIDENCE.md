# Product v3 test evidence

Environment: local Windows, Node 22.21.1 / Node 24 target, pnpm 9.0.0, disposable PostgreSQL 16 `warkop_audit` on loopback port 45432 and Redis 7 on loopback port 46379. No production data or gateway was used. The browser fixture requires `NODE_ENV=test`, a loopback API and that exact isolated database. CI sets the ordering/payment flags only for those tests.

| Gate | Latest local result | Boundary |
| --- | --- | --- |
| Frozen install / Prisma generate | PASS | Lockfile resolved with Next 16.3.6 |
| Schema migration + production-style seed | PASS | 20 migrations; two verified branches, 14 normalized 24-hour rows; seven historic fictional products archived; zero new seed products |
| Reality audit v2 (`pnpm audit:reality`) | 27/27 PASS | Static/typed fixture contract, not physical business re-verification |
| Scope audit (`pnpm audit:scope`) | Historical disclosure PASS; new-merge comparison verified | Rechecked across active branch |
| Production contracts (`pnpm test:contracts`) | 4/4 PASS | Prohibits test catalog deploy, requires loopback + warkop_audit, verifies redirects & noindex |
| ESLint (`pnpm turbo run lint`) | PASS, 0 errors, 0 warnings | All packages in scope |
| TypeScript (`pnpm turbo run typecheck`) | 4/4 projects PASS, 0 errors | All packages in scope |
| API unit/integration | 39 suites, 265 tests PASS | Does not call live Midtrans |
| Web unit | 14 files, 49 tests PASS | Vitest limited to two workers on this machine after default worker run hit local memory limit |
| Admin unit | 1 file, 4 tests PASS | API behavior covered separately |
| Checkout + operations persistence | 2 suites, 10 tests PASS (7 checkout + 3 operations) | Isolated migrated DB with RLS |
| API E2E | 1 suite, 4 tests PASS (`test/app.e2e-spec.ts`) | Connects to migrated DB + Redis, tests /health and auth guard |
| Full monorepo build (`pnpm turbo run build`) | 5/5 packages PASS | Web prerender uses two workers |
| Browser Playwright E2E (`pnpm test:e2e`) | 16/16 PASS (5 admin, 6 commerce, 5 discovery) | Isolated fixture, all browser suites passing |
| Dependency audit | 0 critical/high/low; 1 moderate | Swagger transitive `js-yaml` remains |

Results are snapshots of verified local test runs. Exact-head GitHub Actions, Vercel previews, and deployed runtime checks are executed upon branch push and pull request. See [10_FINAL_IMPLEMENTATION_REPORT.md](10_FINAL_IMPLEMENTATION_REPORT.md) for full implementation status.
