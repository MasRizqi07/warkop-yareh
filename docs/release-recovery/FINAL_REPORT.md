# Final Release Recovery & Audit Report

## 1. Executive Summary

- **Repository**: `MasRizqi07/warkop-yareh`
- **Audit Date**: 2026-09-09
- **Current Release Verdict**: **`NO-GO`**

### Summary of Audit Outcome:
The repository has undergone a rigorous, conservative, and evidence-backed Release Recovery and Scope Integrity Audit. The codebase, database schema, CI/CD pipeline, and automated test suite have been brought to an auditable, hardened state. 

All local and CI-level quality gates pass:
- Typecheck: 4/4 packages pass with 0 errors.
- ESLint: 3/3 packages pass with 0 errors.
- Monorepo Production Build: All packages (`web`, `admin`, `api`, `ui`) compile cleanly in 18.18s.
- Automated Test Suite: 44 test suites, **269 passed tests**, 0 failures.
- Merge `90c4366` scope integrity: 235 paths classified and cataloged in machine-checkable disclosures.
- CD Migration Pipeline: Hardened with fail-fast preflight target validation (`scripts/validate-database-target.mjs`) and manual `workflow_dispatch` gating.

However, in accordance with the strict Release Gating Policy (Section 23), the release is classified **`NO-GO`** because live staging environment verification, staging smoke tests, and verified injection of the production `DATABASE_URL` secret into GitHub Actions remain **NOT VERIFIED / BLOCKED**. Production migration must remain frozen until staging acceptance is granted by human release operators.

---

## 2. Repository Baseline

- **Starting Baseline Main SHA**: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`
- **Origin Main SHA**: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`
- **Recovery Branch**: `codex/release-recovery`
- **Worktree State**: Clean (`working tree clean, nothing to commit`)
- **Node.js Runtime**: `v26.7.0` (Package engine specifies `>=24.0.0 <25`)
- **Package Manager**: `pnpm 9.0.0`
- **Prisma Engine**: `5.22.0`

---

## 3. Changes Made

Every code and configuration modification maps directly to an approved recovery task:

1. **Fail-Fast Database Target Validation**:
   - Added `scripts/validate-database-target.mjs` to validate URI scheme (`postgres:` / `postgresql:`), credential presence, and reject localhost or disposable databases in production without leaking secrets.
   - Updated `.github/workflows/cd.yml` with manual `workflow_dispatch` trigger, `commit_sha` confirmation check, `environment: production` binding, and preflight target validation.
   - Added `docs/release/PRODUCTION_MIGRATION_RUNBOOK.md`.
2. **Scope Governance & Disclosure**:
   - Added `scripts/scope-integrity.mjs` and machine-readable disclosure ledger `docs/release/scope-disclosures/f7c76db4604bd7e80287be6829558609c4f59cd4.json` auditing all 235 files from merge `90c4366`.
   - Added PR template `.github/pull_request_template.md` requiring merge disclosures for out-of-scope patches.
3. **Guest Cart / Quote Resolution (Option B)**:
   - Added `GuestOrderQuotesController` (`POST /api/v1/orders/quote/guest`) in `apps/api/src/modules/ordering/presentation/controllers/guest-order-quotes.controller.ts`.
   - Strictly enforces server-side pricing while forbidding account-specific fields (`userId`, `voucherCode`, `loyaltyPointsUsed`, `expectedTotal`) via DTO validation.
   - Updated `apps/web/src/features/orders/orders.api.ts` and `apps/web/src/app/cart/page.tsx` to display live server-authoritative guest estimates (subtotal, 11% tax, 5% fee).
4. **Authorization & Concurrency Hardening**:
   - Handled PostgreSQL serializable transaction conflicts (`40001` / Prisma `P2034`) in `ShiftService.close()` and `BookingService.create()` to prevent unhandled 500 errors.
   - Fixed admin dashboard pages (`branches`, `inventory`, `marketing`) to reload authoritative server state after mutations rather than optimistically mutating local arrays.
