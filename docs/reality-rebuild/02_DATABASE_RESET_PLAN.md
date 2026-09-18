# Database Domain Reset Plan: Warkop Ya'reh

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Document Status:** ARCHITECTURAL SPECIFICATION (REVISED PHASE 1.5)  
**Author:** Database Engineer & Domain Architect  
**Target Schema Location:** `packages/database/prisma/schema.prisma`  

---

## 1. Reset Motivation & Core Principles
## 1. Core Motivation & Invariant

The current Prisma schema (976 lines) models 33 tables across speculative enterprise domains: multi-tier gamified loyalty, community social networks, event ticketing, meeting room reservations, franchise tenancy, and WhatsApp marketing campaigns.
The current Prisma schema (976 lines, 33 models, 23 enums) models speculative enterprise domains inherited from a third-party template: gamified loyalty, community forums, event ticketing, meeting rooms, franchise tenancy, and automated marketing campaigns.

Deploying or maintaining these tables creates:
1. Significant database operational overhead.
2. Cognitive debt and false architectural assumptions.
3. Severe data integrity liability (e.g. tracking loyalty points that customers cannot redeem).
To maintain production safety and data integrity:
> [!CAUTION]
> **Do NOT execute destructive schema drops in the initial implementation.**
> 
> Decommissioning must proceed through **four controlled, non-destructive stages** to ensure no active code path, foreign key, or query is broken unexpectedly.

This document details the transition from the contaminated legacy schema to the **Phase-1 Core Reality Domain**.
---

## 2. Four-Stage Decommissioning Strategy

```
┌─────────────────────────────────────────────────────────────┐
│ Stage A: Logical Deactivation                               │
│ • Remove unsupported public navigation & routes             │
│ • Cease creating records in unsupported tables              │
│ • Replace contaminated seed with clean verified seed        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage B: Application Dependency Removal                     │
│ • Decouple apps/web, apps/admin, apps/api from legacy models│
│ • Remove dead controller actions and store dependencies     │
│ • Compile and test after each coherent domain decoupled     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage C: Schema Deprecation & Core Additions                │
│ • Add verified core models (GalleryAsset, BusinessHour, etc)│
│ • Mark legacy entities as deprecated in schema comments     │
│ • Preserve migration history intact                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage D: Physical Schema Removal                            │
│ • Executed ONLY after zero runtime dependencies remain      │
│ • Create forward migration dropping deprecated tables       │
│ • Verify migration on clean DB and representative test DB   │
│ • Run full regression suite                                 │
└─────────────────────────────────────────────────────────────┘
```

### Stage A — Logical Deactivation
- **Route Deactivation:** Decommission public routes (`/booking`, `/community`, `/events`, `/loyalty`, `/reservations`).
- **Seed Protection:** Replace `packages/database/prisma/seed.ts` so that only `jetis-kulon` and `prapen` are seeded, with zero fictional menu items and zero fake staff accounts.
- **Record Creation Cessation:** Disable any background worker or webhook that writes to speculative tables.

### Stage B — Application Dependency Removal
- Systematically remove code imports and database queries referencing legacy models (`LoyaltyTransaction`, `Reward`, `Reservation`, `Event`, `CommunityPost`, `FranchiseAgreement`).
- Compile (`pnpm turbo run typecheck`) and test (`pnpm turbo run test`) after each domain is detached.

### Stage C — Schema Deprecation & Core Additions
- Add the verified core models to `packages/database/prisma/schema.prisma`:
  - `GalleryAsset`
  - `BusinessHour`
  - `SiteContent`
  - `BusinessFact`
  - `SourceReference`
- Mark deprecated tables with descriptive schema comments and decouple any cross-domain foreign keys.

### Stage D — Physical Schema Removal (Final Controlled Migration)
- Generate a formal forward migration (`pnpm --filter @warkop-yareh/database prisma migrate dev --name drop_deprecated_speculative_domains`).
- Validate the migration against:
  1. A fresh, clean PostgreSQL database instance (`db:migrate:deploy` + `db:seed`).
  2. A representative database with legacy data to verify clean foreign key drop cascades.
- Run complete monorepo typecheck, lint, and regression test suites.

---

## 2. Core Domain Model Specification (Phase 1 Target)
## 3. Target Phase-1 Core Domain Specification

