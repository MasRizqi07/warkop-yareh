# Merge 90c4366 Scope Integrity Audit

## 1. Audit Context & Methodology

- **Merge Commit**: `90c4366792b6408cfdf8660981f13c45f3a355d1`
- **First Parent (`90c4366^1`)**: `0b3efd9e3b97ad8711e1f77ecbc22d4eebcf91d3` (Approved Phase 1 Remediation)
- **Imported Branch Head (`90c4366^2`)**: `f7c76db4604bd7e80287be6829558609c4f59cd4`
- **Known Imported Commits**:
  - `7e64d4e` — App-state persistence and client checkout estimation
  - `6c89899` — Removal of generated Prisma client and 35+ obsolete scripts/tests
  - `f7c76db` — Cashier shifts, cash movements, admin/API/public-feature rewrites
- **Diff Statistics**:
  - 235 files changed
  - 8,815 insertions
  - 81,176 deletions (primarily generated Prisma artifacts and dead scripts)

---

## 2. Classification Schema

Every file modified in `90c4366^1..90c4366` has been reviewed and classified under one of the 7 required categories:

| Category Code | Category Name | File Count | Description |
|---|---|---|---|
| **A** | `REQUIRED_REMEDIATION` | 18 | Direct remediation items required for correctness, idempotency, and security. |
| **B** | `REQUIRED_DEPENDENCY` | 22 | Supporting services, repositories, and DTOs necessary for remediation items. |
| **C** | `CLEANUP` | 102 | Repository cleanup, deletion of generated artifacts and unmaintained scripts. |
| **D** | `OUT_OF_SCOPE_FEATURE` | 68 | Features outside the approved remediation scope (cashier shifts, content module, admin rewrite). |
| **E** | `PRODUCT_BEHAVIOR_CHANGE` | 15 | Alterations to end-user or operational behavior (guest cart estimates, booking intervals). |
| **F** | `INFRASTRUCTURE_OR_TOOLCHAIN` | 10 | CI/CD workflows, build scripts, package locks, engine constraints. |
| **G** | `UNKNOWN_REQUIRES_REVIEW` | 0 | All paths have been inspected and classified. |

---

## 3. Detailed Area-by-Area Audit & Recommendations

### 3.1 Repository Cleanup & Generated Artifact Removal
- **Paths**: `packages/database/generated/client/**` (18 files, 53,000+ lines), 35+ root test scripts (`test-*.js`, `query-*.js`, `create-role.js`), dead web sections (`apps/web/src/components/sections/*`).
- **Category**: `C. CLEANUP`
- **Commit Origin**: `6c89899`
- **Business / Operational Impact**: High positive impact. Removing generated Prisma artifacts prevents binary engine drift across macOS, Linux, and Windows. Removing unauthenticated root test scripts eliminates credential leakage risks.
- **DB / API / UI Impact**: None. Prisma Client is now generated dynamically during `pnpm install` / CI runner initialization.
- **Security Impact**: Positive. Eliminates hardcoded tokens and credentials stored in ad-hoc test scripts.
- **Test Coverage**: CI build, Prisma generation, and typecheck verify client availability.
- **Recommendation**: **ACCEPT**

---

### 3.2 Cashier Shifts & Cash Drawer Operations
- **Paths**:
  - `packages/database/prisma/migrations/20260908130000_cashier_shift_operations/migration.sql`
  - `packages/database/prisma/schema.prisma` (`CashierShift`, `CashDrawerMovement`)
  - `apps/api/src/modules/operations/**` (`shift.service.ts`, `shift.controller.ts`, `shift.dto.ts`)
  - `apps/admin/src/app/(dashboard)/shifts/page.tsx`
  - `apps/web/src/app/ops/shift/page.tsx`
- **Category**: `D. OUT_OF_SCOPE_FEATURE`
- **Commit Origin**: `f7c76db`
- **Business Impact**: Introduces POS shift management (opening float, cash-in/cash-out drawer adjustments, shift reconciliation, closing cash counting). Highly valuable for physical operations but was not in the original remediation scope.
- **DB Impact**: Strictly additive tables (`cashier_shifts`, `cash_drawer_movements`) and enums. Partial unique index `cashier_shifts_one_open_per_branch` guarantees at most one open shift per branch. Table-level RLS enforced with branch isolation policies.
- **API Impact**: New endpoints under `/api/v1/shifts`. Protected with `@Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.OWNER, Role.SUPERADMIN)`. Uses PostgreSQL `pg_advisory_xact_lock` and serializable isolation to prevent concurrency anomalies.
- **UI Impact**: Management view in Admin dashboard and cashier view in Web app.
- **Security Impact**: Server-side role enforcement and branch tenant isolation verified. Concurrency serialization conflicts mapped to HTTP 409 Conflict.
- **Test Coverage**: Unit tests in `shift.service.spec.ts`, integration tests in `apps/api/test/operations.e2e-spec.ts`.
- **Recommendation**: **ACCEPT_WITH_FIX** (Retain with concurrency conflict handling and branch scoping tests; keep production migration gated).

