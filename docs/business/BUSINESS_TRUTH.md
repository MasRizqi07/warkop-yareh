# Warkop Ya'reh — Authoritative Business Truth

**Document Status:** LIVING SOURCE OF TRUTH  
**Last Verified:** 2026-09-17  
**Audience:** Product Engineering, Domain Architecture, Database, QA, Marketing, Management  

---

## 1. Non-Negotiable Reality Policy

This document is the absolute authoritative source of business-domain truth for **Warkop Ya'reh**. 

Any application, API route, database model, seed script, UI component, marketing copy, or documentation within this repository **MUST NEVER CONTRADICT** the facts set forth here.

### Rules of Engagement:
1. **Never Invent Business Information:**  
   Do not invent branches, menu items, item prices, addresses, telephone numbers, email addresses, facilities, business history, founders, staff, payment integrations, ordering capabilities, seating capacities, promotions, loyalty programs, reservations, delivery capabilities, events, community programs, customer statistics, or revenue metrics.
2. **Preserve Unknowns:**  
   Unknown information must remain explicitly `UNKNOWN` or `null`. Under no circumstances should missing business facts be replaced with "plausible-looking" filler content or sample data.
3. **Absence of Evidence is NOT Evidence of Absence:**  
   A business capability, service, or amenity may be classified as `VERIFIED_ABSENT` **only** when supported by direct authoritative evidence (e.g. written statement from the business owner, or direct physical inspection audit). Do not infer non-existence merely because an item is omitted from a third-party directory or Google Maps listing. Capabilities lacking direct evidence must be classified as **`UNVERIFIED`** (or **`NO CURRENT EVIDENCE`**).
