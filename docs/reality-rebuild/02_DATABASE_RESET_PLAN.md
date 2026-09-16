# Database Domain Reset Plan: Warkop Ya'reh

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Author:** Database Engineer & Domain Architect  
**Target Schema Location:** `packages/database/prisma/schema.prisma`  

---

## 1. Reset Motivation & Core Principles

The current Prisma schema (976 lines) models 33 tables across speculative enterprise domains: multi-tier gamified loyalty, community social networks, event ticketing, meeting room reservations, franchise tenancy, and WhatsApp marketing campaigns.

Deploying or maintaining these tables creates:
1. Significant database operational overhead.
2. Cognitive debt and false architectural assumptions.
3. Severe data integrity liability (e.g. tracking loyalty points that customers cannot redeem).

This document details the transition from the contaminated legacy schema to the **Phase-1 Core Reality Domain**.

---

## 2. Core Domain Model Specification (Phase 1 Target)

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

