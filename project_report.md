# 📊 WARKOP YA'REH — Project Status Report

> **Report Date**: July 6, 2026  
> **Project Version**: `v0.1.0`  
> **Project Phase**: Phase 1 — Local Cafe Operations  
> **Report Type**: Full Codebase Status Report  
> **Prepared For**: Project Owner / Development Team

---

## 1. Executive Summary

Warkop Ya'reh (also referred to as "Cold 'N Brew") is a **community-centric specialty coffee shop digital ecosystem** designed for Surabaya-based locations. The platform consolidates digital menu, ordering, table reservations, community hub, events, and a loyalty rewards system into a unified monorepo architecture.

### Current State at a Glance

| Dimension | Status | Assessment |
|:--|:--|:--|
| **Architecture** | Monorepo (Turborepo + pnpm) | ✅ Well-structured |
| **Frontend — Web** | Next.js 15 / React 19 | 🟡 Functional, using mock data |
| **Frontend — Admin** | Next.js 15 / React 19 | 🟡 Functional, using mock data |
| **Backend — API** | NestJS 11, Clean Architecture | 🟡 Structure complete, services partially implemented |
| **Database** | PostgreSQL + Prisma ORM | ✅ Comprehensive schema (793 lines, 28+ models) |
| **Payments** | Midtrans integration | 🟡 Skeleton service, not fully wired |
| **Real-time** | WebSocket (Socket.io) | 🟡 Gateway implemented, not integrated with order flow |
| **Testing** | Vitest + Jest | 🔴 Minimal test coverage |
| **CI/CD** | GitHub Actions | 🟡 CI present, CD has placeholder steps |
| **Infrastructure** | Docker + Terraform | 🟡 Docker ready, Terraform partial |

### Overall Maturity Score: **~45% Complete (Phase 1)**

The architectural foundation is strong. The database schema is comprehensive and production-quality. Frontend UIs are visually polished with mock data. The critical gap is the **end-to-end data flow** — most frontend pages consume hardcoded mock data rather than live API responses, and many API modules have scaffolded structures without full business logic.

---

## 2. Architecture Overview

### 2.1 Monorepo Structure

```
warkop-yareh/
├── apps/
│   ├── web/          → Customer-facing web app (Next.js, Port 3000)
│   ├── admin/        → Admin/Manager dashboard (Next.js, Port 3001)
│   └── api/          → REST API backend (NestJS, Port 3001/4000)
├── packages/
│   ├── database/     → Prisma schema, migrations, client wrapper
│   ├── auth/         → NextAuth shared adapter
│   ├── types/        → Shared TypeScript interfaces (270 lines)
│   ├── validation/   → Zod validation schemas
│   ├── ui/           → Shared UI component library
│   ├── config/       → Linting/formatting configs
│   ├── shared/       → General utility functions
│   └── analytics/    → Analytics calculations
└── infra/
    ├── docker/       → PostgreSQL + Redis + MailHog + API containers
    ├── terraform/    → IaC for cloud deployment
    └── github-actions/ → CI/CD pipeline definitions
```

### 2.2 Tech Stack Summary

| Layer | Technology | Version |
|:--|:--|:--|
| Build Orchestration | Turborepo | `^2.0.0` |
| Package Manager | pnpm | `9.0.0` |
| Frontend Framework | Next.js | `15.2.7` |
| UI Library | React | `19.2.4` |
| Styling | Tailwind CSS | `^4.0.0` |
| Animations | Framer Motion | `^12.40.0` |
| State Management | Zustand | `^5.0.14` |
| Server State | TanStack Query | `^5.101.0` |
| Backend | NestJS | `^11.0.0` |
| ORM | Prisma | `^5.22.0` |
| Database | PostgreSQL | `16` (Docker) |
| Cache / Queue | Redis + BullMQ | `7.x / ^5.78.0` |
| Payment Gateway | Midtrans | `^1.4.3` |
| Real-time | Socket.io | `^4.8.3` |
| UI Components | Radix UI | Multiple packages |

---

## 3. Feature Implementation Status

