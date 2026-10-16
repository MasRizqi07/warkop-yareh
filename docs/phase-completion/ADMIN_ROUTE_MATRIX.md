# Admin Route Matrix & Operational Surface

**Document Status:** FINAL / COMMITTED  
**Date:** 2026-10-16  
**Applicable Branch:** `antigravity/phase3-evidence`  
**Monorepo Package:** `apps/admin` (Next.js 16.3.6)

---

## 1. Active & Retained Operational Routes

| Route | Page Title / Purpose | RBAC Role | Backing API Endpoints | Automated Coverage |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Dashboard Overview | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/analytics/overview`, `GET /api/v1/orders/recent` | `admin-operations.e2e.ts:40` |
| `/analytics` | Financial & Sales Analytics | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/analytics/revenue`, `GET /api/v1/analytics/hourly-demand` | `admin-operations.e2e.ts:40`, `:86` |
| `/branches` | Branch Capacity & Details | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/branches`, `PATCH /api/v1/branches/:id` | `admin-operations.e2e.ts:40`, `:204` |
| `/inventory` | Stock Levels & Burn Rates | `ADMIN`, `SUPER_ADMIN`, `MANAGER` | `GET /api/v1/inventory`, `PATCH /api/v1/inventory/:branchId/:productId` | `admin-operations.e2e.ts:40`, `:204` |
| `/marketing` | Marketing Drafts & Broadcasts | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/marketing`, `POST /api/v1/marketing` | `admin-operations.e2e.ts:40`, `:230` |
| `/orders` | Order Pipeline & Audit Logs | `ADMIN`, `SUPER_ADMIN`, `CASHIER` | `GET /api/v1/orders`, `PATCH /api/v1/orders/:id/status` | `admin-operations.e2e.ts:40` |
| `/products` | Catalog & Publication Workflow | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/products`, `PATCH /api/v1/products/:id/publish` | `admin-operations.e2e.ts:40` |
| `/settings` | Operational Parameters & Flags | `SUPER_ADMIN` | `GET /api/v1/settings`, `PATCH /api/v1/settings` | `admin-operations.e2e.ts:40` |
| `/shifts` | Cashier Shift History & Variance | `ADMIN`, `SUPER_ADMIN`, `MANAGER` | `GET /api/v1/shifts`, `GET /api/v1/shifts/:id/summary` | `admin-operations.e2e.ts:40`, `:86` |
| `/users` | Staff & User Accounts | `SUPER_ADMIN` | `GET /api/v1/users`, `PATCH /api/v1/users/:id` | `admin-operations.e2e.ts:40` |
| `/kitchen` | Kitchen Display System (KDS) | `KITCHEN`, `CASHIER`, `ADMIN` | `GET /api/v1/kitchen/orders`, `PATCH /api/v1/kitchen/orders/:id/progress` | `admin-operations.e2e.ts:40` |
| `/pos` | Point of Sale (POS) Register | `CASHIER`, `ADMIN` | `POST /api/v1/pos/orders`, `GET /api/v1/pos/products` | `admin-operations.e2e.ts:40`, `:86` |
| `/pos/shifts` | Shift Opening & Closing Register | `CASHIER`, `ADMIN` | `POST /api/v1/shifts/open`, `POST /api/v1/shifts/close`, `POST /api/v1/shifts/movements` | `admin-operations.e2e.ts:86`, `operations.e2e-spec.ts` |
| `/tables` | Dining Tables & QR Codes | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/tables`, `POST /api/v1/tables/qr` | `admin-operations.e2e.ts:40` |
| `/gallery` | Media Assets & Verification Drafts | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/gallery`, `POST /api/v1/gallery/draft` | `admin-operations.e2e.ts:243` |
| `/site-content` | Editorial Copy & Announcement Drafts | `ADMIN`, `SUPER_ADMIN` | `GET /api/v1/content`, `POST /api/v1/content/draft` | `admin-operations.e2e.ts:243` |
| `/login` | Administrative Authentication | Public / Anonymous | `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` | `admin-operations.e2e.ts:10` |

---

## 2. Decommissioned / Retired Legacy Routes (Enforced 308 Redirects)

Per Phase 2 Dead-Code Decommissioning decisions, the following legacy admin pages have been removed and redirect safely to `/`:

| Retired Route | Decommissioned Date | Target Redirect | Enforcing Spec |
| :--- | :--- | :--- | :--- |
| `/community` | 2026-10-13 | `/` | `admin-operations.e2e.ts:77` |
| `/crm` | 2026-10-13 | `/` | `admin-operations.e2e.ts:77` |
| `/events` | 2026-10-13 | `/` | `admin-operations.e2e.ts:77` |
| `/loyalty` | 2026-10-13 | `/` | `admin-operations.e2e.ts:77` |
| `/reservations` | 2026-10-13 | `/` | `admin-operations.e2e.ts:77` |
| `/franchise` | 2026-10-13 | `/` | `production-smoke.mjs` |

---

## 3. Reality Verification Safeguards

1. **Authentication Requirement**: All dashboard routes require valid `Bearer` access token in sessionStorage (`admin_access_token`). Unauthenticated requests are intercepted and redirected to `/login`.
2. **Network Idle Assurance**: E2E test `admin-operations.e2e.ts:40` visits all 13 retained routes sequentially with network idle listening, asserting 0 HTTP $\ge$ 400 API responses and 0 uncaught page errors.
3. **Database-Backed Mutations**: Shift open $\to$ cash movement $\to$ POS sale $\to$ close balance variance $\to$ reload verification is verified end-to-end against PostgreSQL `warkop_audit`.
