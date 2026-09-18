# Warkop Ya'reh — Business Data Confidence Model

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Last Updated:** 2026-09-17  

---

## 1. Confidence Levels
## 1. Core Evidence Rule

To prevent data hallucination and ensure strict domain integrity, all business facts must be assigned one of five standardized confidence levels:
> [!IMPORTANT]
> **Absence of evidence is not evidence of absence.**
>
> A business capability, amenity, or operational feature may be classified as `VERIFIED_ABSENT` **only** when supported by direct primary evidence (e.g. explicit written declaration from the business owner, direct physical inspection confirming absence, or official public notices).
>
> In all other cases where evidence has not yet been obtained, the status **MUST** remain `UNVERIFIED` (or `NO CURRENT EVIDENCE`).
>
> Do **NOT** infer non-existence merely because an attribute or service is omitted from a third-party directory, Google Maps listing, or customer review.

---

## 2. Confidence Level Taxonomy

```
[ VERIFIED ] ──────────► Backed by primary evidence (Google Maps, store audit, owner confirmation).
                            Allowed in production databases, seeds, and public copy.
┌─────────────────────────┐
│        VERIFIED         │ ──► Directly confirmed by primary authoritative evidence
└─────────────────────────┘     (Google Maps merchant profile, owner confirmation, in-store audit).
            │
┌─────────────────────────┐
│   PARTIALLY_VERIFIED    │ ──► Secondary evidence or standard regional warkop practice;
└─────────────────────────┘     pending direct field verification.
            │
┌─────────────────────────┐
│       UNVERIFIED        │ ──► Unknown or uninvestigated capability; NO CURRENT EVIDENCE.
└─────────────────────────┘     Must remain NULL or UNKNOWN. NEVER fabricate placeholder data.
            │
┌─────────────────────────┐
│     VERIFIED_ABSENT     │ ──► Proven not to exist via authoritative owner statement or audit.
└─────────────────────────┘     Requires explicit citation of the negative proof source.
            │
┌─────────────────────────┐
│        DISPUTED         │ ──► Conflicting information between two or more active sources.
└─────────────────────────┘     Blocked from production until resolved.
            │
┌─────────────────────────┐
│       DEPRECATED        │ ──► Inherited from legacy template (Cold 'N Brew). Quarantined.
└─────────────────────────┘
```

[ PARTIALLY_VERIFIED ] ─► Secondary evidence or cultural norm; pending physical confirmation.
                            Allowed in descriptive text with appropriate disclaimers.
---

[ UNVERIFIED ] ─────────► Unknown business fact.
                            Must remain NULL or UNKNOWN. NEVER fabricate placeholder data.
## 3. Dynamic External Data Invariant

[ DISPUTED ] ───────────► Contradicted by known reality or conflicting sources.
                            Blocked from production deployment.
Third-party platform data (including Google Maps ratings, review counts, opening hours, and venue price segments) represents **time-bound external observations**, not eternal constants.

[ DEPRECATED ] ─────────► Obsolete or contaminated data from previous templates.
                            Quarantined or expunged.
```
Whenever external data is modeled or cached, it must include temporal tracking metadata:
1. `sourceType`: Primary source identifier (e.g. `GOOGLE_MAPS`).
2. `sourceReference`: Specific listing URL or Plus Code.
3. `capturedAt`: Timestamp when the data was scraped or recorded.
4. `lastVerifiedAt`: Timestamp of the most recent validation check.

---

## 2. TypeScript Domain Contract
## 4. TypeScript Domain Contract

The data confidence model should be represented in `@warkop-yareh/types`:

```typescript
export type DataConfidenceLevel =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'VERIFIED_ABSENT'
  | 'DISPUTED'
  | 'DEPRECATED';

export type BusinessSourceType =
  | 'BUSINESS_OWNER'
  | 'IN_STORE_OBSERVATION'
  | 'OFFICIAL_MENU'
  | 'OFFICIAL_SOCIAL_MEDIA'
  | 'GOOGLE_MAPS'
  | 'CUSTOMER_REVIEW'
  | 'THIRD_PARTY_PLATFORM';

