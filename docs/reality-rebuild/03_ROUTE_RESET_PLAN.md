# Route & Content Reset Plan: Warkop Ya'reh

**Document Status:** ARCHITECTURAL SPECIFICATION  
**Document Status:** ARCHITECTURAL SPECIFICATION (REVISED PHASE 1.5)  
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
├── /menu                       (Status Menu & Kisaran Pengeluaran Publik)
├── /outlets                    (Daftar Outlet Warkop Ya'reh)
│   ├── /outlets/jetis-kulon    (Detail Outlet 1 - Wonokromo)
│   └── /outlets/prapen         (Detail Outlet 2 - Tenggilis Mejoyo)
├── /gallery                    (Galeri Suasana Warkop)
├── /about                      (Tentang Warkop Ya'reh)
└── /contact                    (Kontak & Lokasi Google Maps)
├── /about                      (Profil Singkat Faktual Warkop Ya'reh)
└── /contact                    (Kontak Terverifikasi & Lokasi Google Maps)
```

---

## 2. Target Homepage Blueprint (`apps/web/src/app/(marketing)/page.tsx`)

The homepage will be structured into 10 cohesive, verified sections:

1. **Hero Section:**
   - **Headline:** `Warkop Ya'reh`
   - **Tagline:** *"Ngopi, Makan, Nongkrong. 24 Jam."*
   - **Badge:** `Buka 24 Jam Non-Stop di Surabaya`
   - **Badge:** `Buka 24 Jam di Surabaya (Jetis Kulon & Prapen)`
   - **Primary CTAs:** `Lihat Lokasi Outlet` (scrolls to outlets) and `Lihat Menu` (links to `/menu`).
   - **Background/Visual:** Real venue imagery or warm urban nocturnal palette.
2. **Business Identity & Heritage:**
   - Authentic Surabaya warkop culture: an unpretentious, friendly cangkrukan space for everyone.
   - Zero luxury or corporate pretension.
2. **Business Identity & Context:**
   - Kedai kopi lokal di Surabaya dengan konsep warkop terbuka 24 jam.
   - Factual and minimal; no claims of luxury roasts or coworking sanctuaries.
3. **24-Hour Dependability Callout:**
   - Highlight continuous 24/7 operations in both Wonokromo and Prapen.
   - Continuous 24/7 operations in both Wonokromo and Prapen.
4. **Service Formats:**
   - Clear indicators for **Dine-in** and **Takeaway**.
5. **Menu & Price Range Preview:**
   - Prominently showcases the verified price bracket: `Rp1 - Rp25.000 per orang`.
   - Honest indicator: *"Menu lengkap sedang diperbarui langsung dari meja seduh."*
   - Verified services: **Dine-in** and **Takeaway**.
5. **Menu & Price Notice:**
   - Status indicator: *"Menu lengkap sedang diverifikasi langsung dari outlet."*
   - Public reference: *"Kisaran pengeluaran yang tercantum pada listing publik: Rp1–25.000 per orang."*
6. **Outlets Directory Preview:**
   - Side-by-side interactive cards for **Jetis Kulon** and **Prapen**.
   - Includes address, Plus Code, Google Maps navigation links, and phone number for Prapen (`0821-3735-4606`).
7. **Real Atmosphere Gallery:**
   - Authentic, uncurated photos of customer cangkrukan, coffee brewing, and evening atmosphere.
   - Strictly no AI-generated luxury cafe stock photography.
8. **Customer Sentiment & Vibe Signals:**
   - Honest community signals: *"Tempat nongkrong malam favorit warga Surabaya selatan dan pusat."*
   - Address, Plus Code, Google Maps navigation links, and phone number for Prapen (`0821-3735-4606`).
7. **Real Atmosphere Gallery Preview:**
   - Authentic warkop environment and evening cangkrukan. Strictly no AI-generated luxury cafe mockups.
8. **Customer Sentiment Signals:**
   - Honest, general community signals based on public listings (casual hangout, 24h accessibility).
9. **Direct Google Maps Navigation:**
   - Embedded interactive maps or one-click navigation links to both locations.
10. **Contact & Social Footer CTA:**
    - Direct WhatsApp / phone CTA for Prapen; clean, honest footer without broken links.
   - One-click navigation links to both locations via Plus Codes / Maps URLs.
10. **Contact CTA:**
    - Direct phone call link for Prapen (`0821-3735-4606`); honest contact guidance for Jetis Kulon.

---

## 3. Public Route Retirement & Disposal Matrix
## 3. Corrected About-Page Requirements (`/about`)

The repository currently possesses **no verified evidence** regarding founding year, founder identities, family lineage, brand-name origin, or historical milestones.

### Mandated Positioning:
> *"Warkop Ya'reh merupakan kedai kopi lokal di Surabaya dengan outlet yang saat ini teridentifikasi di Jetis Kulon dan Prapen. Kami hadir melayani warga dan pekerja Surabaya selama 24 jam setiap hari untuk ngopi dan beristirahat santai."*

### Strict Prohibitions:
- Do NOT use *"Heritage"*, *"Legendaris"*, *"Ikonik"*, *"Sejak tahun XXXX"*, or *"Tradisi keluarga"*.
- Do NOT invent fictional founding narratives or fake founders.

---

## 4. Corrected Menu-Page Requirements (`/menu`)

1. Prominently communicate:  
   `"Menu lengkap sedang diverifikasi."`
2. Display public venue spending range separately:  
   `"Kisaran pengeluaran yang tercantum pada listing publik: Rp1–25.000 per orang."`
3. Direct customers to physical outlets for full item ordering.
4. Do not state or imply that individual items cost Rp1–25.000.

---

## 5. Public Route Retirement Matrix

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
| `/booking` | **REMOVE** | Permanent 301 redirect to `/outlets` |
| `/reservations` | **REMOVE** | Permanent 301 redirect to `/outlets` |
| `/community` | **REMOVE** | Permanent 301 redirect to `/` |
| `/community/groups/[id]` | **REMOVE** | Permanent 301 redirect to `/` |
| `/events` | **REMOVE** | Permanent 301 redirect to `/` |
| `/events/[id]` | **REMOVE** | Permanent 301 redirect to `/` |
| `/loyalty` | **REMOVE** | Permanent 301 redirect to `/` |
| `/cart` | **PARK** | Disable navigation links; 302 redirect to `/menu` |
| `/checkout` | **PARK** | Disable navigation links; 302 redirect to `/menu` |
| `/checkout/status` | **PARK** | Disable navigation links; 302 redirect to `/menu` |
| `/checkout/success` | **PARK** | Disable navigation links; 302 redirect to `/menu` |
| `/order/track/[orderId]` | **PARK** | Disable navigation links |
| `/orders` | **PARK** | Disable navigation links |
| `/orders/[id]` | **PARK** | Disable navigation links |
| `/table/[tableId]` | **PARK** | Disable navigation links |
| `/qr/[code]` | **PARK** | Disable navigation links |
| `/ops/*` (kds, pos, shift) | **REMOVE** | Delete from `apps/web` bundle (relocate to Admin if verified) |
| `/blog` | **PARK** | De-link from main navigation |
| `/blog/[slug]` | **PARK** | De-link from main navigation |
| `/ops/*` (kds, pos, shift) | **REMOVE** | Delete from `apps/web` bundle (internal ops belong in Admin) |
| `/blog`, `/blog/[slug]` | **PARK** | De-link from main navigation |
| `/account`, `/profile` | **PARK** | De-link from main navigation |
| `/register`, `/otp` | **PARK** | Disable self-serve customer registration |
| `/login` | **REWRITE** | Repurpose as administrative / staff gateway |

---

## 4. Admin Backoffice Route Realignment (`apps/admin`)
## 6. Admin Backoffice Scope Realignment (`apps/admin`)

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

- **Active in Phase 1:** `/login`, `/branches` (Jetis Kulon & Prapen), `/products` (catalog ready for real items), `/gallery` (curation), `/site-content` (announcements), `/settings`.
- **Parked / Excluded from Sidebar:** `/loyalty`, `/community`, `/events`, `/reservations`, `/crm`, `/marketing`, `/inventory`, `/pos`, `/kitchen`.
