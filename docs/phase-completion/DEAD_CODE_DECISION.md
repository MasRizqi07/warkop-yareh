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

---

## 4. Discrete Commits & Verification Log

| Area | Commit SHA | Date | Scope of Decommissioning | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Area 1: Admin** | `7892f74` | 2026-10-13 | `(dashboard)/{community,crm,events,loyalty,reservations}` and pruned `management-api.ts` dead methods | Build (20 pages), typecheck, lint, test (4 passed) |
| **Area 2: Web** | `976a3de` | 2026-10-13 | `features/{reservations,loyalty}`, `(marketing)/{community,events,blog}`, stub pages `app/{booking,loyalty,reservations}`, pruned `public.api.ts` | Build (28 pages), typecheck, lint, test (47 passed) |
| **Area 3: API** | `2f53510` | 2026-10-13 | `src/modules/{community,event,loyalty,reservation}`, pruned booking tests in `checkout.e2e-spec.ts` | Typecheck, lint, unit tests (213 passed, 0 failed across 32 suites) |
| **Area 4: Assets** | `35c3559` | 2026-10-13 | `apps/web/public/images/{matcha-pandan-latte,cold-brew-aren-brulee,artisan-toasted-sourdough,darmo-interior.png,hero/hero-coffee.png}`, updated `browser-server.ts:126` to `image: null` | Build, lint, zero orphaned asset references |

---

## 5. Test Suite Impact & Delta Accounting

| Package / Suite | Pre-Decommission Tests | Tests Removed | Post-Decommission Tests | Explanation of Delta |
| :--- | :--- | :--- | :--- | :--- |
| `@warkop-yareh/admin` | 4 passed | 0 | 4 passed | Only dead pages removed; existing `operations-api.test.ts` untouched. |
| `@warkop-yareh/web` | 49 passed | 2 | 47 passed | `booking-date.test.ts` (2 tests) decommissioned with `features/reservations/`. |
| `@warkop-yareh/api` (Unit) | 219 passed, 3 failed (33 suites) | 9 tests (1 suite) | 213 passed, 0 failed (32 suites) | Removed unit test specs for dead modules (`community`, `event`, `loyalty`, `reservation`). Expired mock date failures (3 tests) in `reservation.service.spec.ts` eliminated cleanly. |
| `@warkop-yareh/api` (Persistence) | 7 cases | 2 | 5 cases | 2 booking test cases (`replays a booking...`, `prices approved workspace packages...`) removed from `checkout.e2e-spec.ts` per Directive C.3. |
| `test:contracts` | 4 passed | 0 | 4 passed | Canonical 308 redirects and contract invariants verified intact. |
| `audit:reality` | 27 passed | 0 | 27 passed | Business integrity audit passes with zero warnings. |

---

## 6. HTTP 308 Canonical Redirect Verification (`curl -I`)

Verified on production build server (`http://localhost:3000`) on 2026-10-13:

```http
=== /reservations ===
HTTP/1.1 308 Permanent Redirect
location: /outlets
Refresh: 0;url=/outlets

=== /loyalty ===
HTTP/1.1 308 Permanent Redirect
location: /
Refresh: 0;url=/

=== /events ===
HTTP/1.1 308 Permanent Redirect
location: /
Refresh: 0;url=/

=== /community ===
HTTP/1.1 308 Permanent Redirect
location: /
Refresh: 0;url=/

=== /booking ===
HTTP/1.1 308 Permanent Redirect
location: /outlets
Refresh: 0;url=/outlets

=== /blog ===
HTTP/1.1 308 Permanent Redirect
location: /
Refresh: 0;url=/
```

---

## 7. Sign-Off & Status

- **Status Code:** `DONE_WITH_CONCERNS`
- **Sign-Off Date:** 2026-10-13
- **Concerns / Deferred Items:**
  1. Ordering vocabulary (`voucherCode`, `voucherDiscount`, `loyaltyPointsUsed`, `membershipTier`) deferred in active database repositories and DTOs per Section 0.4 and Directive C.3.
  2. Local persistence test execution (`checkout.e2e-spec.ts`) remains blocked locally due to Docker daemon unavailable in Windows non-elevated user shell; passes in remote CI Linux container.
- **Outcome:** All dead code and orphaned template assets deleted in 4 standalone, reversible commits. Zero schema migrations introduced. All 27 reality checks, 4 contract tests, and 264 unit tests green on Node 24.

