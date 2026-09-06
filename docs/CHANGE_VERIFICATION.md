# Change verification and completion register

Baseline: `579226ae653dca45add6baa520e788ea19d0ac10`. The initial worktree had one user change in `capture-authenticated-evidence.js`; it is preserved. Historical claims in the supplied walkthrough are not current acceptance evidence.

## Stage 1: verified findings

- Fresh `pnpm turbo run lint typecheck test --force` exited **2**. Ten customer/admin pages contained interleaved old/new JSX and imports. Passing seven frontend unit tests did not establish that the pages compiled.
- The API lint gate independently reported **147 problems: 124 errors, 23 warnings**.
- Checkout caught API/payment errors, cleared the cart, and navigated to a fabricated order. Tracking constructed fallback orders and allowed local payment/status changes. Menu customization added options absent from the server catalog.
- Account and loyalty showed fabricated history/balances and successful actions without persistence. Several admin and booking pages were browser-only prototypes.
- Payment initialization generated fake tokens when credentials were absent. Payment updates lacked row locking and could downgrade a settled transaction. Signed webhooks also needed an explicit internal tenant context for RLS transactions.

## Invariants

1. A customer can read only their own private records; staff access is restricted by assigned branch and API authorization.
2. Product/option prices, discounts, point balances and payment state are authoritative on the server. A failed request must not become a success state.
3. Retrying the same checkout must replay the same order. Order creation, voucher use and point deduction must commit together.
4. Payment retries must not duplicate point awards or revert a settled/refunded state. Gateway side effects and database state require separate failure handling.
5. Private query caches must be scoped by user and cleared at logout. Resource cleanup must run when components unmount.

## Approved pricing decision

The user explicitly chose **11% tax, 5% service fee, and Rp100 per redeemed point**. Both percentages use the item subtotal. Vouchers and points discount merchandise, capped at the subtotal; tax and service fee remain payable. Codes must exist, be active, meet their minimum spend, and have remaining quota. Each configured voucher may be used once per customer. Existing orders retain their stored prices and a default zero service fee; they are not repriced by migration.

## Completion register

| Priority | Area | Required result | Current evidence |
| --- | --- | --- | --- |
| P0 | Recent JSX changes | All Web/Admin routes compile; retain semantic tokens | Admin typecheck passed after reconstruction; subsequent final checks pending |
| P0 | Checkout | Server quote, configured options, persistent retry key, truthful failure handling | Pricing migration and quote service implemented; UI integration in progress |
| P0 | Payments | Real gateway tokens, bounded timeout, verified status, atomic transitions | Hardening in progress; live provider verification pending |
| P0 | Loyalty | Atomic redemption/award/reversal and real ledger | API-backed UI implemented; concurrency regression checks pending |
| P1 | Account | Profile save, private order archive, real favorites, session management | Profile/archive integrated; remaining account features under review |
| P1 | Booking/QR | Real tables, availability, atomic reservations, valid onboarding | Existing API available; redesigned booking UI still needs reconciliation |
| P1 | Community | Persisted membership/posts/replies and real counts | Service inventory inspected; remaining UI integration pending |
| P1 | Admin | Persistent inventory, shifts, CRM, campaigns, branch controls, analytics | Prototype controls identified; integration pending |
| P1 | Database | Fresh migrations, schema drift check, constraints/indexes, seed integrity | Migrations through checkout pricing pass on isolated PostgreSQL |
| P2 | Shared UI | Accessible dialogs/drawers, error/loading/empty states, responsive routes | Data-state components implemented; browser audit pending |
| P2 | Quality gates | Zero-warning lint, typecheck, full tests, production build | Final validation pending |
| External | Release | Exact-commit CI, staging E2E, live provider callbacks, production configuration | Unverified; staging URLs/database isolation requested from user |

Evidence logs are stored under the ignored `test-results/` directory. No production database migration or deployment has been performed by this audit.
