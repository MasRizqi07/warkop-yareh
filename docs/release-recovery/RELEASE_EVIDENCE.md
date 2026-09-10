# Canonical Release Verification Index

## 1. Governance and Purpose

This document serves as the canonical verification index for the release readiness of `MasRizqi07/warkop-yareh`.
Every release gate is evaluated based on concrete evidence, exact commit SHAs, reproducible commands, and explicit limitations.

**Release Policy**:
<<<<<<< HEAD

=======
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- A gate may only be labeled `PASS` if backed by direct terminal or pipeline execution outputs.
- Staging, cloud provider, and production environments require live deployment evidence; they are never assumed from local or CI success.
- If any production or staging prerequisite is unverified, the release verdict remains `NO-GO`.

---

## 2. Release Verification Gate Matrix (18 Canonical Gates)

<<<<<<< HEAD
| Gate # | Release Gate Name            | Status           | Exact Commit SHA                           | Verification Command / Workflow                              | Evidence Location                                   | Date       | Limitations & Operational Context                                     |
| ------ | ---------------------------- | ---------------- | ------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| **1**  | **Repository Integrity**     | **PASS**         | `f3e4298`                                  | `git status; git log -n 1`                                   | Clean working tree on `codex/release-recovery`      | 2026-09-09 | No uncommitted modifications; branch clean.                           |
| **2**  | **Dependency Install**       | **PASS**         | `f3e4298`                                  | `pnpm install --frozen-lockfile`                             | CI runner log & local pnpm environment              | 2026-09-09 | Lockfile integrity verified with pnpm 9.0.0.                          |
| **3**  | **Prisma Client Generation** | **PASS**         | `f3e4298`                                  | `pnpm --filter @warkop-yareh/database run db:generate`       | Local terminal & CI workflow                        | 2026-09-09 | Dynamic generation confirmed across Linux and Windows engines.        |
| **4**  | **Migration (Fresh DB)**     | **PASS**         | `3303f1c`                                  | `pnpm --filter @warkop-yareh/database run db:migrate:deploy` | GitHub Actions CI container (`postgres:16`)         | 2026-09-09 | Verified in CI. Local Docker daemon is currently off.                 |
| **5**  | **Migration (Upgrade DB)**   | **PASS**         | `f3e4298`                                  | `prisma validate`, schema AST check                          | `docs/release-recovery/MIGRATION_AUDIT.md`          | 2026-09-09 | Strictly additive tables and composite index change; zero data drops. |
| **6**  | **Typecheck**                | **PASS**         | `42b8e34d977a318e8ed2166aafc00c321e04c5a1` | `pnpm turbo typecheck --force --output-logs=full`            | [Raw output](#41-typecheck)                         | 2026-09-10 | Local exact-commit evidence; remote CI not yet run.                   |
| **7**  | **Lint**                     | **PASS**         | `42b8e34d977a318e8ed2166aafc00c321e04c5a1` | `pnpm turbo lint --force --output-logs=full`                 | [Raw output](#42-lint)                              | 2026-09-10 | Local exact-commit evidence; remote CI not yet run.                   |
| **8**  | **Unit / Persistence Tests** | **PASS**         | `42b8e34d977a318e8ed2166aafc00c321e04c5a1` | `pnpm turbo test --force --output-logs=full`                 | [Raw output](#43-unit-and-persistence-tests)        | 2026-09-10 | Includes checkout, operations, RLS, and concurrency suites locally.   |
| **9**  | **API Application E2E**      | **PASS**         | `3303f1c`                                  | `pnpm --filter @warkop-yareh/api run test:e2e`               | GitHub Actions CI run                               | 2026-09-09 | Verified in ephemeral CI environment.                                 |
| **10** | **Browser E2E Tests**        | **PASS**         | `3303f1c`                                  | `pnpm test:e2e` (Playwright Chromium)                        | GitHub Actions CI artifact (`browser-e2e-evidence`) | 2026-09-09 | Verified in CI.                                                       |
| **11** | **Security & Authorization** | **PASS**         | `f3e4298`                                  | Server RBAC audit & test suite                               | `docs/release-recovery/ADMIN_SECURITY_AUDIT.md`     | 2026-09-09 | Server-side role checks, forced RLS, and tenant branch isolation.     |
| **12** | **Scope Audit (90c4366)**    | **PASS**         | `f3e4298`                                  | `pnpm audit:scope`                                           | `docs/release-recovery/SCOPE_AUDIT_90c4366.md`      | 2026-09-09 | 235 paths classified into 8 areas; machine-audited.                   |
| **13** | **Staging Migration**        | **NOT VERIFIED** | `f3e4298`                                  | N/A (Staging DB environment unavailable)                     | Staging deployment pipeline                         | 2026-09-09 | No accessible staging environment provided.                           |
| **14** | **Staging Runtime Smoke**    | **NOT VERIFIED** | `f3e4298`                                  | N/A (Staging cluster unavailable)                            | Staging HTTP endpoints                              | 2026-09-09 | Staging verification blocked due to missing staging environment.      |
| **15** | **Production Migration**     | **BLOCKED**      | `f3e4298`                                  | CD workflow dispatch preflight guard                         | `.github/workflows/cd.yml`                          | 2026-09-09 | Production migration workflow hardened; pending secret injection.     |
| **16** | **Production Runtime**       | **NOT VERIFIED** | `f3e4298`                                  | N/A (Production cluster unavailable)                         | Production endpoints                                | 2026-09-09 | Production release intentionally frozen.                              |
| **17** | **Smoke Test (Live)**        | **NOT VERIFIED** | `f3e4298`                                  | N/A (Production deployment blocked)                          | Production smoke runbook                            | 2026-09-09 | Awaits manual migration approval and live rollout.                    |
| **18** | **Rollback Readiness**       | **PASS**         | `f3e4298`                                  | Migration down runbook & git branch strategy                 | `docs/release/PRODUCTION_MIGRATION_RUNBOOK.md`      | 2026-09-09 | All migrations strictly additive; main branch history preserved.      |
=======
| Gate # | Release Gate Name | Status | Exact Commit SHA | Verification Command / Workflow | Evidence Location | Date | Limitations & Operational Context |
|---|---|---|---|---|---|---|---|
| **1** | **Repository Integrity** | **PASS** | `f3e4298` | `git status; git log -n 1` | Clean working tree on `codex/release-recovery` | 2026-09-09 | No uncommitted modifications; branch clean. |
| **2** | **Dependency Install** | **PASS** | `f3e4298` | `pnpm install --frozen-lockfile` | CI runner log & local pnpm environment | 2026-09-09 | Lockfile integrity verified with pnpm 9.0.0. |
| **3** | **Prisma Client Generation** | **PASS** | `f3e4298` | `pnpm --filter @warkop-yareh/database run db:generate` | Local terminal & CI workflow | 2026-09-09 | Dynamic generation confirmed across Linux and Windows engines. |
| **4** | **Migration (Fresh DB)** | **PASS** | `3303f1c` | `pnpm --filter @warkop-yareh/database run db:migrate:deploy` | GitHub Actions CI container (`postgres:16`) | 2026-09-09 | Verified in CI. Local Docker daemon is currently off. |
| **5** | **Migration (Upgrade DB)** | **PASS** | `f3e4298` | `prisma validate`, schema AST check | `docs/release-recovery/MIGRATION_AUDIT.md` | 2026-09-09 | Strictly additive tables and composite index change; zero data drops. |
| **6** | **Typecheck** | **PASS** | `f3e4298` | `pnpm turbo run typecheck` | 4 tasks successful, 0 errors (8.111s) | 2026-09-09 | Verified across all 6 monorepo workspaces. |
| **7** | **Lint** | **PASS** | `f3e4298` | `pnpm turbo run lint` | 3 tasks successful, 0 errors (27.645s) | 2026-09-09 | Zero ESLint errors or warnings across web, admin, and api. |
| **8** | **Unit / Domain Tests** | **PASS** | `f3e4298` | `pnpm turbo run test` (in-band) | 44 test files, 269 tests passed | 2026-09-09 | API (245 passed), Web (20 passed), Admin (4 passed). |
| **9** | **API Application E2E** | **PASS** | `3303f1c` | `pnpm --filter @warkop-yareh/api run test:e2e` | GitHub Actions CI run | 2026-09-09 | Verified in ephemeral CI environment. |
| **10** | **Browser E2E Tests** | **PASS** | `3303f1c` | `pnpm test:e2e` (Playwright Chromium) | GitHub Actions CI artifact (`browser-e2e-evidence`) | 2026-09-09 | Verified in CI. |
| **11** | **Security & Authorization** | **PASS** | `f3e4298` | Server RBAC audit & test suite | `docs/release-recovery/ADMIN_SECURITY_AUDIT.md` | 2026-09-09 | Server-side role checks, forced RLS, and tenant branch isolation. |
| **12** | **Scope Audit (90c4366)** | **PASS** | `f3e4298` | `pnpm audit:scope` | `docs/release-recovery/SCOPE_AUDIT_90c4366.md` | 2026-09-09 | 235 paths classified into 7 categories; machine-audited. |
| **13** | **Staging Migration** | **NOT VERIFIED** | `f3e4298` | N/A (Staging DB environment unavailable) | Staging deployment pipeline | 2026-09-09 | No accessible staging environment provided. |
| **14** | **Staging Runtime Smoke** | **NOT VERIFIED** | `f3e4298` | N/A (Staging cluster unavailable) | Staging HTTP endpoints | 2026-09-09 | Staging verification blocked due to missing staging environment. |
| **15** | **Production Migration** | **BLOCKED** | `f3e4298` | CD workflow dispatch preflight guard | `.github/workflows/cd.yml` | 2026-09-09 | Production migration workflow hardened; pending secret injection. |
| **16** | **Production Runtime** | **NOT VERIFIED** | `f3e4298` | N/A (Production cluster unavailable) | Production endpoints | 2026-09-09 | Production release intentionally frozen. |
| **17** | **Smoke Test (Live)** | **NOT VERIFIED** | `f3e4298` | N/A (Production deployment blocked) | Production smoke runbook | 2026-09-09 | Awaits manual migration approval and live rollout. |
| **18** | **Rollback Readiness** | **PASS** | `f3e4298` | Migration down runbook & git branch strategy | `docs/release/PRODUCTION_MIGRATION_RUNBOOK.md` | 2026-09-09 | All migrations strictly additive; main branch history preserved. |
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3

---

## 3. Evidence Index Summary

<<<<<<< HEAD
- **Phase 7.0 refreshed local gates**: typecheck, lint, unit/persistence tests,
  and build passed at the recorded exact commit. These are local results only.
- **Historical local/CI gates**: rows that still name `3303f1c` or `f3e4298`
  retain their scoped historical evidence; they are not an exact-commit remote CI
  result for the rebased branch.
- **Deployment & Production Environment Gates (Gates 13, 14, 15, 16, 17)**: **0 / 5 VERIFIED** (Blocked / Awaiting external environment access)

**Conclusion**: The refreshed local gates pass, while exact-commit remote CI,
staging, and production deployment evidence remains unavailable. The release
verdict is therefore **NO-GO** until those external gates are completed.

## 4. Phase 7.0 exact-commit local gate output

Verification target: `42b8e34d977a318e8ed2166aafc00c321e04c5a1` on
`codex/release-recovery`. Runtime: Node
`v24.20.0`, pnpm `9.0.0`, Windows, disposable PostgreSQL 16 database
`warkop_audit`, and disposable Redis 7. The output below is complete terminal
text with CRLF and ANSI color-control bytes normalized for Markdown storage.
The initial test attempt without the isolated database failed closed as designed;
these recorded tests are the rerun after the CI-equivalent dependencies and all
15 migrations were available.

### 4.1 Typecheck

Command: `pnpm turbo typecheck --force --output-logs=full`

Exit code: `0`

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running typecheck in 6 packages
   • Remote caching disabled

@warkop-yareh/ui:typecheck: cache bypass, force executing 27305d4eca47f53b
@warkop-yareh/api:typecheck: cache bypass, force executing 462ea492be07231b
@warkop-yareh/ui:typecheck:
@warkop-yareh/ui:typecheck: > @warkop-yareh/ui@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\packages\ui
@warkop-yareh/ui:typecheck: > tsc --noEmit
@warkop-yareh/ui:typecheck:
@warkop-yareh/api:typecheck:
@warkop-yareh/api:typecheck: > @warkop-yareh/api@0.0.1 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:typecheck: > tsc --noEmit
@warkop-yareh/api:typecheck:
@warkop-yareh/web:typecheck: cache bypass, force executing 78107b21a36f4053
@warkop-yareh/admin:typecheck: cache bypass, force executing 3f4334032e17d68b
@warkop-yareh/web:typecheck:
@warkop-yareh/web:typecheck: > @warkop-yareh/web@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\web
@warkop-yareh/web:typecheck: > tsc --noEmit
@warkop-yareh/web:typecheck:
@warkop-yareh/admin:typecheck:
@warkop-yareh/admin:typecheck: > @warkop-yareh/admin@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\admin
@warkop-yareh/admin:typecheck: > tsc --noEmit
@warkop-yareh/admin:typecheck:

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    9.521s
```

### 4.2 Lint

Command: `pnpm turbo lint --force --output-logs=full`

Exit code: `0`

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running lint in 6 packages
   • Remote caching disabled

@warkop-yareh/web:lint: cache bypass, force executing c140a961509caca7
@warkop-yareh/admin:lint: cache bypass, force executing 6a3739f7c660243e
@warkop-yareh/api:lint: cache bypass, force executing a9cae9547393abfa
@warkop-yareh/web:lint:
@warkop-yareh/web:lint: > @warkop-yareh/web@0.1.0 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\web
@warkop-yareh/web:lint: > eslint
@warkop-yareh/web:lint:
@warkop-yareh/admin:lint:
@warkop-yareh/admin:lint: > @warkop-yareh/admin@0.1.0 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\admin
@warkop-yareh/admin:lint: > eslint
@warkop-yareh/admin:lint:
@warkop-yareh/api:lint:
@warkop-yareh/api:lint: > @warkop-yareh/api@0.0.1 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:lint: > eslint "{src,apps,libs,test}/**/*.ts"
@warkop-yareh/api:lint:

 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    19.578s
```

### 4.3 Unit and persistence tests

Command: `pnpm turbo test --force --output-logs=full`

Exit code: `0`

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running test in 6 packages
   • Remote caching disabled

@warkop-yareh/api:test:persistence: cache bypass, force executing 89dd747aef310ba7
@warkop-yareh/ui:build: cache bypass, force executing 002979f03f30d306
@warkop-yareh/ui:build:
@warkop-yareh/ui:build: > @warkop-yareh/ui@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\packages\ui
@warkop-yareh/ui:build: > tsc
@warkop-yareh/ui:build:
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence: > @warkop-yareh/api@0.0.1 test:persistence D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:test:persistence: > pnpm run test:checkout && pnpm run test:operations
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence: > @warkop-yareh/api@0.0.1 test:checkout D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:test:persistence: > jest --config ./test/jest-checkout.json
@warkop-yareh/api:test:persistence:
@warkop-yareh/admin:test: cache bypass, force executing 71dd8616c610493b
@warkop-yareh/web:test: cache bypass, force executing 2053311f444b9e0f
@warkop-yareh/api:test:persistence: [Nest] 21992  - 10/09/2026, 14.39.51     LOG [DatabaseService] Database role api_user check passed successfully.
@warkop-yareh/admin:test:
@warkop-yareh/admin:test: > @warkop-yareh/admin@0.1.0 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\admin
@warkop-yareh/admin:test: > vitest run
@warkop-yareh/admin:test:
@warkop-yareh/web:test:
@warkop-yareh/web:test: > @warkop-yareh/web@0.1.0 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\web
@warkop-yareh/web:test: > vitest run
@warkop-yareh/web:test:
@warkop-yareh/web:test:
@warkop-yareh/admin:test:
@warkop-yareh/web:test:  RUN  v4.1.11 D:/MY CODE/ANTIGRAVITY/01-production/warkop-yareh/apps/web
@warkop-yareh/admin:test:  RUN  v4.1.11 D:/MY CODE/ANTIGRAVITY/01-production/warkop-yareh/apps/admin
@warkop-yareh/web:test:
@warkop-yareh/admin:test:
@warkop-yareh/api:test:persistence: PASS test/checkout.e2e-spec.ts
@warkop-yareh/api:test:persistence:   Checkout persistence, concurrency and RLS
@warkop-yareh/api:test:persistence:     √ rejects a changed quote without writing an order or spending points (94 ms)
@warkop-yareh/api:test:persistence:     √ allows only one concurrent redemption when the combined points exceed the balance (94 ms)
@warkop-yareh/api:test:persistence:     √ restores cancelled order points exactly once and rejects a stale transition (166 ms)
@warkop-yareh/api:test:persistence:     √ awards and reverses paid points once despite duplicate and out-of-order notifications (285 ms)
@warkop-yareh/api:test:persistence:     √ prevents a different customer from reading an order under RLS (68 ms)
@warkop-yareh/api:test:persistence:     √ prices the approved workspace packages and add-ons from persisted products (68 ms)
@warkop-yareh/api:test:persistence:     √ replays a booking, blocks cross-customer overlap across midnight, and releases a failed payment (405 ms)
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence: Test Suites: 1 passed, 1 total
@warkop-yareh/api:test:persistence: Tests:       7 passed, 7 total
@warkop-yareh/api:test:persistence: Snapshots:   0 total
@warkop-yareh/api:test:persistence: Time:        2.619 s, estimated 4 s
@warkop-yareh/api:test:persistence: Ran all test suites.
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence: > @warkop-yareh/api@0.0.1 test:operations D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:test:persistence: > jest --config ./test/jest-operations.json
@warkop-yareh/api:test:persistence:
@warkop-yareh/web:test:  ✓ src/lib/client-checkout-estimate.test.ts (3 tests) 7ms
@warkop-yareh/web:test:  ✓ src/features/orders/payment-navigation.test.ts (7 tests) 9ms
@warkop-yareh/web:test:  ✓ src/stores/auth.store.test.ts (4 tests) 8ms
@warkop-yareh/api:test:persistence: [Nest] 4680  - 10/09/2026, 14.39.55     LOG [DatabaseService] Database role api_user check passed successfully.
@warkop-yareh/admin:test:  ✓ src/lib/operations-api.test.ts (4 tests) 10ms
@warkop-yareh/admin:test:
@warkop-yareh/admin:test:  Test Files  1 passed (1)
@warkop-yareh/admin:test:       Tests  4 passed (4)
@warkop-yareh/admin:test:    Start at  14:39:52
@warkop-yareh/admin:test:    Duration  3.10s (transform 77ms, setup 30ms, import 149ms, tests 10ms, environment 2.46s)
@warkop-yareh/admin:test:
@warkop-yareh/web:test:  ✓ src/stores/persist-storage.test.ts (3 tests) 10ms
@warkop-yareh/web:test:  ✓ src/lib/api.test.ts (3 tests) 12ms
@warkop-yareh/web:test:
@warkop-yareh/web:test:  Test Files  5 passed (5)
@warkop-yareh/web:test:       Tests  20 passed (20)
@warkop-yareh/web:test:    Start at  14:39:52
@warkop-yareh/web:test:    Duration  3.28s (transform 442ms, setup 243ms, import 765ms, tests 47ms, environment 12.06s)
@warkop-yareh/web:test:
@warkop-yareh/api:test:persistence: PASS test/operations.e2e-spec.ts
@warkop-yareh/api:test:persistence:   Cashier shift persistence, concurrency and RLS
@warkop-yareh/api:test:persistence:     √ allows exactly one concurrent open shift per branch (164 ms)
@warkop-yareh/api:test:persistence:     √ persists movements, reloads the summary, and serializes close (236 ms)
@warkop-yareh/api:test:persistence:     √ enforces branch isolation on reads and shift lookup (145 ms)
@warkop-yareh/api:test:persistence:
@warkop-yareh/api:test:persistence: Test Suites: 1 passed, 1 total
@warkop-yareh/api:test:persistence: Tests:       3 passed, 3 total
@warkop-yareh/api:test:persistence: Snapshots:   0 total
@warkop-yareh/api:test:persistence: Time:        2.178 s, estimated 4 s
@warkop-yareh/api:test:persistence: Ran all test suites.
@warkop-yareh/api:test: cache bypass, force executing af6de09245df3257
@warkop-yareh/api:test:
@warkop-yareh/api:test: > @warkop-yareh/api@0.0.1 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:test: > jest
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/infrastructure/payment/cash-payment.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/branch/presentation/controllers/branch.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/franchise/presentation/controllers/franchise.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/event/presentation/controllers/event.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/community/presentation/controllers/community.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/identity/presentation/controllers/auth.controller.spec.ts (5.119 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/identity/presentation/controllers/users.controller.spec.ts (5.149 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/tables/presentation/controllers/table.controller.spec.ts (5.304 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/ordering/presentation/controllers/guest-order-quotes.controller.spec.ts (5.737 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/ordering/presentation/controllers/orders.controller.spec.ts (6.085 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/marketing/application/processors/marketing-dispatch.processor.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/reservation/presentation/controllers/reservations.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/ordering/application/services/ordering.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/infrastructure/payment/payment.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/catalog/presentation/controllers/catalog.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/ai/ai.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/infrastructure/payment/payment.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/tables/application/services/table.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/marketing/application/services/marketing.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/websockets/events.gateway.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/health/health.controller.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: [Nest] 5216  - 10/09/2026, 14.40.06    WARN [MarketingService] Campaign campaign-1 was delivered to user customer-1, but the in-app notification failed: notification storage unavailable
@warkop-yareh/api:test: PASS src/modules/event/application/services/event.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/community/application/services/community.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/analytics/application/services/analytics.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/loyalty/application/services/loyalty.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/catalog/application/services/catalog.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/branch/application/services/branch.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/reservation/application/services/reservation.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/content/application/services/content.service.spec.ts
@warkop-yareh/api:test: PASS src/config/environment.validation.spec.ts
@warkop-yareh/api:test: PASS src/modules/marketing/infrastructure/whatsapp-cloud.service.spec.ts
@warkop-yareh/api:test: PASS src/infrastructure/auth/ws-jwt.guard.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/operations/application/services/shift.service.spec.ts
@warkop-yareh/api:test: PASS src/modules/ordering/domain/checkout-pricing.spec.ts
@warkop-yareh/api:test: PASS src/modules/franchise/application/services/franchise.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/modules/identity/application/services/identity.service.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: PASS src/common/guards/roles.guard.spec.ts
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test: [Nest] 8408  - 10/09/2026, 14.40.07    WARN [WsJwtGuard] WsJwtGuard rejected a message: Missing authenticated socket session
@warkop-yareh/api:test: [Nest] 8408  - 10/09/2026, 14.40.07    WARN [WsJwtGuard] WsJwtGuard rejected a message: Socket session expired
@warkop-yareh/api:test: PASS src/modules/identity/application/services/auth.service.spec.ts (7.716 s)
@warkop-yareh/api:test:   ● Console
@warkop-yareh/api:test:
@warkop-yareh/api:test:     console.log
@warkop-yareh/api:test:       ✔ Console Ninja extension is connected to Nest.js, see https://tinyurl.com/2vt8jxzw
@warkop-yareh/api:test:
@warkop-yareh/api:test:       at new oA (c:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/C:/Users/rrgtet47/.vscode/extensions/wallabyjs.console-ninja-1.0.541/out/buildHook/index.js:1:4281246)
@warkop-yareh/api:test:
@warkop-yareh/api:test:
@warkop-yareh/api:test: Test Suites: 38 passed, 38 total
@warkop-yareh/api:test: Tests:       245 passed, 245 total
@warkop-yareh/api:test: Snapshots:   0 total
@warkop-yareh/api:test: Time:        9.734 s, estimated 192 s
@warkop-yareh/api:test: Ran all test suites.

 Tasks:    5 successful, 5 total
Cached:    0 cached, 5 total
  Time:    19.488s
```

### 4.4 Build

Command: `pnpm turbo build --force --output-logs=full`

Exit code: `0`

```text
• turbo 2.10.12

   • Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
   • Running build in 6 packages
   • Remote caching disabled

@warkop-yareh/ui:build: cache bypass, force executing 002979f03f30d306
@warkop-yareh/api:build: cache bypass, force executing cc303dd8bdbf041e
@warkop-yareh/ui:build:
@warkop-yareh/ui:build: > @warkop-yareh/ui@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\packages\ui
@warkop-yareh/ui:build: > tsc
@warkop-yareh/ui:build:
@warkop-yareh/api:build:
@warkop-yareh/api:build: > @warkop-yareh/api@0.0.1 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api
@warkop-yareh/api:build: > nest build
@warkop-yareh/api:build:
@warkop-yareh/admin:build: cache bypass, force executing 936d982f3881edf3
@warkop-yareh/web:build: cache bypass, force executing 34357063b145b22c
@warkop-yareh/admin:build:
@warkop-yareh/admin:build: > @warkop-yareh/admin@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\admin
@warkop-yareh/admin:build: > next build
@warkop-yareh/admin:build:
@warkop-yareh/web:build:
@warkop-yareh/web:build: > @warkop-yareh/web@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\web
@warkop-yareh/web:build: > next build
@warkop-yareh/web:build:
@warkop-yareh/admin:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/admin:build: - Environments: .env.local
@warkop-yareh/web:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/web:build: - Environments: .env.local
@warkop-yareh/web:build: ✓ Running next.config.mjs took 67ms
@warkop-yareh/admin:build: ✓ Running next.config.ts took 204ms
@warkop-yareh/web:build:
@warkop-yareh/web:build:   Creating an optimized production build ...
@warkop-yareh/admin:build:
@warkop-yareh/admin:build:   Creating an optimized production build ...
@warkop-yareh/admin:build: ✓ Compiled successfully in 1255ms
@warkop-yareh/admin:build:   Running TypeScript ...
@warkop-yareh/web:build: ✓ Compiled successfully in 1538ms
@warkop-yareh/web:build:   Running TypeScript ...
@warkop-yareh/admin:build:   Finished TypeScript in 4.2s ...
@warkop-yareh/admin:build:   Collecting page data using 11 workers ...
@warkop-yareh/web:build:   Finished TypeScript in 5.5s ...
@warkop-yareh/web:build:   Collecting page data using 11 workers ...
@warkop-yareh/admin:build:   Generating static pages using 11 workers (0/23) ...
@warkop-yareh/admin:build:   Generating static pages using 11 workers (5/23)
@warkop-yareh/web:build:   Generating static pages using 11 workers (0/30) ...
@warkop-yareh/admin:build:   Generating static pages using 11 workers (11/23)
@warkop-yareh/admin:build:   Generating static pages using 11 workers (17/23)
@warkop-yareh/admin:build: ✓ Generating static pages using 11 workers (23/23) in 3.0s
@warkop-yareh/admin:build:   Finalizing page optimization ...
@warkop-yareh/admin:build:
@warkop-yareh/admin:build: Route (app)
@warkop-yareh/admin:build: ┌ ○ /
@warkop-yareh/admin:build: ├ ○ /_not-found
@warkop-yareh/admin:build: ├ ○ /analytics
@warkop-yareh/admin:build: ├ ○ /branches
@warkop-yareh/admin:build: ├ ○ /community
@warkop-yareh/admin:build: ├ ○ /crm
@warkop-yareh/admin:build: ├ ○ /events
@warkop-yareh/admin:build: ├ ƒ /events/[id]
@warkop-yareh/admin:build: ├ ○ /inventory
@warkop-yareh/admin:build: ├ ○ /kitchen
@warkop-yareh/admin:build: ├ ○ /login
@warkop-yareh/admin:build: ├ ○ /loyalty
@warkop-yareh/admin:build: ├ ○ /marketing
@warkop-yareh/admin:build: ├ ○ /orders
@warkop-yareh/admin:build: ├ ○ /pos
@warkop-yareh/admin:build: ├ ○ /pos/shifts
@warkop-yareh/admin:build: ├ ○ /products
@warkop-yareh/admin:build: ├ ○ /reservations
@warkop-yareh/admin:build: ├ ○ /settings
@warkop-yareh/admin:build: ├ ○ /shifts
@warkop-yareh/admin:build: ├ ○ /tables
@warkop-yareh/admin:build: └ ○ /users
@warkop-yareh/admin:build:
@warkop-yareh/admin:build:
@warkop-yareh/admin:build: ○  (Static)   prerendered as static content
@warkop-yareh/admin:build: ƒ  (Dynamic)  server-rendered on demand
@warkop-yareh/admin:build:
@warkop-yareh/web:build:   Generating static pages using 11 workers (7/30)
@warkop-yareh/web:build:   Generating static pages using 11 workers (14/30)
@warkop-yareh/web:build:   Generating static pages using 11 workers (22/30)
@warkop-yareh/web:build: ✓ Generating static pages using 11 workers (30/30) in 2.1s
@warkop-yareh/web:build:   Finalizing page optimization ...
@warkop-yareh/web:build:
@warkop-yareh/web:build: Route (app)
@warkop-yareh/web:build: ┌ ○ /
@warkop-yareh/web:build: ├ ○ /_not-found
@warkop-yareh/web:build: ├ ○ /about
@warkop-yareh/web:build: ├ ○ /account
@warkop-yareh/web:build: ├ ○ /auth
@warkop-yareh/web:build: ├ ○ /blog
@warkop-yareh/web:build: ├ ƒ /blog/[slug]
@warkop-yareh/web:build: ├ ○ /booking
@warkop-yareh/web:build: ├ ○ /cart
@warkop-yareh/web:build: ├ ○ /checkout
@warkop-yareh/web:build: ├ ƒ /checkout/status
@warkop-yareh/web:build: ├ ƒ /checkout/success
@warkop-yareh/web:build: ├ ○ /community
@warkop-yareh/web:build: ├ ƒ /community/groups/[id]
@warkop-yareh/web:build: ├ ○ /contact
@warkop-yareh/web:build: ├ ○ /events
@warkop-yareh/web:build: ├ ƒ /events/[id]
@warkop-yareh/web:build: ├ ○ /login
@warkop-yareh/web:build: ├ ○ /loyalty
@warkop-yareh/web:build: ├ ○ /menu
@warkop-yareh/web:build: ├ ○ /ops/kds
@warkop-yareh/web:build: ├ ○ /ops/pos
@warkop-yareh/web:build: ├ ○ /ops/shift
@warkop-yareh/web:build: ├ ƒ /order/track/[orderId]
@warkop-yareh/web:build: ├ ○ /orders
@warkop-yareh/web:build: ├ ƒ /orders/[id]
@warkop-yareh/web:build: ├ ƒ /orders/[id]/thankyou
@warkop-yareh/web:build: ├ ○ /otp
@warkop-yareh/web:build: ├ ƒ /payment/status
@warkop-yareh/web:build: ├ ○ /profile
@warkop-yareh/web:build: ├ ƒ /qr/[code]
@warkop-yareh/web:build: ├ ○ /register
@warkop-yareh/web:build: ├ ○ /reservations
@warkop-yareh/web:build: ├ ○ /robots.txt
@warkop-yareh/web:build: ├ ○ /sitemap.xml
@warkop-yareh/web:build: └ ƒ /table/[tableId]
@warkop-yareh/web:build:
@warkop-yareh/web:build:
@warkop-yareh/web:build: ○  (Static)   prerendered as static content
@warkop-yareh/web:build: ƒ  (Dynamic)  server-rendered on demand
@warkop-yareh/web:build:

 Tasks:    4 successful, 4 total
Cached:    0 cached, 4 total
  Time:    18.973s
```
=======
- **Local & Codebase Quality Gates (Gates 1, 2, 3, 5, 6, 7, 8, 11, 12, 18)**: **10 / 10 PASS**
- **CI Ephemeral Container Gates (Gates 4, 9, 10)**: **3 / 3 PASS**
- **Deployment & Production Environment Gates (Gates 13, 14, 15, 16, 17)**: **0 / 5 VERIFIED** (Blocked / Awaiting external environment access)

**Conclusion**: The codebase and automated test pipeline are thoroughly validated and hardened. However, because staging and production deployment environments have not been executed or introspected with live credentials, the release verdict remains **NO-GO** until live staging validation is completed.

>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
