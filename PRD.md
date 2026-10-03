# PRODUCT REQUIREMENTS DOCUMENT
# WARKOP YA'REH DIGITAL PLATFORM
## Version 3.0 — Reality-First Production Product

**Status:** Approved Product Direction
**Date:** October 2026
**Repository:** `MasRizqi07/warkop-yareh`
**Current baseline:** `main @ b21ee705d845dd2459f39682b164ca4afa26c718`

---

# 1. EXECUTIVE SUMMARY

Warkop Ya'reh adalah bisnis warkop lokal Surabaya yang saat ini memiliki dua outlet terverifikasi:

1. Warkop Ya'reh — Jetis Kulon
2. Warkop Ya'reh 2 — Prapen

Versi awal sistem digital Warkop Ya'reh berkembang dari konsep coffee-shop enterprise yang terlalu spekulatif dan mengandung asumsi bisnis yang belum terbukti.

Reality Rebuild telah memperbaiki sebagian besar customer-facing product sehingga platform kembali merepresentasikan bisnis yang benar-benar ada.

PRD v3.0 menjadi source of truth baru untuk transformasi berikutnya.

Produk tidak lagi dibangun sebagai:

> “premium specialty coffee / coworking ecosystem”

tetapi sebagai:

> **Digital Operating Platform untuk Warkop Ya'reh yang reality-first, mobile-first, local-first, operationally useful, scalable, dan dapat berkembang hanya berdasarkan kemampuan bisnis yang benar-benar tersedia.**

Platform harus mampu bertumbuh dari:

`Business Information Platform`

menjadi:

`Verified Digital Menu`

kemudian:

`Ordering & Customer Platform`

kemudian:

`Operational Business Platform`

tanpa pernah mengorbankan integritas data bisnis.

---

# 2. PRODUCT VISION

Membangun platform digital resmi Warkop Ya'reh yang menjadi pusat informasi, discovery, customer interaction, ordering, content, dan operasional bisnis untuk seluruh outlet.

Platform harus terasa:

- lokal;
- cepat;
- sederhana;
- modern;
- mobile-first;
- accessible;
- terpercaya;
- mudah digunakan pelanggan;
- mudah dioperasikan owner/staff;
- scalable secara teknis;
- tidak bergantung pada data fiktif.

North-star principle:

> **Real business first. Software follows reality.**

---

# 3. PRODUCT PRINCIPLES

## 3.1 Reality Before Features

Tidak ada fitur atau informasi customer-facing yang boleh dianggap aktif sebelum kemampuan bisnisnya terbukti.

---

## 3.2 Unknown Is Not Absent

Data yang belum diketahui harus direpresentasikan sebagai:

`UNVERIFIED`

bukan dianggap tidak tersedia.

---

## 3.3 Evidence-Driven Data

Business facts harus memiliki provenance apabila berasal dari sumber eksternal atau observasi bisnis.

Confidence model:

- `VERIFIED`
- `PARTIALLY_VERIFIED`
- `UNVERIFIED`
- `DISPUTED`
- `DEPRECATED`

---

## 3.4 Mobile First

Mayoritas penggunaan customer diasumsikan melalui smartphone.

Desktop tetap first-class, tetapi keputusan UX dimulai dari mobile.

---

## 3.5 Progressive Capability

Fitur bisnis berat hanya diaktifkan ketika data dan operasional siap.

Contoh:

`menu verified → cart → checkout → payment → kitchen workflow`

bukan sebaliknya.

---

## 3.6 Operational Simplicity

Owner/staff tidak boleh membutuhkan developer untuk melakukan perubahan rutin seperti:

- memperbarui jam;
- memperbarui menu;
- mengganti foto;
- memperbarui harga;
- menandai item unavailable;
- mengubah content landing page.

---

# 4. VERIFIED BUSINESS BASELINE

## 4.1 Jetis Kulon

**Brand name:** WARKOP YA'REH

**Slug:** `jetis-kulon`

**Address:**

`Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243`

**Plus Code:**

`MPVJ+2G Wonokromo, Surabaya, Jawa Timur`

**Phone:**

`UNKNOWN`

**Operating hours:**

24 hours

**Known service modes:**

- dine-in;
- takeaway.

**Public spending range:**

`Rp1–25.000 per orang`

This is a venue spending range, not item pricing.

---

## 4.2 Prapen

**Brand name:** WARKOP YA'REH 2 PRAPEN

**Slug:** `prapen`

**Address:**

`Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239`

**Plus Code:**

`MQM3+XJ Prapen, Surabaya, Jawa Timur`

**Phone:**

`0821-3735-4606`

