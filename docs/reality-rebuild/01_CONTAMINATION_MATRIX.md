# Contamination Matrix: Repository-Wide Domain Audit

**Document Status:** AUDIT BASELINE  
**Audit Target SHA:** `4370459ef4f3500cb344a3fb6a39528c61fe79f4`  
**Total Contaminated Files:** 183 distinct files  
**Total Occurrences:** 1,844  

---

## 1. Classification Taxonomy

Every contaminated occurrence in the repository is classified under one of five remediation categories:

| Category | Definition | Action Required |
| :--- | :--- | :--- |
| **KEEP** | Technically sound code or configuration where the keyword occurrence is incidental (e.g. standard color constants, generic UI tokens, generic tooling). | Preserve intact. |
| **REWRITE** | Reusable architectural component, model, or route whose domain semantics, labels, fixtures, or content are contaminated with fictional assumptions. | Refactor domain semantics to reflect verified Warkop Ya'reh reality. |
| **REMOVE** | Speculative features, models, endpoints, or UI routes with zero business basis in the real Warkop Ya'reh operations (e.g. VIP table bookings, developer community forums, loyalty points). | Decommission from active production scope and prune from active bundles. |
| **VERIFY** | Potentially useful operational features (e.g. cashier shifts, physical POS, kitchen display) that cannot be deployed as core requirements until verified with the business owner. | Park in a segregated module or behind disabled feature flags. |
| **ARCHIVE** | Legacy HTML prototypes, exploratory UI mocks, and historical PRDs that provide design reference but must not be treated as production specifications. | Relocate to `Design/archive/speculative-v1/`. |

---

## 2. Global Term Frequency Summary

| Keyword Pattern | Occurrences | Files Affected | Primary Contaminated Domains |
| :--- | :---: | :---: | :--- |
| `Loyalty` | 450 | 100 | Point ledgers, membership rewards, checkout discounts |
| `Community` | 415 | 71 | Developer forums, discussion boards, coffee club posts |
| `Midtrans` | 218 | 65 | Payment gateway webhooks, payment tokens, sandbox keys |
| `Franchise` | 190 | 31 | Multi-tenant billing, royalty share, franchise agreements |
| `VIP` | 172 | 29 | Table booking types, VIP lounge zones |
| `Membership` | 151 | 49 | Tier progression, member discounts, user roles |
| `Darmo` | 137 | 26 | Fictional flagship branch references and mockups |
| `Gold` | 117 | 45 | Loyalty tier enum, UI badge colors, theme variables |
| `Gubeng` | 100 | 23 | Fictional branch location (`Warkop Ya'reh Gubeng`) |
| `Platinum` | 44 | 25 | Speculative highest membership tier |
| `Bronze` | 44 | 27 | Default user tier assignment in auth schemas |
| `Silver` | 38 | 26 | Intermediate membership tier |
| `Coworking` | 37 | 16 | Marketing claims regarding high-speed desks and meeting spaces |
| `Specialty Coffee` | 16 | 14 | Premium third-wave coffee branding |
| `Dharmahusada` | 16 | 7 | Fictional branch location |
| `Referral` | 15 | 9 | Viral marketing referral code generation and attribution |
| `coldnbrew` | 12 | 8 | Auth storage key (`coldnbrew-auth`), fixture branch IDs |
| `CNB` | 10 | 2 | Order number prefix (`CNB-YYYYMMDD-XXXX`), branch IDs |
| `Cold 'N Brew` | 9 | 3 | Root PRDs and architectural documentation |
| `Meeting Room` | 8 | 5 | Table booking types (`MR-A`, `MR-B`) in seed and schemas |
| `Developer Meetup`| 5 | 4 | Fictional events ("Ngopi & Bangun Produk", tech workshops) |
| `Drive Thru` | 3 | 2 | Fictional branch feature in `Branch.features` |
| `AI Recommendation` | 1 | 1 | "Barista Concierge" automated recommender |
| `Predictive Analytics`| 1 | 1 | Fictional ML churn prediction documentation |
| `Coffee Sanctuary` | 1 | 1 | Luxury branding headline in UI mockups |

---

## 3. Database Layer Contamination (`packages/database`)

