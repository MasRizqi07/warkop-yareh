# Phase 9 Phase 0 Command Evidence

Commit for every command below: `a12d52283a087e4f2fad56748b4452b8d83d10a5`.

Toolchain:

```text
v24.20.0
9.0.0
```

## Exact-baseline GitHub Actions

- Run: [CI #49](https://github.com/MasRizqi07/warkop-yareh/actions/runs/34886618344)
- Head SHA shown by GitHub: `a12d52283a087e4f2fad56748b4452b8d83d10a5`
- Trigger: `push` on `main`
- GitHub status: `Success`
- Duration: `3m 16s`
- Artifact listed by GitHub: `browser-e2e-evidence` (708 KB), digest `sha256:fcc1b8cd255f447ba591a9f4294438a4f42d6f084378d02c194f7d5984f84595`
- Annotation: one warning that several v4 actions target the deprecated Node.js 20 action runtime while GitHub forced them onto Node.js 24. This is not a failed job, but it should not be hidden.

The GitHub run is evidence for the baseline commit. The Phase 9 documentation files in this worktree are currently uncommitted and therefore are not covered by that historical run.

## `pnpm install --frozen-lockfile`

Executed as `fnm exec --using 24.20.0 pnpm install --frozen-lockfile`.

```text
Scope: all 7 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date

devDependencies:
+ @axe-core/playwright 4.13.0
+ @eslint/eslintrc 3.3.7
+ playwright 1.62.1
+ prettier 3.9.6
+ turbo 2.10.12

Done in 3.8s
COMMAND_EXIT=0
```

## `pnpm typecheck`

Executed as `fnm exec --using 24.20.0 pnpm typecheck`.

```text
> warkop-yareh@0.1.0 typecheck D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh
> turbo run typecheck

• turbo 2.10.12
• Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
• Running typecheck in 6 packages
• Remote caching disabled

@warkop-yareh/api:typecheck: > tsc --noEmit
@warkop-yareh/ui:typecheck: > tsc --noEmit
@warkop-yareh/admin:typecheck: > tsc --noEmit
@warkop-yareh/web:typecheck: > tsc --noEmit

Tasks:    4 successful, 4 total
Cached:    3 cached, 4 total
Time:     25.946s
COMMAND_EXIT=0
```

## `pnpm lint`

Executed as `fnm exec --using 24.20.0 pnpm lint`.

```text
> warkop-yareh@0.1.0 lint D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh
> turbo run lint

• turbo 2.10.12
• Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
• Running lint in 6 packages
• Remote caching disabled

@warkop-yareh/api:lint: > eslint "{src,apps,libs,test}/**/*.ts"
@warkop-yareh/admin:lint: > eslint
@warkop-yareh/web:lint: > eslint

Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
Time:     43.988s
COMMAND_EXIT=0
```

## `pnpm test`

Executed as `fnm exec --using 24.20.0 pnpm test`.

```text
> warkop-yareh@0.1.0 test D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh
> turbo run test

• turbo 2.10.12
• Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
• Running test in 6 packages
• Remote caching disabled

@warkop-yareh/admin:test: Test Files  1 passed (1)
@warkop-yareh/admin:test: Tests       4 passed (4)
@warkop-yareh/web:test: Test Files  9 passed (9)
@warkop-yareh/web:test: Tests       29 passed (29)

@warkop-yareh/api:test:persistence: FAIL test/checkout.e2e-spec.ts
@warkop-yareh/api:test:persistence: Checkout persistence, concurrency and RLS
@warkop-yareh/api:test:persistence:   × rejects a changed quote without writing an order or spending points
@warkop-yareh/api:test:persistence:   × allows only one concurrent redemption when the combined points exceed the balance
@warkop-yareh/api:test:persistence:   × restores cancelled order points exactly once and rejects a stale transition
@warkop-yareh/api:test:persistence:   × awards and reverses paid points once despite duplicate and out-of-order notifications
@warkop-yareh/api:test:persistence:   × prevents a different customer from reading an order under RLS
@warkop-yareh/api:test:persistence:   × prices the approved workspace packages and add-ons from persisted products
@warkop-yareh/api:test:persistence:   × replays a booking, blocks cross-customer overlap across midnight, and releases a failed payment

Checkout integration tests require the isolated warkop_audit database
at Object.<anonymous> (apps/api/test/checkout.e2e-spec.ts:33:13)

Test Suites: 1 failed, 1 total
Tests:       7 failed, 7 total
Snapshots:   0 total
Time:        14.59 s
Ran all test suites.

Tasks:    3 successful, 5 total
Cached:    2 cached, 5 total
Time:     19.356s
Failed:   @warkop-yareh/api#test:persistence
COMMAND_EXIT=1
```

The seven tests did not reach their assertions; the suite's target-database guard rejected the ordinary environment. This is an environment blocker, not a passing application result.

## `pnpm build`

Executed as `fnm exec --using 24.20.0 pnpm build`.

```text
> warkop-yareh@0.1.0 build D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh
> turbo run build

• turbo 2.10.12
• Packages in scope: @warkop-yareh/admin, @warkop-yareh/api, @warkop-yareh/database, @warkop-yareh/types, @warkop-yareh/ui, @warkop-yareh/web
• Running build in 6 packages
• Remote caching disabled

@warkop-yareh/ui:build: > tsc
@warkop-yareh/database:build: > tsc --project tsconfig.json
@warkop-yareh/api:build: > nest build
@warkop-yareh/admin:build: > next build
@warkop-yareh/web:build: > next build
@warkop-yareh/admin:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/web:build: ▲ Next.js 16.3.4 (Turbopack)
@warkop-yareh/admin:build: ✓ Compiled successfully in 11.1s
@warkop-yareh/web:build: ✓ Compiled successfully in 15.6s
@warkop-yareh/admin:build: ✓ Generating static pages using 11 workers (23/23) in 5.1s
@warkop-yareh/web:build: ✓ Generating static pages using 11 workers (33/33) in 825ms

Tasks:    5 successful, 5 total
Cached:    2 cached, 5 total
Time:     1m4.851s
COMMAND_EXIT=0
```

The complete route listing emitted by Next is represented one-row-per-page in the functional matrix.

## `pnpm test:e2e`

Executed as `fnm exec --using 24.20.0 pnpm test:e2e`.

```text
> warkop-yareh@0.1.0 test:e2e D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh
> playwright test

[WebServer] Error: Browser fixtures require NODE_ENV=test, warkop_audit, a loopback API and explicit fixture configuration
[WebServer]     at bootstrap (D:\MY CODE\ANTIGRAVITY\01-production\warkop-yareh\apps\api\test\browser-server.ts:33:11)
Error: Process from config.webServer was not able to start. Exit code: 1

ELIFECYCLE Command failed with exit code 1.
COMMAND_EXIT=1
```

No Playwright test reached execution; therefore there are no passed, skipped, or pending browser cases to claim from this run.

## `node scripts/ui-audit.mjs`

Executed as `fnm exec --using 24.20.0 node scripts/ui-audit.mjs`.

```text
file:///D:/MY%20CODE/ANTIGRAVITY/01-production/warkop-yareh/scripts/ui-audit.mjs:16
  throw new Error(
        ^

Error: UI_AUDIT_ADMIN_EMAIL and UI_AUDIT_ADMIN_PASSWORD are required
    at file:///D:/MY%20CODE/ANTIGRAVITY/01-production/warkop-yareh/scripts/ui-audit.mjs:16:9
    at ModuleJob.run (node:internal/modules/esm/module_job:561:25)
    at async node:internal/modules/esm/loader:647:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.20.0
COMMAND_EXIT=1
```

No credentials were invented or copied into the repository.

## `node scripts/scope-integrity.mjs`

Executed as `fnm exec --using 24.20.0 node scripts/scope-integrity.mjs`.

```text
Historical merge disclosure verified: 235 paths across 8 areas
New-merge audit skipped: no complete Git comparison range is available
COMMAND_EXIT=0
```

## Prisma network note

No Prisma binary-fetch network failure occurred in these commands. The failing test gate was the intentional isolated-database guard described above.