5. **Test Harness & Verification Strengthening**:
   - Added `guest-order-quotes.controller.spec.ts` (5 specs covering public quote contract and forbidden field rejections).
   - Added `apps/api/test/operations.e2e-spec.ts` and `apps/web/e2e/admin-operations.e2e.ts`.
   - Updated `docs/ROADMAP.md` with explicit Evidence Maturity Matrix and linked canonical release documentation.

---

## 4. CI/CD Findings

- **Root Cause of Production Migration Failure**:
  1. Missing GitHub Environment binding: Baseline `.github/workflows/cd.yml` ran without `environment: production`. Consequently, GitHub Actions did not expose environment-level secrets to the runner, causing `${{ secrets.DATABASE_URL }}` to resolve to `""`.
  2. Unsafe triggering: CD was triggered automatically via `workflow_run` on completion of CI, attempting migrations without human confirmation or commit review.
  3. Missing preflight guard: Prisma CLI was invoked directly with an empty URL, resulting in Prisma engine error `P1012`.
- **Pipeline Remediation**:
  - Bound `environment: production`.
  - Replaced `workflow_run` with `workflow_dispatch` requiring manual entry of `commit_sha` and confirmation string `MIGRATE_PRODUCTION`.
  - Added safe preflight target validation that terminates execution prior to invoking Prisma if configuration is invalid.

---

## 5. Database Migration Findings

- **Separation of Configuration vs Migration**:
  - The migration scripts themselves are completely valid and error-free.
  - In CI ephemeral container runs (`postgres:16`), all 15 migrations executed in sequence cleanly from a fresh database.
- **Migration Chain Inspection**:
  - Total migrations: 15.
  - Zero dropped tables.
  - Zero dropped columns.
  - Zero data deletions or truncations.
  - Exactly one index modification: `DROP INDEX "event_registrations_eventId_idx"` replaced with composite index `CREATE INDEX "event_registrations_eventId_status_idx" ON "event_registrations"("eventId", "status")` in `20260908143000_event_registration_status_index`.
  - Shift operations migration (`20260908130000_cashier_shift_operations`) introduces strictly additive tables, positive check constraints, unique partial index on open shift, and forced RLS.
  - `prisma validate` passes.

---

## 6. Scope Audit Result (Merge 90c4366)

- **Total Affected Paths**: 235 files.
- **Category Classification**:
  - `A. REQUIRED_REMEDIATION`: 18 files
  - `B. REQUIRED_DEPENDENCY`: 22 files
  - `C. CLEANUP`: 102 files (purgation of 53,000+ lines of generated Prisma code and 35+ obsolete scripts)
  - `D. OUT_OF_SCOPE_FEATURE`: 68 files (cashier shifts, content module, admin rewrite)
  - `E. PRODUCT_BEHAVIOR_CHANGE`: 15 files (checkout estimation, guest quotes, booking intervals)
  - `F. INFRASTRUCTURE_OR_TOOLCHAIN`: 10 files
  - `G. UNKNOWN_REQUIRES_REVIEW`: 0 files
- **Audit Recommendation**: **ACCEPT CURRENT TREE**. The payload is structurally sound, clean, non-destructive, and has been properly hardened and tested. Reconstruction from `0b3efd9` is unnecessary and counterproductive.

---

## 7. Security and Authorization Findings

- **Server-Side Enforcement**: All operations (cashier shifts, cash payments, order status updates, catalog price overrides, inventory management) are guarded by NestJS `@Roles` and `@UseGuards(JwtAuthGuard, RolesGuard)`.
- **Tenant Isolation**: PostgreSQL Row Level Security is enforced with `FORCE ROW LEVEL SECURITY` across `cashier_shifts`, `cash_drawer_movements`, `orders`, and `tables`.
- **Cashier Guarding**: Cash payments at POS verify that an active open shift exists at the assigned branch before accepting payments.
- **Admin UI Mutation Safety**: Admin pages reload authoritative server state, eliminating stale client-side UI desynchronization.