| File | Context / Line | Current Behavior | Class | Required Action | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `prisma/schema.prisma` | Line 26, 88-93 | `enum MembershipTier { BRONZE, SILVER, GOLD, PLATINUM }` | **REMOVE** | Remove enum; drop column from `User` | Warkop Ya'reh does not run a gamified loyalty scheme. |
| `prisma/schema.prisma` | Line 27, 41 | `loyaltyPoints Int @default(0)`, `LoyaltyTransaction[]` | **REMOVE** | Remove loyalty fields and relations | Speculative loyalty points model. |
| `prisma/schema.prisma` | Line 29-30 | `referralCode String`, `referredBy String?` | **REMOVE** | Remove referral fields from `User` | No referral marketing program exists. |
| `prisma/schema.prisma` | Line 76 | `enum OrderType { ... DRIVE_THRU }` | **REMOVE** | Remove `DRIVE_THRU` value | Real outlets do not have drive-thru facilities. |
| `prisma/schema.prisma` | Line 112 | `features String[]` (`Drive Thru`, `Meeting Room`) | **REWRITE** | Sanitize features array | Purge fictional amenities. |
| `prisma/schema.prisma` | Line 222 | `orderNumber String // Format: CNB-YYYYMMDD-XXXX` | **REWRITE** | Update prefix to `WY-` | Contaminated Cold 'N Brew acronym. |
| `prisma/schema.prisma` | Line 344-362 | `model Payment` with `midtransToken`, `midtransOrderId` | **VERIFY** | Park payment model or disable online checkout | No merchant Midtrans account verified. |
| `prisma/schema.prisma` | Line 366-397 | `model Table` with `TableType` (`VIP`, `MEETING_ROOM`) | **REMOVE** | Remove VIP and Meeting Room enums/models | Only communal seating exists. |
| `prisma/schema.prisma` | Line 398-434 | `model Reservation` | **REMOVE** | Remove model and relationships | Warkop Ya'reh does not take table bookings. |
| `prisma/schema.prisma` | Line 436-510 | `model Event`, `model EventRegistration` | **REMOVE** | Remove event ticketing models | No event management program exists. |
| `prisma/schema.prisma` | Line 514-572 | `model CommunityGroup`, `model CommunityPost` | **REMOVE** | Remove social community forum models | No online social forum exists. |
| `prisma/schema.prisma` | Line 575-616 | `model LoyaltyTransaction`, `model Reward` | **REMOVE** | Remove loyalty reward models | Speculative gamification. |
| `prisma/schema.prisma` | Line 670-730 | `model MarketingCampaign`, `model MarketingDelivery` | **VERIFY** | Park WhatsApp broadcast models | No verified WhatsApp Cloud API account. |
| `prisma/schema.prisma` | Line 827-874 | `model FranchiseAgreement`, `model FranchiseBilling` | **REMOVE** | Remove franchise tenancy models | Warkop Ya'reh is not an open franchise network. |
| `prisma/seed.ts` | Line 23, 44-83 | Fixed ID `coldnbrew-gubeng-001`, `Warkop Ya'reh Gubeng` | **REWRITE** | Seed `jetis-kulon` and `prapen` verified branches | Gubeng branch is fictional. |
| `prisma/seed.ts` | Line 86-191 | 32 fictional luxury coffee products (Americano, Lava Cake) | **REWRITE** | Empty production menu seed | No item-level menu verified yet. |
| `prisma/seed.ts` | Line 194-224 | Meeting room tables `MR-A`, `MR-B` | **REMOVE** | Purge meeting room seed tables | Meeting rooms do not exist. |
| `prisma/seed.ts` | Line 226-265 | Rewards (`Nitro Cold Brew`, `Toraja V60`) | **REMOVE** | Purge loyalty rewards seed | No loyalty catalog exists. |
| `prisma/seed.ts` | Line 268-286 | Staff emails `admin@coldnbrew.id`, `kasir@coldnbrew.id` | **REWRITE** | Use neutral local admin accounts | Contaminated Cold 'N Brew domains. |
| `prisma/seed.ts` | Line 333-350 | Event seed `Ngopi & Bangun Produk` | **REMOVE** | Purge fictional tech community events | Unsupported business assumption. |

---

## 4. Shared Contracts Layer (`packages/types`, `packages/ui`)