### 3.1 Customer Web App (`apps/web`)

| Feature | Route/Component | Implementation Status | Notes |
|:--|:--|:--|:--|
| **Landing / Home Page** | `/(marketing)/page.tsx` | ✅ Complete | Hero, stats, featured products, CTA, events, testimonials, membership card sections |
| **Digital Menu** | `/(marketing)/menu/page.tsx` | ✅ Complete (UI) | 10,759 bytes — Categories, search, product cards. **Uses mock data** |
| **Booking / Reservations** | `/(marketing)/booking/page.tsx` | ✅ Complete (UI) | 17,339 bytes — Date picker, table type, time slots. **Uses mock data** |
| **Community Hub** | `/(marketing)/community/page.tsx` | ✅ Complete (UI) | 15,159 bytes — Groups, posts, members. **Uses mock data** |
| **Events** | `/(marketing)/events/page.tsx` | ✅ Complete (UI) | 5,960 bytes — Event cards, registration. **Uses mock data** |
| **Blog** | `/(marketing)/blog/` | 🟡 Route exists | Needs content management |
| **About** | `/(marketing)/about/` | 🟡 Route exists | Page structure present |
| **Contact** | `/(marketing)/contact/` | 🟡 Route exists | Contact form present |
| **Login** | `/login/page.tsx` | ✅ Complete | 6,042 bytes — Email/password form |
| **Register** | `/register/page.tsx` | ✅ Complete | 7,758 bytes — Full registration form |
| **OTP Verification** | `/otp/` | 🟡 Partial | Route present |
| **QR Code Ordering** | `/qr/[code]/` | 🟡 Partial | Dynamic route exists |
| **Checkout** | `/checkout/page.tsx` | ✅ Complete (UI) | 8,259 bytes — Cart summary, payment selection |
| **Checkout Success** | `/checkout/success/` | ✅ Complete | Success confirmation page |
| **Order Tracking** | `/orders/[id]/` | 🟡 Partial | Dynamic route, needs real-time updates |
| **Loyalty Dashboard** | `/loyalty/page.tsx` | ✅ Complete (UI) | 12,153 bytes — Points, tiers, rewards, history |
| **Cart Drawer** | `CartDrawer.tsx` | ✅ Complete | Slide-over cart with quantity controls |
| **SEO** | `robots.ts`, `sitemap.ts` | ✅ Complete | Proper sitemap and robots.txt generation |

### 3.2 Admin Dashboard (`apps/admin`)

| Feature | Route/Component | Implementation Status | Notes |
|:--|:--|:--|:--|
| **Dashboard Overview** | `/(dashboard)/page.tsx` | ✅ Complete (UI) | Stats, revenue chart, quick actions, recent orders, inventory alerts, events, loyalty |
| **Dashboard Components** | `components/dashboard/` | ✅ Complete | 9 components: StatsRow, RevenueChart, QuickActions, RecentOrders, InventoryAlert, UpcomingEvents, LoyaltyTierStats, etc. |
| **Products Management** | `/(dashboard)/products/` | 🟡 Route exists | CRUD interface needed |
| **Orders Management** | `/(dashboard)/orders/` | 🟡 Route exists | Order list and status management |
| **Users Management** | `/(dashboard)/users/` | 🟡 Route exists | User list and role management |
| **Branches Management** | `/(dashboard)/branches/` | 🟡 Route exists | Multi-branch CRUD |
| **Reservations** | `/(dashboard)/reservations/` | 🟡 Route exists | Reservation management |
| **Events Management** | `/(dashboard)/events/` | 🟡 Route exists | Event CRUD |
| **Community** | `/(dashboard)/community/` | 🟡 Route exists | Community moderation |
| **Loyalty Management** | `/(dashboard)/loyalty/` | 🟡 Route exists | Loyalty tier and reward management |
| **Analytics** | `/(dashboard)/analytics/` | 🟡 Route exists | Analytics dashboards |
| **Settings** | `/(dashboard)/settings/` | 🟡 Route exists | App configuration |
| **Kitchen Display (KDS)** | `/kitchen/page.tsx` | ✅ Complete (UI) | 10,138 bytes — Order queue display |
| **Point of Sale (POS)** | `/pos/page.tsx` | 🟡 Partial | 5,617 bytes — Basic POS layout |
| **Table Management** | `/tables/` | 🟡 Route exists | Table status board |