**Operating hours:**

24 hours

**Known service modes:**

- dine-in;
- takeaway.

**Public spending range:**

`Rp1–25.000 per orang`

---

# 5. PRODUCT PROBLEMS

## P-01 — Business Information Fragmentation

Informasi outlet tersebar di external listing dan belum memiliki satu canonical digital source.

---

## P-02 — Menu Data Not Yet Digitally Authoritative

Belum ada verified item-level menu dataset yang cukup aman untuk dianggap production truth.

---

## P-03 — Legacy Domain Contamination

Repository masih memiliki domain model yang berasal dari product concept lama:

- loyalty;
- membership tiers;
- reservation;
- events;
- community;
- drive-thru;
- delivery;
- coworking-related assumptions;
- speculative branch capabilities.

Model-model tersebut menciptakan architecture debt dan risiko future regression.

---

## P-04 — Documentation Drift

`PRD.md`, `README.md`, dan sebagian architecture documentation belum merepresentasikan Reality Rebuild.

---

## P-05 — Operational Content Dependency

Business content masih terlalu bergantung pada source code.

Owner/staff membutuhkan CMS yang lebih usable.

---

## P-06 — Production Readiness Gap

Build dan CI sudah hijau, tetapi production readiness harus mencakup:

- monitoring;
- accessibility;
- SEO;
- observability;
- security;
- runtime validation;
- content provenance.

---

# 6. TARGET USERS

## Customer / Visitor

Kebutuhan:

- menemukan outlet;
- mengetahui apakah buka;
- mendapatkan arah;
- melihat informasi menu ketika tersedia;
- menghubungi outlet;
- melakukan pemesanan jika fitur aktif.

---

## Returning Customer

Kebutuhan:

- login;
- melihat order history;
- melakukan repeat order ketika ordering benar-benar aktif;
- mengelola profil.

---

## Staff

Kebutuhan:

- melihat order aktif;
- memperbarui status order;
- mengelola availability menu;
- menangani workflow outlet.

Aktif hanya jika deployment operasional benar-benar digunakan.

---

## Admin

Kebutuhan:

- manage content;
- menu;
- gallery;
- outlet data;
- visibility;
- provenance;
- availability.

---

## Owner / Manager

Kebutuhan:

- business overview;
- outlet status;
- menu management;
- operational visibility;
- analytics berbasis real data.

---

# 7. PRODUCT INFORMATION ARCHITECTURE

Canonical public IA:

```text
/
├── /menu
├── /outlets
│   ├── /outlets/jetis-kulon
│   └── /outlets/prapen
├── /gallery
├── /about
├── /contact
└── /login
```

Internal/customer application routes may include:

```text
/account
/profile
/cart
/checkout
/orders
/orders/[id]
/order/track/[orderId]
/payment/status
/qr/[code]
/table/[tableId]
```

These routes must not automatically become publicly promoted or SEO-indexed.

---

# 8. PRODUCT MODULES

# MODULE A — PUBLIC BUSINESS EXPERIENCE

Priority: **P0**

Features:

- homepage;
- outlet discovery;
- outlet detail;
- maps CTA;
- business hours;
- verified contact;
- service modes;
- spending range;
- verified status indication;
- responsive navigation;
- footer.

Acceptance:

- no fictional facts;
- no stale branches;
- no broken CTA;
- mobile-first.

---

# MODULE B — VERIFIED MENU PLATFORM

Priority: **P0 / gated by data**

Capabilities:

- categories;
- products;
- description;
- price;
- availability;
- branch-level availability;
- branch-level pricing;
- optional customization;
- image;
- dietary/allergen fields when known;
- provenance;
- publish state.

Required publishing workflow:

```text
DRAFT
→ REVIEW
→ VERIFIED
→ PUBLISHED
→ ARCHIVED
```

No item should enter production simply because it exists in database.

---

# MODULE C — CONTENT MANAGEMENT SYSTEM

Priority: **P0**

Admin capabilities:

- branch content;
- hero copy;
- announcements;
- menu;
- gallery;
- contact information;
- business hours;
- FAQ;
- metadata;
- structured content blocks.

CMS requirements:

- optimistic concurrency;
- audit trail;
- validation;
- draft/publish;
- preview;
- rollback-ready design.

---

# MODULE D — GALLERY & MEDIA

Priority: **P1**

Asset classifications:

- verified venue photo;
- verified branch photo;
- menu item photo;
- brand asset;
- placeholder;
- unverified.

Requirements:

- alt text;
- branch relation;
- provenance;
- responsive image;
- optimized delivery;
- order/sort;
- visibility.

---

