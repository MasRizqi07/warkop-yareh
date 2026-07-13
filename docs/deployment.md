# Deployment Guide

## Row-Level Security (RLS) Configuration

This application uses PostgreSQL Row-Level Security (RLS) to strictly isolate tenant (branch) data. 

### Critical Post-Migration Step
When deploying to an environment, the database migrations will create the `api_user` role and define all RLS policies. However, Prisma migrations generally run as a privileged CI role (e.g. `postgres`), meaning that any `GRANT` executed within a migration dynamically assigns privileges to that CI role, not the application's runtime role.

**After running `prisma migrate deploy`**, you MUST manually grant the application runtime user access to the `api_user` role. Without this, the application will fail at startup.

```sql
-- Connect as a superuser or the role that owns the api_user role
GRANT api_user TO <your_application_runtime_db_user>;
```

**Why this is needed:**
The API application utilizes a multi-tenant middleware that executes `SET LOCAL ROLE api_user` inside a transaction before performing business queries. The database will return `42501 permission denied to set role "api_user"` if the runtime user does not hold this grant.

## Startup Checks
The backend API contains a fail-fast startup check that attempts a throwaway transaction setting the `api_user` role. If this grant has not been applied, the application will refuse to boot and log a FATAL error pointing to this document.