### 3.3 Backend API (`apps/api`)

| Module | Files | Implementation Status | Notes |
|:--|:--|:--|:--|
| **Identity (Auth)** | Module + Service + Controller + Repository | ✅ Implemented | JWT auth, bcrypt, Google OAuth strategy, refresh token rotation |
| **Catalog (Products)** | Module + Service + Controller | 🟡 Scaffolded | Structure present, needs complete CRUD |
| **Ordering** | Module + Service + Controller | 🟡 Scaffolded | Order creation and status flow needed |
| **Reservation** | Module + Service + Controller | 🟡 Scaffolded | Reservation logic needed |
| **Community** | Module + Service + Controller | 🟡 Scaffolded | Groups, posts, membership CRUD needed |
| **Event** | Module + Service + Controller | 🟡 Scaffolded | Event management and registration needed |
| **Loyalty** | Module + Service + Controller | 🟡 Scaffolded | Points tracking, tier computation needed |
| **Analytics** | Module + Service + Controller | 🟡 Scaffolded | Aggregation queries needed |
| **Branch** | Module + Service + Controller | 🟡 Scaffolded | Branch CRUD needed |
| **Franchise** | Module + Service + Controller | 🟡 Scaffolded | Phase 4 feature, basic structure only |
| **Tables** | Module + Service + Controller | 🟡 Scaffolded | Table management, QR linking needed |
| **WebSockets** | Gateway complete | ✅ Implemented | Room management, broadcast events defined |
| **Midtrans Payment** | Service scaffold | 🟡 Scaffold only | CoreApi and Snap initialized, no transaction methods |

### 3.4 Infrastructure Layer

| Component | Status | Notes |
|:--|:--|:--|
| **Domain Entities** | ✅ 4 entities defined | `base.entity.ts`, `order.entity.ts`, `product.entity.ts`, `loyalty.entity.ts` |
| **Domain Repositories** | 🟡 Interfaces only | Repository interfaces defined |
| **Domain Events** | 🟡 Folder exists | Event sourcing structure present |
| **Value Objects** | 🟡 Folder exists | Value object patterns started |
| **Global Exception Filter** | ✅ Implemented | Unified error handling |
| **Response Interceptor** | ✅ Implemented | Standardized API response format |
| **Rate Limiting** | ✅ Implemented | ThrottlerGuard configured via env vars |
| **Swagger Docs** | ✅ Implemented | Auto-generated OpenAPI 3.1 docs at `/api/docs` |

---

## 4. Database Analysis

### 4.1 Schema Statistics

| Metric | Count |
|:--|:--|
| **Total Models** | 28 |
| **Enum Types** | 18 |
| **Schema Lines** | 793 |
| **Total Relations** | 50+ |

### 4.2 Model Inventory

| Domain | Models | Assessment |
|:--|:--|:--|
| **Users & Auth** | `User`, `Session`, `UserDevice` | ✅ Comprehensive — includes refresh token rotation and push notification device tracking |
| **Branches** | `Branch` | ✅ Good — supports geo-coordinates, capacity, features, operating hours |
| **Products** | `Category`, `Product`, `ProductCustomization`, `BranchProduct` | ✅ Excellent — branch-specific pricing, customizations via JSON |
| **Orders** | `Order`, `OrderItem`, `Payment`, `OrderFeedback` | ✅ Excellent — snapshot pricing, multiple order types (DINE_IN, TAKE_AWAY, DRIVE_THRU, DELIVERY) |
| **Reservations** | `Table`, `Reservation`, `WaiterCall` | ✅ Good — table types (INDOOR, OUTDOOR, VIP, MEETING_ROOM), QR codes |
| **Events** | `Event`, `EventRegistration` | ✅ Good — categories, capacity, ticket codes, waitlisting |
| **Community** | `CommunityGroup`, `CommunityMembership`, `CommunityPost` | ✅ Good — roles (MEMBER, MODERATOR, ADMIN), threaded posts |
| **Loyalty** | `LoyaltyTransaction`, `Reward` | ✅ Good — tier-based rewards, point expiration tracking |
| **Reviews** | `Review` | ✅ Good — verified reviews, helpful votes, images |
| **Notifications** | `Notification` | ✅ Good — typed notifications with action URLs |
| **Blog** | `BlogPost` | ✅ Good — publishing workflow, SEO fields |
| **Audit** | `AuditLog`, `OutboxEvent` | ✅ Excellent — immutable audit trail, transactional outbox for event-driven patterns |
| **Franchise** | `FranchiseAgreement`, `FranchiseBilling` | ✅ Good — Phase 4 readiness with billing and revenue share |

