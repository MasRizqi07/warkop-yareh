# 🛠️ Technology Stack Specifications

## Project: Warkop Ya'reh Digital Platform

This document describes the unified technology stack across the monorepo workspaces of the Warkop Ya'reh platform.

---

## 1. Stack Matrix Overview

| Layer            | Component                 | Choice              | Version    | Description                                  |
| :--------------- | :------------------------ | :------------------ | :--------- | :------------------------------------------- |
| **Monorepo**     | Build Orchestration       | **Turborepo**       | `^2.0.0`   | Orchestrates dependencies & caching tasks    |
|                  | Workspace Package Manager | **pnpm**            | `9.0.0`    | Secure symlinks & cache optimizations        |
| **Frontend**     | Framework                 | **Next.js**         | `15.2.7`   | App Router, React Server Components (RSC)    |
|                  | Core Library              | **React**           | `19.2.4`   | Server Actions, rendering optimization       |
|                  | State Management          | **Zustand**         | `^5.0.14`  | Client-side state store                      |
|                  | Server State Cache        | **TanStack Query**  | `^5.101.0` | Synced query caching for server hooks        |
|                  | Styling                   | **Tailwind CSS**    | `^4.0.0`   | CSS custom properties styling system         |
|                  | Interactions              | **Framer Motion**   | `^12.40.0` | Micro-animations and layout spring fades     |
| **Backend**      | API Engine                | **NestJS**          | `^11.0.0`  | Clean architecture MVC framework             |
|                  | Database Client           | **Prisma**          | `^5.10.0`  | Object-Relational Mapping (ORM) client       |
| **Data & Queue** | Core Database             | **PostgreSQL**      | `15`       | Relational storage (Neon serverless)         |
|                  | Cache Manager             | **Redis**           | `7.x`      | User session store, queue backend            |
|                  | Job Queue Broker          | **BullMQ**          | `^5.78.0`  | Redis-backed asynchronous worker queues      |
| **Integrations** | Payments                  | **Midtrans Client** | `^1.4.3`   | Indonesian e-wallets, virtual bank transfers |
|                  | Object Storage            | **Cloudflare R2**   | Standard   | S3-compatible media file storage             |
| **Monitoring**   | Observability APIs        | **OpenTelemetry**   | `^1.21.0`  | Standard request trace collections           |
|                  | Error Diagnostics         | **Sentry**          | `^8.0.0`   | Error logging and crash reports              |
|                  | Product Analytics         | **PostHog**         | `^1.100.0` | Funnel conversion and cohort analysis        |

---

## 2. Infrastructure Mappings

### 2.1 Workspace Declarations (`pnpm-workspace.yaml`)

We isolate libraries and applications into workspaces to ensure compile-time isolation:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2.2 Client-Edge Infrastructure

- **Next.js at the Edge (Vercel)**: Next.js is deployed closer to the user to optimize initial document loads.
- **NestJS on ECS Fargate (AWS)**: The core API and workers are packaged in Docker container configurations and hosted on auto-scaling clusters behind load balancers.
- **Serverless Storage (Neon DB)**: Leverages autoscaling compute nodes that scale down to zero when idle, reducing operational costs for franchise operators.

---

## 3. Technology Rationale

1. **Turborepo & pnpm**: Dramatically reduces CI build and deployment runtimes by caching outputs. Prevents workspace package cross-contamination.
2. **Next.js 15 + React 19**: Server Components render HTML on the server, minimizing client-side JavaScript execution to achieve LCP < 2.0s.
3. **NestJS 11**: Provides an structured architecture (Domain, Application, Infrastructure, Presentation) suitable for DDD and Clean Architecture.
4. **BullMQ & Redis**: Lightweight, highly efficient background queuing system. Avoids the operational cost of managing a full Kafka cluster in the early launch phases.
5. **Neon Serverless PostgreSQL**: Eliminates database sizing administration tasks for multi-branch layouts while supporting PostgreSQL features (RLS, window functions).
6. **Google Gemini integration**: Selected to power the AI concierge and recommendation subsystems. Gemini provides favorable latency metrics for Indonesian network paths, low cost per token, and strong local contextual language parsing.

---

## 4. API & Communication Contracts (Audited)

- **REST Interface**: The communication layer uses REST APIs. Client-server requests transmit JSON payloads. Next.js Server Actions execute on the server and proxy commands directly to the backend REST API endpoints.
- **API Documentation**: NestJS generates dynamic OpenAPI 3.1 schemas using `@nestjs/swagger`. Typescript DTOs are mapped to schemas automatically, ensuring API contracts stay synced.

---

## 5. Testing Stack Specifications (Audited)

To guarantee system stability, we enforce the following testing tools:

1. **Unit Testing**: **Vitest** is our default runner for frontend packages and NestJS domains, offering fast execution and native ESM support.
2. **Integration Testing**: We test database repository calls and event handlers using **Testcontainers** to orchestrate temporary PostgreSQL and Redis Docker containers on local machines.
3. **End-to-End (E2E) Testing**: **Playwright** is configured to run automated browser scripts validating checkout payment flows (mocking Midtrans callbacks) and table reservation success paths.
4. **API Testing**: **Supertest** is used in NestJS mock servers to execute controller integration checks.
