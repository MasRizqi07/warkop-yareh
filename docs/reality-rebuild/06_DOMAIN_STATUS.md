# Domain Status Matrix: Warkop Ya'reh

**Document Status:** AUTHORITATIVE DOMAIN INVENTORY  
**Effective Date:** 2026-09-17  
**Auditor:** Domain Architect & Staff Product Engineer  

---

## 1. Domain Status Definitions

| Status | Definition | Architectural Action |
| :--- | :--- | :--- |
| **ACTIVE** | Core business domain verified in the real operations of Warkop Ya'reh in Surabaya. Supported by production requirements, routes, and schemas. | Maintain, test, and expose in customer/admin applications. |
| **VERIFY** | Potentially relevant operational domain that lacks primary evidence or credentials. Requires physical or owner verification before production deployment. | Park in internal scope behind disabled feature flags. |
| **PARKED** | Functionality implemented in code/schema that is not currently part of the verified customer journey or verified public operations. | Disconnect from public customer routes; preserve in backend/internal scope without active dependencies. |
| **DEPRECATED** | Contaminated naming, identifiers, or legacy template constructs (e.g. Cold 'N Brew, fake branch slugs). | Sanitize and migrate to verified Warkop Ya'reh identifiers. |
| **REMOVE** | Speculative capabilities with zero business reality in Warkop Ya'reh (e.g. VIP meeting room bookings, gamified tier points, tech community forums). | Systematically decouple and decommission from production scope. |

---

## 2. Authoritative Domain Status Table

| Domain | Reality Status | Operational Responsibility | Phase-1 Technical Action |
| :--- | :---: | :--- | :--- |
| **Branch** | **ACTIVE** | Physical outlets: Jetis Kulon (Wonokromo) and Prapen (Tenggilis Mejoyo). | REWRITE: Update fixtures, models, and UI to verified outlets. |
| **Menu** | **ACTIVE** | Food & beverage catalog. Verified venue spending range Rp1–25k/person; item-level menu UNVERIFIED. | REWRITE: Empty production seed; public UI displays transparent verification notice. |
| **Gallery** | **ACTIVE** | Visual documentation of real warkop ambiance and cangkrukan culture. | NEW: Add `GalleryAsset` model and public `/gallery` route. |
| **Site Content** | **ACTIVE** | Truthful brand identity, announcements, and operating schedules. | NEW: Add `SiteContent` model and factual `/about` and `/` copy. |
| **Auth** | **ACTIVE** | Internal staff and administrative authentication. | REWRITE: Prune customer loyalty/referral fields; migrate auth storage key to `warkop-yareh-auth`. |
| **Orders** | **PARKED** | Complex online ordering and cart management. | PARK: Disable public `/cart`, `/checkout`, and `/orders` routes; keep models parked. |
| **Payments** | **PARKED** | Midtrans online payment gateway. | PARK: Disable live payment calls; keep models parked until merchant account is verified. |
| **Reservations**| **REMOVE** | Table reservations, slot booking, VIP booths. | REMOVE: Decommission `/booking`, `/reservations`, and `Reservation` model. |
| **Tables** | **PARKED** | QR dine-in table mapping. | PARK: Disable public `/table/[tableId]` and `/qr/[code]` routes; prune `TableType.VIP` and `MEETING_ROOM`. |
| **Loyalty** | **REMOVE** | Points ledgers, rewards catalog, tier progression. | REMOVE: Decommission `/loyalty`, `LoyaltyTransaction`, `Reward`, and `MembershipTier`. |
| **Membership** | **REMOVE** | Bronze, Silver, Gold, Platinum customer tiers. | REMOVE: Prune `membershipTier` from `User` model and shared types. |
| **Referral** | **REMOVE** | Referral codes and viral customer referral loops. | REMOVE: Prune `referralCode` and `referredBy` from `User` model. |
| **Community** | **REMOVE** | Developer meetups, discussion forums, social posts. | REMOVE: Decommission `/community`, `CommunityGroup`, and `CommunityPost`. |
| **Events** | **REMOVE** | Event ticketing, workshops, speaker rosters. | REMOVE: Decommission `/events`, `Event`, and `EventRegistration`. |
| **Marketing** | **PARKED** | WhatsApp Cloud API broadcast campaigns. | PARK: De-link `/marketing` in admin until verified WhatsApp API credentials exist. |
| **Inventory** | **PARKED** | Enterprise ingredient tracking and burn rates. | PARK: De-link `/inventory` in admin until physical store inventory audit is conducted. |
| **POS** | **PARKED** | Cashier shifts and cash drawer balancing. | PARK: Restrict `/pos` and `/pos/shifts` to internal staff scope. |
| **KDS** | **PARKED** | Kitchen Display System. | PARK: Remove from customer web bundle; relocate to internal staff scope. |
| **Franchise** | **REMOVE** | Multi-tenant franchise agreements and royalty billing. | REMOVE: Decommission `FranchiseAgreement`, `FranchiseBilling`, and API module. |
| **AI Recommendation** | **REMOVE** | "Barista Concierge" AI coffee recommender. | REMOVE: Delete `BaristaConciergeModal` component and `apps/api/src/modules/ai`. |