---

### 3.3 Cash Payment Handling at POS
- **Paths**:
  - `apps/api/src/infrastructure/payment/cash-payment.controller.ts`
  - `apps/api/src/infrastructure/payment/payment.service.ts`
  - `apps/admin/src/app/pos/page.tsx`
  - `apps/web/src/app/ops/pos/page.tsx`
- **Category**: `D. OUT_OF_SCOPE_FEATURE`
- **Commit Origin**: `f7c76db`
- **Business Impact**: Allows cashier staff to record exact cash payments received at POS.
- **DB Impact**: Updates `orders.paymentStatus = 'PAID'` and logs transaction.
- **API Impact**: New endpoint `POST /api/v1/payments/cash`. Enforces server-side cashier roles (`CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`). Verifies shift is OPEN at the order branch before accepting cash payment.
- **Security Impact**: Verified server-side check. Prevents cash payments if branch has no open cashier shift.
- **Test Coverage**: Unit tests in `payment.service.spec.ts` and `cash-payment.controller.spec.ts`.
- **Recommendation**: **ACCEPT**

---

### 3.4 Public Content & Blog System
- **Paths**:
  - `apps/api/src/modules/content/**`
  - `apps/web/src/app/(marketing)/blog/**`
- **Category**: `D. OUT_OF_SCOPE_FEATURE`
- **Commit Origin**: `f7c76db`
- **Business Impact**: Adds public marketing articles and blog posts.
- **DB / API / UI Impact**: Read-only public endpoints with server-side caching.
- **Security Impact**: Low risk; no mutations permitted by untrusted actors.
- **Test Coverage**: API unit tests in `content.service.spec.ts`.
- **Recommendation**: **ACCEPT**

---

### 3.5 Event Registration Composite Index
- **Paths**:
  - `packages/database/prisma/migrations/20260908143000_event_registration_status_index/migration.sql`
- **Category**: `A. REQUIRED_REMEDIATION`
- **Commit Origin**: `f7c76db`
- **Business Impact**: Improves query performance for event capacity checks and prevents registration race conditions.
- **DB Impact**: Replaces `event_registrations_eventId_idx` with composite index `event_registrations_eventId_status_idx`. Zero data loss.
- **Security Impact**: Positive. Mitigates concurrent overbooking of events.
- **Test Coverage**: Verified in migration deployment and integration tests.
- **Recommendation**: **ACCEPT**

---

### 3.6 Guest Cart & Quote Behavior
- **Paths**:
  - `apps/api/src/modules/ordering/presentation/controllers/orders.controller.ts`
  - `apps/web/src/app/cart/page.tsx`
  - `apps/web/src/lib/client-checkout-estimate.ts`
- **Category**: `E. PRODUCT_BEHAVIOR_CHANGE`
- **Commit Origin**: `7e64d4e` / `b93cf79`
- **Business Impact**: Transitioned checkout price calculation from client-side estimation to server-authoritative quotes. In `3303f1c`, guests are blocked from seeing any price breakdown at `/cart` until logging in.
- **DB / API / UI Impact**: Evaluated in dedicated document `docs/release-recovery/GUEST_QUOTE_DECISION.md`.
- **Security Impact**: Server pricing prevents price tampering. Public guest quote must strictly ignore vouchers and loyalty points.
- **Recommendation**: **ACCEPT_WITH_FIX** (Adopt Option B: Dedicated public server quote endpoint `POST /api/v1/orders/quote/guest` without vouchers or loyalty, maintaining 100% server pricing authority).

---

### 3.7 Admin Portal Management Pages
- **Paths**: `apps/admin/src/app/(dashboard)/**` (14 pages: `analytics`, `branches`, `community`, `crm`, `events`, `inventory`, `loyalty`, `marketing`, `orders`, `products`, `reservations`, `settings`, `shifts`, `users`).
- **Category**: `D. OUT_OF_SCOPE_FEATURE`
- **Commit Origin**: `f7c76db`
- **Business Impact**: Complete management dashboard for multi-branch operations.
- **Security Impact**: Evaluated in dedicated audit `docs/release-recovery/ADMIN_SECURITY_AUDIT.md`.
- **Recommendation**: **ACCEPT_WITH_FIX** (Ensure all mutations reload authoritative state via `loadData()`; verify strict server-side RBAC and branch isolation).

---

## 4. Synthesis of Merge 90c4366 Scope Audit

The imported changes from `90c4366` represent a substantial functional advancement for the application rather than malicious or destabilizing code:
1. All database migrations are strictly additive and non-destructive.
2. The elimination of 53,000+ lines of generated Prisma client and obsolete scripts drastically improved repository hygiene.
3. The additions in POS cashier shifts and cash management enforce rigorous database constraints, advisory locks, and row-level security.
4. With appropriate hardening (guest public quote endpoint, CD workflow fail-fast preflight guard, and admin state reload fixes), retaining the merge payload is technically sound and significantly preferable to destructive git history reconstruction.
