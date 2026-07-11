# 🕵️ Warkop Ya'reh — Enterprise Architecture Audit Report

This audit performs a critical security, scalability, and performance review of the platform blueprint defined in [enterprise_architecture.md](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/architecture/enterprise_architecture.md). It highlights architectural vulnerabilities, technical debt, and system boundaries that must be corrected prior to execution.

---

## 🚦 Executive Summary

| Category                       | Score        | Status               | Description                                                                                                 |
| :----------------------------- | :----------- | :------------------- | :---------------------------------------------------------------------------------------------------------- |
| **Architecture Score**         | **68 / 100** | ⚠️ Needs Refactoring | Strong conceptual models, but compromised by database coupling and distributed transaction vulnerabilities. |
| **Production Readiness Score** | **55 / 100** | 🚨 High Risk         | Lacks fallback modes, dead-letter strategies, and partition isolation necessary for franchise scaling.      |

---

## SECTION 1: Architecture Validation

### 1.1 DDD (Domain-Driven Design) Correctness

- **Shared Database & Schema Coupling (Major Flaw)**: The architecture proposes a single Prisma schema (`schema.prisma`) and shared database instance. This violates core DDD isolation principles. Bounded contexts must encapsulate their data stores. Sharing tables (e.g. joining `Order` with `User` or `Branch` directly in SQL) leads to tight schema coupling.
- **Shared Types Bottleneck**: A shared `packages/types` package acts as a single point of compilation failure. Changes in the `Loyalty` type structure will force rebuilds across the `web`, `admin`, and `api` workspaces, violating independent deployability.
- **Anemic Domain Models**: The current model relies heavily on Prisma-generated interfaces which are simple data bags. True DDD requires **Rich Domain Models** that encapsulate business invariants (e.g., an `Order` class containing state-transition rules, rather than relying on service classes to alter model fields).

### 1.2 Clean Architecture Correctness

- **Dependency Bleeding**: Using NestJS or Prisma decorators (like `@IsString` or `@Exclude`) directly on domain entities binds the core domain layer to external libraries and presentation frameworks.
- **Auth Layer Coupling**: NextAuth is deployed in the shared `packages/auth` directory, but NextAuth is fundamentally designed for frontend session handling. NestJS relies on Passport-JWT validation. Bypassing NestJS's controller layer for direct database adapter writing from NextAuth introduces implicit transaction dependencies.

### 1.3 Modular Monolith Strategy

- **Lack of Module Boundary Enforcements**: NestJS modules compile into a single runtime memory space. Without strict compile-time checks (e.g., utilizing `dependency-cruiser` or Nx boundary rules), developers will inevitably import services from other domains directly (e.g., `OrderingService` importing `LoyaltyRepository` directly), degenerating the system into a "Big Ball of Mud".

### 1.4 Event-Driven Architecture Readiness

- **Outbox Pattern Complexity Overhead**: Implementing the outbox pattern via Debezium requires a Kafka Connect cluster, Kafka Brokers, and Schema Registries. For a Phase 1/2 rollout, this introduces massive infrastructure overhead. If implemented via basic polling, it introduces high database read load.
- **No Compensating Transactions (Saga)**: The plan lacks a Saga orchestrator or choreographing engine to handle transaction failures (e.g. reversing loyalty points or releasing table reservations when a Midtrans payment fails after a 15-minute timeout).

### 1.5 CQRS & BFF Suitability

- **CQRS-Lite Limitation**: Implementing command-query separation at the code level without separate read/write databases is ineffective. High-concurrency reads (like menus) will lock the database write transaction queries during peak ordering hours.
- **BFF Validation Duplication**: Next.js Server Actions validate inputs using Zod, and NestJS controllers validate the same payloads again. This duplicates validation logic across the monorepo.

---

## SECTION 2: Domain Audit

### 2.1 Context Coupling Vulnerabilities

- **Inventory & Catalog Coupling**: Ordering directly queries `Catalog` prices. If the catalog prices change dynamically, historical order records will change retrospectively unless the order item captures a static snapshot of the price, description, and tax at the moment of checkout.
- **Circular Domain Dependencies**: The `Branch` context has references to `Events` and `CommunityGroups`, while `Events` have references to `Branches`. This circular coupling complicates domain boundary isolation.

