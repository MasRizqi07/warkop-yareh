# 🔍 WARKOP YA'REH — Project Audit Report

> **Audit Date**: July 6, 2026  
> **Audit Scope**: Full codebase technical audit  
> **Project Version**: `v0.1.0`  
> **Audit Classification**: Pre-Production Readiness Assessment  
> **Auditor**: Automated Code Audit

---

## Table of Contents

1. [Audit Methodology](#1-audit-methodology)
2. [Finding Severity Scale](#2-finding-severity-scale)
3. [Frontend Audit — Customer Web App](#3-frontend-audit--customer-web-app)
4. [Frontend Audit — Admin Dashboard](#4-frontend-audit--admin-dashboard)
5. [Backend Audit — NestJS API](#5-backend-audit--nestjs-api)
6. [Database & Schema Audit](#6-database--schema-audit)
7. [Security Audit](#7-security-audit)
8. [Performance & Optimization Audit](#8-performance--optimization-audit)
9. [DevOps & Infrastructure Audit](#9-devops--infrastructure-audit)
10. [Code Quality & Maintainability Audit](#10-code-quality--maintainability-audit)
11. [PRD Compliance Audit](#11-prd-compliance-audit)
12. [Prioritized Action Plan](#12-prioritized-action-plan)

---

## 1. Audit Methodology

This audit was conducted by analyzing:
- All source files across `apps/web`, `apps/admin`, `apps/api`, and `packages/*`
- Configuration files: `package.json`, `turbo.json`, `tsconfig.json`, `.env.example`
- Infrastructure: `docker-compose.yml`, CI/CD pipelines, Terraform
- Documentation: `README.md`, `DESIGN.md`, `PRD.md`, `ROADMAP.md`, `TECH_STACK.md`
- Database schema: `schema.prisma` (793 lines, 28 models)
- All 18+ API modules and their internal structure

---

## 2. Finding Severity Scale

| Severity | Icon | Definition |
|:--|:--|:--|
| **CRITICAL** | 🔴 | Blocks production deployment or poses a security/data loss risk |
| **HIGH** | 🟠 | Significant functional gap or architectural issue requiring attention before launch |
| **MEDIUM** | 🟡 | Quality concern that should be addressed for maintainability and reliability |
| **LOW** | 🟢 | Minor improvement or best-practice recommendation |
| **INFO** | ℹ️ | Observation for awareness, no immediate action needed |

---

## 3. Frontend Audit — Customer Web App

### 3.1 Route Coverage Analysis

**Total routes identified**: 17 routes across 2 route groups

#### Marketing Route Group `/(marketing)/`

| Route | File Size | Data Source | Verdict |
|:--|:--|:--|:--|
| `/` (Home) | `page.tsx` (1.2 KB) + 7 section components | Mock data via `data/mock.ts` (20 KB) | 🟡 UI complete, not connected to API |
| `/menu` | `page.tsx` (10.8 KB) | Hardcoded mock | 🟡 Same |
| `/booking` | `page.tsx` (17.3 KB) | Hardcoded mock | 🟡 Same |
| `/community` | `page.tsx` (15.2 KB) | Hardcoded mock | 🟡 Same |
| `/events` | `page.tsx` (6.0 KB) | Hardcoded mock | 🟡 Same |
| `/blog` | Route exists | Unknown | 🟡 Needs verification |
| `/about` | Route exists | Static content | 🟢 Likely complete |
| `/contact` | Route exists | Form submission | 🟡 Needs API endpoint |

#### Protected Routes

| Route | File Size | Data Source | Verdict |
|:--|:--|:--|:--|
| `/login` | `page.tsx` (6.0 KB) | Form → API `/auth/login` | 🟡 Needs API integration testing |
| `/register` | `page.tsx` (7.8 KB) | Form → API `/auth/register` | 🟡 Same |
| `/otp` | Route exists | OTP verification flow | 🟡 Partial |
| `/checkout` | `page.tsx` (8.3 KB) | Cart store + API | 🟡 Payment flow incomplete |
| `/checkout/success` | Route exists | Confirmation display | 🟡 Depends on payment callback |
| `/orders/[id]` | Dynamic route | API + WebSocket | 🟡 Real-time tracking incomplete |
| `/loyalty` | `page.tsx` (12.2 KB) | Mock data | 🟡 UI complete, no API |
| `/qr/[code]` | Dynamic route | QR → Table → Order | 🟡 Flow not implemented |

---

### 3.2 Frontend Findings

#### 🔴 F-001: ALL customer-facing pages use mock/hardcoded data

**Location**: `apps/web/src/data/mock.ts` (20,279 bytes)  
**Problem**: Every marketing page (menu, booking, community, events, loyalty) renders hardcoded mock data instead of fetching from the NestJS API. TanStack Query is installed but not used for data fetching on any page.

**Impact**: Zero end-to-end functionality. Users cannot interact with real data.

**Recommendation**:
1. Create API hook files under `apps/web/src/hooks/` using `useQuery`/`useMutation` from TanStack Query
2. Replace all mock data imports with hook-based data fetching
3. Implement loading skeletons (the `Skeleton` component already exists)
4. Implement error boundary components

---

#### 🟠 F-002: Cart store does not persist product customizations

**Location**: `apps/web/src/stores/index.ts` (lines 54-101)  
**Problem**: The `addItem` function matches items by `product.id` only. If a customer adds the same coffee with different customizations (e.g., hot vs. iced), the system incorrectly increments quantity instead of adding a separate cart line.

**Current Code**:
```typescript
addItem: (product, quantity = 1) =>
  set((state) => {
    const existing = state.items.find(
      (item) => item.product.id === product.id, // ← Only checks product ID
    );
```

**Recommendation**: Generate a composite key combining `productId` + serialized customizations to distinguish unique cart entries.

---

#### 🟠 F-003: Middleware authentication is cookie-existence-only

**Location**: `apps/web/src/middleware.ts` (lines 4-32)  
**Problem**: The Edge middleware only checks `request.cookies.has('refreshToken')` — it does **not** verify the token's validity, expiration, or structure. An expired or malformed cookie will pass the gate.

**Current Code**:
```typescript
const hasRefreshToken = request.cookies.has('refreshToken');
```

**Mitigation**: While the comment acknowledges this limitation (backend validates on actual API calls), users may see a flash of protected content before being redirected. Consider:
1. Decoding JWT header (not full verification) to check `exp` claim in Edge runtime
2. Adding a lightweight `/api/auth/verify` call for SSR protected pages

---

#### 🟡 F-004: No error handling UI components

**Location**: `apps/web/src/components/`  
**Problem**: No `ErrorBoundary`, `NotFound`, or `ErrorPage` components exist. If an API call fails, users see raw React error boundaries or nothing at all.

**Recommendation**: Create:
- `app/error.tsx` — Global error boundary
- `app/not-found.tsx` — Custom 404 page
- `app/(marketing)/error.tsx` — Marketing-specific error handler
- Reusable `<ErrorState />` and `<EmptyState />` components

---

#### 🟡 F-005: No loading/suspense boundaries

**Location**: `apps/web/src/app/`  
**Problem**: No `loading.tsx` files exist in any route directory. With Next.js App Router, these are critical for streaming SSR and showing loading states during navigation.

**Recommendation**: Add `loading.tsx` to all route groups, especially `/(marketing)/menu/`, `/checkout/`, `/orders/[id]/`, and `/loyalty/`.

---

#### 🟡 F-006: Missing `next/image` optimization for product images

**Location**: Multiple page files  
**Problem**: Product and event images may use standard `<img>` tags instead of Next.js `<Image>` component, missing out on automatic optimization, lazy loading, and responsive srcsets.

**Recommendation**: Audit all image tags and replace with `next/image` where applicable. Configure `images.domains` in `next.config.mjs` for external image sources.

---

#### 🟡 F-007: No PWA (Progressive Web App) setup

**Location**: `apps/web/`  
**Problem**: The PRD lists PWA as a requirement (Feature 1 — Customer Mobile Experience), but no `manifest.json`, service worker, or `next-pwa` integration exists.

**Recommendation**: Install `@ducanh2912/next-pwa` or `next-pwa` and configure:
- `public/manifest.json` with app metadata
- Offline-capable service worker for menu browsing
- Add to Home Screen (A2HS) support

---

#### 🟢 F-008: Backup PostCSS config files in source tree

**Location**: `apps/web/postcss.config.mjs.bak`, `postcss.config.mjs.bak2`  
**Problem**: Two backup config files are committed to the repo. These add noise and may confuse other developers.

**Recommendation**: Delete `postcss.config.mjs.bak` and `postcss.config.mjs.bak2` and add `*.bak*` to `.gitignore`.

---

## 4. Frontend Audit — Admin Dashboard

### 4.1 Findings

#### 🟠 A-001: Admin dashboard uses static mock data in all components

**Location**: `apps/admin/src/components/dashboard/` (9 component files)  
**Problem**: All dashboard stats, charts, and lists render hardcoded values. The `RevenueChart.tsx`, `StatsRow.tsx`, `RecentOrders.tsx`, `InventoryAlert.tsx`, etc., display placeholder numbers.

**Impact**: The admin dashboard provides zero operational value until connected to the analytics API.

---

#### 🟠 A-002: 10 admin sub-pages have routes but likely minimal implementation

**Location**: `apps/admin/src/app/(dashboard)/` — `products/`, `orders/`, `users/`, `branches/`, `reservations/`, `events/`, `community/`, `loyalty/`, `analytics/`, `settings/`

**Problem**: These route directories exist but likely contain only basic page shells. Full CRUD interfaces with data tables, forms, modals, search, filtering, and pagination are required for each.

**Recommendation**: Implement each admin page with:
- Data table component with sorting, filtering, pagination
- Create/Edit form modals
- Delete confirmation dialogs
- Bulk actions (for orders, users)
- Real-time updates via WebSocket

---

#### 🟡 A-003: POS system is minimal

**Location**: `apps/admin/src/app/pos/page.tsx` (5,617 bytes)  
**Problem**: The POS page is small for a full point-of-sale interface. Missing: product grid, quick-add buttons, order modification, split bill, refund, cash drawer management.

**Recommendation**: The PRD specifies POS as a Phase 1 deliverable. Expand significantly with:
- Touch-friendly product grid
- Real-time cart management
- Multiple payment method support
- Receipt printing capability
- Staff identification

---

#### 🟡 A-004: Kitchen Display System lacks real-time integration

**Location**: `apps/admin/src/app/kitchen/page.tsx` (10,138 bytes)  
**Problem**: The KDS page has a good UI foundation (10 KB of code) but lacks real-time WebSocket subscription to receive order updates. The WebSocket gateway (`EventsGateway`) has `joinKitchen` and `broadcastOrderCreated` methods that need to be consumed by this page.

**Recommendation**: Add `socket.io-client` to admin package and subscribe to `order.created` and `order.updated` events in the KDS page.

---

## 5. Backend Audit — NestJS API

### 5.1 Architecture Assessment

The backend follows **Clean Architecture / DDD** with 4 layers:
1. **Domain**: Entities, repositories (interfaces), events, value objects
2. **Application**: Services, use cases
3. **Infrastructure**: Prisma repositories, Redis, Midtrans, Auth strategies
4. **Presentation**: Controllers, middleware

**Overall Assessment**: ✅ Architecture is well-structured. The concern is with **depth of implementation**.

### 5.2 Findings

#### 🔴 B-001: API modules are scaffolded but mostly empty

**Location**: `apps/api/src/modules/` — 14 module directories  
**Problem**: Examining the module files reveals:

| Module | Has `application/` | Has `presentation/` | Has `domain/` | Has `infrastructure/` | Assessment |
|:--|:--|:--|:--|:--|:--|
| `identity` | ✅ Services | ✅ Controllers | ✅ Domain | ✅ Repository | **Complete** |
| `catalog` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `ordering` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `reservation` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `community` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `event` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `loyalty` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `analytics` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `branch` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `franchise` | ✅ | ✅ | ❌ | ❌ | Scaffolded |
| `tables` | Unknown | Unknown | ❌ | ❌ | Minimal |
| `orders` | Unknown | Unknown | ❌ | ❌ | May duplicate `ordering` |
| `products` | Unknown | Unknown | ❌ | ❌ | May duplicate `catalog` |
| `websockets` | N/A | ✅ Gateway | N/A | N/A | **Complete** |

Only **Identity** and **WebSockets** modules are fully implemented. The remaining 12 modules need:
- Complete service methods (CRUD + business logic)
- Controller endpoints with DTO validation
- Prisma repository implementations
- Swagger decorators for API documentation

---

#### 🔴 B-002: Potential module duplication

**Location**: `apps/api/src/modules/`  
**Problem**: Two module pairs may represent the same domain:
- `ordering/` and `orders/` — both appear to handle orders
- `catalog/` and `products/` — both appear to handle product management

**Recommendation**: Audit each module's controllers and services. Consolidate duplicates to avoid confusion and ensure a single source of truth per bounded context.

---

#### 🔴 B-003: Midtrans payment service is a skeleton

**Location**: `apps/api/src/infrastructure/payment/midtrans.service.ts` (23 lines)  
**Problem**: The MidtransService only initializes `CoreApi` and `Snap` clients. **No transaction methods exist**:
- No `createTransaction()`
- No `handleNotification()` callback handler
- No `checkTransactionStatus()`
- No refund handling

**Current Code** (complete file):
```typescript
@Injectable()
export class MidtransService {
  public coreApi: any;  // ← Using `any` type
  public snap: any;      // ← Using `any` type

  constructor() {
    this.coreApi = new midtransClient.CoreApi({...});
    this.snap = new midtransClient.Snap({...});
  }
}
```

**Issues**:
1. Uses `any` type for both clients — loses all type safety
2. No methods to create, process, or verify payments
3. No webhook endpoint for Midtrans callbacks
4. Environment variables have insecure fallback values

**Recommendation**: Implement full payment lifecycle:
```
createSnapTransaction() → getPaymentUrl() → handleNotification() → updateOrderStatus()
```

---

#### 🟠 B-004: Domain entities are minimal

**Location**: `apps/api/src/domain/entities/`  
**Problem**: Only 4 entity files exist:
- `base.entity.ts` (615 bytes) — Abstract base
- `order.entity.ts` (819 bytes) — Order entity
- `product.entity.ts` (1,032 bytes) — Product entity
- `loyalty.entity.ts` (1,166 bytes) — Loyalty entity

Missing entities: `User`, `Branch`, `Event`, `Reservation`, `Community`, `Table`, `Payment`, `Review`, `Notification`, `Session`.

**Recommendation**: Create domain entities for all 28 Prisma models, containing:
- Business validation rules
- Domain methods (e.g., `Order.calculateTotal()`, `User.promoteTier()`)
- Factory methods
- Type-safe value objects

---

#### 🟠 B-005: WebSocket gateway has no authentication

**Location**: `apps/api/src/modules/websockets/events.gateway.ts` (line 13)  
**Problem**: The WebSocket gateway uses `origin: '*'` CORS and **no authentication guard**. Any client can:
- Join the `cashier` or `kitchen` rooms
- Receive all order broadcasts
- Listen to table updates

**Current Code**:
```typescript
@WebSocketGateway({
  cors: {
    origin: '*', // ← Wide-open CORS
  },
})
```

**Recommendation**:
1. Restrict CORS origins to match the REST API configuration
2. Implement a `WsAuthGuard` that validates JWT on `handleConnection()`
3. Verify user roles before joining sensitive rooms (`cashier`, `kitchen`)

---

#### 🟡 B-006: No API versioning enforcement

**Location**: `apps/api/src/main.ts` (line 45)  
**Problem**: While `api/v1` prefix is configured, there's no versioning strategy for future API evolution. If API contracts change in Phase 2, clients will break.

**Recommendation**: Use NestJS `@Version()` decorators and `app.enableVersioning()` for clean v1/v2 coexistence.

---

#### 🟡 B-007: Console.log used in production-path code

**Location**: `apps/api/src/modules/websockets/events.gateway.ts` (lines 22, 26)  
**Problem**: `console.log` statements for connection/disconnection events. These should use NestJS `Logger` for structured logging.

**Current Code**:
```typescript
handleConnection(client: Socket) {
  console.log(`Client connected: ${client.id}`);  // ← console.log
}
```

**Recommendation**: Use `private readonly logger = new Logger(EventsGateway.name)` consistently.

---

#### 🟡 B-008: Port conflict between API and Admin

**Location**: `.env.example` (line 39) vs. `apps/api/src/main.ts` (line 101)  
**Problem**: The `.env.example` shows `PORT=3001` and `BACKEND_URL=http://localhost:3001`, while the README states the API runs on port 4000 and admin on port 3001. This creates confusion.

**Recommendation**: Standardize port assignments:
- Web: `3000`
- Admin: `3001`
- API: `4000`

Update `.env.example`, Docker, and documentation accordingly.

---

## 6. Database & Schema Audit

### 6.1 Findings

#### 🟡 D-001: No database migrations — using `db:push`

**Location**: `packages/database/prisma/`  
**Problem**: No `migrations/` directory exists. The project appears to use `prisma db push` for schema synchronization, which is suitable for prototyping but dangerous for production:
- No rollback capability
- No migration history
- Data loss risk on schema changes

**Recommendation**: Switch to `prisma migrate dev` and maintain a formal migration history before any staging deployment.

---

#### 🟡 D-002: OrderItem snapshot fields are nullable

**Location**: `packages/database/prisma/schema.prisma` (lines 250-253)  
**Problem**: Audit snapshot fields (`snapshotName`, `snapshotPrice`, `snapshotTax`) are nullable:
```prisma
snapshotName   String?
snapshotPrice  Int?
snapshotTax    Int?     @default(0)
```

If these aren't populated during order creation, you lose the ability to audit historical pricing. They should be required and populated from the product record at order time.

**Recommendation**: Make snapshot fields required after implementing the order creation service that auto-populates them.

---

#### 🟡 D-003: No soft delete pattern

**Location**: Schema-wide  
**Problem**: No models implement soft deletes (`deletedAt DateTime?`). Critical data (orders, payments, users) will be permanently destroyed on deletion.

**Recommendation**: Add `deletedAt DateTime?` to `User`, `Order`, `Product`, `Branch`, `Event`, and `CommunityGroup` models. Implement Prisma middleware for automatic filtering.

---

#### 🟡 D-004: String-based time fields instead of DateTime

**Location**: `Reservation.startTime`, `Reservation.endTime`, `Event.startTime`, `Event.endTime`  
**Problem**: Time-of-day fields are stored as `String` (e.g., `"14:00"`), making database-level time comparisons and timezone handling difficult.

**Recommendation**: Consider storing full `DateTime` values or use a dedicated `Time` type with timezone awareness for multi-region support (Phase 3).

---

#### 🟢 D-005: Review model lacks Order relation

**Location**: `schema.prisma` — `Review` model (lines 554-573)  
**Problem**: Reviews are linked to `User` and optionally `Product`, but not to `Order`. This means:
- Cannot enforce "only review products you've purchased"
- Cannot link review to specific purchase experience

**Recommendation**: Add optional `orderId String?` relation to verify purchases before allowing reviews.

---

#### 🟢 D-006: CommunityPost comment count is denormalized without comment model

**Location**: `CommunityPost.comments Int @default(0)` (line 497)  
**Problem**: A `comments` count field exists but there is no `Comment` model to store actual comment data. This is a denormalized counter without the underlying entity.

**Recommendation**: Either create a `Comment` model (with parent post relation), or remove the `comments` field if comments are not a Phase 1 feature.

---

## 7. Security Audit

### 7.1 Findings

#### 🔴 S-001: Environment variable fallback values are insecure

**Location**: `apps/api/src/infrastructure/payment/midtrans.service.ts` (lines 12-13)  
**Problem**: Midtrans keys have **hardcoded fallback strings** that could be accidentally used in production:
```typescript
serverKey: process.env.MIDTRANS_SERVER_KEY || 'sandbox_server_key',
```

**Recommendation**: Throw an error if required environment variables are missing rather than using fallback values. Use NestJS `ConfigService` with validation:
```typescript
const serverKey = this.configService.getOrThrow('MIDTRANS_SERVER_KEY');
```

---

#### 🟠 S-002: No RBAC (Role-Based Access Control) guards implemented

**Location**: API-wide  
**Problem**: The `Role` enum defines 8 roles (`CUSTOMER`, `STAFF`, `CASHIER`, `KITCHEN`, `MANAGER`, `ADMIN`, `OWNER`, `SUPERADMIN`), but no `@Roles()` decorator or `RolesGuard` is implemented. All authenticated users can potentially access all endpoints.

**Recommendation**: Create:
1. `@Roles()` decorator
2. `RolesGuard` that reads roles from JWT payload
3. Apply to all admin, staff, and management endpoints

---

#### 🟠 S-003: Sensitive data stored in plaintext

**Location**: `User` model — `email`, `phone` fields  
**Problem**: The PRD (Section 5.3) explicitly requires "Encrypt personal data (emails, phones) at rest." Currently, these fields are stored as plain strings in PostgreSQL.

**Recommendation**: Implement application-level encryption using `crypto` for PII fields, or leverage PostgreSQL's `pgcrypto` extension.

---

#### 🟡 S-004: JWT secret in .env.example is a readable string

**Location**: `.env.example` (line 19)  
**Problem**: The example JWT secret is `change-this-to-a-random-256bit-secret-minimum-32-chars`. While this is clearly a placeholder, better guidance should be provided.

**Recommendation**: Add a generation command in the comment: `# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

#### 🟡 S-005: No CSRF protection

**Location**: API-wide  
**Problem**: The API uses cookie-based refresh tokens (`withCredentials: true`) but has no CSRF token validation. This leaves the refresh endpoint vulnerable to cross-site request forgery attacks.

**Recommendation**: Implement CSRF protection using:
1. `csurf` middleware for state-changing endpoints, OR
2. Double-submit cookie pattern, OR
3. Same-site cookie attribute (`SameSite=Strict`) as minimum mitigation

---

#### 🟡 S-006: WebSocket CORS allows all origins

**Location**: `apps/api/src/modules/websockets/events.gateway.ts` (line 13)

Already documented in B-005. This is a security concern: any malicious site can open a WebSocket connection and eavesdrop on real-time events.

---

## 8. Performance & Optimization Audit

### 8.1 Findings

#### 🟡 P-001: No image optimization pipeline

**Location**: Project-wide  
**Problem**: Product, event, and user avatar images are referenced as plain URL strings. No image optimization, CDN, or responsive image handling exists.

**Recommendation**:
1. Configure `next/image` with allowed domains
2. Set up Cloudflare R2 or similar CDN for image hosting
3. Implement automatic image resizing/WebP conversion
4. Add blur data URLs for progressive loading

---

#### 🟡 P-002: Large Framer Motion bundle not code-split

**Location**: `apps/web/package.json` — `framer-motion: ^12.40.0`  
**Problem**: The PRD notes (Section 5.1): "Framer Motion bundle imports must use dynamic lazy-loading to protect mobile bundle weights." Current implementation likely imports the full library.

**Recommendation**:
1. Use `next/dynamic` with `ssr: false` for animation-heavy components
2. Use `import { motion } from "framer-motion/m"` (lightweight export)
3. Lazy-load section components that use heavy animations

---

#### 🟡 P-003: No caching strategy for API responses

**Location**: `apps/api/src/`  
**Problem**: Redis is configured as infrastructure but no caching layer is implemented for:
- Menu/catalog data (changes infrequently)
- Branch information (quasi-static)
- User sessions beyond JWT

**Recommendation**: Implement Redis caching with TTL for:
- `GET /api/v1/menu` — Cache for 5 minutes
- `GET /api/v1/branches` — Cache for 30 minutes
- `GET /api/v1/events` — Cache for 10 minutes

---

#### 🟡 P-004: No database query optimization evidence

**Location**: API modules  
**Problem**: No evidence of:
- Prisma `select` or `include` optimizations (to avoid over-fetching)
- Cursor-based pagination (for large datasets)
- Aggregate queries for analytics

**Recommendation**: When implementing API services:
1. Use Prisma `select` to limit returned fields
2. Implement cursor-based pagination for orders, users, products
3. Use `prisma.$queryRaw` for complex analytics aggregations

---

## 9. DevOps & Infrastructure Audit

### 9.1 Findings

#### 🔴 I-001: CI pipeline has no test step

**Location**: `infra/github-actions/ci.yml`  
**Problem**: The CI pipeline only runs `pnpm install`, `pnpm lint`, and `pnpm build`. **No test command is executed**:
```yaml
steps:
  - name: Install dependencies
    run: pnpm install
  - name: Lint
    run: pnpm run lint
  - name: Build
    run: pnpm run build
  # ❌ No "pnpm test" step
```

**Recommendation**: Add `pnpm test` step after lint. Block PR merges on test failure.

---

#### 🔴 I-002: CD pipeline deploy steps are non-functional

**Location**: `infra/github-actions/cd.yml` (lines 37-51)  
**Problem**: Both deployment steps contain only `echo` statements:
```yaml
- name: Build and Deploy API (ECS Fargate)
  run: |
    echo "Deploying NestJS API container..."
    # docker build -t warkop-yareh-api -f apps/api/Dockerfile .
    # docker push ...

- name: Build and Deploy Frontend (Vercel)
  run: |
    echo "Deploying Next.js applications to Vercel..."
    # pnpm vercel deploy --prod --token=$VERCEL_TOKEN
```

**Impact**: No automated deployments are possible.

**Recommendation**: Implement actual deploy commands:
1. For API: Build Docker image → Push to ECR → Update ECS service
2. For Web/Admin: Use Vercel CLI or Vercel GitHub integration

---

#### 🟡 I-003: CI/CD files are not in `.github/workflows/`

**Location**: `infra/github-actions/ci.yml` and `cd.yml`  
**Problem**: GitHub Actions workflow files must be located at `.github/workflows/` to be recognized and executed. The current location at `infra/github-actions/` means **neither pipeline will run automatically**.

**Recommendation**: Move files to `.github/workflows/` or create symlinks.

---

#### 🟡 I-004: Terraform is minimal

**Location**: `infra/terraform/main.tf` (2,181 bytes)  
**Problem**: A single Terraform file is insufficient for production infrastructure. Missing:
- Variable definitions
- State backend configuration
- Output values
- Separate environments (staging/production)

**Recommendation**: Expand to:
```
infra/terraform/
├── environments/
│   ├── staging/
│   └── production/
├── modules/
│   ├── database/
│   ├── cache/
│   ├── api/
│   └── cdn/
├── variables.tf
├── outputs.tf
└── backend.tf
```

---

#### 🟡 I-005: Docker Compose version is deprecated

**Location**: `infra/docker/docker-compose.yml` (line 1)  
**Problem**: `version: '3.8'` is deprecated in Docker Compose v2+. Modern Docker Compose ignores this field.

**Recommendation**: Remove the `version` key entirely.

---

#### 🟢 I-006: No `.dockerignore` in API app

**Location**: `apps/api/`  
**Problem**: A `Dockerfile` exists but no `.dockerignore`. Without it, `node_modules`, `.git`, test files, and documentation are included in the Docker build context, increasing build time and image size.

**Recommendation**: Add `.dockerignore`:
```
node_modules
.git
*.md
test/
dist/
.turbo/
```

---

## 10. Code Quality & Maintainability Audit

### 10.1 Findings

#### 🔴 Q-001: Package naming inconsistency across the monorepo

**Problem**: The project uses two competing naming conventions:

| Scope | Name |
|:--|:--|
| `@cold-n-brew/web` | Cold 'N Brew |
| `@cold-n-brew/database` | Cold 'N Brew |
| `@cold-n-brew/auth` | Cold 'N Brew |
| `@warkop-yareh/api` | Warkop Ya'reh |
| `@warkop-yareh/types` | Warkop Ya'reh |

**Impact**: Import confusion, inconsistent `--filter` commands, and workspace resolution issues. A developer running `pnpm --filter @warkop-yareh/database db:push` will **fail** because the package is actually named `@cold-n-brew/database`.

**Recommendation**: Unify all packages under one namespace. Since the project is titled "Warkop Ya'reh", standardize to `@warkop-yareh/*` across all packages.

---

#### 🟠 Q-002: Shared packages are effectively empty

**Location**: Multiple packages  
**Problem Analysis**:

| Package | Status | What Should Exist |
|:--|:--|:--|
| `packages/validation` | Only `ExampleSchema` | Zod schemas for all API DTOs (auth, orders, products, reservations) |
| `packages/ui` | No source files | Shared React components (Button, Card, Input, Modal, DataTable) |
| `packages/analytics` | No source files | Analytics calculation functions, chart data transformers |
| `packages/shared` | Likely empty | Utility functions (formatCurrency, formatDate, generateOrderNumber) |
| `packages/auth` | 10-line skeleton | NextAuth with zero providers, unused by the web app (which uses custom JWT) |

**Impact**: The monorepo's package isolation promise is not realized. Shared logic is duplicated or non-existent.

---

#### 🟡 Q-003: Dual authentication systems

**Location**: `packages/auth/index.ts` vs. `apps/api/src/infrastructure/auth/`  
**Problem**: Two competing auth systems exist:
1. **`packages/auth`**: Uses `NextAuth` with `PrismaAdapter` — zero providers configured, appears unused
2. **`apps/api/src/infrastructure/auth`**: Custom JWT strategy with Passport.js — fully implemented

**Impact**: Confusion about which auth system is canonical. The `@cold-n-brew/auth` package is imported in `apps/web/package.json` but the web app actually uses the custom JWT flow via `stores/auth.store.ts`.

**Recommendation**: Remove the unused `packages/auth` NextAuth setup, or replace the custom JWT implementation with NextAuth. Don't maintain both.

---

#### 🟡 Q-004: Types package doesn't mirror Prisma schema exactly

**Location**: `packages/types/index.ts` vs. `packages/database/prisma/schema.prisma`  
**Problem Analysis**:

| Issue | Types Package | Prisma Schema |
|:--|:--|:--|
| Role enum | 5 values: `customer`, `staff`, `manager`, `admin`, `owner` | 8 values: adds `CASHIER`, `KITCHEN`, `SUPERADMIN` |
| Role casing | lowercase strings | UPPERCASE enums |
| Order type | Not defined | `DINE_IN`, `TAKE_AWAY`, `DRIVE_THRU`, `DELIVERY` |
| Payment method | Not defined | `CASH`, `QRIS`, `DEBIT`, `CREDIT_CARD`, `E_WALLET` |
| Order status | Missing `SERVED` | Includes `SERVED` |
| Loyalty type | Missing `REFERRAL` | Includes `REFERRAL` |

**Impact**: Frontend and backend disagree on valid enum values. This will cause runtime errors when the API returns values the frontend doesn't expect.

**Recommendation**: Auto-generate frontend types from the Prisma schema using `prisma-zod-generator` or manually sync all enums.

---

#### 🟡 Q-005: No shared utility functions for currency formatting

**Location**: Project-wide  
**Problem**: Indonesian Rupiah (IDR) formatting (e.g., `Rp 25.000`) needs to be consistent across web, admin, and API. No shared formatter exists.

**Recommendation**: Create in `packages/shared`:
```typescript
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}
```

---

## 11. PRD Compliance Audit

Cross-referencing the **Product Requirements Document** (`docs/PRD.md`) against actual implementation:

### Phase 1 Requirements Compliance

| PRD Requirement | Implementation Status | Gap Analysis |
|:--|:--|:--|
| **Digital Menu** — Interactive display with search, filters, categories, prep time, calories, tags | 🟡 UI Complete, mock data | Missing: API integration, real-time availability |
| **Customization Engine** — Sweetness, ice, milk, toppings | 🟡 Schema ready | Missing: Frontend customization UI, cart customization tracking |
| **Checkout & Payments** — Midtrans (GoPay, ShopeePay, VA) | 🔴 Skeleton only | Missing: Full payment lifecycle, webhook handler, Snap integration |
| **Table Reservations** — Zones, capacity, slot selection | 🟡 UI Complete, mock data | Missing: API CRUD, availability calculation |
| **Authentication** — Email/password + Google OAuth | 🟡 Backend ready | Missing: Frontend-to-API wiring, Google OAuth frontend flow |
| **Kitchen Display System** | 🟡 UI built | Missing: Real-time WebSocket integration |
| **POS System** | 🟡 Basic UI | Missing: Full POS functionality |
| **Order Tracking** — Real-time status | 🟡 WebSocket gateway exists | Missing: Frontend consumer, order status update triggers |

### Non-Functional Requirements Compliance

| NFR | Required | Current Status | Gap |
|:--|:--|:--|:--|
| **Lighthouse Performance** | ≥ 95 | ❓ Not measured | Need to benchmark |
| **LCP** | < 2.0s (mobile 3G) | ❓ Not measured | Framer Motion bundle may impact |
| **INP** | < 200ms | ❓ Not measured | Need to benchmark |
| **CLS** | < 0.1 | ❓ Not measured | Need to benchmark |
| **99.5% Uptime** | Required | ❌ No monitoring | No health check monitoring, no alerting |
| **WCAG 2.2 AA** | Required | 🟡 Partial | Focus states documented, but `reduced-motion` media queries need verification |
| **SEO** | Schema markup for branches/events | 🟡 Partial | robots.ts and sitemap.ts exist; missing structured data (JSON-LD) |
| **Audit Logs** | Immutable ledger | 🟡 Schema only | AuditLog model exists, no write logic |
| **i18n** | Bahasa Indonesia primary | 🔴 Not started | No next-intl, no translation files |
| **PWA** | Progressive Web App | 🔴 Not started | No manifest, no service worker |

### Phase 2-4 Requirements Status

| Feature | Phase | Schema Ready | Backend Ready | Frontend Ready |
|:--|:--|:--|:--|:--|
| Loyalty points & tiers | Phase 2 | ✅ | 🔴 No logic | 🟡 UI only |
| Referral system | Phase 2 | ✅ | 🔴 No logic | 🔴 Not started |
| SSE/real-time tracking | Phase 2 | N/A | 🟡 WebSocket gateway | 🔴 Not integrated |
| Community forums | Phase 3 | ✅ | 🔴 Scaffolded | 🟡 UI only |
| AI Concierge (Gemini) | Phase 3 | ❌ | 🔴 Not started | 🔴 Not started |
| Franchise management | Phase 4 | ✅ | 🔴 Scaffolded | 🔴 Not started |
| RLS tenant isolation | Phase 4 | ❌ | 🔴 Not started | N/A |

---

## 12. Prioritized Action Plan

### 🔴 Tier 1 — Critical (Blocks Phase 1 Launch)

| # | Finding | Action Required | Effort |
|:--|:--|:--|:--|
| 1 | **B-001** | Implement complete CRUD for **Catalog**, **Ordering**, and **Tables** API modules | 3-4 weeks |
| 2 | **F-001** | Wire **all** frontend pages to live API using TanStack Query hooks | 2-3 weeks |
| 3 | **B-003** | Implement **full Midtrans payment lifecycle** (create transaction, webhook, status) | 1-2 weeks |
| 4 | **Q-001** | **Unify package naming** to `@warkop-yareh/*` across all packages | 1 day |
| 5 | **I-001** | Add `pnpm test` step to CI pipeline | 1 hour |
| 6 | **I-003** | Move CI/CD files to `.github/workflows/` | 1 hour |

### 🟠 Tier 2 — High Priority (Required for Production)

| # | Finding | Action Required | Effort |
|:--|:--|:--|:--|
| 7 | **S-002** | Implement **RBAC guards** for all protected endpoints | 2-3 days |
| 8 | **B-005** | Add **WebSocket authentication** and origin restrictions | 1 day |
| 9 | **Q-004** | **Sync types package** with Prisma schema enums | 1 day |
| 10 | **Q-002** | Implement **validation schemas** in `packages/validation` | 3-5 days |
| 11 | **F-004** | Create **error boundaries** and **loading states** for all routes | 2-3 days |
| 12 | **D-001** | Switch from `db:push` to **Prisma Migrate** | 1 day |
| 13 | **S-001** | Remove **insecure env fallbacks** — throw errors on missing vars | 2 hours |
| 14 | **A-001** | Connect **admin dashboard** to analytics API | 1-2 weeks |
| 15 | **I-002** | Implement **real deployment commands** in CD pipeline | 2-3 days |

### 🟡 Tier 3 — Medium Priority (Quality & Completeness)

| # | Finding | Action Required | Effort |
|:--|:--|:--|:--|
| 16 | **F-002** | Fix **cart customization matching** logic | 2-3 hours |
| 17 | **F-007** | Set up **PWA** with manifest and service worker | 1-2 days |
| 18 | **Q-003** | Remove unused **NextAuth package** or consolidate auth | 1 day |
| 19 | **B-004** | Expand **domain entities** for all models | 3-5 days |
| 20 | **P-002** | Implement **Framer Motion code-splitting** | 1 day |
| 21 | **P-003** | Add **Redis caching** for menu and branch endpoints | 2-3 days |
| 22 | **S-005** | Implement **CSRF protection** | 1 day |
| 23 | **D-003** | Add **soft delete** to critical models | 1-2 days |
| 24 | **A-003** | Expand **POS system** to full functionality | 2-3 weeks |
| 25 | **A-004** | Integrate **KDS with WebSocket** for real-time order tracking | 2-3 days |

### 🟢 Tier 4 — Low Priority (Polish & Best Practices)

| # | Finding | Action Required | Effort |
|:--|:--|:--|:--|
| 26 | **F-008** | Delete `.bak` files from repo | 5 minutes |
| 27 | **B-007** | Replace `console.log` with NestJS `Logger` | 30 minutes |
| 28 | **B-008** | Standardize **port assignments** in docs and configs | 1 hour |
| 29 | **I-005** | Remove deprecated `version` from docker-compose | 5 minutes |
| 30 | **I-006** | Add `.dockerignore` to API app | 15 minutes |
| 31 | **D-006** | Create `Comment` model or remove counter field | 1-2 hours |
| 32 | **D-005** | Add `orderId` relation to `Review` model | 30 minutes |
| 33 | **Q-005** | Create shared currency formatter in `packages/shared` | 1 hour |

---

## Audit Summary Statistics

| Category | Critical 🔴 | High 🟠 | Medium 🟡 | Low 🟢 | Total |
|:--|:--|:--|:--|:--|:--|
| **Frontend (Web)** | 1 | 2 | 4 | 1 | 8 |
| **Frontend (Admin)** | 0 | 2 | 2 | 0 | 4 |
| **Backend (API)** | 3 | 2 | 3 | 0 | 8 |
| **Database** | 0 | 0 | 4 | 2 | 6 |
| **Security** | 1 | 2 | 3 | 0 | 6 |
| **Performance** | 0 | 0 | 4 | 0 | 4 |
| **DevOps** | 2 | 0 | 3 | 1 | 6 |
| **Code Quality** | 1 | 1 | 3 | 0 | 5 |
| **Total** | **8** | **9** | **26** | **4** | **47** |

> **Overall Audit Verdict**: The project has a **solid architectural foundation** with excellent database modeling and a modern tech stack. However, it is currently at approximately **45% completion for Phase 1**. The primary blocker is the gap between the polished frontend UI (which uses mock data) and the backend API (which is mostly scaffolded). Resolving the 8 critical findings is required before any production consideration.

---

*End of Audit Report — July 6, 2026*