| File | Context / Line | Current Behavior | Class | Required Action | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `packages/types/index.ts` | Line 16 | `export type MembershipTier = 'BRONZE' ...` | **REMOVE** | Delete type definition | Gamified loyalty model deprecated. |
| `packages/types/index.ts` | Line 25-27 | `membershipTier`, `loyaltyPoints` in `User` | **REMOVE** | Prune fields from `User` interface | Align with clean Admin/Staff model. |
| `packages/types/index.ts` | Line 85-97 | `interface Reservation` with `vip`, `meeting-room` | **REMOVE** | Delete interface | Reservations unsupported. |
| `packages/types/index.ts` | Line 106-136 | `interface Event`, `EventSpeaker` | **REMOVE** | Delete interfaces | Event ticketing unsupported. |
| `packages/types/index.ts` | Line 138-162 | `interface CommunityGroup`, `CommunityPost` | **REMOVE** | Delete interfaces | Community forums unsupported. |
| `packages/types/index.ts` | Line 184-204 | `interface LoyaltyTransaction`, `Reward` | **REMOVE** | Delete interfaces | Loyalty program unsupported. |
| `packages/types/index.ts` | Line 252-267 | `interface Branch` with fictional `features` | **REWRITE** | Add `plusCode`, `coordinates`, `DataConfidenceLevel` | Reflect verified branch structure. |
| `packages/ui/src/theme.css` | Line 18 | `--color-gold: #d4af37;` | **KEEP** | Retain generic CSS utility variable | Generic design token, not tied to domain logic. |

---

## 5. Customer Application Contamination (`apps/web`)

| File | Context | Current Behavior | Class | Required Action | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `src/stores/auth.store.ts` | Line 39 | `name: 'coldnbrew-auth'` | **REWRITE** | Migrate to `warkop-yareh-auth` with migration function | Contaminated storage key namespace. |
| `src/stores/persist-storage.test.ts` | Line 25 | Tests `'coldnbrew-auth'` storage key | **REWRITE** | Update test to verify migration to clean key | Align test with reality. |
| `src/app/(marketing)/page.tsx` | Full Page | Hero promoting "Coffee Sanctuary", "Coworking" | **REWRITE** | Reconstruct into 24-hour urban Surabaya warkop | Align with authentic warkop identity. |
| `src/app/(marketing)/about/page.tsx` | Full Page | Narrative about artisan baristas, single-origin roasts | **REWRITE** | Rewrite with truthful Surabaya warkop background | Eliminate fictional marketing claims. |
| `src/app/(marketing)/menu/page.tsx` | Full Page | Displays fictional Cold Brew, pastries, pastas | **REWRITE** | Display verified price envelope (Rp1-25k) & status banner | Production menu seed is empty. |
| `src/app/(marketing)/contact/page.tsx`| Full Page | Displays fake phone numbers & corporate contact forms | **REWRITE** | Display verified Prapen phone (`0821-3735-4606`) & Maps | Truthful outlet contact channels. |
| `src/app/(marketing)/booking/page.tsx`| Full Page | Table & meeting room reservation interface | **REMOVE** | Remove route or replace with 404/redirect | Warkop Ya'reh has no reservation system. |
| `src/app/(marketing)/community/page.tsx`| Full Page | Developer community forum & meetup lists | **REMOVE** | Remove route or replace with 404/redirect | Unsupported community system. |
| `src/app/(marketing)/events/page.tsx` | Full Page | Event listing and ticket checkout | **REMOVE** | Remove route or replace with 404/redirect | Unsupported event system. |
| `src/app/loyalty/page.tsx` | Full Page | Loyalty point balances & tiered perk charts | **REMOVE** | Remove route or replace with 404/redirect | Unsupported loyalty system. |
| `src/app/reservations/page.tsx` | Full Page | Customer reservation dashboard | **REMOVE** | Remove route or replace with 404/redirect | Unsupported reservation system. |
| `src/app/cart/page.tsx` | Full Page | E-commerce shopping cart | **REMOVE / PARK** | Disable public navigation | No verified online delivery or checkout. |
| `src/app/checkout/page.tsx` | Full Page | Multi-step Midtrans payment flow | **REMOVE / PARK** | Disable public navigation | Speculative online payments. |
| `src/app/table/[tableId]/page.tsx` | Full Page | QR table dine-in ordering | **REMOVE / PARK** | Disable public navigation | Speculative QR table service. |
| `src/app/ops/*` | Sub-routes | Kitchen KDS, POS, Cashier Shifts | **REMOVE / PARK** | Remove from public customer bundle | Internal ops belong in Admin, not Web. |
| `src/components/layout/UniversalHeader.tsx`| Nav Links | Links to Loyalty, Community, Events, Booking | **REWRITE** | Prune navigation links to Menu, Outlets, About, Contact | Clean public customer IA. |
| `src/components/ai/barista-concierge-modal.tsx`| Full Component| AI barista product recommender | **REMOVE** | Remove component | Unnecessary complexity for a traditional warkop. |

