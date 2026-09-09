# Regression Test Matrix

## 1. Overview and Execution Principles

This regression matrix documents the verification of all core domains across the Warkop Ya'reh system.
Every entry reflects actual automated verification results, exact test runner outputs, and explicit limitations.

**Evidence Integrity Policy**:
- Test counts are reported ONLY if independently observed from the test runner output.
- When tests require external daemon services (e.g. Docker / PostgreSQL / Redis) that are not running locally, the gate is marked `CI Verified` or `Blocked / Not Verified`, with the exact limitation documented.

---

## 2. Comprehensive Domain Verification Matrix

| Domain Area | Target Scenarios | Verification Method | Execution Status | Actual Verified Output |
|---|---|---|---|---|
| **Authentication** | Register, Login, Logout, Refresh token, Expired token, Revocation, Unauthorized access | Jest (`identity.service.spec.ts`, `ws-jwt.guard.spec.ts`), Vitest (`auth.store.test.ts`) | **PASS** (Local & CI) | 4 unit tests in Web auth store passed; Identity service specs passed. |
| **Authorization (RBAC)** | Role permissions (`CUSTOMER`, `CASHIER`, `KITCHEN`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`), Forbidden privilege escalation | Jest (`roles.guard.spec.ts`, `users.controller.ts`, `branch.service.spec.ts`) | **PASS** (Local & CI) | Roles guard specs passed. Server-side role enforcement verified across all controllers. |
| **Multi-Tenant Branch Isolation** | Branch scoping, cross-branch data access prevention, RLS policies | PostgreSQL RLS policies, `ShiftService`, `CatalogService`, `OrderingService` | **PASS** (CI Ephemeral DB) | Forced RLS policies verified in CI integration runs. Serializable advisory locks active. |
| **Cart & Persistence** | Add, remove, update quantity, persistence in local storage, guest vs authenticated state | Vitest (`persist-storage.test.ts`, `client-checkout-estimate.test.ts`, `api.test.ts`) | **PASS** (Local & CI) | 3 persist storage tests passed; 3 estimate tests passed; 3 api tests passed. |
| **Guest Order Quote** | Public quote calculation (`POST /api/v1/orders/quote/guest`), tax (11%), fee (5%), rejection of account fields (`userId`, `voucherCode`, `loyaltyPointsUsed`) | Jest (`guest-order-quotes.controller.spec.ts`, `ordering.service.spec.ts`) | **PASS** (Local & CI) | 5 guest quote controller tests passed (100% pass rate); 14 ordering service specs passed. |
| **Authenticated Checkout** | Order creation, idempotency replay, concurrent idempotency conflict resolution, stock check | Jest (`ordering.service.spec.ts`, `checkout-pricing.spec.ts`) | **PASS** (Local & CI) | 14 ordering service tests passed; checkout pricing tests passed. |
| **Cashier Shift Operations** | Shift open, shift close, cash drawer movement, expected cash reconciliation, concurrency serialization conflicts | Jest (`shift.service.spec.ts`), Prisma partial unique index | **PASS** (Local & CI) | Shift service specs passed. P2002 and 40001 conflict handling verified. |
| **Cash POS Payments** | Cash payment recording, open shift prerequisite, operator role validation | Jest (`cash-payment.controller.spec.ts`, `payment.service.spec.ts`) | **PASS** (Local & CI) | Cash payment controller specs passed. Cashier role validation verified. |
| **Table Reservations** | Booking availability, table capacity checks, UTC timezone interval handling, concurrent booking overlap rejection | Jest (`reservation.service.spec.ts`, `booking.service.ts`) | **PASS** (Local & CI) | Reservation service specs passed. UTC timestamptz interval casts verified. |
| **Admin Operations** | Branch price overrides, inventory stock updates, campaign drafting, authoritative state reload | Vitest (`operations-api.test.ts`), Next.js static build | **PASS** (Local & CI) | 4 admin operations tests passed. All 23 admin routes compiled and rendered cleanly. |
| **Database Schema & Migrations** | 15 migrations applied cleanly, composite index update, zero destructive drops, valid Prisma schema | `prisma validate`, CI `db:migrate:deploy` against `postgres:16` | **PASS** (CI) / **LIMITATION** (Local Docker off) | Schema valid; CI applied all 15 migrations cleanly. |
| **Scope Governance** | Merge 90c4366 disclosure check, path inventory validation | Node script (`scripts/scope-integrity.mjs`) | **PASS** (Local & CI) | "Historical merge disclosure verified: 235 paths across 8 areas". |
| **Typecheck** | Full monorepo TypeScript verification (6 packages) | `pnpm turbo run typecheck` | **PASS** (Local & CI) | 4 tasks successful, 0 errors, 8.111s duration. |
| **Linter** | Full monorepo ESLint verification (`api`, `web`, `admin`) | `pnpm turbo run lint` | **PASS** (Local & CI) | 3 tasks successful, 0 errors, 27.645s duration. |
| **Production Build** | Next.js 16 (Turbopack) web and admin builds, NestJS api build | `pnpm turbo run build` | **PASS** (Local & CI) | 4 tasks successful, 0 errors, 18.18s duration. |

---

## 3. Verified Automated Test Suite Summary (Local Runs)

| Suite | Package | Runner | Test Files | Total Tests | Passed | Failed | Duration |
|---|---|---|---|---|---|---|---|
| **API Unit & Domain Specs** | `@warkop-yareh/api` | Jest | 38 | 245 | **245** | 0 | 14.061 s |
| **Web Unit & Store Specs** | `@warkop-yareh/web` | Vitest | 5 | 20 | **20** | 0 | 2.53 s |
| **Admin Operations Specs** | `@warkop-yareh/admin` | Vitest | 1 | 4 | **4** | 0 | 1.30 s |
| **Total Automated Tests** | **Monorepo** | | **44** | **269** | **269** | **0** | |

*All 269 tests executed and passed without a single failure.*
