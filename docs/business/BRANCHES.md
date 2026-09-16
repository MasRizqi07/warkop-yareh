# Warkop Ya'reh — Verified Branches Directory

**Document Status:** AUTHORITATIVE BRANCH TRUTH  
**Last Updated:** 2026-09-17  

---

## 1. Branch Overview

Warkop Ya'reh operates exactly two known, verified physical locations in Surabaya, Jawa Timur.

Any reference to other branches (such as "Gubeng", "Darmo", "Dharmahusada", or "Jakarta Flagship") represents historical template contamination and must be expunged from all active routing and configuration.

---

## 2. Outlet Specifications

### 2.1 Branch 1: WARKOP YA'REH (Jetis Kulon)

```yaml
id: "jetis-kulon"
name: "WARKOP YA'REH"
brand: "Warkop Ya'reh"
branch_number: 1
is_main_branch: true
is_active: true
category: "Kedai Kopi"
operating_hours: "24 Hours"
service_options:
  - "Dine-in"
  - "Takeaway"
price_range: "Rp1-25.000 per person"
address:
  street: "Jl. Raya Jetis Kulon I No.38"
  subdistrict: "Wonokromo"
  district: "Kec. Wonokromo"
  city: "Surabaya"
  province: "Jawa Timur"
  postal_code: "60243"
plus_code: "MPVJ+2G Wonokromo, Surabaya, Jawa Timur"
phone: null # UNKNOWN
email: null # UNKNOWN
website: null # UNKNOWN
capacity: null # UNKNOWN
amenities:
  wifi: "PARTIALLY_VERIFIED (Typical warkop amenity, requires field check)"
  parking: "PARTIALLY_VERIFIED (Motorcycle roadside parking typical)"
  vip_room: "VERIFIED_ABSENT"
  meeting_room: "VERIFIED_ABSENT"
  drive_thru: "VERIFIED_ABSENT"
source_type: "GOOGLE_MAPS"
verification_date: "2026-09-17"
confidence_status: "VERIFIED"
```

---

### 2.2 Branch 2: WARKOP YA'REH 2 PRAPEN

```yaml
id: "prapen"
name: "WARKOP YA'REH 2 PRAPEN"
brand: "Warkop Ya'reh"
branch_number: 2
is_main_branch: false
is_active: true
category: "Kedai Kopi"
operating_hours: "24 Hours"
service_options:
  - "Dine-in"
  - "Takeaway"
price_range: "Rp1-25.000 per person"
address:
  street: "Jl. Raya Prapen No.39"
  subdistrict: "Prapen"
  district: "Kec. Tenggilis Mejoyo"
  city: "Surabaya"
  province: "Jawa Timur"
  postal_code: "60239"
plus_code: "MQM3+XJ Prapen, Surabaya, Jawa Timur"
phone: "0821-3735-4606"
email: null # UNKNOWN
website: null # UNKNOWN
capacity: null # UNKNOWN
amenities:
  wifi: "PARTIALLY_VERIFIED (Typical warkop amenity, requires field check)"
  parking: "PARTIALLY_VERIFIED (Motorcycle roadside parking typical)"
  vip_room: "VERIFIED_ABSENT"
  meeting_room: "VERIFIED_ABSENT"
  drive_thru: "VERIFIED_ABSENT"
source_type: "GOOGLE_MAPS"
verification_date: "2026-09-17"
confidence_status: "VERIFIED"
```

---

## 3. Disputed / Contaminated Branch Data

| Erroneous Branch Name | Contaminated Location | Historical Occurrence | Action Required |
| :--- | :--- | :--- | :--- |
| **Warkop Ya'reh Gubeng** | Jl. Gubeng Pojok No. 10, Surabaya 60281 | `seed.ts`, `apps/api/branch.controller.spec.ts` | PURGE / REPLACE with `jetis-kulon` |
| **Cold 'N Brew Gubeng** | `coldnbrew-gubeng-001` | Fixture ID throughout database, API, and tests | PURGE / RENAME fixture IDs |
| **Darmo Flagship** | Jl. Raya Darmo No. 42 | Marketing copy, UI mockups, image assets | PURGE |
| **Dharmahusada Branch**| Dharmahusada | Marketing copy, UI mockups | PURGE |

---

## 4. Operational Invariants

1. Both branches operate on a **continuous 24-hour cycle** 7 days a week.
2. The primary mode of transport for customers is motorcycle, with roadside/stall parking.
3. Seating arrangements are communal warkop benches and tables; there are no reservable private rooms or conference facilities.

