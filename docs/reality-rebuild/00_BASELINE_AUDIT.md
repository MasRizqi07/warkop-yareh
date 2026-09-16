# Baseline Audit: MasRizqi07/warkop-yareh

**Audit Execution Date:** 2026-09-17  
**Auditor:** Principal Software Engineer, Staff Product Engineer & Repository Auditor  
**Audit Target SHA:** `4370459ef4f3500cb344a3fb6a39528c61fe79f4`  
**Git Branch:** `codex/phase9-functional-completeness`  
**Working Tree Status:** Clean (0 uncommitted changes prior to audit documentation)

---

## 1. Executive Summary

A comprehensive repository audit of `MasRizqi07/warkop-yareh` confirms a severe product-domain integrity divergence. While the technical foundation (Turborepo, Next.js 16.3.4, NestJS 11, Prisma 5, Vitest, Playwright, Tailwind CSS) demonstrates modern monorepo engineering standards, the domain modeling, seed data, routes, UI copy, and database schemas are contaminated with fictional, luxury specialty coffee assumptions inherited from a template or speculative concept ("Cold 'N Brew" / "CNB").

The actual business foundation is **Warkop Ya'reh**, a traditional 24-hour Surabaya coffee shop ("Kedai Kopi") operating in Wonokromo (Jetis Kulon) and Prapen, with affordable pricing (Rp1-25.000 per person), dine-in/takeaway services, and traditional warkop culture.

This audit establishes the immutable baseline facts of the repository prior to domain reconstruction.

---

## 2. Git & Repository Baseline

| Property | Value |
| :--- | :--- |
| **Commit HEAD SHA** | `4370459ef4f3500cb344a3fb6a39528c61fe79f4` |
| **Active Branch** | `codex/phase9-functional-completeness` |
| **Remote Tracking** | `origin/codex/phase9-functional-completeness` (Up to date) |
| **Package Manager** | `pnpm@9.0.0` (Workspace enabled) |
| **Node Engine Target** | `>=24.0.0 <25` (Local environment: Node `v22.21.1`) |
| **Build Orchestrator** | Turborepo `v2.10.12` |
| **Total Tracked Files** | 639 files |

---

## 3. Workspace Packages & Monorepo Structure

