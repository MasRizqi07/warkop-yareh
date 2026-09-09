# Phase 2-6 execution register

> Status is evidence-based. A local pass does not imply CI, staging, live-provider, or production approval.

## Definition of done

1. Production routes never fabricate successful mutations, payments, orders, inventory, reservations, loyalty balances, campaigns, or operational state.
2. Customer and staff UIs consume the NestJS API for mutable/domain data and expose loading, empty, error, retry, and disabled states.
3. API inputs are validated, responses use the shared envelope, privileged operations enforce role and branch scope, and retries are idempotent where money or inventory is involved.
4. Database changes are migration-backed, indexed, constrained, tenant-aware, and exercised against a disposable PostgreSQL database.
5. Pricing remains server-authoritative: tax 11%, service fee 5%, and one redeemed point equals Rp100.
6. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, Prisma validation/generation, migration/seed checks, and the runtime evidence harness all finish with exit code 0.
7. Runtime acceptance covers 320, 480, 768, 1024, and 1440 px; keyboard/accessibility basics; dark/light themes; reduced motion; invalid URLs; API failure; and persisted mutation-after-reload.

## Route and data-flow register

| Surface | Route/area | Phase 2 finding | Required implementation | Acceptance evidence |
| --- | --- | --- | --- | --- |
| Web | `/ops/pos`, `/ops/kds`, `/ops/shift` | Duplicate browser-only stores bypass staff authentication | Consolidate into the authenticated admin terminals and remove the legacy store | Redirect/navigation check; no legacy mock-store import |
| Web | `/table/[tableId]` | Catalog and order success are browser simulations | Resolve a real table, load branch catalog, create an idempotent server order, and call staff through the API | Invalid-table and successful API-flow tests |
| Web | `/events` | Static event fixture | Fetch/filter real public events and register only through authenticated API | Empty/error/retry and registration mutation checks |
| Web | `/community`, `/community/groups/[id]` | Browser-only membership/posts/replies/likes | Use persisted groups, membership, and posts; remove unsupported controls | Join/post/reload proof; invalid group check |
| Web | `/blog` and home editorial data | Static fixture is presented as current domain data | Add read-only published-content/review endpoints; seed only explicit local fixtures | API contract tests and empty-state UI |
| Admin | POS/KDS/tables | Static fallback data and unauthenticated fetches | Real branch scope, catalog/orders/tables/waiter calls, authenticated mutations, WebSocket refresh | Mutation, reload, and branch-isolation tests |
| Admin | shifts/drawer | Entirely local simulation | Migration-backed shifts, cash movements, cash settlement, and reconciliation | Open/move/close/reload and concurrency tests |
| Admin | products/reservations/events/community/loyalty/users/settings | Static rows and `alert()` success paths | Wire to existing or extended APIs; remove fake controls | Per-page error/empty/mutation checks |
| API | authorization and operations | Some modules are sound; uncovered operations are missing | Extend existing bounded contexts, preserving global/branch roles and response format | Controller/service/RBAC regression tests |
| Database | generated client and operational persistence | Generated engines are tracked; shift domain absent | Ignore generated output; add constrained/indexed shift migration and RLS policies | `prisma validate`, deploy migrations, seed, persistence proof |
| Repository | root scripts/packages/docs | Dozens of unreferenced one-off scripts, telemetry/backups, empty packages, stale audit claims | Remove superseded artifacts; keep supported scripts under `scripts/`; mark historical documents | Import/reference scan and clean worktree inventory |

## Phase gates

| Phase | Gate | Status |
| --- | --- | --- |
| 2 | Inventory, consolidation plan, dead-code cleanup, naming/environment alignment | In progress |
| 3 | API/database/security/transaction hardening with focused tests | Pending |
| 4 | All active UI routes use real contracts and responsive/error states | Pending |
| 5 | Full static/unit/integration/browser regression suite | Pending |
| 6 | Disposable-local runtime proof and release boundary report | Pending |

## External gates

The following cannot be inferred from local code and stay explicitly unverified until separately authorized and supplied: exact-commit remote CI, staging deployment, production migration, live Midtrans callbacks, live WhatsApp dispatch, DNS/TLS, observability dashboards, and production load/SLO results.