The Phase-1 database domain focuses strictly on what the real business requires: authentic branch profiles, transparent menu/pricing management, real venue gallery management, truthful site announcements, and auditable business facts.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Branch      │───┬───│  BusinessHour   │       │  BusinessFact   │
└─────────────────┘   │   └─────────────────┘       └─────────────────┘
         │            │                                      │
         │            │   ┌─────────────────┐                │
         │            └───│  GalleryAsset   │       ┌─────────────────┐
         │                └─────────────────┘       │ SourceReference │
         │                                          └─────────────────┘
         │ 1:N
         ▼
┌───────────────────┐     ┌─────────────────┐       ┌─────────────────┐
│  BranchMenuItem   │◀────│    MenuItem     │◀──────│  MenuCategory   │
└───────────────────┘     └─────────────────┘       └─────────────────┘
```

### 2.1 Target Models
### 3.1 Core Target Models
1. **`AdminUser` / `User`:** Staff/Admin management only. Consumer loyalty and referral fields pruned.
2. **`Branch`:** Represents `jetis-kulon` and `prapen`. Includes `plusCode`, `latitude`, `longitude`, `brandName`.
3. **`BusinessHour`:** Structured 24/7 operating schedules per branch.
4. **`MenuCategory`:** Food & beverage taxonomy.
5. **`MenuItem`:** Itemized menu once authenticated via receipts (production seed empty).
6. **`BranchMenuItem`:** Availability and localized pricing per branch.
7. **`GalleryAsset`:** Authentic photography of venue atmosphere.
8. **`SiteContent`:** Managed copywriting (announcements, hero copy, about narrative).
9. **`BusinessFact` & `SourceReference`:** First-class audit trail with confidence levels (`VERIFIED`, `UNVERIFIED`, etc.) and temporal metadata (`capturedAt`, `lastVerifiedAt`).
10. **`Session` & `AuditLog`:** Technical foundations.

#### 1. `AdminUser` (Refactored from `User`)
- **Purpose:** Identity and access control for store managers, operators, and developers.
- **Fields:** `id`, `email`, `passwordHash`, `name`, `role` (SUPERADMIN, ADMIN, MANAGER, STAFF), `branchId` (optional), `isActive`, `createdAt`, `updatedAt`.
- **Pruned:** `membershipTier`, `loyaltyPoints`, `referralCode`, `referredBy`, `whatsAppMarketingOptInAt`.

#### 2. `Branch`
- **Purpose:** Physical branch representation matching verified reality.
- **Fields:** `id`, `slug` (`jetis-kulon`, `prapen`), `name`, `brandName` ("Warkop Ya'reh"), `addressStreet`, `addressDistrict`, `addressCity`, `addressProvince`, `postalCode`, `phone` (nullable), `plusCode`, `latitude`, `longitude`, `isMainBranch`, `isActive`, `createdAt`, `updatedAt`.
- **Pruned:** `capacity`, `features` (Meeting Room, Drive Thru), fake phone/email defaults.

#### 3. `BusinessHour`
- **Purpose:** Structured representation of branch operating schedule.
- **Fields:** `id`, `branchId`, `dayOfWeek` (0-6), `isOpen24Hours` (default `true`), `openTime` (nullable), `closeTime` (nullable).

#### 4. `MenuCategory`
- **Purpose:** High-level categorization for verified food and beverage items.
- **Fields:** `id`, `slug`, `name`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`.

#### 5. `MenuItem`
- **Purpose:** Catalog items once verified via physical receipt or merchant audit.
- **Fields:** `id`, `slug`, `name`, `description` (nullable), `price` (Int, in IDR), `categoryId`, `image` (nullable), `isActive`, `createdAt`, `updatedAt`.
- **Policy:** Production seed MUST be empty.

#### 6. `BranchMenuItem`
- **Purpose:** Localized availability and pricing per branch.
- **Fields:** `id`, `branchId`, `menuItemId`, `isAvailable` (default `true`), `priceOverride` (nullable).

#### 7. `GalleryAsset`
- **Purpose:** Authentic photography showcasing real warkop ambiance.
- **Fields:** `id`, `branchId` (nullable), `title`, `imageUrl`, `caption` (nullable), `sortOrder`, `isPublished`, `createdAt`.

#### 8. `SiteContent`
- **Purpose:** Centrally managed public copywriting (Hero headline, About story, contact announcements).
- **Fields:** `id`, `key` (unique slug), `title`, `content` (Markdown or JSON), `isPublished`, `updatedAt`.