export interface TraceableBusinessFact<T> {
export interface DynamicExternalFact<T> {
  value: T;
  confidence: DataConfidenceLevel;
  sourceType: BusinessSourceType;
  sourceReference: string;
  verifiedAt: string; // ISO 8601 string
  capturedAt: string;     // ISO 8601 string
  lastVerifiedAt: string; // ISO 8601 string
  notes?: string;
}
```

---

## 3. Current Repository Entities Classified by Confidence
## 5. Current Entity Classification Matrix (Corrected Semantics)

| Entity / Field | Confidence | Source Type | Reference |
| :--- | :--- | :--- | :--- |
| **Brand Name ("Warkop Ya'reh")** | `VERIFIED` | `GOOGLE_MAPS` | Listings in Wonokromo & Prapen |
| **Branch: Jetis Kulon Address** | `VERIFIED` | `GOOGLE_MAPS` | Jl. Raya Jetis Kulon I No.38 |
| **Branch: Prapen Address & Phone**| `VERIFIED` | `GOOGLE_MAPS` | Jl. Raya Prapen No.39 / 0821-3735-4606 |
| **24-Hour Operations** | `VERIFIED` | `GOOGLE_MAPS` | Both branch listings |
| **Price Envelope (Rp1-25k)** | `VERIFIED` | `GOOGLE_MAPS` | Public price segment |
| **WiFi in Outlets** | `PARTIALLY_VERIFIED` | `CUSTOMER_REVIEW` | Common amenity mentioned by visitors |
| **Motorcycle Parking** | `PARTIALLY_VERIFIED` | `IN_STORE_OBSERVATION` | Street-level imagery |
| **Itemized Menu & Prices** | `UNVERIFIED` | NONE | Not authenticated yet |
| **Seating Capacity** | `UNVERIFIED` | NONE | Not measured |
| **VIP / Meeting Rooms** | `DISPUTED` | NONE | Real warkops do not feature VIP rooms |
| **Cold 'N Brew Gubeng Fixture** | `DEPRECATED` | NONE | Contaminated template legacy |
| **Loyalty Tier System** | `DEPRECATED` | NONE | Contaminated template legacy |

| Domain / Entity | Verified Reality | Confidence Status | Primary Evidence / Notes |
| :--- | :--- | :---: | :--- |
| **Brand Name ("Warkop Ya'reh")** | Brand identity | `VERIFIED` | Google Maps listings (Wonokromo & Prapen) |
| **Branch 1: Jetis Kulon** | Physical outlet | `VERIFIED` | Jl. Raya Jetis Kulon I No.38, Surabaya 60243 |
| **Branch 2: Prapen** | Physical outlet | `VERIFIED` | Jl. Raya Prapen No.39, Surabaya 60239 |
| **Operating Hours (24 Hours)** | Both branches | `VERIFIED` | Google Maps listing schedule |
| **Services: Dine-in & Takeaway** | Counter service | `VERIFIED` | Public listing supported service flags |
| **Prapen Telephone (`0821-3735-4606`)**| Branch phone | `VERIFIED` | Google Maps Prapen listing |
| **Public Spending Range (Rp1–25k/org)**| Spending range | `VERIFIED` | Venue price segment, NOT item price |
| **Jetis Kulon Telephone** | Telephone | `UNVERIFIED` | No verified listing; remains `UNKNOWN` |
| **Item-Level Menu & Prices** | Product catalog | `UNVERIFIED` | No direct receipts/menu; seed remains empty |
| **Public Wi-Fi** | Network access | `UNVERIFIED` | Common regional amenity; unverified |
| **Motorcycle Parking** | Storefront | `PARTIALLY_VERIFIED` | Roadside street parking visible |
| **Seating Capacity** | Total seats | `UNVERIFIED` | Unmeasured; never claim 80 or 150 |
| **VIP / Meeting Rooms** | Private spaces | `UNVERIFIED` | No current evidence; unsupported |
| **Drive-Thru** | Vehicle lane | `UNVERIFIED` | No current evidence; unsupported |
| **Table Reservations** | Booking system | `UNVERIFIED` | No current evidence; unsupported |
| **Loyalty / Membership Points** | Gamification | `UNVERIFIED` | No current evidence; unsupported |
| **Community Forums & Events** | Developer hubs | `UNVERIFIED` | No current evidence; unsupported |
| **Online Ordering & Delivery** | Web checkout | `UNVERIFIED` | No current evidence; unsupported |
| **Midtrans Payment Gateway** | Payment gateway | `UNVERIFIED` | No current merchant integration evidence |
| **Franchise Operations** | Multi-tenancy | `UNVERIFIED` | No current evidence; unsupported |
| **Cold 'N Brew Legacy Fixtures** | Template data | `DEPRECATED` | Contaminated legacy template artifacts |
