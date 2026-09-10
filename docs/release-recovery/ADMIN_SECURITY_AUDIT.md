# Admin Application Security & Authorization Audit

## 1. Audit Scope and Objectives

The Admin application (`apps/admin`) was significantly updated in merge `90c4366` to support comprehensive multi-branch coffee shop operations. This audit examines:
<<<<<<< HEAD

=======
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- Client-side authentication and session management.
- Server-side Role-Based Access Control (RBAC) enforcement across all admin endpoints.
- Multi-tenant and branch scoping guarantees.
- Mutation reliability and state consistency (preventing optimistic UI desynchronization).
- Privilege escalation vulnerabilities or frontend-only access restrictions.

---

## 2. Authentication & Session Security Architecture

### 2.1 Admin Token Management (`apps/admin/src/lib/api.ts`)
<<<<<<< HEAD

=======
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- **Storage**: Tokens are stored in `sessionStorage` (`admin_access_token`), isolating them from long-term persistence in `localStorage` and ensuring tokens expire when the browser session ends.
- **Role Verification on Login**:
  - `adminLogin()` queries `POST /api/v1/auth/login`.
  - The returned user role is checked against `ADMIN_ROLES`: `['STAFF', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'SUPERADMIN']`.
  - If a non-privileged account attempts login, `revokeUnauthorizedSession()` immediately calls `POST /api/v1/auth/logout` and rejects the session.
- **Automated Refresh & Expiry Handling**:
  - `apiFetch()` automatically attempts `refreshAdminToken()` upon receiving HTTP 401.
  - If refresh fails, `clearAdminToken()` purges session storage and triggers `redirectToLogin()`.

---

## 3. Server-Side RBAC Enforcement Matrix

Every administrative operation must be enforced by the backend NestJS controllers via `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)`. Client-side disabled buttons are treated solely as UX affordances and never as security boundaries.

<<<<<<< HEAD
| Domain Area                 | API Endpoint / Action                                 | Enforced Backend Roles                                          | Tenant / Branch Isolation                            | Server Guard Verification                      |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| **Branch Management**       | `GET /api/v1/branches`                                | Public / Authenticated                                          | All branches listed                                  | Active filter verified                         |
| **Branch Mutation**         | `POST /api/v1/branches`, `PATCH /api/v1/branches/:id` | `ADMIN`, `SUPERADMIN`, `OWNER`                                  | Global tenant scope                                  | Verified in `BranchController`                 |
| **Branch Products**         | `PATCH /api/v1/branches/:id/products/:productId`      | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`                       | Scoped to assigned `branchId` unless global          | Verified in `CatalogController`                |
| **Inventory Adjustments**   | `PATCH /api/v1/inventory/:branchId/:productId`        | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`                       | Branch isolation verified                            | Verified in `CatalogController`                |
| **Cashier Shift Open**      | `POST /api/v1/shifts/open`                            | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`            | Scoped to assigned branch; max 1 open shift enforced | Verified via DB partial index & `ShiftService` |
| **Cash Drawer Movements**   | `POST /api/v1/shifts/:id/movements`                   | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`            | Must target currently open shift at user branch      | Verified via RLS & FK constraints              |
| **Cashier Shift Close**     | `POST /api/v1/shifts/:id/close`                       | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`            | Must target user's branch shift                      | Serializable transaction + advisory lock       |
| **Cash POS Payment**        | `POST /api/v1/payments/cash`                          | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`            | Requires OPEN shift at the order branch              | Verified in `PaymentService`                   |
| **Order Status Transition** | `PATCH /api/v1/orders/:id/status`                     | `KITCHEN`, `STAFF`, `CASHIER`, `MANAGER`, `ADMIN`, `SUPERADMIN` | Branch RLS enforced                                  | Verified in `OrdersController`                 |
| **Loyalty Vouchers**        | `POST /api/v1/loyalty/vouchers`                       | `ADMIN`, `SUPERADMIN`                                           | Global                                               | Verified in `LoyaltyController`                |
| **Marketing Campaigns**     | `POST /api/v1/marketing/campaigns`                    | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`                       | Global / Branch target                               | Verified in `MarketingController`              |
| **Analytics Overview**      | `GET /api/v1/analytics/overview`                      | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`                       | Scoped to branch for managers                        | Verified in `AnalyticsController`              |
| **User Roles & IAM**        | `PATCH /api/v1/users/:id/role`                        | `ADMIN`, `SUPERADMIN`                                           | Global                                               | Verified in `UsersController`                  |
=======
| Domain Area | API Endpoint / Action | Enforced Backend Roles | Tenant / Branch Isolation | Server Guard Verification |
|---|---|---|---|---|
| **Branch Management** | `GET /api/v1/branches` | Public / Authenticated | All branches listed | Active filter verified |
| **Branch Mutation** | `POST /api/v1/branches`, `PATCH /api/v1/branches/:id` | `ADMIN`, `SUPERADMIN`, `OWNER` | Global tenant scope | Verified in `BranchController` |
| **Branch Products** | `PATCH /api/v1/branches/:id/products/:productId` | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Scoped to assigned `branchId` unless global | Verified in `CatalogController` |
| **Inventory Adjustments** | `PATCH /api/v1/inventory/:branchId/:productId` | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Branch isolation verified | Verified in `CatalogController` |
| **Cashier Shift Open** | `POST /api/v1/shifts/open` | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Scoped to assigned branch; max 1 open shift enforced | Verified via DB partial index & `ShiftService` |
| **Cash Drawer Movements** | `POST /api/v1/shifts/:id/movements` | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Must target currently open shift at user branch | Verified via RLS & FK constraints |
| **Cashier Shift Close** | `POST /api/v1/shifts/:id/close` | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Must target user's branch shift | Serializable transaction + advisory lock |
| **Cash POS Payment** | `POST /api/v1/payments/cash` | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Requires OPEN shift at the order branch | Verified in `PaymentService` |
| **Order Status Transition** | `PATCH /api/v1/orders/:id/status` | `KITCHEN`, `STAFF`, `CASHIER`, `MANAGER`, `ADMIN`, `SUPERADMIN` | Branch RLS enforced | Verified in `OrdersController` |
| **Loyalty Vouchers** | `POST /api/v1/loyalty/vouchers` | `ADMIN`, `SUPERADMIN` | Global | Verified in `LoyaltyController` |
| **Marketing Campaigns** | `POST /api/v1/marketing/campaigns` | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Global / Branch target | Verified in `MarketingController` |
| **Analytics Overview** | `GET /api/v1/analytics/overview` | `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN` | Scoped to branch for managers | Verified in `AnalyticsController` |
| **User Roles & IAM** | `PATCH /api/v1/users/:id/role` | `ADMIN`, `SUPERADMIN` | Global | Verified in `UsersController` |
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3

