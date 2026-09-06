# 🏛️ System Architecture — Warkop Ya'reh Digital Ecosystem

> **Status:** Source-aligned architecture plus target deployment topology. Provider-specific infrastructure in this document requires separate staging/production evidence.

## 1. High-Level Architecture (C4 Context Diagram)

```mermaid
graph TD
    subgraph Users["👥 Users"]
        Customer["Customer<br/>(Mobile/Desktop Browser)"]
        Staff["Staff/Barista<br/>(Tablet/Desktop)"]
        Manager["Branch Manager<br/>(Desktop)"]
        Owner["Franchise Owner<br/>(Desktop)"]
    end

    subgraph Edge["☁️ Edge Layer"]
        CDN["Cloudflare CDN<br/>+ WAF + DDoS Protection"]
    end

    subgraph Frontend["🖥️ Frontend Applications"]
        Web["apps/web<br/>Next.js 16 (Vercel)<br/>Customer Portal"]
        Admin["apps/admin<br/>Next.js 16 (Vercel)<br/>Admin Dashboard"]
    end

    subgraph Backend["⚙️ Backend Services"]
        API["apps/api<br/>NestJS 11 (ECS Fargate)<br/>REST API Server"]
    end

    subgraph Data["💾 Data Layer"]
        DB["PostgreSQL 15<br/>(Neon Serverless)<br/>Primary Database"]
        Redis["Redis 7<br/>(Upstash)<br/>Cache + Queue Backend"]
        R2["Cloudflare R2<br/>Object Storage"]
    end

    subgraph External["🔌 External Services"]
        Midtrans["Midtrans<br/>Payment Gateway"]
        Gemini["Google Gemini<br/>AI API (Phase 3)"]
        Sentry["Sentry<br/>Error Tracking"]
        PostHog["PostHog<br/>Product Analytics"]
    end

    Customer --> CDN
    Staff --> CDN
    Manager --> CDN
    Owner --> CDN
    CDN --> Web
    CDN --> Admin
    Web -->|"Server Actions (BFF)"| API
    Admin -->|"Server Actions (BFF)"| API
    API --> DB
    API --> Redis
    API --> R2
    API --> Midtrans
    API --> Gemini
    API --> Sentry
    Web --> PostHog
```

---

## 2. Container Diagram

```mermaid
graph LR
    subgraph Monorepo["📦 Turborepo Monorepo"]
        subgraph Apps["apps/"]
            WEB["web<br/>Next.js 16<br/>Port 3000"]
            ADMIN["admin<br/>Next.js 16<br/>Port 3001"]
            API["api<br/>NestJS 11<br/>Port 4000"]
        end
        subgraph Packages["packages/"]
            UI["ui<br/>Shared Components"]
            DB["database<br/>Prisma Client"]
            TYPES["types<br/>Shared Interfaces"]
            VAL["validation<br/>Zod Schemas"]
            SHARED["shared<br/>Utilities"]
            CONFIG["config<br/>ESLint/TS Config"]
            ANALYTICS["analytics<br/>Calculation Lib"]
        end
    end

    WEB --> UI
    WEB --> TYPES
    WEB -->|"JWT + HttpOnly refresh cookie"| API
    WEB --> VAL
    ADMIN --> UI
    ADMIN --> TYPES
    ADMIN -->|"JWT + HttpOnly refresh cookie"| API
    API --> DB
    API --> TYPES
    API --> VAL
    API --> SHARED
```

---

## 3. Component Diagram (NestJS Modules)

