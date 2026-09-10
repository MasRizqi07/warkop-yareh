# Final Release Recovery & Audit Report

## 1. Executive Summary

- **Repository**: `MasRizqi07/warkop-yareh`
- **Audit Date**: 2026-09-09
- **Current Release Verdict**: **`NO-GO`**

### Summary of Audit Outcome:

The repository has undergone a conservative, evidence-backed Release Recovery and Scope Integrity Audit. The recorded recovery tree passes its local gates and has supporting CI-container evidence, but it has not yet been verified by an exact-commit remote CI run or in a deployed environment.

The following local and CI-container results were recorded for the audited commits; they do not establish exact-commit remote CI or staging acceptance for the current recovery branch:

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
- **Audit Recommendation**: **ACCEPT THE AUDITED TREE FOR CONTINUED VERIFICATION**. The recorded payload is structurally sound and non-destructive under the listed local and CI-container checks. Exact-commit remote CI and deployed-environment verification remain required.

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

_All test counts are taken from direct test runner execution:_

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

| Severity | Risk Description                                                      | Mitigation / Action Required                                                                                                                         |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P0**   | Production database credentials missing in GitHub Actions Environment | Repository admin must configure `DATABASE_URL` under GitHub Environment `production` and set `PRODUCTION_MIGRATION_ENABLED=true`.                    |
| **P1**   | Staging runtime behavior unverified against live cloud cluster        | Deploy `codex/release-recovery` to staging and execute end-to-end smoke verification before scheduling production rollout.                           |
| **P2**   | Local Docker daemon inactive on audit workstation                     | Integration and migration tests relied on GitHub Actions container runners; local Compose environment should be started for local offline debugging. |
| **P3**   | Long-term roadmap features (multi-region read replicas, AI concierge) | Accurately designated as `NOT_IMPLEMENTED` or `PARTIAL` in `docs/ROADMAP.md`.                                                                        |

---

## 13. Release Decision

### Verdict: **`NO-GO`**

### Justification:

The repository source code, database migration chain, and automated test suite have passed the recorded local and CI-container checks. They are not yet release-verified because exact-commit remote CI and deployed staging evidence are still missing. Physical production rollout cannot proceed until:

1. The GitHub Environment `production` is configured with a valid `DATABASE_URL`.
2. Staging deployment and live runtime smoke testing are successfully conducted and signed off.

---

## 14. Git Evidence Boundary

- **Reviewed main baseline**: `6184a17bb48cf1bc422cbfaa4bc60702f647d32e`
- **Clean reconciled recovery parent**: `c91d76eaf2c8552258ef9449b62498c2f2d5ec95`
- **Recovery branch**: `codex/release-recovery-v2`
- The pre-rebase commit IDs `1187804`, `798243b`, and `0d0b918` are superseded history and are not part of the clean branch ancestry. Their relevant patches were already present on `main` through a different lineage before reconciliation.
- Use `git log origin/main..HEAD` and `git diff origin/main...HEAD` at review time as the authoritative current history and payload. Do not infer current evidence from the historical commit list in earlier recovery reports.