The repository is configured as a pnpm monorepo using `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3.1 Applications (`apps/`)

| App | Path | Framework / Tools | Status | Observed Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **web** | `apps/web` | Next.js 16.3.4 (Turbopack), React 19, Tailwind CSS, Vitest | ACTIVE | Customer-facing portal with 33 routes covering ordering, bookings, community, loyalty, tables. Heavily contaminated. |
| **admin** | `apps/admin` | Next.js 16.3.4 (Turbopack), React 19, Tailwind CSS, Vitest | ACTIVE | Operational backoffice with 23 routes covering analytics, branches, inventory, POS, shifts, marketing, CRM. |
| **api** | `apps/api` | NestJS 11, Prisma Client, Jest, Passport JWT, Socket.IO | ACTIVE | Centralized REST and WebSocket API with 17 domain modules. Contains extensive speculative commerce & community endpoints. |

### 3.2 Packages (`packages/`)

| Package | Path | Type | Status | Role & Notes |
| :--- | :--- | :--- | :--- | :--- |
| **@warkop-yareh/database** | `packages/database` | Library | ACTIVE | Prisma ORM schema (976 lines), 33 models, 23 enums, 15 migrations, seed script. Contains critical domain contamination. |
| **@warkop-yareh/types** | `packages/types` | Library | ACTIVE | Shared TypeScript domain contracts (267 lines). Contains speculative models (VIP tables, loyalty tiers, events, community). |
| **@warkop-yareh/ui** | `packages/ui` | Library | ACTIVE | Design system and reusable primitives (buttons, modals, typography). Independent of business assumptions. |
| **analytics** | `packages/analytics` | Directory | ORPHANED | Empty directory containing only stale `node_modules`. No `package.json`. Candidate for pruning. |
| **auth** | `packages/auth` | Directory | ORPHANED | Empty directory containing only stale `node_modules`. No `package.json`. Candidate for pruning. |
| **shared** | `packages/shared` | Directory | ORPHANED | Empty directory containing only stale `node_modules`. No `package.json`. Candidate for pruning. |
| **validation** | `packages/validation` | Directory | ORPHANED | Empty directory containing only stale `node_modules`. No `package.json`. Candidate for pruning. |

---

## 4. Route Inventory

### 4.1 Customer-Facing Routes (`apps/web` — 33 routes)

| Route Path | Route Type | Reality Classification | Contamination / Unsupported Assumptions |
| :--- | :--- | :--- | :--- |
| `/` | Static | REWRITE | Specialty coffee marketing, "sanctuary", luxury beans, speculative branch links |
| `/about` | Static | REWRITE | Fictional brand origin narrative, fake founders, specialty coffee mission |
| `/menu` | Static | REWRITE | Fictional luxury menu (Americano, Cold Brew Tonic, Croissant, Lava Cake) |
| `/contact` | Static | REWRITE | Fake phone numbers, fake email addresses, missing real outlet details |
| `/booking` | Static | REMOVE | Table reservations for Meeting Rooms, VIP booths (unsupported) |
| `/reservations` | Static | REMOVE | Reservation management dashboard |
| `/community` | Static | REMOVE | Developer community hub, discussion boards, coffee groups |
| `/community/groups/[id]` | Dynamic | REMOVE | Group discussion threads and social posts |
| `/events` | Static | REMOVE | Event ticketing, tech meetups, coffee cupping sessions |
| `/events/[id]` | Dynamic | REMOVE | Individual event registration & ticket code checkout |
| `/loyalty` | Static | REMOVE | Bronze/Silver/Gold/Platinum membership tier system, reward points |
| `/cart` | Static | REMOVE / PARK | E-commerce shopping cart for online ordering |
| `/checkout` | Static | REMOVE / PARK | Multi-step checkout with Midtrans payment integration |
| `/checkout/status` | Dynamic | REMOVE / PARK | Payment status polling & webhook landing |
| `/checkout/success` | Dynamic | REMOVE / PARK | Order confirmation page |
| `/order/track/[orderId]` | Dynamic | REMOVE / PARK | Real-time order tracking with step progress |
| `/orders` | Static | REMOVE / PARK | Customer order history |
| `/orders/[id]` | Dynamic | REMOVE / PARK | Order details view |
| `/orders/[id]/thankyou` | Dynamic | REMOVE / PARK | Post-order thank you view |
| `/payment/status` | Dynamic | REMOVE / PARK | Payment gateway redirection feedback |
| `/table/[tableId]` | Dynamic | REMOVE / PARK | QR dine-in table ordering |
| `/qr/[code]` | Dynamic | REMOVE / PARK | Table QR code redirection handler |
| `/account` | Static | REMOVE / PARK | Customer profile & loyalty balance |
| `/profile` | Static | REMOVE / PARK | Profile editor |
| `/login` | Static | REWRITE | Currently mixes customer login with admin login |
| `/register` | Static | REMOVE | Customer registration with referral codes |
| `/otp` | Static | REMOVE / PARK | OTP login verification via SendGrid |
| `/auth/callback` | Static | REMOVE / PARK | OAuth callback handler |
| `/ops/kds` | Static | REMOVE / PARK | Kitchen display system in customer web bundle |
| `/ops/pos` | Static | REMOVE / PARK | Point-of-sale interface in customer web bundle |
| `/ops/shift` | Static | REMOVE / PARK | Cashier shift management in customer web bundle |
| `/blog` | Static | REMOVE / PARK | Coffee editorial blog |
| `/blog/[slug]` | Dynamic | REMOVE / PARK | Individual blog article |
| `/offline` | Static | KEEP | PWA offline fallback page |
| `/manifest.webmanifest` | Static | REWRITE | PWA manifest with old brand meta |
| `/robots.txt` | Static | REWRITE | Robots sitemap specification |
| `/sitemap.xml` | Static | REWRITE | Sitemap listing all fictional routes |

### 4.2 Admin Routes (`apps/admin` — 23 routes)

| Route Path | Route Type | Reality Classification | Contamination / Notes |
| :--- | :--- | :--- | :--- |
| `/` | Static | REWRITE | Executive operations dashboard displaying fake revenue & metrics |
| `/login` | Static | KEEP | Admin authentication gateway |
| `/branches` | Static | REWRITE | Multi-branch management (currently hardcoded to Gubeng fixture) |
| `/products` | Static | REWRITE | Menu management (currently manages fictional menu items) |
| `/orders` | Static | VERIFY / PARK | Live order management (keep disabled until real ordering exists) |
| `/pos` | Static | VERIFY / PARK | POS interface (parked from core Phase-1 scope) |
| `/pos/shifts` | Static | VERIFY / PARK | Cashier shifts and cash drawer balancing |
| `/kitchen` | Static | VERIFY / PARK | Kitchen Display System |
| `/tables` | Static | REMOVE / PARK | Table layout management (VIP, Meeting Room) |
| `/reservations` | Static | REMOVE | Table reservations backoffice |
| `/inventory` | Static | REMOVE / PARK | Enterprise ingredient tracking & burn rate analytics |
| `/loyalty` | Static | REMOVE | Gamified loyalty rewards management |
| `/community` | Static | REMOVE | Community group moderations |
| `/events` | Static | REMOVE | Event ticketing management |
| `/events/[id]` | Dynamic | REMOVE | Event registration roster |
| `/marketing` | Static | REMOVE / PARK | WhatsApp Cloud API campaign broadcaster |
| `/crm` | Static | REMOVE | Patron CRM and lifecycle segmentation |
| `/analytics` | Static | REMOVE / PARK | Speculative predictive analytics |
| `/shifts` | Static | VERIFY / PARK | Staff shift scheduling |
| `/users` | Static | REWRITE | User management (prune customer roles & tiers, retain admin/staff) |
| `/settings` | Static | REWRITE | System configuration & business hours |

---

## 5. API Module Inventory (`apps/api/src/modules`)

| Module Name | Path | Reality Classification | Analysis & Impact |
| :--- | :--- | :--- | :--- |
| **branch** | `src/modules/branch` | REWRITE | Core domain. Currently returns fictional branches (`coldnbrew-gubeng-001`, Darmo). Must be rewritten for Jetis Kulon and Prapen. |
| **catalog** | `src/modules/catalog` | REWRITE | Core domain. Currently returns fictional luxury products. Must be decoupled from fake data. |
| **content** | `src/modules/content` | REWRITE | Core domain. Manages site content, banners, and verified business facts. |
| **health** | `src/modules/health` | KEEP | Operational liveness & readiness probes (`/health`). Pure technical foundation. |
| **identity** | `src/modules/identity` | REWRITE | Auth & user management. Prune customer tiers/points; preserve AdminUser authentication. |
| **ai** | `src/modules/ai` | REMOVE | Speculative "Barista Concierge" AI recommendation engine. Unsupported. |
| **analytics** | `src/modules/analytics` | REMOVE / PARK | Predictive revenue metrics and executive analytics for non-existent transactions. |
| **community** | `src/modules/community` | REMOVE | Developer meetups, community forum posts, memberships. Zero business reality. |
| **event** | `src/modules/event` | REMOVE | Event ticketing and workshop registrations. Unsupported. |
| **franchise** | `src/modules/franchise` | REMOVE | Multi-tenant franchise agreements and revenue sharing. Unsupported. |
| **loyalty** | `src/modules/loyalty` | REMOVE | Bronze/Silver/Gold tier progression and voucher redemptions. Unsupported. |
| **marketing** | `src/modules/marketing` | REMOVE / PARK | WhatsApp Cloud API campaign dispatcher. Unsupported in Phase-1. |
| **operations** | `src/modules/operations` | VERIFY / PARK | Cash drawer shifts, waiter call buttons. Parked from core domain. |
| **ordering** | `src/modules/ordering` | VERIFY / PARK | Complex multi-channel checkout engine with Midtrans integration. Parked. |
| **reservation** | `src/modules/reservation` | REMOVE | Meeting room and VIP table booking engine. Unsupported. |
| **tables** | `src/modules/tables` | REMOVE / PARK | Table QR mapping and status tracking. Parked. |
| **websockets** | `src/modules/websockets` | VERIFY / PARK | Real-time gateway for orders and waiter calls. Parked. |

---

## 6. Database Schema & Migration Inventory (`packages/database`)

### 6.1 Prisma Models (33 Models)

| Model Name | Table Name | Reality Classification | Status & Action |
| :--- | :--- | :--- | :--- |
| `User` | `users` | REWRITE | Prune `membershipTier`, `loyaltyPoints`, `referralCode`, `whatsAppMarketingOptInAt`. Retain for Admin/Staff. |
| `Branch` | `branches` | REWRITE | Prune `capacity`, `features` (Meeting Room/Drive Thru), fake coordinates. Refactor to verified outlets. |
| `Category` | `categories` | REWRITE | Keep schema structure, purge fictional categories (Espresso, Cold Brew, etc.). |
| `Product` | `products` | REWRITE | Keep schema structure, purge fictional luxury items. Empty production seed. |
| `ProductCustomization` | `product_customizations` | REWRITE / PARK | Reusable JSON options structure. |
| `BranchProduct` | `branch_products` | REWRITE | Multi-branch availability mapping. |
| `Order` | `orders` | PARKED | Complex commerce order aggregate with `CNB-YYYYMMDD-XXXX` format. |
| `OrderItem` | `order_items` | PARKED | Order line items with price snapshots. |
| `Voucher` | `vouchers` | REMOVED | Discount voucher system. |
| `VoucherRedemption` | `voucher_redemptions` | REMOVED | Voucher tracking per user. |
| `Payment` | `payments` | PARKED | Midtrans online gateway transaction record. |
| `Table` | `tables` | PARKED | Meeting rooms and table layouts. |
| `Reservation` | `reservations` | REMOVED | Speculative booking records. |
| `Event` | `events` | REMOVED | Speculative tech/coffee events. |
| `EventRegistration` | `event_registrations` | REMOVED | Event attendee ticket codes. |
| `CommunityGroup` | `community_groups` | REMOVED | Forum groups. |
| `CommunityMembership` | `community_memberships`| REMOVED | Group members. |
| `CommunityPost` | `community_posts` | REMOVED | Forum posts. |
| `LoyaltyTransaction` | `loyalty_transactions`| REMOVED | Loyalty ledger entries. |
| `Reward` | `rewards` | REMOVED | Reward catalog for loyalty redemption. |
| `Review` | `reviews` | REWRITE | Customer review storage. |
| `Notification` | `notifications` | PARKED | System & promo push notifications. |
| `MarketingCampaign` | `marketing_campaigns` | PARKED | WhatsApp marketing campaigns. |
| `MarketingDelivery` | `marketing_deliveries` | PARKED | WhatsApp message logs. |
| `BlogPost` | `blog_posts` | PARKED | Editorial blog content. |
| `AuditLog` | `audit_logs` | KEEP | System audit logs. |
| `OutboxEvent` | `outbox_events` | KEEP | Transactional outbox table. |
| `Session` | `sessions` | KEEP | Refresh token session store. |
| `UserDevice` | `user_devices` | PARKED | Push notification device tokens. |
| `FranchiseAgreement`| `franchise_agreements`| REMOVED | Franchise contracts. |
| `FranchiseBilling` | `franchise_billings` | REMOVED | Franchise fee invoices. |
| `WaiterCall` | `waiter_calls` | PARKED | Table call waiter requests. |
| `CashierShift` | `cashier_shifts` | PARKED | Cash drawer shift ledger. |
| `CashDrawerMovement`| `cash_drawer_movements`| PARKED | Cash in / out movements. |
| `OrderFeedback` | `order_feedbacks` | PARKED | Post-meal satisfaction ratings. |

### 6.2 Prisma Enums (23 Enums)

- `Role` (CUSTOMER, STAFF, CASHIER, KITCHEN, MANAGER, ADMIN, OWNER, SUPERADMIN) — REWRITE (prune customer role)
- `MembershipTier` (BRONZE, SILVER, GOLD, PLATINUM) — REMOVED
- `OrderType` (DINE_IN, TAKE_AWAY, DRIVE_THRU, DELIVERY) — REWRITE (remove DRIVE_THRU)
- `TableType` (INDOOR, OUTDOOR, VIP, MEETING_ROOM) — REMOVED / PARKED
- `TableStatus`, `ReservationStatus`, `EventCategory`, `EventStatus`, `EventRegistrationStatus` — REMOVED
- `CommunityMemberRole`, `LoyaltyType` — REMOVED
- `FranchiseStatus`, `BillingStatus` — REMOVED
- `PaymentStatus`, `PaymentMethod`, `OrderStatus` — PARKED
- `MarketingCampaignStatus`, `MarketingDeliveryStatus` — PARKED
- `NotificationType`, `WaiterCallType`, `CallStatus`, `CashierShiftStatus`, `CashMovementType` — PARKED

### 6.3 Existing Migrations (15 Migrations)

```
20260709032524_init
20260709032553_enable_rls
20260709032704_soft_delete_and_snapshots
20260712011030_force_rls
20260713041928_create_api_user_role
20260713042838_dynamic_api_user_grant
20260713050000_fix_rls_policies
20260905090000_harden_order_idempotency
20260906080000_persist_payment_redirect
20260906100000_checkout_pricing
20260906180000_paid_booking
20260907150000_phase6_admin_operations
20260907220000_whatsapp_marketing_consent
20260908130000_cashier_shift_operations
20260908143000_event_registration_status_index
```
*Note: All migrations represent historical schema evolution. Destruction without an audit-traceable strategy would violate data integrity principles.*

---

## 7. Contamination Scan Summary

A comprehensive repository-wide search across 25 contaminated keywords revealed **183 distinct files** with **1,844 total occurrences**:

```
Cold 'N Brew          :     9 occurrences across   3 files
coldnbrew             :    12 occurrences across   8 files
CNB                   :    10 occurrences across   2 files
Gubeng                :   100 occurrences across  23 files
Darmo                 :   137 occurrences across  26 files
Dharmahusada          :    16 occurrences across   7 files
Coffee Sanctuary      :     1 occurrences across   1 files
Specialty Coffee      :    16 occurrences across  14 files
Coworking             :    37 occurrences across  16 files
Drive Thru            :     3 occurrences across   2 files
Meeting Room          :     8 occurrences across   5 files
VIP                   :   172 occurrences across  29 files
Membership            :   151 occurrences across  49 files
Bronze                :    44 occurrences across  27 files
Silver                :    38 occurrences across  26 files
Gold                  :   117 occurrences across  45 files
Platinum              :    44 occurrences across  25 files
Loyalty               :   450 occurrences across 100 files
Referral              :    15 occurrences across   9 files
Community             :   415 occurrences across  71 files
Developer Meetup      :     5 occurrences across   4 files
Franchise             :   190 occurrences across  31 files
AI Recommendation     :     1 occurrences across   1 files
Predictive Analytics  :     1 occurrences across   1 files
Midtrans              :   218 occurrences across  65 files
------------------------------------------------------------
Total Occurrences     : 1,844
Total Unique Files    :   183
```

---

## 8. Current Test & Quality Baseline

| Quality Gate | Command | Exit Code | Observed Result |
| :--- | :--- | :---: | :--- |
| **Typecheck** | `pnpm turbo run typecheck` | `0` | All 4 packages passed cleanly (web, admin, api, ui). |
| **Lint** | `pnpm turbo run lint` | `0` | Clean across web, admin, and api. |
| **Web Tests** | `pnpm --filter @warkop-yareh/web test` | `0` | 13 test files passed, 43 unit tests passed (Vitest). |
| **Admin Tests** | `pnpm --filter @warkop-yareh/admin test` | `0` | 1 test file passed, 4 unit tests passed (Vitest). |
| **API Unit Tests**| `pnpm --filter @warkop-yareh/api test` | `1` | 32 suites passed (210 tests passed); 8 suites failed due to Jest worker OOM and `jsonwebtoken` module resolution on Windows. |
| **Full Build** | `pnpm turbo run build` | `0` | All 5 build artifacts completed successfully (`@warkop-yareh/ui`, `@warkop-yareh/database`, `@warkop-yareh/api`, `@warkop-yareh/admin`, `@warkop-yareh/web`). |

---

## 9. Risk & Dependency Assessment

1. **Tight Coupling in Customer App:**  
   `apps/web` components, layouts, and store hooks (`UniversalHeader`, `auth.store`, `useCartStore`, `checkout-page`) tightly bind to `Loyalty`, `MembershipTier`, and `Table` models. Removing or altering types will cascade across 42 files in `apps/web`.
2. **Persisted Auth Key:**  
   `apps/web/src/stores/auth.store.ts` uses the storage key `coldnbrew-auth`. Changing this key must preserve backward-compatible state migration to prevent breaking existing user sessions.
3. **Seed Dependency on Contaminated Fixtures:**  
   `packages/database/prisma/seed.ts` unconditionally inserts `coldnbrew-gubeng-001`, fake products, fake staff (`admin@coldnbrew.id`), and fake events. Seeding current code immediately pollutes any clean database.
4. **API Jest Test Instability:**  
   Jest parallel test workers on Windows exhaust memory when executing all 40 spec files simultaneously. Unit test execution in CI/local environments must run with `--maxWorkers=2` or `--runInBand`.
5. **Midtrans Gateway Liability:**  
   Midtrans payment keys and webhook handlers assume real monetary checkout flows for unverified products. Leaving these live poses compliance, security, and consumer protection risks.

