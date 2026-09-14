# Deployment Guide
# Deployment Guide — Warkop Ya'reh

## Row-Level Security (RLS) Configuration
## 1. Deployment Architecture

This application uses PostgreSQL Row-Level Security (RLS) to strictly isolate tenant (branch) data. 
The Warkop Ya'reh platform uses a decoupled, cloud-native deployment strategy:

| Component | Target Platform | Runtime / Build Engine | Environment Type |
|---|---|---|---|
| `apps/web` (Customer Portal) | **Vercel** | Next.js 16 / React 19 (Node 24) | Preview / Staging & Production |
| `apps/admin` (Back-Office Portal) | **Vercel** | Next.js 16 / React 19 (Node 24) | Preview / Staging & Production |
| `apps/api` (Backend REST API) | **Railway** | Multi-stage Dockerfile (`node:24-alpine`) | Staging & Production |
| Database | **PostgreSQL (Neon / Managed PG)** | PostgreSQL 16+ with RLS enabled | Staging & Production |
| Cache & Queue | **Redis (Upstash / Managed Redis)** | Redis 7+ for BullMQ & Caching | Staging & Production |

---

## 2. GitHub Secrets Configuration Matrix

To enable automated CD delivery via `.github/workflows/cd.yml`, configure the following secrets in **GitHub Repository Settings > Secrets and variables > Actions**:

### A. Vercel Secrets (Web & Admin Frontends)

| Secret Name | Description | How to Obtain |
|---|---|---|
| `VERCEL_TOKEN` | Personal access token with deploy permissions | Vercel Dashboard → Account Settings → Tokens → Create Token (Scope: Full Account or Team). |
| `VERCEL_ORG_ID` | Vercel Organization or User ID | Run `npx vercel link` locally or check `.vercel/project.json` (`orgId`), or inspect Team Settings in Vercel Dashboard. |
| `VERCEL_PROJECT_ID_WEB` | Project ID for `apps/web` | Vercel Dashboard → Select `apps/web` project → Settings → General → Project ID. |
| `VERCEL_PROJECT_ID_ADMIN` | Project ID for `apps/admin` | Vercel Dashboard → Select `apps/admin` project → Settings → General → Project ID. |

### B. Railway Secrets (NestJS API Service)

| Secret Name | Description | How to Obtain |
|---|---|---|
| `RAILWAY_TOKEN` | API token with deploy permissions | Railway Dashboard → Account Settings → Tokens → Create Token. |
| `RAILWAY_SERVICE_ID_API_STAGING` | Service ID for API staging service | Railway Dashboard → Select Staging Project → Click API Service → Settings → Service ID. |
| `RAILWAY_SERVICE_ID_API_PROD` | Service ID for API production service | Railway Dashboard → Select Production Project → Click API Service → Settings → Service ID. |

### C. Application Runtime Secrets (Configured on Host Platforms)

Configure these environment variables directly in the Vercel and Railway dashboard project settings:

| Variable Name | Target | Purpose |
|---|---|---|
| `DATABASE_URL` | Railway & Migration runner | Connection string `postgresql://user:pass@host:port/dbname?sslmode=require` |
| `REDIS_URL` | Railway API | Connection string `rediss://default:pass@host:port` |
| `JWT_SECRET` | Railway API | Min 32 chars random string (`openssl rand -base64 48`) |
| `JWT_REFRESH_SECRET` | Railway API | Min 32 chars distinct random string |
| `NEXT_PUBLIC_API_URL` | Vercel (Web & Admin) | Public API endpoint (e.g. `https://api-staging.warkopyareh.com/api/v1`) |
| `NEXT_PUBLIC_WS_URL` | Vercel (Web & Admin) | Public WebSocket URL (e.g. `wss://api-staging.warkopyareh.com`) |
| `MIDTRANS_SERVER_KEY` | Railway API | Server key from Midtrans Sandbox/Production dashboard |
| `MIDTRANS_CLIENT_KEY` | Railway & Vercel | Client key from Midtrans Sandbox/Production dashboard |
| `MIDTRANS_IS_PRODUCTION` | Railway API | `false` for staging/sandbox, `true` for production |
| `GOOGLE_CLIENT_ID` | Railway API & Web | Google Cloud Console OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Railway API | Google Cloud Console OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK_URL` | Railway API | Callback URL (e.g. `https://api.yourdomain.com/auth/google/callback`) |

---

## 3. Row-Level Security (RLS) Configuration

This application uses PostgreSQL Row-Level Security (RLS) to strictly isolate tenant (branch) data.

### Critical Post-Migration Step
When deploying to an environment, the database migrations will create the `api_user` role and define all RLS policies. However, Prisma migrations generally run as a privileged CI role (e.g. `postgres`), meaning that any `GRANT` executed within a migration dynamically assigns privileges to that CI role, not the application's runtime role.
When deploying to an environment, database migrations create the `api_user` role and define all RLS policies. However, Prisma migrations generally run as a privileged CI role (e.g. `postgres`), meaning that any `GRANT` executed within a migration dynamically assigns privileges to that CI role, not the application's runtime role.

**After running `prisma migrate deploy`**, you MUST manually grant the application runtime user access to the `api_user` role. Without this, the application will fail at startup.

```sql
-- Connect as a superuser or the role that owns the api_user role
GRANT api_user TO <your_application_runtime_db_user>;
```

**Why this is needed:**
The API application utilizes a multi-tenant middleware that executes `SET LOCAL ROLE api_user` inside a transaction before performing business queries. The database will return `42501 permission denied to set role "api_user"` if the runtime user does not hold this grant.

## Startup Checks
### Startup Checks
The backend API contains a fail-fast startup check that attempts a throwaway transaction setting the `api_user` role. If this grant has not been applied, the application will refuse to boot and log a FATAL error pointing to this document.

---

## 4. Release & Delivery Workflows

Deployment is orchestrated via `.github/workflows/cd.yml`:

1. **Staging Deployments**:
   - Triggered manually via `workflow_dispatch` selecting `target_environment: staging`.
   - Can deploy individual components (`api`, `web`, `admin`) or `all`.
   - Never affects production state.

2. **Production Deployments (Strictly Guarded)**:
   - Automated push-to-production triggers are disabled.
   - Production deployment requires explicit manual `workflow_dispatch` with:
     - `target_environment: production`
     - `confirmation: DEPLOY-PROD`
   - Database migrations require:
     - `confirmation: MIGRATE_PRODUCTION`