#### 9. `BusinessFact` & `SourceReference`
- **Purpose:** First-class database-level auditability and source traceability.
- **Fields (`BusinessFact`):** `id`, `entityType`, `entityId`, `fieldName`, `confidence` (`VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`, `DISPUTED`), `sourceReferenceId`, `verifiedAt`.
- **Fields (`SourceReference`):** `id`, `sourceType` (`GOOGLE_MAPS`, `BUSINESS_OWNER`, `IN_STORE_OBSERVATION`), `identifier`, `url` (nullable), `verifiedAt`, `verifiedBy`.

#### 10. Technical Foundation Models
- `Session`: Refresh token storage for authenticated staff.
- `AuditLog`: Immutable change ledger.

---

## 3. Classification of Existing Models
## 4. Model Classification & Transition Status

| Model Name | Current Classification | Action in Database Reset |
| :--- | :---: | :--- |
| `User` | **REWRITE** | Refactor to administrative/staff focus; drop consumer loyalty/referral columns |
| `Branch` | **REWRITE** | Migrate to verified schema with `plusCode` and verified coordinates |
| `Category` | **REWRITE** | Retain structure; empty seed |
| `Product` | **REWRITE** | Retain structure; empty seed |
| `ProductCustomization` | **PARKED** | Isolate from active queries |
| `BranchProduct` | **REWRITE** | Retain for localized availability |
| `Order` | **PARKED** | Retain in historical table `orders`; disable active insertion from web |
| `OrderItem` | **PARKED** | Retain in historical table `order_items` |
| `Voucher` | **REMOVED** | Deprecate table in cleanup migration |
| `VoucherRedemption` | **REMOVED** | Deprecate table in cleanup migration |
| `Payment` | **PARKED** | Isolate Midtrans payment table; cease online transaction calls |
| `Table` | **PARKED** | Cease active table QR generation |
| `Reservation` | **REMOVED** | Deprecate table in cleanup migration |
| `Event` | **REMOVED** | Deprecate table in cleanup migration |
| `EventRegistration` | **REMOVED** | Deprecate table in cleanup migration |
| `CommunityGroup` | **REMOVED** | Deprecate table in cleanup migration |
| `CommunityMembership`| **REMOVED** | Deprecate table in cleanup migration |
| `CommunityPost` | **REMOVED** | Deprecate table in cleanup migration |
| `LoyaltyTransaction` | **REMOVED** | Deprecate table in cleanup migration |
| `Reward` | **REMOVED** | Deprecate table in cleanup migration |
| `Review` | **PARKED** | Isolate user review table |
| `Notification` | **PARKED** | Isolate push notification table |
| `MarketingCampaign` | **PARKED** | Isolate WhatsApp campaign table |
| `MarketingDelivery` | **PARKED** | Isolate WhatsApp delivery table |
| `BlogPost` | **PARKED** | Isolate editorial blog table |
| `AuditLog` | **KEEP** | Preserve unchanged |
| `OutboxEvent` | **KEEP** | Preserve unchanged |
| `Session` | **KEEP** | Preserve unchanged |
| `UserDevice` | **PARKED** | Isolate push token table |
| `FranchiseAgreement`| **REMOVED** | Deprecate table in cleanup migration |
| `FranchiseBilling` | **REMOVED** | Deprecate table in cleanup migration |
| `WaiterCall` | **PARKED** | Isolate operations waiter call table |
| `CashierShift` | **PARKED** | Isolate POS cashier shift table |
| `CashDrawerMovement`| **PARKED** | Isolate cash drawer table |
| `OrderFeedback` | **PARKED** | Isolate order feedback table |

---

## 4. Migration Strategy: Non-Destructive Deprecation vs. Clean Baseline

To preserve migration history and avoid destroying rollback capabilities, the repository will execute a **two-phase controlled migration strategy**:

### Option Evaluated:
- **Destructive Deletion (`rm -rf prisma/migrations/*`):**  
  *REJECTED.* Destroying existing migrations makes it impossible for deployed staging or production environments to reconcile their current state. It also destroys audit evidence.
- **Additive Deprecation Migration (`20260918000000_domain_reality_reset`):**  
  *SELECTED.* A controlled forward migration that creates target reality tables (`gallery_assets`, `business_facts`, `source_references`, `business_hours`), adds verified fields to `branches`, and cleanses or drops unneeded speculative foreign keys.

