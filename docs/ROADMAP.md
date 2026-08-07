# 🗺️ Product & Tech Roadmap

## Project: Warkop Ya'reh Digital Platform

This document describes the 4-Phase rollout plan to scale the Warkop Ya'reh platform from initial local cafe operations to a national franchise brand.

---

## 1. Definition of Done (DoD) (Audited)

An item or feature in this roadmap is only marked as complete `[x]` when it satisfies the following criteria:

1. **Implementation**: Code meets the functional specs defined in the PRD.
2. **Code Quality**: Passes all static code analysis (`pnpm lint` and `pnpm format`) with zero warnings.
3. **Automated Testing**: Coverages exceed **80%** threshold in unit and integration test blocks.
4. **Environment Verification**: Deployed successfully to staging and passes automated E2E smoke tests.
5. **QA Review**: Verified against explicit acceptance criteria by the QA team.

---

## 2. Roadmap Overview

```
📅 2026 Q3               📅 2026 Q4               📅 2027 H1               📅 2027 H2
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ Phase 1: Local Cafe  │  │ Phase 2: Multi-Branch│  │ Phase 3: Regional    │  │ Phase 4: Franchise   │
│ - Core ordering      │  │ - Price overrides    │  │ - Multi-region caching│ │ - Tenant isolation   │
│ - Table reservations │  │ - Points & loyalty   │  │ - AI concierge       │  │ - BI analytics       │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## 3. Detailed Phases

### 📍 Phase 1: Local Cafe Operations (1-2 Branches)

- **Goal**: Launch the digital menu, table reservation engine, and checkout system at our Surabaya flagship locations (Darmo, Dharmahusada).
- **Target Timeline**: Q3 2026
- **Success Metrics & Service Level Objectives (SLOs)**:
  - **Order Endpoint Performance**: `POST /api/v1/orders` p95 response latency < 2.0s under 50 concurrent users.
  - **Menu Page Load**: LCP < 2.0s, INP < 200ms on mobile 3G networks.
  - **System Reliability**: 99.5% uptime.
- **Key Deliverables**:
  - [x] Next.js Web App customer portal.
  - [x] NestJS API Server with basic menu, order tracking, and table booking.
  - [x] Midtrans integration for local e-wallets.
  - [x] Local Docker database settings.

---

### 🏢 Phase 2: Multi-Branch & Real-time Tracking (10+ Branches)

- **Goal**: Expand operations across East Java, introducing loyalty rewards, referral programs, price overrides, and real-time status updates.
- **Target Timeline**: Q4 2026
- **Success Metrics**:
  - Active Users: 20,000+ MAU.
  - Loyalty Conversion: 35% signup rate.
  - System Reliability: 99.9% uptime.
- **Key Deliverables**:
  - [x] Real-time order status tracking via WebSockets (Socket.IO).
  - [x] Branch-specific price overrides and product availability controls.
  - [x] Points ledger and loyalty tier tracking (Bronze, Silver, Gold, Platinum).
  - [ ] Automated email and WhatsApp check-in confirmations.

---

### 🌐 Phase 3: Regional Expansion & Edge Optimizations (25+ Branches)

- **Goal**: Deploy the platform across Java and Bali. Optimize performance at the edge, introduce AI assistants, and integrate community forums.
- **Target Timeline**: H1 2027
- **Success Metrics**:
  - Active Users: 60,000+ MAU.
  - Edge Page Speeds: LCP < 2.0s.
  - System Reliability: 99.9% uptime.
- **Key Deliverables**:
  - [ ] Edge caching of menu structures using Cloudflare Workers.
  - [ ] **Community Domain launch**: Threaded discussion boards, user profiles with GitHub integration, local interest tags, and branch-specific networking systems. *(partial: group creation, memberships, and posts done; GitHub integration, interest tags, and branch networking pending)*
  - [ ] **AI Concierge launch**: Google Gemini integration for conversational menu selections and up-selling recommendations.
  - [ ] Multi-region database read-replicas.

---

### 🏆 Phase 4: Franchise Licensing & BI (50+ Branches, National Scale)

- **Goal**: Position the platform to support national franchise expansions, providing operators with database tenant isolation, analytics, and billing modules.
- **Target Timeline**: H2 2027
- **Success Metrics**:
  - Active Users: 100,000+ MAU.
  - Provisioning Time: < 4 hours per branch.
  - System Reliability: 99.9% uptime.
- **Key Deliverables**:
  - [x] **RLS Global Activation**: Row-level tenant isolation schemas forced globally in production database instances.
  - [ ] Automated franchise provisioning tools. *(partial: manual agreement creation exists, automated infra provisioning pending)*
  - [ ] Business Intelligence (BI) gross sales reports. *(partial: basic revenue stats & category performance done, full BI suite pending)*
  - [x] Multi-tenant billing and agreement tracking.