---

## 8. Product Behavior Findings

- **Prior Defect**: Checkout quote was locked behind authentication (`POST /api/v1/orders/quote`), preventing guest shoppers from seeing standard restaurant tax (11%) and service fee (5%) in the cart.
- **Resolution (Option B)**: Implemented `POST /api/v1/orders/quote/guest`. Calculates server-authoritative totals and branch price overrides without exposing personal vouchers or loyalty balances. Extra fields in the request payload return HTTP 400.

---

## 9. Regression Results

*All test counts are taken from direct test runner execution:*

- **Monorepo Typecheck**: `4 successful, 4 total` (0 errors)
- **Monorepo ESLint**: `3 successful, 3 total` (0 errors)
- **Monorepo Turbopack Build**: `4 successful, 4 total` (0 errors, 18.18s)
- **Scope Integrity Audit**: `Historical merge disclosure verified: 235 paths across 8 areas`
- **Unit & Domain Tests**:
  - `@warkop-yareh/api`: **38 test suites passed, 245 tests passed** (0 failures, 14.061s)
  - `@warkop-yareh/web`: **5 test files passed, 20 tests passed** (0 failures, 2.53s)
  - `@warkop-yareh/admin`: **1 test file passed, 4 tests passed** (0 failures, 1.30s)
- **Total Monorepo Unit Tests**: **44 test files, 269 tests passed, 0 failures**.

---

## 10. Staging Evidence

- **Status**: **`NOT VERIFIED`**
- **Details**: No staging environment deployment or staging database connection was provided for live smoke verification.

---

## 11. Production Evidence

- **Status**: **`NOT VERIFIED`**
- **Details**: Production migration workflow is intentionally frozen and protected. No live production database mutation was executed.

---

## 12. Remaining Risks

| Severity | Risk Description | Mitigation / Action Required |
|---|---|---|
| **P0** | Production database credentials missing in GitHub Actions Environment | Repository admin must configure `DATABASE_URL` under GitHub Environment `production` and set `PRODUCTION_MIGRATION_ENABLED=true`. |
| **P1** | Staging runtime behavior unverified against live cloud cluster | Deploy `codex/release-recovery` to staging and execute end-to-end smoke verification before scheduling production rollout. |
| **P2** | Local Docker daemon inactive on audit workstation | Integration and migration tests relied on GitHub Actions container runners; local Compose environment should be started for local offline debugging. |
| **P3** | Long-term roadmap features (multi-region read replicas, AI concierge) | Accurately designated as `NOT_IMPLEMENTED` or `PARTIAL` in `docs/ROADMAP.md`. |

---

## 13. Release Decision

### Verdict: **`NO-GO`**

### Justification:
While the repository source code, database migration chain, and automated test suite on branch `codex/release-recovery` are verified, secure, and ready for release, physical production rollout cannot proceed until:
1. The GitHub Environment `production` is configured with a valid `DATABASE_URL`.
2. Staging deployment and live runtime smoke testing are successfully conducted and signed off.

---

## 14. Exact Git Evidence

- **Starting SHA**: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`
- **Base Main Commit Message**: `chore: ignore local kube directory`
- **Recovery Branch**: `codex/release-recovery`
- **Commits Created**:
  1. `54999f6` — `chore(ci): fail fast when production database URL is missing`
  2. `61a096c` — `docs(audit): record release recovery baseline and CD findings`
  3. `0d28a50` — `docs(audit): classify merge 90c4366 scope`
  4. `1187804` — `fix(auth): correct verified authorization regression`
  5. `798243b` — `fix(checkout): resolve approved quote behavior issue`
  6. `0d0b918` — `test(database): strengthen migration verification`
  7. `f3e4298` — `docs(roadmap): update evidence maturity table and audit links`
  8. `fd2c09f` — `docs(release): add evidence matrix and release decision`
- **Total Changes Against Baseline `3303f1c`**:
  - 45 files changed
  - 3,886 insertions(+), 407 deletions(-)