### 4.3 Indexing Strategy

The schema includes **30+ database indexes** covering all major query patterns:
- Composite indexes for frequent lookups (`userId + isRead` on notifications)
- Unique constraints on business-critical fields (`orderNumber`, `email`, `phone`, `slug`, `qrCode`, `ticketCode`)
- Date-based indexes for time-series queries (`createdAt` on orders, events, posts)

---

## 5. State Management Analysis

### 5.1 Client-Side Stores (Zustand)

| Store | Location | Features | Status |
|:--|:--|:--|:--|
| **Theme Store** | `stores/index.ts` | Dark/light toggle with DOM class management | ✅ Complete |
| **Cart Store** | `stores/index.ts` | Add, remove, update quantity, totals, persistence | ✅ Complete |
| **UI Store** | `stores/index.ts` | Mobile menu, search, modal management | ✅ Complete |
| **Auth Store** | `stores/auth.store.ts` | Access token management, login/logout | ✅ Complete |
| **User Store** | `stores/useUserStore.ts` | User profile state | ✅ Complete |
| **Reservation Store** | `stores/useReservationStore.ts` | Reservation form state | ✅ Complete |

### 5.2 API Client

The Axios-based API client (`lib/api.ts`) includes:
- ✅ Automatic Bearer token attachment
- ✅ Transparent token refresh on 401 responses
- ✅ Request queuing during refresh
- ✅ Forced logout on refresh failure
- ✅ httpOnly cookie support for refresh tokens

---

## 6. Design System Assessment

### 6.1 Visual Identity

| Element | Choice | Quality |
|:--|:--|:--|
| **Heading Font** | Plus Jakarta Sans | ✅ Premium, modern |
| **Body Font** | Inter | ✅ Highly legible |
| **Monospace Font** | JetBrains Mono | ✅ Developer-friendly |
| **Primary Color** | Coffee Brown `#9c6b3a` | ✅ On-brand |
| **Secondary Color** | Cream Beige `#e8c47a` | ✅ Warm, inviting |
| **Accent Color** | Premium Gold `#f59e0b` | ✅ Eye-catching |
| **Dark Mode** | Full semantic token system | ✅ Comprehensive |

### 6.2 UI Components Inventory

| Category | Components | Count |
|:--|:--|:--|
| **Core UI** | Button, Badge, Input, Skeleton, AuroraBackground, ScrollProgress, ScrollToTop | 7 |
| **Sections** | HeroSection, FeaturedProducts, StatsSection, TestimonialsSection, EventsSection, CTASection, MembershipCard | 7 |
| **Layout** | Navbar, Footer, marketing layout wrapper | 3+ |
| **Cart** | CartDrawer | 1 |
| **Admin Dashboard** | DashboardHeader, StatsRow, StatCard, RevenueChart, QuickActions, RecentOrders, InventoryAlert, UpcomingEvents, LoyaltyTierStats | 9 |

### 6.3 Glassmorphism & Animations

- ✅ `.glass` utility class with backdrop blur
- ✅ `.bg-mesh` ambient light patterns
- ✅ `.bg-noise` organic texture overlay
- ✅ `.skeleton` loading state animation
- ✅ `.card-hover` elevation on interaction
- ✅ Custom spring easing curves
- ✅ Float, pulse-glow, slide-up keyframe animations

