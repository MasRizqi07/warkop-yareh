# Dead Code Decommissioning Decision & Audit

**Document Status:** COMPLETE / EXECUTED  
**Date:** 2026-10-13  
**Repo:** `MasRizqi07/warkop-yareh`  
**Phase:** Phase 2 — Dead code decommissioning  
**Owner Decision:** Option (a) — Delete now via four independent, dated commits. Prisma schema and database rows stay untouched. Recovery preserved in Git history.

---

## 1. Executive Summary

During the Product v3 architecture transition, multiple legacy domains were disconnected from runtime navigation and routing but retained in the codebase without a formal decommissioning date. These legacy surfaces comprise ~4,500 lines of dead NestJS modules, Next.js admin and customer pages, legacy client API helpers, and unverified template imagery.

By explicit owner directive on 2026-10-13 (Rizqi), Option (a) has been executed. All dead code and assets are decommissioned in four discrete commits. Database schemas and rows remain strictly untouched in compliance with Section 0.4 (no destructive migrations). All HTTP 308 permanent redirects remain in place to protect legacy indexed URLs.

---

## 2. Decommissioning Matrix & Call-Graph Verification

| Area | Decommissioned Paths | Call-Graph / Reachability Proof | Downstream Impact & Handling |
| :--- | :--- | :--- | :--- |
| **Area 1: Admin** | `apps/admin/src/app/(dashboard)/{community,crm,events,loyalty,reservations}`<br>`apps/admin/src/lib/management-api.ts` (dead functions) | - Admin `next.config.ts` redirects all 5 routes.<br>- `Sidebar.tsx` has zero links to these routes.<br>- `management-api.ts` functions imported exclusively by the deleted dashboard pages.<br>- Zero callers in live admin screens. | Delete pages and unused API methods.<br>Redirects in `next.config.ts` preserved.<br>Zero runtime impact on live admin. |
| **Area 2: Web** | `apps/web/src/features/reservations/`<br>`apps/web/src/features/loyalty/`<br>`apps/web/src/app/(marketing)/{community,events,blog}`<br>`apps/web/src/app/{booking,loyalty,reservations}/page.tsx` | - Customer `next.config.mjs` enforces permanent HTTP 308 redirects to `/outlets` and `/`.<br>- Global navigation and footer have zero links to these routes.<br>- Stub pages merely re-exported deprecated features. | Delete feature folders, marketing routes, and stubs.<br>308 redirects in `next.config.mjs` preserved.<br>`booking-date.test.ts` (2 tests) deleted with feature. |
| **Area 3: API** | `apps/api/src/modules/{reservation,loyalty,community,event}` | - None of these modules is registered in `AppModule`.<br>- No live controller or service is injected by active API domains.<br>- Only test dependency was `BookingService` in `checkout.e2e-spec.ts`. | Delete module directories.<br>Remove booking test cases from `checkout.e2e-spec.ts` per Directive C.3.<br>Eliminates 3 expired date test failures in `reservation.service.spec.ts`. |
| **Area 4: Assets** | `apps/web/public/images/{matcha-pandan-latte.png,cold-brew-aren-brulee.png,artisan-toasted-sourdough.png,darmo-interior.png,hero/hero-coffee.png}` | - Grep confirms zero references across live customer pages, admin, or metadata.<br>- Referenced only by legacy fixtures. | Delete 5 orphaned template image files. |

---

## 3. Protected Ordering Surface (Deferred Items)

Per Section 0.4 and Directive C.3, the following legacy vocabulary elements reside inside the active ordering, payment, and repository paths:
- Voucher and loyalty discount fields in `orders.controller.ts`, `order.dto.ts`, `prisma-ordering.repository.ts`, `checkout-pricing.ts`.
- Legacy user schema fields (`membershipTier`, `loyaltyPoints`) in `apps/api` identity domain.

**Decision:** **DEFERRED — NEEDS SEPARATE OWNER DECISION.**  
These paths touch the protected financial calculation and checkout pricing contract. In accordance with rule 0.4 and directive C.3, they are NOT modified or removed during Phase 2. They will be addressed in a future dedicated ordering refactor only upon explicit instruction.

---

## 4. Test Suite Impact & Delta Accounting

| Package | Pre-Decommission Tests | Tests Removed | Post-Decommission Tests | Explanation of Delta |
| :--- | :--- | :--- | :--- | :--- |
| `@warkop-yareh/admin` | 4 passed | 0 | 4 passed | Only dead pages removed; existing `operations-api.test.ts` untouched. |
| `@warkop-yareh/web` | 49 passed | 2 | 47 passed | `booking-date.test.ts` (2 tests) decommissioned with `features/reservations/`. |
| `@warkop-yareh/api` (Unit) | 264 passed, 3 failed | 85 | 182 passed, 0 failed | Removed unit test suites for dead modules (`reservation`, `loyalty`, `community`, `event`). Expired date failures in `reservation.service.spec.ts` eliminated. |
| `@warkop-yareh/api` (Persistence) | 7 cases | 2 | 5 cases | 2 booking test cases (`replays a booking...`, `prices approved workspace packages...`) removed from `checkout.e2e-spec.ts` per C.3. |
| `test:contracts` | 4 passed | 0 | 4 passed | Canonical 308 redirects and contract invariants verified intact. |
| `audit:reality` | 27 passed | 0 | 27 passed | Integrity audit passes with zero warnings. |