### 2.2 Domain Boundary Mapping Recommendations

```
[Catalog Context]  ───(Snapshot Price/Details)───► [Ordering Context]
                                                            │
                                                     (Publish Event)
                                                            │
                                                            ▼
[Loyalty Context]  ◄───(Listen: OrderPaid Event)────────────┘
```

1. **Price Snapshotting**: The `Ordering` context must snapshot the product catalog state during order creation. The order must store `unitPrice` and `taxRate` fields statically within `OrderItem` rather than linking to the live `Product` entity.
2. **Asynchronous Side Effects**: Ordering must not depend on the Loyalty context to evaluate rewards. The Order transaction must complete independently, publishing an `OrderPaid` event. The Loyalty domain must process this event asynchronously to increment user points.

---

## SECTION 3: Database Audit

### 3.1 Schema & Query Vulnerabilities

- **N+1 Query Cascades**: Prisma's default behavior does not support lazy loading, but querying deeply nested objects (e.g. fetching a user's reservations with table details and branch structures) will trigger multiple individual SQL queries if developers do not carefully structure their `include` parameters.
- **Write Lock Contention**: A single `orders` table holding records for all 50+ branches will experience high write contention during peak lunch/dinner hours, causing transaction lock timeouts.
- **JSON Serialization Antipattern**: Storing item configurations (sugar levels, toppings, milk types) as a JSON object (`customizations Json?` in `OrderItem`) makes analytical reporting (e.g., counting oat milk usage) extremely slow, requiring database-level JSON parsing functions.

### 3.2 Database Improvements

1. **Sharding Keys**: Partition the `orders` and `order_items` tables using a composite partitioning key consisting of `(branchId, createdAt)`.
2. **Schema Separation**: Replace the single JSON customization structure with a structured model mapping customizations to unique option records:
   ```prisma
   model OrderItemCustomization {
     id           String    @id @default(cuid())
     orderItemId  String
     orderItem    OrderItem @relation(fields: [orderItemId], references: [id])
     optionName   String    // e.g. "Oat Milk"
     priceAdded   Int
   }
   ```

---

## SECTION 4: Authentication & Authorization Audit

### 4.1 Security & Session Risks

- **JWT Storage Vulnerabilities**: Storing JWT access tokens on the frontend makes them vulnerable to Cross-Site Scripting (XSS) attacks. If stored in memory, they are lost on page refreshes; if stored in LocalStorage, they are accessible to malicious third-party scripts.
- **Refresh Token Hijacking**: The architecture lacks **Refresh Token Rotation (RTR)**. If a refresh token is stolen, a malicious user can generate new access tokens indefinitely without triggering security alerts.
- **Bypassing RLS (Row-Level Security)**: NextAuth's direct Prisma adapter bypasses PostgreSQL's RLS policies because it connects to the database using a single root credential. Any code execution within the frontend app can query all user profiles.

### 4.2 Auth Improvements

1. **Secure Session Cookie**: Store both access and refresh tokens in secure, `HttpOnly`, `SameSite=Strict` cookies.
2. **JWT Refresh Rotation**: Enforce RTR. When a client requests token rotation, invalidate the old refresh token. If a client attempts to reuse a revoked refresh token, immediately invalidate all active sessions for that user.

---

## SECTION 5: Event-Driven Audit

### 5.1 Event System Bottlenecks

- **Memory Limits & Data Loss**: Storing BullMQ queues in a shared Redis cluster poses a risk of data loss. If Redis runs out of memory (OOM) and eviction policies are active, pending jobs (like loyalty points assignments) will be lost.
- **No Schema Registry**: Lacking a schema registry means developers can change event structures (e.g. changing `pointsEarned` to a float in `LoyaltyPointsAwarded`) and break downstream consumers in production.

### 5.2 Required Missing Events

- `PaymentFailed`: To trigger ticket release and reservation cancellations.
- `InventoryAllocated` / `InventoryReleased`: To track branch ingredient levels and prevent double-booking items.
- `FranchiseDeactivated`: Immediatlely terminates all session connections for staff under the target franchise.

---

## SECTION 6: Scalability Audit