### Concrete Migration Steps:
1. **Step 1 (Schema Alignment):** Create the new target schema models in `schema.prisma`. Add `@map("legacy_...")` to speculative models marked for decommissioning.
2. **Step 2 (Data Preservation & Export):** Export any legitimate historical testing fixtures to a JSON snapshot in `docs/reality-rebuild/snapshots/`.
3. **Step 3 (Migration Generation):** Generate a structured Prisma migration (`pnpm --filter @warkop-yareh/database prisma migrate dev --name reality_rebuild_domain_reset`).
4. **Step 4 (Seed Replacement):** Replace `packages/database/prisma/seed.ts` with the **Truthful Production Seed** containing only `jetis-kulon` and `prapen`, with an empty menu.
5. **Step 5 (Validation):** Execute `db:migrate:deploy` against a test PostgreSQL instance to ensure zero migration drift.

| Model Name | Table Name | Status | Transition Stage | Notes |
| :--- | :--- | :---: | :---: | :--- |
| `User` | `users` | **ACTIVE** | Stage B (Refactor) | Prune loyalty/referral columns |
| `Branch` | `branches` | **ACTIVE** | Stage C (Refactor) | Add Plus Code & verified coordinates |
| `Category` | `categories` | **ACTIVE** | Stage A (Empty seed)| Retain structure |
| `Product` | `products` | **ACTIVE** | Stage A (Empty seed)| Retain structure |
| `BranchProduct` | `branch_products` | **ACTIVE** | Stage C (Refactor) | Retain for localized availability |
| `AuditLog` | `audit_logs` | **ACTIVE** | Unchanged | System audit log |
| `Session` | `sessions` | **ACTIVE** | Unchanged | Refresh token session store |
| `OutboxEvent` | `outbox_events` | **ACTIVE** | Unchanged | Transactional event outbox |
| `Order` | `orders` | **PARKED** | Stage A (Deactivate)| Isolate from public customer web |
| `OrderItem` | `order_items` | **PARKED** | Stage A (Deactivate)| Isolate from public customer web |
| `Payment` | `payments` | **PARKED** | Stage A (Deactivate)| Isolate Midtrans transactions |
| `Table` | `tables` | **PARKED** | Stage A (Deactivate)| Disable table QR generation |
| `CashierShift` | `cashier_shifts` | **PARKED** | Stage A (Deactivate)| Internal staff POS only |
| `CashDrawerMovement`| `cash_drawer_movements`| **PARKED**| Stage A (Deactivate)| Internal staff POS only |
| `WaiterCall` | `waiter_calls` | **PARKED** | Stage A (Deactivate)| Isolate operations calls |
| `MarketingCampaign` | `marketing_campaigns` | **PARKED**| Stage A (Deactivate)| Isolate WhatsApp campaigns |
| `MarketingDelivery` | `marketing_deliveries` | **PARKED**| Stage A (Deactivate)| Isolate WhatsApp deliveries |
| `BlogPost` | `blog_posts` | **PARKED** | Stage A (Deactivate)| Isolate editorial blog |
| `Voucher` | `vouchers` | **REMOVE** | Stage D (Drop) | Unsupported discount codes |
| `VoucherRedemption` | `voucher_redemptions` | **REMOVE**| Stage D (Drop) | Unsupported redemption logs |
| `Reservation` | `reservations` | **REMOVE** | Stage D (Drop) | Unsupported table bookings |
| `Event` | `events` | **REMOVE** | Stage D (Drop) | Unsupported event ticketing |
| `EventRegistration` | `event_registrations` | **REMOVE**| Stage D (Drop) | Unsupported attendee ticket codes |
| `CommunityGroup` | `community_groups` | **REMOVE** | Stage D (Drop) | Unsupported community forums |
| `CommunityMembership`| `community_memberships`| **REMOVE**| Stage D (Drop) | Unsupported group memberships |
| `CommunityPost` | `community_posts` | **REMOVE** | Stage D (Drop) | Unsupported forum posts |
| `LoyaltyTransaction`| `loyalty_transactions`| **REMOVE**| Stage D (Drop) | Unsupported gamified points |
| `Reward` | `rewards` | **REMOVE** | Stage D (Drop) | Unsupported loyalty catalog |
| `FranchiseAgreement`| `franchise_agreements`| **REMOVE**| Stage D (Drop) | Unsupported franchise contracts |
| `FranchiseBilling` | `franchise_billings` | **REMOVE** | Stage D (Drop) | Unsupported franchise invoices |