---

## 4. Multi-Tenant Branch Scoping & RLS Verification

### 4.1 Database Layer (PostgreSQL Row Level Security)
<<<<<<< HEAD

Row Level Security is configured with `FORCE ROW LEVEL SECURITY` on core operational tables:

=======
Row Level Security is configured with `FORCE ROW LEVEL SECURITY` on core operational tables:
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- `orders`
- `tables`
- `cashier_shifts`
- `cash_drawer_movements`
- `inventory_items`

The RLS policy checks `CURRENT_USER <> 'api_user'` or `current_setting('app.current_user_role', true) IN ('ADMIN', 'SUPERADMIN')` or `"branchId" = current_setting('app.current_branch_id', true)`.

### 4.2 Application Layer Guarding
<<<<<<< HEAD

In `ShiftService`, `OrderingService`, and `CatalogService`:

=======
In `ShiftService`, `OrderingService`, and `CatalogService`:
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- Staff or Cashiers attempting to access or mutate records from other branches are blocked by the database session context or application validation.
- Cross-branch shift opening is blocked: A cashier assigned to Branch A cannot open a shift for Branch B.

---

## 5. UI Mutation Integrity: Elimination of Stale State

### 5.1 Issue Discovered in Baseline 3303f1c
<<<<<<< HEAD

In `apps/admin/src/app/(dashboard)/branches/page.tsx`, `inventory/page.tsx`, and `marketing/page.tsx`:

=======
In `apps/admin/src/app/(dashboard)/branches/page.tsx`, `inventory/page.tsx`, and `marketing/page.tsx`:
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- Updating branch product price overrides or availability previously mutated local React state (`replaceBranchProduct()`, `setItems()`, `setCampaigns()`) without refreshing data from the authoritative API.
- If a background mutation, inventory lock, or database trigger modified prices or stock, the admin UI retained stale local data.

### 5.2 Remediation
<<<<<<< HEAD

In all mutating actions:

=======
In all mutating actions:
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
- Replaced optimistic local array slicing with `await loadData()` / `await loadItems()`.
- After server mutation confirmation, the complete authoritative dataset is retrieved and re-rendered.
- Provides immediate visual notice confirming that data was persisted and reloaded from the API.

---

## 6. Audit Verdict

- **Authentication**: PASS (Session isolation, token revocation, clean refresh cycles).
- **Server RBAC**: PASS (All sensitive mutations guarded on backend; least-privilege role matrix enforced).
- **Tenant & Branch Scoping**: PASS (PostgreSQL forced RLS + service-level branch validation).
- **Mutation Integrity**: ACCEPT_WITH_FIX (Implemented authoritative server reload on branches, inventory, and marketing pages).
<<<<<<< HEAD
=======

>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
