# ☕ Warkop Ya'reh — Monorepo Platform

![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?style=flat-square&logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9.0.0-F69220?style=flat-square&logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)

> **A Premium, Design-Driven Community Specialty Coffee Shop & Coworking Ecosystem**
> Premium Indonesian coffee culture ("Warkop") meets state-of-the-art digital experiences. Featuring dynamic, fluid UI/UX, glassmorphism, and immersive micro-animations, tailored for developers, creators, and professionals in Surabaya to deliver absolute maximum user satisfaction.

> [!IMPORTANT]
> **Official Project Documentation**:
>
> - **[Product Requirements Document (PRD)](file:///d:/MY%20CODE/ANTIGRAVITY/01-production/warkop-yareh/PRD.md)**
> - **[Design System Guide](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/DESIGN_SYSTEM.md)**
> - **[Enterprise Architecture Blueprint](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/ENTERPRISE_ARCHITECTURE.md)**
> - **[Enterprise Architecture Audit](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/architecture/enterprise_audit.md)**
> - **[Technology Stack Specifications](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/TECH_STACK.md)**
> - **[Local Development Guide](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/DEVELOPMENT_GUIDE.md)**
> - **[Product & Tech Roadmap](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/ROADMAP.md)**
> - **[Architecture Decision Records (ADR)](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/docs/ADR/)**

---

## ✨ Key Features at a Glance

- 🏢 **Multi-Branch Architecture**: Manage independent stores, localized menus, and operating hours.
- 📱 **Omnichannel Ordering**: Seamlessly process pickup and in-store table orders.
- 💳 **Local Payments**: Native Midtrans integration for GoPay, ShopeePay, and QRIS.
- 🤝 **Community Hub**: Built-in forums and event reservations for developer meetups and communities.
- 🏆 **Loyalty Ecosystem**: Automated points, tiers, and rewards system for returning customers.

---

## 🧭 Table of Contents

1. [Official Project Documentation](#official-project-documentation)
2. [System Architecture](#️-system-architecture)
3. [Monorepo Structure](#-monorepo-structure)
4. [Technology Stack](#️-technology-stack)
5. [Domain Modules & Features](#-domain-modules--features)
6. [Database Schema Overview](#️-database-schema-overview)
7. [Getting Started](#-getting-started)
8. [Development Commands](#-development-commands)
9. [Deployment & Infrastructure](#-deployment--infrastructure)
10. [Design Guidelines](#-design-guidelines)

---

## 🏛️ System Architecture

Warkop Ya'reh is engineered as a modern, high-performance monorepo utilizing **pnpm workspaces** and **Turborepo**. The ecosystem separates the customer-facing frontend, administrative dashboards, and backend services into distinct, reusable layers.

```mermaid
graph TD
    %% Frontend Applications
    A[apps/web<br/>Next.js 16 / React 19] -->|Consumes| D[packages/types]
    A -->|Authentication| E[packages/auth]
    A -->|Validates| F[packages/validation]
    A -->|UI Elements| G[packages/ui]

    B[apps/admin<br/>Next.js 16 / React 19] -->|Consumes| D
    B -->|Authentication| E
    B -->|UI Elements| G

    %% Backend Services
    C[apps/api<br/>NestJS 11] -->|Consumes| D
    C -->|Validates| F
    C -->|Database Access| H[packages/database<br/>Prisma Client]

    %% Middleware & Cache
    C -->|Job Queuing| I[(Redis / BullMQ)]
    C -->|Payment Processing| J[Midtrans Gateway]

    %% Databases
    H -->|Reads/Writes| K[(PostgreSQL Neon)]
```

### Backend Architecture Strategy

The NestJS API (`apps/api`) implements **Domain-Driven Design (DDD)** combined with a **Clean/Hexagonal Architecture** pattern, enforcing a strict separation of concerns:

- **Domain**: Core entities, interfaces, value objects, and business rules isolated from any external libraries.
- **Application**: Application services, use cases, CQRS commands/queries, and domain event handlers.
- **Infrastructure**: Concrete implementations of databases (Prisma repositories), redis caching, third-party wrappers (Midtrans payment Client), and message queues (BullMQ).
- **Presentation**: REST API controllers, Request interceptors, guards, and custom middleware.

---

## 📂 Monorepo Structure

The workspace follows a strict Turborepo architecture:

```lisptemplate
warkop-yareh/
├── 📱 apps/
│   ├── web/                  # Customer-facing Next.js App Router (Port 3000)
│   ├── admin/                # Back-office admin portal Next.js App Router (Port 3001)
│   └── api/                  # NestJS Clean Architecture REST API (Port 4000)
├── 📦 packages/
│   ├── database/             # Prisma schema, migrations, and database client wrapper
│   ├── auth/                 # Auth.js (NextAuth) shared auth providers and adapters
│   ├── types/                # Unified TypeScript interfaces and DTOs
│   ├── validation/           # Zod-based request validation schemas
│   ├── ui/                   # Shared UI component library
│   ├── config/               # Linting, formatting, and TS configurations
│   ├── shared/               # Shared general utility functions
│   └── analytics/            # Unified analytics calculations
├── ⚙️ infra/
│   ├── docker/               # Local infrastructure (PostgreSQL & Redis containers)
│   ├── terraform/            # Infrastructure as Code (IaC) files
│   └── github-actions/       # CI/CD pipeline declarations
├── 📄 README.md                 # System overview and getting started guide
└── 🎨 DESIGN.md                 # Typography, palettes, and design token configurations
```


---

## 🛠️ Technology Stack

| Layer                  | Technology                                                     | Version     | Description                                           |
| :--------------------- | :------------------------------------------------------------- | :---------- | :---------------------------------------------------- |
| **Monorepo Manager**   | [Turborepo](https://turbo.build/)                              | `^2.0.0`    | Build orchestration & cache pipeline                  |
| **Package Manager**    | [pnpm](https://pnpm.io/)                                       | `9.0.0`     | Workspace workspace symlinks and package isolation    |
| **Frontend Framework** | [Next.js](https://nextjs.org/)                                 | `16.2.7`    | App Router, SSR, React Server Components              |
| **UI Library**         | [React](https://react.dev/)                                    | `19.2.4`    | Virtual DOM rendering with Server Actions             |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com/)                       | `^4.0.0`    | Native CSS custom variables design framework          |
| **Animation Engine**   | [Framer Motion](https://www.framer.com/motion/)                | `^11.0.0`   | Fluid, physics-based micro-animations & transitions   |
| **State Management**   | [Zustand](https://github.com/pmndrs/zustand)                   | `^5.0.14`   | Client state store with persistence middleware        |
| **Query Engine**       | [React Query](https://tanstack.com/query)                      | `^5.101.0`  | Server-state caching and synchronization              |
| **Backend Framework**  | [NestJS](https://nestjs.com/)                                  | `^11.0.0`   | Modular, progressive TypeScript backend               |
| **ORM**                | [Prisma](https://www.prisma.io/)                               | `Latest`    | PostgreSQL type-safe schema modeling                  |
| **Database**           | [PostgreSQL](https://www.postgresql.org/)                      | `15`        | Relational storage (Neon serverless for staging/prod) |
| **Cache & Queue**      | [Redis](https://redis.io/) / [BullMQ](https://docs.bullmq.io/) | `7.x / 5.x` | Event queues, background worker tasks, and caching    |
| **Payment Gateway**    | [Midtrans](https://midtrans.com/)                              | `^1.4.3`    | Indonesian payment processing                         |

---

## 🧩 Domain Modules & Features

The Warkop Ya'reh platform supports a rich ecosystem combining food-ordering, community engagements, and loyalty-perks.

### 🛡️ 1. Authentication & Role-Based Access (RBAC)

- Multi-tier system: `CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`, and `OWNER`.
- Shared NextAuth adapters linked to the Prisma database backend.

### 📍 2. Branch Management

- Branch-specific operating hours, seating capacity, geo-coordinates, and customized menus.
- Supports Surabaya-based locations (e.g., Darmo flagship, Dharmahusada branch).

### 🍔 3. Product Catalog & Customization

- Categories: Coffee, Non-Coffee, Food, Snacks, Desserts, Tea.
- Flexible pricing overrides per branch.
- JSON-based customizations (e.g., Sweetness, Ice levels, Milk preferences).

### 🛒 4. Order Engine & Payments

- Pickup orders and in-store table orders.
- Direct integration with **Midtrans Payment Gateway** for Indonesian local payment methods (GoPay, ShopeePay, Virtual Accounts).
- Real-time order status tracking: `PENDING` ➡️ `CONFIRMED` ➡️ `PREPARING` ➡️ `READY` ➡️ `COMPLETED` ➡️ `CANCELLED`.

### 📅 5. Table Reservations

- Table allocations based on type: `INDOOR`, `OUTDOOR`, `VIP`, and `MEETING_ROOM`.
- Availability checks by slot capacity.

### 👥 6. Events & Community Hub

- Branch-centric community events (e.g., Developer Meetups, Acoustic Nights, Latte Art Championships).
- Community Groups: Developer clubs, writer guilds, and boardgame social networks.
- User posts, comment threads, and likes within localized spaces.

### 🏆 7. Loyalty Rewards & Referral Network

- Tier classifications: `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`.
- Loyalty points transaction tracking (`EARNED`, `REDEEMED`, `EXPIRED`, `BONUS`, `REFERRAL`).
- In-app store to swap points for rewards (e.g., Free Coffee, Coworking Day Passes, Event space rentals).

---

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Reservation : makes
    User ||--o{ EventRegistration : registers
    User ||--o{ LoyaltyTransaction : transacts
    User ||--o{ CommunityMembership : joins
    User ||--o{ CommunityPost : writes
    User ||--o{ Review : submits

    Branch ||--o{ User : registers_to
    Branch ||--o{ BranchProduct : hosts
    Branch ||--o{ Table : contains
    Branch ||--o{ Order : fulfills
    Branch ||--o{ Reservation : manages
    Branch ||--o{ Event : hosts

    Product ||--o{ ProductCustomization : configures
    Product ||--o{ BranchProduct : tracks
    Product ||--o{ OrderItem : details
    Product ||--o{ Review : receives

    Order ||--|{ OrderItem : contains
    OrderItem }|--|| Product : references

    Table ||--o{ Reservation : schedules
    Event ||--o{ EventRegistration : enrolls

    CommunityGroup ||--o{ CommunityMembership : enrolls
    CommunityGroup ||--o{ CommunityPost : hosts
```

Key models defined in [schema.prisma](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/packages/database/prisma/schema.prisma):

- **User**: Stores profiles, roles, loyalty points, and tier statuses.
- **Branch**: Stores physical store attributes, location data, and hours.
- **Product**: Holds standard info like pricing, calories, preparation times, and categorizations.
- **BranchProduct**: A bridge table that overrides product prices and tracks items' physical availability.
- **Order / OrderItem**: Processes payments, tracks items, and logs point payouts.
- **Reservation / Table**: Schedules in-person workspace bookings.
- **Event / EventRegistration**: Collects data on community gatherings.
- **CommunityGroup / CommunityMembership / CommunityPost**: Power social networks.
- **LoyaltyTransaction / Reward**: Catalogs transactions and rewards.

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: `v20.x` or higher
2. **Package Manager**: `pnpm` (run `corepack enable` or `npm install -g pnpm`)
3. **Docker**: Running engine for local databases

### Step 1: Clone and Install

```bash
git clone https://github.com/your-username/warkop-yareh.git
cd warkop-yareh
pnpm install
```

### Step 2: Spin Up Infrastructure

Run local PostgreSQL and Redis databases using Docker:

```bash
cd infra/docker
docker-compose up -d
```

This boots up:

- **PostgreSQL** on `localhost:5432` (User: `postgres`, Password: `password`, DB: `warkop_yareh`)
- **Redis** on `localhost:6379`

### Step 3: Configure Environment Variables

Create `.env` files in:

1. `apps/web/.env.local`
2. `apps/api/.env`
3. `packages/database/.env`

Example environment variables:

```env
# Database Settings
DATABASE_URL="postgresql://postgres:password@localhost:5432/warkop_yareh?schema=public"

# Redis Config
REDIS_URL="redis://localhost:6379"

# Next Auth (Web)
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

# Midtrans Settings
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_IS_PRODUCTION=false
```

### Step 4: Seed the Database

Deploy Prisma schemas and insert seed tables:

```bash
pnpm --filter @warkop-yareh/database db:push
pnpm --filter @warkop-yareh/database db:seed
```

### Step 5: Start Development Server

```bash
# Start all apps & packages concurrently
pnpm dev
```

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **Admin App**: [http://localhost:3001](http://localhost:3001)

---

## 💻 Development Commands

The workspace leverages Turborepo targets defined in [turbo.json](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/turbo.json):

```bash
# Build production bundles for all apps
pnpm build

# Launch hot-reloading dev environment
pnpm dev

# Check syntax and fix ESLint errors
pnpm lint

# Format code using Prettier configuration
pnpm format

# Flush Turborepo cache and remove node_modules
pnpm clean
```

For app-specific processes, append the `--filter` option:

```bash
# Run NestJS API in debug mode
pnpm --filter @warkop-yareh/api start:debug

# Run unit tests on API
pnpm --filter @warkop-yareh/api test
```

---

## 🌐 Deployment & Infrastructure

The project includes pre-configured assets under `infra/` for robust operations:

- **Terraform**: Provisioning specifications for Google Cloud Platform (GCP) or AWS, hosting Next.js instances, NestJS on cloud runners, Neon PostgreSQL database mappings, and Upstash/ElastiCache instances.
- **GitHub Actions**: Configured pipelines executing parallel checkouts, package installs, syntax lint checks, and testing before deploying builds directly to production runners.

---

## 🎨 Design Guidelines

Refer to [DESIGN.md](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/DESIGN.md) for typography guidelines, color values, custom Tailwind theme properties, and standard layout styles.
# warkop-yareh