---

## 6. Admin Application Contamination (`apps/admin`)

| File | Context | Current Behavior | Class | Required Action | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `src/app/(dashboard)/branches/page.tsx`| Dashboard | References `coldnbrew-gubeng-001`, fake capacities | **REWRITE** | Manage Jetis Kulon & Prapen branches | Align with verified outlets. |
| `src/app/(dashboard)/products/page.tsx`| Dashboard | Manages fictional luxury pastries and espresso items | **REWRITE** | Support clean empty catalog ready for real items | Align with clean catalog schema. |
| `src/app/(dashboard)/loyalty/page.tsx` | Dashboard | Manage tier rules, point multipliers, rewards | **REMOVE** | Decommission page | Unsupported loyalty domain. |
| `src/app/(dashboard)/community/page.tsx`| Dashboard | Moderate user forum posts and tech groups | **REMOVE** | Decommission page | Unsupported community domain. |
| `src/app/(dashboard)/events/page.tsx` | Dashboard | Manage ticket codes, speakers, workshops | **REMOVE** | Decommission page | Unsupported event domain. |
| `src/app/(dashboard)/reservations/page.tsx`| Dashboard | Manage VIP table and meeting room calendars | **REMOVE** | Decommission page | Unsupported reservation domain. |
| `src/app/(dashboard)/marketing/page.tsx`| Dashboard | WhatsApp Cloud API campaign broadcaster | **VERIFY** | Park page until WhatsApp credentials exist | Unverified communication channel. |
| `src/app/(dashboard)/crm/page.tsx` | Dashboard | Customer lifetime value & segment analytics | **REMOVE** | Decommission page | Unsupported customer telemetry. |
| `src/app/(dashboard)/inventory/page.tsx`| Dashboard | Ingredient tracking and burn rates | **VERIFY** | Park page | Unsupported enterprise inventory. |
| `src/components/layout/Sidebar.tsx` | Navigation | Links to Loyalty, Community, Events, CRM | **REWRITE** | Restrict sidebar to Branches, Menu, Gallery, Content | Focus on core Phase-1 scope. |

---

## 7. Backend API Contamination (`apps/api`)

| File | Module / Path | Current Behavior | Class | Required Action | Reason |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `src/modules/branch/*` | `branch` module | Hardcoded checks for `coldnbrew-gubeng-001` | **REWRITE** | Update tests and fixtures to `jetis-kulon` / `prapen` | Purge legacy branch identifiers. |
| `src/modules/catalog/*` | `catalog` module | Seed and tests assume luxury coffee hierarchy | **REWRITE** | Decouple from fake menu assumptions | Empty catalog default. |
| `src/modules/ai/*` | `ai` module | GPT/Claude recommendations for coffee beans | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/community/*`| `community` module | Group threads, posts, memberships | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/event/*` | `event` module | Event ticketing and speaker rosters | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/franchise/*`| `franchise` module | Franchise royalty fee calculation | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/loyalty/*` | `loyalty` module | Points calculation and rewards redemption | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/reservation/*`| `reservation` module | Table locking and slot booking | **REMOVE** | Remove module | Unsupported capability. |
| `src/modules/marketing/*`| `marketing` module | WhatsApp Cloud API dispatch processor | **VERIFY** | Park module from core routing | Unsupported capability. |
| `src/modules/ordering/*` | `ordering` module | Multi-step checkout, voucher discount rules | **VERIFY** | Park module from core routing | Unsupported capability. |

---

## 8. Design Prototypes & Documentation (`Design/*`, `docs/*`)

| Path | Description | Class | Required Action | Reason |
| :--- | :--- | :---: | :--- | :--- |
| `Design/*` (18 folders) | High-end coworking, specialty coffee, VIP reservation HTML mocks | **ARCHIVE** | Relocate to `Design/archive/speculative-v1/` | Prevent speculative designs from polluting production requirements. |
| `apps/web/public/images/*` | `darmo-interior.png`, `artisan-toasted-sourdough.png` | **ARCHIVE** | Move to archive; use authentic photography | Misrepresents real venue. |
| `PRD.md`, `project_audit.md` | Legacy documents referencing Cold 'N Brew and luxury concept | **ARCHIVE** | Deprecate in favor of `docs/business/` | Historical records only. |
| `docs/architecture/*` | Architectural diagrams for 10+ speculative enterprise microservices | **REWRITE** | Realign to modular monolith for Warkop Ya'reh reality | Simplify to actual business scope. |