---

## 7. Security Assessment

| Security Feature | Status | Notes |
|:--|:--|:--|
| **JWT Authentication** | ✅ Implemented | Access + Refresh token strategy |
| **Refresh Token Rotation** | ✅ Implemented | Session model tracks token hashes |
| **Password Hashing** | ✅ Implemented | bcrypt with configurable rounds |
| **Helmet** | ✅ Enabled | CSP headers configured |
| **CORS** | ✅ Configured | Restricted to frontend origins |
| **Rate Limiting** | ✅ Enabled | ThrottlerGuard with configurable TTL/limits |
| **Input Validation** | ✅ Enabled | ValidationPipe with whitelist + transform |
| **Cookie Security** | 🟡 Partial | httpOnly cookies for refresh tokens, but `Secure` and `SameSite` flags need production hardening |
| **RBAC** | 🟡 Partial | Roles defined in schema, guard implementation needed |
| **Audit Logging** | 🟡 Schema only | AuditLog model exists but no write logic |
| **Data Encryption at Rest** | 🔴 Not implemented | Personal data (emails, phones) stored in plaintext |

---

## 8. Testing & Quality

### 8.1 Test Files Identified

| Test File | Location | Type |
|:--|:--|:--|
| `app.controller.spec.ts` | `apps/api/src/` | Unit (NestJS) |
| `auth.store.test.ts` | `apps/web/src/stores/` | Unit (Vitest) |
| `dummy.test.ts` | `apps/admin/src/` | Placeholder |
| `vitest.config.ts` | `apps/web/` | Config |
| `vitest.config.ts` | `apps/admin/` | Config |

### 8.2 Test Coverage Assessment

| Metric | Current | Target |
|:--|:--|:--|
| **Unit Test Coverage** | < 5% | 80% |
| **Integration Tests** | 0 tests | Full API endpoint coverage |
| **E2E Tests** | 0 tests | Critical user journeys |
| **Total Test Files** | 3 (1 placeholder) | 50+ |

> **Verdict**: Testing is the most critical gap. Only 2 real test files exist across the entire project. The `dummy.test.ts` in admin is a placeholder.

---

## 9. Infrastructure & DevOps

### 9.1 Docker

| Service | Image | Status |
|:--|:--|:--|
| PostgreSQL | `postgres:16-alpine` | ✅ Configured with healthcheck |
| Redis | `redis:7-alpine` | ✅ Configured with healthcheck |
| MailHog | `mailhog/mailhog:latest` | ✅ Configured for email testing |
| API | Custom Dockerfile | ✅ Multi-stage build defined |

### 9.2 CI/CD Pipeline

| Pipeline | Status | Issues |
|:--|:--|:--|
| **CI (`ci.yml`)** | 🟡 Partial | Builds and lints, but **no test step** |
| **CD (`cd.yml`)** | 🟡 Placeholder | Prisma migration step present, but deploy commands are **commented out / echo statements** |

### 9.3 Terraform

- Single `main.tf` file exists (2,181 bytes)
- Minimal provisioning specs — needs expansion for production use

---

## 10. Shared Packages Assessment

| Package | Source Files | Status | Assessment |
|:--|:--|:--|:--|
| `@warkop-yareh/types` | `index.ts` (270 lines, 5.2 KB) | ✅ Complete | Comprehensive TypeScript interfaces for all domains |
| `@cold-n-brew/database` | `index.ts` (446 bytes) + full Prisma schema | ✅ Complete | Well-structured Prisma client wrapper with generated types |
| `@cold-n-brew/auth` | `index.ts` (287 bytes) | 🔴 Skeleton | NextAuth initialized with **zero providers configured** |
| `@warkop-yareh/validation` | `index.ts` (172 bytes) | 🔴 Skeleton | Only a single `ExampleSchema` exists — no real validation schemas |
| `@warkop-yareh/ui` | No source files | 🔴 Empty | `package.json` only, no components exported |
| `@warkop-yareh/config` | Unknown | 🟡 Likely present | ESLint/Prettier configs |
| `@warkop-yareh/shared` | Unknown | 🟡 Likely empty | General utilities placeholder |
| `@warkop-yareh/analytics` | No source files | 🔴 Empty | `package.json` only |

