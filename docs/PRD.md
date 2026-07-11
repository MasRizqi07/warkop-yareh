# 📋 Product Requirements Document (PRD)

## Project: Warkop Ya'reh Digital Ecosystem Platform

| Attribute            | Details                    |
| :------------------- | :------------------------- |
| **Status**           | Approved                   |
| **Target Release**   | Q3 2026                    |
| **Owner**            | Product Strategy Team      |
| **Document Version** | v1.0.1 (Audited & Refined) |

---

## 1. Executive Summary & Vision

Traditional coffee shops ("Warkop") in Indonesia are community centers, but they lack scalable digital infrastructure to capture customer value, build online communities, and manage franchise models.

**Warkop Ya'reh Digital Ecosystem** transitions this physical environment into a scalable lifestyle platform. This ecosystem consolidates the ordering flow, localized communities, events, and loyalty engines under one monorepo platform.

---

## 2. Product Goals & Key Performance Indicators (KPIs)

### Business Goals

- **Increase Retention**: Push repeat visits up by 25% within the first 6 months of user activation.
- **Active Communities**: Convert 40% of transacting customers into registered members of branch-specific community groups.
- **Drive Ticket Sales**: Establish local events as self-sustaining revenue sources with average attendances > 80% capacity.
- **Franchise Readiness**: Reduce the operational provisioning time for new franchise branches from weeks to under 4 hours via automated dashboards.

### Key Metrics (KPIs)

- **Monthly Active Users (MAU)**: Target 50,000+ within year one.
- **Average Order Value (AOV)**: Boost AOV by 15% through smart catalog recommendations.
- **Churn Rate**: Target customer churn of < 5% month-over-month.
- **Net Promoter Score (NPS)**: Target NPS of ≥ 75.

---

## 3. User Personas & Target Demographics

### 3.1 Customer (Freelancer / Developer)

- **Needs**: Stable internet, workspace booking, convenient food ordering without leaving the desk, networking with other tech professionals.
- **Goals**: Reserve a table, check-in, order a "Signature Kopi Susu", pay via e-wallet, and join local tech meetups.

### 3.2 Branch Staff / Barista

- **Needs**: Clean, real-time interface to accept, modify, and track order preparation states.
- **Goals**: Receive orders, update fulfillment statuses (Pending ➡️ Preparing ➡️ Ready), and check in event attendees via QR scans.

### 3.3 Branch Manager

- **Needs**: Manage inventory availability, adjust item prices for local promotions, and view staff performance.
- **Goals**: Toggle menu item availability, override catalog prices, and view daily sales.

### 3.4 Franchise Owner

- **Needs**: Access financial reports across branches, audit operational metrics, and review franchise invoice billings.
- **Goals**: Analyze net margins, cross-compare product performance across regions, and track licensing terms.

---

## 4. Functional Requirements & Feature Matrix

### 4.1 Customer Experience Domain

- **Digital Menu**: Interactive display with categorizations, search filters, preparation time indications, calorie counts, and active tags (e.g. `bestseller`, `signature`, `vegan`).
- **Customization Engine**: Options for sweetness levels, ice density, milk replacements, and add-on toppings.
- **Checkout & Payments**: Integration with **Midtrans** supporting local Indonesian payment networks (GoPay, ShopeePay, OVO, Bank Virtual Accounts).
- **Table Reservations**: Seating maps categorized by zones (`INDOOR`, `OUTDOOR`, `VIP`, `MEETING_ROOM`). Capacity check and slots selection.

### 4.2 Community Domain (Phase 3+)

- **Directory & Profiles (Phase 3+)**: Public search for local members. Developer-centric profiles featuring GitHub integrations, custom bio badges, and interest tags.
- **Discussion Boards (Phase 3+)**: Threaded message spaces for local topics. Upvotes, image uploads, and post editing.
- **Leaderboards (Phase 3+)**: Monthly community points rankings based on engagement, purchases, and event attendance.

### 4.3 Event Domain

- **Discovery & Feed**: Calendar of local events (Surabaya Dev Meetups, Latte Art Competitions).
- **Ticketing & Registration**: Automated booking flow. Generates secure, encrypted QR tickets emailed to users and saved to the mobile app profile.
- **Attendance Tracking**: Mobile scanner for baristas to check in attendees at the event door.

### 4.4 Loyalty & Gamification Domain

- **Tier Engine**: Bronze, Silver, Gold, Platinum status tracking. Points earned dynamically per transaction (10 points per IDR 1,000 spent).
- **Rewards Shop**: Catalog of swap rewards (free coffee, merchandise, workspace passes).
- **Referral Loops**: Generate referral codes. Reward both inviter and invitee with 500 bonus points after the invitee's first purchase.

### 4.5 AI Domain (Phase 3+)

- **AI Concierge & Menu Co-pilot**: Conversational assistant embedded in the web app to suggest drinks based on preferences (e.g. "Suggest a cold drink under 200 calories"). Powered by **Google Gemini** integration due to favorable regional latency and pricing.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Rendering Budget (Audited)

- **Lighthouse Score**: Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 100 on desktop/mobile.
- **Largest Contentful Paint (LCP)**: < 2.0 seconds on mobile 3G networks.
- **Interaction to Next Paint (INP)**: < 200 milliseconds.
- **Cumulative Layout Shift (CLS)**: < 0.1.
- **Performance Budget Caution**: GPU-intensive styles (e.g. `backdrop-filter` glassmorphism overlay layouts) must be deferred or disabled above the fold on mobile viewports. Framer Motion bundle imports must use dynamic lazy-loading to protect mobile bundle weights.

### 5.2 Scale & Availability

- **Scale**: Handle 100,000+ active users and 50+ branches without service degradation.
- **Uptime**: Maintain ≥ 99.9% availability (maximum 8.76 hours downtime per year).
- **Throughput**: Support peak capacity of 500 orders/minute.

### 5.3 Security & Regulatory

- **Data Isolation**: Multi-tenant partitioning. Enforce strict data boundaries between franchises.
- **Data Protection**: Store all payment processing securely through Midtrans. Encrypt personal data (emails, phones) at rest.
- **Audit Logs**: Record all administrative edits to the database (immutable ledger).

### 5.4 SEO & Accessibility (WCAG 2.2 AA)

- **SEO**: Optimize metadata headers per page dynamically. Target schema.json markup for local branches and events.
- **Accessibility**: Fully conform to WCAG 2.2 AA standards, supporting screen readers, keyboard-only routing, and accessible text-contrast ratios.
- **Reduced Motion (WCAG 2.2 AA SC 2.3.3)**: Every interactive animation, layout shift, or page transition must respect the user's system preferences (`prefers-reduced-motion: reduce`) by disabling unnecessary animations to prevent motion-induced sickness.

### 5.5 i18n & Localization Strategy (Audited)

- **Primary Language**: The primary operational language is **Bahasa Indonesia** for customer interfaces, menus, and local emails.
- **Expansion Readiness**: Application schemas and next-intl structures must utilize key-value localization models to support future English expansion for international franchise monitoring. Local pricing is strictly evaluated in Indonesian Rupiah (IDR).

---

## 6. Out of Scope (Future Releases)

- Direct courier/delivery service integrations (e.g., GrabExpress, GoSend) - postponed to Phase 2.
- POS machine hardware integration - operations will use the web-based manager dashboard initially.
- Franchise corporate stock purchasing and raw material supply chain workflows.
