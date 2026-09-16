# Route & Content Reset Plan: Warkop Ya'reh

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Author:** Staff Product Engineer & Domain Architect  
**Target Applications:** `apps/web`, `apps/admin`  

---

## 1. Target Customer Information Architecture (IA)

The customer-facing application (`apps/web`) will be reconstructed into an authentic, fast, accessible digital presence for Warkop Ya'reh in Surabaya.

```
Public Customer IA
│
├── /                           (Beranda / Homepage)
├── /menu                       (Daftar Menu & Kisaran Harga)
├── /outlets                    (Daftar Outlet Warkop Ya'reh)
│   ├── /outlets/jetis-kulon    (Detail Outlet 1 - Wonokromo)
│   └── /outlets/prapen         (Detail Outlet 2 - Tenggilis Mejoyo)
├── /gallery                    (Galeri Suasana Warkop)
├── /about                      (Tentang Warkop Ya'reh)
└── /contact                    (Kontak & Lokasi Google Maps)
```

---

## 2. Target Homepage Blueprint (`apps/web/src/app/(marketing)/page.tsx`)

The homepage will be structured into 10 cohesive, verified sections:

1. **Hero Section:**
   - **Headline:** `Warkop Ya'reh`
   - **Tagline:** *"Ngopi, Makan, Nongkrong. 24 Jam."*
   - **Badge:** `Buka 24 Jam Non-Stop di Surabaya`
   - **Primary CTAs:** `Lihat Lokasi Outlet` (scrolls to outlets) and `Lihat Menu` (links to `/menu`).
   - **Background/Visual:** Real venue imagery or warm urban nocturnal palette.
2. **Business Identity & Heritage:**
   - Authentic Surabaya warkop culture: an unpretentious, friendly cangkrukan space for everyone.
   - Zero luxury or corporate pretension.
3. **24-Hour Dependability Callout:**
   - Highlight continuous 24/7 operations in both Wonokromo and Prapen.
4. **Service Formats:**
   - Clear indicators for **Dine-in** and **Takeaway**.
5. **Menu & Price Range Preview:**
   - Prominently showcases the verified price bracket: `Rp1 - Rp25.000 per orang`.
   - Honest indicator: *"Menu lengkap sedang diperbarui langsung dari meja seduh."*
6. **Outlets Directory Preview:**
   - Side-by-side interactive cards for **Jetis Kulon** and **Prapen**.
   - Includes address, Plus Code, Google Maps navigation links, and phone number for Prapen (`0821-3735-4606`).
7. **Real Atmosphere Gallery:**
   - Authentic, uncurated photos of customer cangkrukan, coffee brewing, and evening atmosphere.
   - Strictly no AI-generated luxury cafe stock photography.
8. **Customer Sentiment & Vibe Signals:**
   - Honest community signals: *"Tempat nongkrong malam favorit warga Surabaya selatan dan pusat."*
9. **Direct Google Maps Navigation:**
   - Embedded interactive maps or one-click navigation links to both locations.
10. **Contact & Social Footer CTA:**
    - Direct WhatsApp / phone CTA for Prapen; clean, honest footer without broken links.

---

## 3. Public Route Retirement & Disposal Matrix

| Current Route Path | Action | Remediation Implementation |
| :--- | :---: | :--- |
| `/booking` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/outlets` |
| `/reservations` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/outlets` |
| `/community` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/` |
| `/community/groups/[id]` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/` |
| `/events` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/` |
| `/events/[id]` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/` |
| `/loyalty` | **REMOVE** | Return HTTP 404 or permanent 301 redirect to `/` |
| `/cart` | **PARK** | Disable navigation links; retain page in parked status or 404 |
| `/checkout` | **PARK** | Disable navigation links |
| `/checkout/status` | **PARK** | Disable navigation links |
| `/checkout/success` | **PARK** | Disable navigation links |
| `/order/track/[orderId]` | **PARK** | Disable navigation links |
| `/orders` | **PARK** | Disable navigation links |
| `/orders/[id]` | **PARK** | Disable navigation links |
| `/table/[tableId]` | **PARK** | Disable navigation links |
| `/qr/[code]` | **PARK** | Disable navigation links |
| `/ops/*` (kds, pos, shift) | **REMOVE** | Delete from `apps/web` bundle (relocate to Admin if verified) |
| `/blog` | **PARK** | De-link from main navigation |
| `/blog/[slug]` | **PARK** | De-link from main navigation |
| `/account`, `/profile` | **PARK** | De-link from main navigation |
| `/register`, `/otp` | **PARK** | Disable self-serve customer registration |
| `/login` | **REWRITE** | Repurpose as administrative / staff gateway |

---

## 4. Admin Backoffice Route Realignment (`apps/admin`)

| Admin Route | Status | Phase-1 Target Responsibility |
| :--- | :---: | :--- |
| `/` | **REWRITE** | Overview of active outlets (Jetis Kulon & Prapen) and site status |
| `/login` | **KEEP** | Secure authentication gateway for staff and administrators |
| `/branches` | **REWRITE** | Manage verified branch metadata, schedules, and phone numbers |
| `/products` | **REWRITE** | Catalog editor ready to receive real menu items upon verification |
| `/gallery` (NEW) | **NEW** | Upload and curate authentic photos for the public gallery |
| `/site-content` (NEW) | **NEW** | Manage homepage banners and public announcements |
| `/users` | **REWRITE** | Manage internal staff and admin accounts only |
| `/settings` | **REWRITE** | Core platform settings and branch operating status |
| `/loyalty` | **REMOVE** | Decommission page and remove from sidebar |
| `/community` | **REMOVE** | Decommission page and remove from sidebar |
| `/events` | **REMOVE** | Decommission page and remove from sidebar |
| `/reservations` | **REMOVE** | Decommission page and remove from sidebar |
| `/crm` | **REMOVE** | Decommission page and remove from sidebar |
| `/marketing` | **PARK** | Hide from sidebar until WhatsApp Cloud API is verified |
| `/inventory` | **PARK** | Hide from sidebar until physical stock ledger is verified |
| `/pos`, `/pos/shifts` | **PARK** | Retain in operations module behind feature flag |
| `/kitchen` | **PARK** | Retain in operations module behind feature flag |

---

## 5. Visual Design & Brand Direction

### Visual Tone & Aesthetic:
- **Core Mood:** Authentic, nocturnal, local Surabaya, youthful, warm, accessible.
- **Palette:** Deep warm charcoal, raw coffee bean amber (`#9c6b3a`), soft cream paper, clean typography.
- **Imagery Rule:** Real photos of Warkop Ya'reh tables, coffee brewing, and night visitors. AI-generated imagery depicting Scandinavian barista bars is strictly forbidden.