# MODULE E — CUSTOMER IDENTITY

Priority: **P1**

Capabilities:

- email/password;
- Google login;
- OTP only where implementation is properly configured;
- logout;
- secure refresh;
- device/session management;
- profile.

Security requirements:

- HttpOnly where appropriate;
- no persisted raw token;
- revocable sessions;
- rate limiting;
- secure error responses.

---

# MODULE F — ORDERING ENGINE

Priority: **P1, FEATURE FLAGGED**

Ordering may only be publicly activated after:

1. real menu exists;
2. availability is reliable;
3. operational fulfillment is confirmed;
4. payment readiness is confirmed.

Supported initial real-world modes:

- `DINE_IN`
- `TAKEAWAY`

Unsupported modes must not be customer-facing without verification:

- DRIVE_THRU;
- DELIVERY.

Flow:

```text
Branch
→ Menu
→ Product
→ Customization
→ Cart
→ Checkout
→ Payment
→ Order
→ Fulfillment
→ Completion
```

---

# MODULE G — PAYMENT

Priority: **P1, FEATURE FLAGGED**

Potential integration:

Midtrans.

Requirements:

- webhook signature verification;
- idempotency;
- payment state machine;
- timeout;
- reconciliation;
- immutable payment event log;
- no fake payment method claims.

---

# MODULE H — QR / TABLE ORDERING

Priority: **P2**

Only activate after in-store validation.

Requirements:

- signed/unguessable QR identifier;
- branch binding;
- table state;
- no IDOR;
- expiration/revocation capability.

---

# MODULE I — OPERATIONS

Priority: **P2**

Potential capabilities:

- order queue;
- kitchen status;
- cashier workflow;
- shift;
- inventory visibility.

Must not be exposed until owner/staff operational requirements are confirmed.

---

# MODULE J — ANALYTICS

Priority: **P2**

Only real events.

Potential metrics:

- outlet views;
- map CTA click;
- contact CTA;
- menu views;
- conversion;
- cart starts;
- checkout;
- paid order;
- repeat orders;
- top verified items.

No vanity analytics based on fabricated data.

---

# 9. EXPLICIT NON-GOALS

Until business evidence exists, the following are NOT active product capabilities:

- loyalty tiers;
- membership;
- rewards;
- referral incentives;
- reservation;
- coworking;
- meeting room booking;
- events;
- community forum;
- franchise management;
- AI recommendations;
- predictive analytics;
- delivery;
- drive-thru;
- invented promotions.

Legacy schema may temporarily preserve some structures for migration safety, but runtime and documentation must not present them as product features.

---

# 10. TARGET DOMAIN ARCHITECTURE

Core domain:

```text
Identity
Business
Branch
BusinessHours
BusinessFacts
Sources
Menu
MenuCategory
MenuItem
BranchMenu
Media
Content
Order
Payment
Session
Audit
```

Optional future operational domains:

```text
Table
Kitchen
Shift
Inventory
Analytics
```

Deprecated domains should be isolated:

```text
Reservation
Community
Event
Membership
Loyalty
Referral
Franchise
AI Recommendation
```

---

# 11. LEGACY DOMAIN MIGRATION STRATEGY

No destructive big-bang migration.

Use stages:

### Stage 1 — Dependency Mapping

Find active code referencing legacy models.

### Stage 2 — Runtime Decoupling

Remove active application dependencies.

### Stage 3 — Schema Deprecation

Mark models/fields deprecated.

### Stage 4 — Data Export / Backup Strategy

Document data retention.

### Stage 5 — Removal Migration

Only after proven unused and explicitly approved.

This PRD does NOT authorize destructive production drops by default.

---

# 12. DESIGN DIRECTION

Brand axis:

`LOCAL × URBAN × YOUTHFUL × ACCESSIBLE × SURABAYA × 24 JAM`

Avoid:

- fake luxury positioning;
- excessive glassmorphism;
- generic SaaS dashboard aesthetic;
- “premium specialty coffee” messaging;
- developer/coworking branding.

UI characteristics:

- strong typography;
- warm neutral palette;
- simple high-contrast surfaces;
- authentic photography;
- tactile but subtle motion;
- clear information hierarchy;
- accessible contrast;
- fast on low-to-mid-range devices.

---

# 13. SEO & LOCAL DISCOVERY

Required:

- canonical URLs;
- route-specific metadata;
- sitemap;
- robots;
- OpenGraph;
- LocalBusiness structured data;
- branch-specific structured data;
- contact/address consistency;
- map CTA.

Never add unverified:

- aggregateRating;
- review count;
- geo coordinates;
- official email;
- social profile.

