# Warkop Ya'reh — Business Data Confidence Model

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Last Updated:** 2026-09-17  

---

## 1. Confidence Levels

To prevent data hallucination and ensure strict domain integrity, all business facts must be assigned one of five standardized confidence levels:

```
[ VERIFIED ] ──────────► Backed by primary evidence (Google Maps, store audit, owner confirmation).
                            Allowed in production databases, seeds, and public copy.

[ PARTIALLY_VERIFIED ] ─► Secondary evidence or cultural norm; pending physical confirmation.
                            Allowed in descriptive text with appropriate disclaimers.

[ UNVERIFIED ] ─────────► Unknown business fact.
                            Must remain NULL or UNKNOWN. NEVER fabricate placeholder data.

[ DISPUTED ] ───────────► Contradicted by known reality or conflicting sources.
                            Blocked from production deployment.

[ DEPRECATED ] ─────────► Obsolete or contaminated data from previous templates.
                            Quarantined or expunged.
```

---

## 2. TypeScript Domain Contract

The data confidence model should be represented in `@warkop-yareh/types`:

```typescript
export type DataConfidenceLevel =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
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
  value: T;
  confidence: DataConfidenceLevel;
  sourceType: BusinessSourceType;
  sourceReference: string;
  verifiedAt: string; // ISO 8601 string
  notes?: string;
}
```

---

## 3. Current Repository Entities Classified by Confidence

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