### 6.1 Scaling Bottlenecks

- **Phase 2 (Multi-Branch Menu Reads)**: Querying menus with branch-specific overrides requires a join on `BranchProduct`. At high scale, this query will degrade read performance.
- **Phase 3 (Regional Lag)**: Placing the database primary in a single region (e.g., Singapore) means write latency for branches in remote regions will increase significantly due to database network round-trips.

---

## SECTION 7: Observability Audit

### 7.1 Observability Gaps

- **No Distributed Trace Propagation**: If Next.js Server Actions execute in a serverless environment and call the NestJS API in a container, tracing correlation IDs will be lost unless a standard trace propagation header (like W3C `traceparent`) is explicitly injected and parsed at each gateway.
- **No Tenant Metrics**: Monitoring dashboards lack `branchId` and `franchiseId` tags, making it impossible to identify performance drops at specific physical locations.

---

## SECTION 8: Security Audit

### 8.1 Security Vulnerabilities

- **Broken Object Level Authorization (BOLA)**: The SSE route `/api/v1/orders/:id/track` is vulnerable if authorization logic only checks for an active session without verifying that the caller's user ID matches the order owner's user ID.
- **Denial of Wallet (DoW)**: The SMS/WhatsApp notification gateway lacks rate limiting on requests, allowing bad actors to spam the registration routes and exhaust Twilio balances.

---

## SECTION 9: Performance Audit

### 9.1 Performance Bottlenecks

- **Server Action Network Chains**: Direct reliance on chains (Client -> Next.js Server Action -> NestJS Controller -> Prisma DB) adds 150-300ms of latency due to multiple network hops, making it difficult to meet the LCP < 2s target.
- **No Edge Caching**: Pricing calculations are evaluated dynamically on every request instead of utilizing edge cache keys (such as `branch-menu-{id}`).

---

## SECTION 10: Production Readiness Risk Assessment

```
🔥 CRITICAL RISKS
─────────────────────────────────────────────────────────────────────────────
1. Shared Schema & Database Model
   * Impact: High (If a single franchise table locks, it blocks all branches)
   * Probability: High (As data grows, table lock contention will increase)
   * Mitigation: Separate transactional databases per franchise; aggregate data
                 via CDC/ETL into an analytical data warehouse.

2. NextAuth Bypassing Database Security (RLS)
   * Impact: Critical (Data exposure across branches and franchise boundaries)
   * Probability: High (Prisma database connections use single root credentials)
   * Mitigation: Establish session context variables in the database before
                 running queries: "SET LOCAL app.current_user_role = ..."

⚡ HIGH RISKS
─────────────────────────────────────────────────────────────────────────────
3. Redis Out-Of-Memory Job Loss (BullMQ)
   * Impact: High (Customers lose loyalty points; payment updates fail)
   * Probability: Medium (Redis memory configuration defaults)
   * Mitigation: Run a dedicated Redis cluster for BullMQ queues with persistence
                 enabled (AOF/RDB) and disable key eviction policies.
```

---

## SECTION 11: Final Audit Deliverables

### 11.1 Architecture Score: 68 / 100

- **Strengths**: Solid modular design, clear domain separation, and a comprehensive database schema.
- **Weaknesses**: DB-level coupling across domains, security gaps in edge auth handling, and lack of transaction rollback mechanisms (Sagas) for event failures.

### 11.2 Refactoring Recommendations

1. **Isolate Database Contexts**: Implement a multi-tenant database router. Route requests to branch-specific or franchise-specific databases dynamically based on host headers or JWT payloads.
2. **Static Price Snapshotting**: Immediately refactor the `OrderItem` database model to snapshot product attributes during checkouts.
3. **Decouple NextAuth**: Implement a central Auth Service in NestJS. Treat Next.js as a presentation client that delegates credential validation to NestJS.
4. **Implement Saga Orchestration**: Add a saga orchestrator in the application layer to coordinate transactions across Ordering, Reservations, and Loyalty domains.

### 11.3 Production Readiness Score: 55 / 100

- **Must-Fix**: Deploy database partitioning keys, establish database session contexts to enforce row-level security (RLS), configure dedicated Redis instances for BullMQ queues, and set up trace ID propagation across all services.