---

## 11. Naming Inconsistency

There is a notable **brand naming inconsistency** across the codebase:

| Location | Name Used |
|:--|:--|
| Root `package.json` | `cold-n-brew` |
| Web `package.json` | `@cold-n-brew/web` |
| API `package.json` | `@warkop-yareh/api` |
| Database package | `@cold-n-brew/database` |
| Auth package | `@cold-n-brew/auth` |
| Types package | `@warkop-yareh/types` |
| README title | `Warkop Ya'reh` |
| `.env.example` header | `COLD 'N BREW DIGITAL PLATFORM` |
| Swagger title | `Cold 'N Brew API` |
| Docker containers | `coldnbrew_*` |

> **Impact**: This inconsistency can cause confusion during development and potential import resolution issues. A unified naming convention should be adopted.

---

## 12. Key Observations & Risks

### 12.1 Strengths
1. **Excellent architecture**: Clean Architecture + DDD patterns are properly enforced in the backend
2. **Comprehensive schema**: 28 models with proper indexing, relationships, and domain modeling
3. **Modern tech stack**: Latest versions of all major frameworks
4. **Design system**: Professional, documented design tokens with dark mode support
5. **Security foundation**: JWT rotation, Helmet, rate limiting, CORS all properly configured
6. **Monorepo discipline**: Proper workspace isolation with Turborepo

### 12.2 Critical Risks

| Risk | Severity | Impact |
|:--|:--|:--|
| **Mock data dependency** | 🔴 High | All frontend pages use hardcoded data — no live API integration |
| **Near-zero test coverage** | 🔴 High | Regression risk, deployment confidence extremely low |
| **Empty shared packages** | 🔴 High | `ui`, `analytics`, `validation` packages have no real code |
| **CD pipeline not functional** | 🟡 Medium | Deploy steps are commented-out placeholders |
| **No i18n implementation** | 🟡 Medium | PRD requires Bahasa Indonesia + future English, no `next-intl` setup |
| **No image/file upload** | 🟡 Medium | Products, events, and posts reference images but no upload pipeline exists |
| **No email/notification system** | 🟡 Medium | MailHog is configured but no email service is implemented |
| **WebSocket not integrated** | 🟡 Medium | Gateway exists but order flow doesn't trigger real-time events |

---

## 13. Recommendations Summary

### Priority 1 — Critical Path (Required for Phase 1 Launch)

1. **Wire frontend to live API** — Replace all mock data with TanStack Query hooks calling real API endpoints
2. **Complete core API modules** — Implement full CRUD for Catalog, Ordering, and Identity modules
3. **Finish Midtrans payment flow** — Complete the payment creation → callback → status update cycle
4. **Write critical path tests** — Auth flow, order creation, and payment tests minimum
5. **Fix CI pipeline** — Add test step to CI workflow

### Priority 2 — Important for Production Readiness

6. **Unify package naming** — Choose either `@warkop-yareh/*` or `@cold-n-brew/*` consistently
7. **Implement shared validation** — Build Zod schemas for all API request/response types
8. **Implement RBAC guards** — Create role-based guards for protected API endpoints
9. **Set up file uploads** — Cloudflare R2 integration for product/event images
10. **Implement audit logging** — Wire AuditLog model to actual admin operations

### Priority 3 — Phase 2 Preparation

11. **Implement loyalty business logic** — Points calculation, tier progression, reward redemption
12. **Build real-time order tracking** — Wire WebSocket gateway to order status updates
13. **Implement notification system** — Email and push notification service
14. **i18n setup** — Install and configure `next-intl` for Bahasa Indonesia
15. **Complete admin CRUD pages** — All 10 admin dashboard sub-pages need full implementations

---

*This report reflects the state of the codebase as of July 6, 2026. Reassess after implementing Priority 1 items.*