Dynamic third-party data must have freshness metadata.

---

# 14. ACCESSIBILITY

Target:

**WCAG 2.2 AA practical compliance**

Required:

- semantic HTML;
- keyboard navigation;
- focus management;
- labels;
- error announcements;
- alt text;
- touch target sizing;
- color contrast;
- reduced motion;
- accessible dialogs.

---

# 15. PERFORMANCE TARGETS

Target production expectations:

- LCP ideally ≤ 2.5 s;
- CLS ≤ 0.1;
- INP ≤ 200 ms where practical;
- no unnecessary client hydration;
- optimized images;
- route-level code splitting;
- minimal third-party JavaScript.

Performance must be measured on production-like deployment.

---

# 16. SECURITY REQUIREMENTS

Minimum:

- RBAC;
- authorization ownership checks;
- IDOR protection;
- secure cookie usage;
- CSRF-aware architecture;
- rate limiting;
- helmet/security headers;
- password hashing;
- secret isolation;
- webhook verification;
- input validation;
- secure uploads;
- audit logs;
- no sensitive information in client bundle.

---

# 17. OBSERVABILITY

Required production foundations:

- health endpoint;
- structured API logging;
- deployment identification;
- error correlation;
- safe request ID;
- operational logs;
- audit events.

Do not log:

- passwords;
- access tokens;
- refresh tokens;
- payment secrets;
- sensitive cookie values.

---

# 18. ADMIN REQUIREMENTS

Admin must evolve into a usable business control center.

Core navigation:

```text
Dashboard
Branches
Menu
Media
Site Content
Orders
Customers
System
Audit
```

Show only enabled domains.

Deprecated modules must disappear from normal navigation.

---

# 19. DATA PROVENANCE

BusinessFact should support:

- subject;
- key;
- value;
- status;
- source;
- capturedAt;
- lastVerifiedAt;
- notes.

Externally sourced facts should be re-verifiable.

---

# 20. CI/CD REQUIREMENTS

Current CI already validates PR and `main` pushes.

Required gates:

- frozen install;
- Prisma generate;
- isolated migration;
- reality audit;
- lint;
- typecheck;
- build;
- unit tests;
- persistence tests;
- API E2E;
- browser E2E.

Future additions:

- accessibility smoke;
- dead-link validation;
- structured-data validation;
- canonical-business regression;
- migration safety audit.

---

# 21. SUCCESS METRICS

Technical:

- zero critical production errors;
- zero canonical-data regression;
- green CI;
- deployment success;
- no critical security findings;
- mobile usability pass.

Product:

- map CTA engagement;
- outlet detail engagement;
- menu discovery;
- verified menu coverage;
- ordering conversion once activated.

Operational:

- percentage content editable without developer;
- menu update turnaround;
- admin task completion rate;
- reduced manual content deployment.

---

# 22. ROADMAP

## Release A — Architecture Alignment

- replace stale PRD;
- rewrite README;
- update architecture docs;
- inventory legacy schema;
- isolate unsupported domains;
- clean feature navigation;
- strengthen reality audit.

## Release B — Local Discovery & Content

- SEO;
- structured data;
- better outlet UX;
- CMS improvements;
- media provenance;
- gallery.

## Release C — Verified Menu

- verified menu ingestion;
- menu approval workflow;
- availability;
- branch-level menu management.

## Release D — Ordering Pilot

- feature flag;
- cart;
- checkout;
- payment;
- order flow;
- limited operational pilot.

## Release E — Operational Platform

- staff order board;
- kitchen;
- cashier;
- inventory where required.

## Release F — Growth

Only after real product usage:

- analytics;
- retention;
- promotions;
- advanced automation.

---

# 23. DEFINITION OF DONE

Warkop Ya'reh v3.0 is considered aligned when:

1. Product docs match business reality.
2. README no longer advertises fictional capabilities.
3. Active code does not depend on unsupported domains.
4. Schema legacy debt is explicitly mapped.
5. Public routes are factual.
6. Verified menu pipeline exists.
7. CMS can manage business content.
8. Ordering remains gated until operationally ready.
9. Security and accessibility baselines pass.
10. CI and deployments remain green.
11. Every critical business fact has a traceable source.
12. No new fictional capability is introduced.

---

# 24. FINAL PRODUCT STATEMENT

Warkop Ya'reh Digital Platform is not intended to simulate an imaginary enterprise coffee company.

It exists to digitally represent and improve the real Warkop Ya'reh business.

The architecture may be sophisticated.

The product truth must remain simple:

> **Build only what the business actually is, then scale what the business actually needs.**