```mermaid
graph TD
    subgraph AppModule["AppModule (Root)"]
        subgraph Infra["🔧 Infrastructure Layer"]
            DatabaseModule["DatabaseModule<br/>(PrismaService)"]
            RedisModule["RedisModule<br/>(IoRedis)"]
            QueueModule["QueueModule<br/>(BullMQ)"]
            AuthModule["AuthModule<br/>(JWT + Passport)"]
            PaymentModule["PaymentModule<br/>(Midtrans)"]
        end

        subgraph Domains["🏢 Domain Modules"]
            IdentityModule["IdentityModule"]
            CatalogModule["CatalogModule"]
            OrderingModule["OrderingModule"]
            ReservationModule["ReservationModule"]
            EventModule["EventModule"]
            CommunityModule["CommunityModule"]
            LoyaltyModule["LoyaltyModule"]
            AnalyticsModule["AnalyticsModule"]
            BranchModule["BranchModule"]
            FranchiseModule["FranchiseModule"]
        end
    end

    IdentityModule --> DatabaseModule
    IdentityModule --> AuthModule
    CatalogModule --> DatabaseModule
    OrderingModule --> DatabaseModule
    OrderingModule --> PaymentModule
    OrderingModule --> QueueModule
    ReservationModule --> DatabaseModule
    EventModule --> DatabaseModule
    CommunityModule --> DatabaseModule
    LoyaltyModule --> DatabaseModule
    LoyaltyModule --> QueueModule
    AnalyticsModule --> DatabaseModule
    AnalyticsModule --> RedisModule
    BranchModule --> DatabaseModule
    FranchiseModule --> DatabaseModule
```

---

## 4. Deployment Diagram

```mermaid
graph TD
    subgraph Production["🌐 Production Environment"]
        subgraph Vercel["Vercel (Edge Network)"]
            WebDeploy["apps/web<br/>Serverless Functions<br/>+ Static Assets"]
            AdminDeploy["apps/admin<br/>Serverless Functions<br/>+ Static Assets"]
        end

        subgraph AWS["AWS"]
            subgraph ECS["ECS Fargate Cluster"]
                APIContainer1["API Container 1"]
                APIContainer2["API Container 2"]
                APIContainerN["API Container N"]
            end
            ALB["Application<br/>Load Balancer"]
        end

        subgraph Managed["Managed Services"]
            NeonDB["Neon PostgreSQL<br/>(Auto-scaling)"]
            NeonReplica["Neon Read Replica<br/>(Phase 3)"]
            Upstash["Upstash Redis<br/>(Serverless)"]
            R2Store["Cloudflare R2<br/>(S3-compatible)"]
        end

        CF["Cloudflare<br/>WAF + CDN + DNS"]
    end

    CF --> WebDeploy
    CF --> AdminDeploy
    CF --> ALB
    ALB --> APIContainer1
    ALB --> APIContainer2
    ALB --> APIContainerN
    APIContainer1 --> NeonDB
    APIContainer2 --> NeonDB
    APIContainerN --> NeonDB
    NeonDB --> NeonReplica
    APIContainer1 --> Upstash
    APIContainer1 --> R2Store
```

---

## 5. Data Flow Architecture

```mermaid
sequenceDiagram
    participant C as Customer Browser
    participant V as Vercel (Next.js)
    participant A as NestJS API
    participant DB as PostgreSQL
    participant R as Redis
    participant Q as BullMQ Worker
    participant M as Midtrans

    C->>V: Place Order (Server Action)
    V->>A: POST /api/v1/orders (JWT + x-branch-id)
    A->>A: Validate & Authorize (Guards)
    A->>DB: BEGIN Transaction
    A->>DB: Create Order + Snapshot Prices
    A->>DB: Insert OutboxEvent(OrderCreated)
    A->>DB: COMMIT
    A->>M: Create Payment Intent
    M-->>A: Payment URL
    A-->>V: { orderId, paymentUrl }
    V-->>C: Redirect to Payment

    Note over Q: Outbox Relayer (5s poll)
    Q->>DB: Fetch unprocessed OutboxEvents
    Q->>R: Publish to BullMQ
    Q->>DB: Mark events as processed

    M->>A: Webhook: Payment Success
    A->>DB: Update Order status = PAID
    A->>DB: Insert OutboxEvent(OrderPaid)

    Note over Q: OrderPaid Consumer
    Q->>DB: Award Loyalty Points
    Q->>DB: Create Notification
```
