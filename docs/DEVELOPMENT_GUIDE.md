# 💻 Local Development Guide

## Project: Warkop Ya'reh Digital Platform

This document describes the onboarding, setup, and testing procedures for developers working in the **Warkop Ya'reh** monorepo workspace.

---

## 1. Local Machine Requirements

Before beginning local setup, verify you have installed:

1. **Node.js**: `v20.x` or higher
2. **pnpm**: `v9.0.0` or higher
3. **Docker Engine / Desktop**: For running local databases
4. **Git**: Core version control

---

## 2. Onboarding Setup Procedure

### Step 2.1: Clone and Workspace Initialization

```bash
git clone https://github.com/your-username/warkop-yareh.git
cd warkop-yareh
pnpm install
```

### Step 2.2: Infrastructure Spin Up

Launch the local PostgreSQL database and Redis cluster containers:

```bash
cd infra/docker
docker-compose up -d
```

This deploys:

- **PostgreSQL** on `localhost:5432` (User: `postgres`, Password: `password`, DB: `warkop_yareh`)
- **Redis** on `localhost:6379`

### Step 2.3: Configure Local Environment Variables

Create `.env` files in:

1. `apps/web/.env.local`
2. `apps/api/.env`
3. `packages/database/.env`

Example variables config (`apps/api/.env`):

```env
# Relational DB Url
DATABASE_URL="postgresql://postgres:password@localhost:5432/warkop_yareh?schema=public"

# Redis Cache broker url
REDIS_URL="redis://localhost:6379"

# Midtrans configuration values (Sandbox Mode)
MIDTRANS_CLIENT_KEY="your-sandbox-client-key"
MIDTRANS_SERVER_KEY="your-sandbox-server-key"
MIDTRANS_IS_PRODUCTION=false

# CORS Allowed Origin
CORS_ALLOWED_ORIGIN="http://localhost:3000"
```

### Step 2.4: Sync Schema and Database Seed

Push the Prisma schemas directly to your local database container and populate initial configurations:

```bash
pnpm --filter @warkop-yareh/database db:push
pnpm --filter @warkop-yareh/database db:seed
```

---

## 3. Daily Command Matrix (Audited)

Run commands using Turborepo filters:

### 3.1 Development & Build

```bash
# Start all apps & packages concurrently
pnpm dev

# Build production bundles for all apps
pnpm build

# Run formatting with Prettier
pnpm format

# Scan for ESLint errors
pnpm lint
```

### 3.2 Testing Commands (H-01 Audit Fix)

To maintain our target **80% coverage threshold**, run:

```bash
# Execute unit tests using Vitest across workspaces
pnpm test

# Run database integration tests using Testcontainers
pnpm --filter @warkop-yareh/database test:integration

# Run Playwright E2E customer journey browser scripts
pnpm --filter @warkop-yareh/web test:e2e

# Run API contract validation tests using Supertest
pnpm --filter @warkop-yareh/api test:api
```

---

## 4. Git, Hooks & Database Migrations (Audited)

### 4.1 Pre-commit Hooks (L-02 Audit Fix)

We enforce formatting and linting gates on commit using **Husky** and **lint-staged**:

- To setup hooks locally:
  ```bash
  pnpm husky install
  ```
- Every `git commit` triggers a staged lint scan. Files with failures will block the commit until resolved.

### 4.2 Zero-Downtime Database Migrations (L-04 Audit Fix)

As the schema grows, database migrations must utilize the **Expand-Contract (Parallel Change)** pattern to prevent operational downtime:

1. **Expand**: Deploy schema additions (e.g. adding a new table or nullable column) using `prisma migrate deploy`.
2. **Transition**: Deploy updated application code to write to both the old and new columns.
3. **Contract**: Deploy code reading only from the new column, then execute a final migration to safely drop the deprecated database elements.

---

## 5. API Gateway Versioning & CORS (Audited)

### 5.1 API Versioning Path (L-03 Audit Fix)

NestJS handles URI path versioning:

- Core path: `/api/v1/...` (e.g. `/api/v1/orders`).
- Route deprecation is announced by adding standard `Sunset` and `Deprecation` timestamps to endpoint response headers, ensuring legacy frontend clients do not break during API contracts changes.

### 5.2 Local CORS Configurations (H-05 Audit Fix)

To prevent cross-origin request blockages, developers must map local environments to allow:

- **Allowed Origin**: `http://localhost:3000` (Customer web) and `http://localhost:3001` (Admin panel).
- **Allowed Headers**: `Content-Type`, `Authorization`, and `x-branch-id`.
- **Allow Credentials**: `true` is mandated to allow JWT cookies.

---

## 6. Secrets Management Strategy (L-01 Audit Fix)

- **Local Development**: Strictly managed through local `.env` files (git-ignored).
- **Staging & Production**: Secrets (such as database credentials, JWT signer keys, and Midtrans credentials) are managed in **AWS Secrets Manager** (or GCP Secret Manager). Variables are dynamically injected into ECS Fargate containers during task launches, preventing raw secrets leakage in GitHub checkouts.

---

## 7. CI/CD Deployment Pipelines (H-03 Audit Fix)

We utilize GitHub Actions to build, test, and deploy applications in the monorepo.

- **Pipeline Flow (Branch PR ➡️ main)**:
  1. **Build Gate**: Enforces parallel build checks across workspaces using Turborepo caches (`pnpm build`).
  2. **Test Gate**: Runs Vitest suite, integration test containers, and ESLint scans. Failures block merges.
  3. **Frontend Deploy**: Changes in `apps/web` or `apps/admin` auto-trigger Vercel production deployment updates.
  4. **API Container Build**: Merges to `main` compile the API into a Docker image, scan dependencies for vulnerabilities using Snyk, and push the image to AWS ECR.
  5. **Fargate Promotion**: Triggers a Blue-Green deployment on AWS ECS, promoting traffic only after passing target health status checks.

---

## 8. Troubleshooting FAQ (L-06 Audit Fix)

#### Q1: Docker database port conflict (`5432` or `6379` already in use)

- **Cause**: A local PostgreSQL or Redis service is already running on your host machine.
- **Fix**: Stop the local host services using `sudo systemctl stop postgresql` (Linux) or by stopping local SQL servers on Windows before launching `docker-compose up -d`.

#### Q2: Prisma database client schema drift

- **Cause**: Your local database schema is out of sync with Prisma models after pulling git changes.
- **Fix**: Execute `pnpm --filter @warkop-yareh/database db:push` to sync schemas without erasing existing tables.

#### Q3: PNPM workspace dependency resolution errors

- **Cause**: Stale lockfiles or cached package conflicts.
- **Fix**: Run `pnpm clean` to erase all local `node_modules` folders, then execute `pnpm install` at the root directory to rebuild clean symlinks.