4. **No Cosmetic Rebranding:**  
   Fictional structures from previous templates (e.g. Cold 'N Brew) must NOT merely be renamed to "Warkop Ya'reh". Unverified capabilities must be decommissioned, parked, or removed.

---

## 2. Verified Business Identity

| Attribute | Verified Value | Confidence | Notes / Temporal Metadata |
| :--- | :--- | :---: | :--- |
| **Brand Name** | Warkop Ya'reh | `VERIFIED` | Google Maps listings (captured: 2026-09-17) |
| **Business Category** | Kedai Kopi (Coffee Shop / Indonesian Warkop) | `VERIFIED` | Google Maps category (captured: 2026-09-17) |
| **Cultural Identity** | Urban 24-Hour Surabaya Warkop ("Ngopi, Makan, Nongkrong. 24 Jam.") | `VERIFIED` | Based on 24h schedule & location context |
| **Geographic Location** | Surabaya, Jawa Timur, Indonesia | `VERIFIED` | Physical addresses in Jetis Kulon & Prapen |
| **Operating Hours** | 24 Hours (Every Day) | `VERIFIED` | Google Maps schedule (captured: 2026-09-17) |
| **Service Formats** | Dine-in, Takeaway | `VERIFIED` | Google Maps listing service flags |
| **Public Spending Range** | Rp1–25.000 per orang | `VERIFIED` | **Venue spending range**, NOT item price |
| **Target Audience** | Urban residents, students, night workers, informal hangouts | `PARTIALLY_VERIFIED` | Neighborhood context |
| **Delivery Service** | NO CURRENT EVIDENCE | `UNVERIFIED` | No verified proprietary delivery fleet |
| **Online Reservations** | NO CURRENT EVIDENCE | `UNVERIFIED` | Unsupported in current operations |
| **Loyalty Program** | NO CURRENT EVIDENCE | `UNVERIFIED` | No verified points or tiered membership |
| **Meeting / VIP Rooms** | NO CURRENT EVIDENCE | `UNVERIFIED` | Unsupported in current operations |
| **Drive-Thru** | NO CURRENT EVIDENCE | `UNVERIFIED` | Unsupported in current operations |
| **Online Ordering** | NO CURRENT EVIDENCE | `UNVERIFIED` | Unsupported in current operations |
| **Payment Gateway** | NO CURRENT EVIDENCE | `UNVERIFIED` | Unsupported in current operations |

---

## 3. Verified Outlets (Source of Truth)

### Outlet 1: WARKOP YA'REH (Jetis Kulon)

| Property | Value | Confidence |
| :--- | :--- | :---: |
| **Official Name** | WARKOP YA'REH | `VERIFIED` |
| **Internal Identifier** | `jetis-kulon` | `VERIFIED` |
| **Street Address** | Jl. Raya Jetis Kulon I No.38 | `VERIFIED` |
| **Subdistrict / District** | Wonokromo, Kec. Wonokromo | `VERIFIED` |
| **City / Province / Zip** | Surabaya, Jawa Timur 60243 | `VERIFIED` |
| **Plus Code** | MPVJ+2G Wonokromo, Surabaya, Jawa Timur | `VERIFIED` |
| **Operating Hours** | 24 Hours (Senin - Minggu) | `VERIFIED` |
| **Services Supported** | Dine-in, Takeaway | `VERIFIED` |
| **Public Spending Range** | Rp1–25.000 per orang | `VERIFIED` |
| **Telephone** | UNKNOWN | `UNVERIFIED` |
| **Email Address** | UNKNOWN | `UNVERIFIED` |
| **Official Website** | UNKNOWN | `UNVERIFIED` |
| **Seating Capacity** | UNKNOWN | `UNVERIFIED` |

### Outlet 2: WARKOP YA'REH 2 PRAPEN

| Property | Value | Confidence |
| :--- | :--- | :---: |
| **Official Name** | WARKOP YA'REH 2 PRAPEN | `VERIFIED` |
| **Internal Identifier** | `prapen` | `VERIFIED` |
| **Street Address** | Jl. Raya Prapen No.39 | `VERIFIED` |
| **Subdistrict / District** | Prapen, Kec. Tenggilis Mejoyo | `VERIFIED` |
| **City / Province / Zip** | Surabaya, Jawa Timur 60239 | `VERIFIED` |
| **Plus Code** | MQM3+XJ Prapen, Surabaya, Jawa Timur | `VERIFIED` |
| **Telephone** | 0821-3735-4606 | `VERIFIED` |
| **Operating Hours** | 24 Hours (Senin - Minggu) | `VERIFIED` |
| **Services Supported** | Dine-in, Takeaway | `VERIFIED` |
| **Public Spending Range** | Rp1–25.000 per orang | `VERIFIED` |
| **Email Address** | UNKNOWN | `UNVERIFIED` |
| **Official Website** | UNKNOWN | `UNVERIFIED` |
| **Seating Capacity** | UNKNOWN | `UNVERIFIED` |

---

## 4. Menu & Price Semantics Policy

1. **Venue Spending Range vs. Item Price:**  
   The public Google Maps value **`Rp1–25.000 per orang`** represents the typical **customer spending range** per visit. It is **NOT** an item-level menu price.
2. **Item-Level Menu Status:** Currently **`UNVERIFIED`** (No current evidence).
3. **Empty Production Menu Seed Invariant:**  
   Because exact item names, ingredients, portion sizes, and specific prices have not been validated against physical receipts or direct owner menus, **the production database menu seed MUST REMAIN COMPLETELY EMPTY**.
4. **Public Display Communication:**  
   - The `/menu` page must display: *"Menu lengkap sedang diverifikasi."*
   - The public spending range may be displayed separately as: *"Kisaran pengeluaran yang tercantum pada listing publik: Rp1–25.000 per orang."*
   - Never imply that all products cost Rp1–25.000 or that individual items start at Rp1.
5. **Prohibited Menu Fiction:**  
   Items such as "Cold Brew Tonic", "Nitro Cold Brew", "Croissant Mentega", "Pasta Aglio e Olio", "Lava Cake", and "Tiramisu" are fabricated artifacts from an unrelated template and are strictly forbidden in production.

---

## 5. Technology, About-Page & Heritage Policy

### Platform Responsibilities:
The digital presence of Warkop Ya'reh must truthfully serve customers with:
1. Clear outlet identification, accurate addresses, and direct Google Maps navigation.
2. Verified operating hours (24/7 reliability).
3. Direct phone contact for Prapen (`0821-3735-4606`).
4. Transparent pricing boundaries (Rp1–25k per person spending range).
5. Real venue atmosphere through authentic photography (no AI-generated luxury cafe mockups).

### Heritage Ground Truth:
The repository currently does **NOT** possess verified evidence for:
- Founding year (do NOT use "Since 2018", "Since 2020", etc.)
- Founder or founding family names
- Business origin story or folklore
- Brand-name linguistic origin ("Ya'reh")
- Historical milestones or timeline
- Ownership / management history

### Permitted Positioning:
Copy on `/about` and marketing sections must remain factual, minimal, and dignified:
> *"Warkop Ya'reh merupakan kedai kopi lokal di Surabaya dengan outlet yang saat ini teridentifikasi di Jetis Kulon dan Prapen. Buka 24 jam untuk melayani cangkrukan dan ngopi warga Surabaya."*

### Prohibited Buzzwords (without evidence):
Do **NOT** use unsupported claims such as:
- *"Heritage"* / *"Legenda"*
- *"Sejak tahun XXXX"*
- *"Tradisi keluarga turun temurun"*
- *"Ikon warkop Surabaya"*
- *"Sejarah autentik"*
- *"Specialty coffee sanctuary"*
