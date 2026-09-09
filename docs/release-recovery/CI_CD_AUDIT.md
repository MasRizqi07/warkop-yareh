# CI/CD Pipeline & Migration Contract Audit

## 1. Executive Summary

This audit investigates the root cause of the failing production database migration workflow in GitHub Actions, evaluates the security and reliability of the deployment pipeline, and establishes a fail-fast configuration guard to prevent empty or improper database connection targets from reaching Prisma.

---

## 2. CI/CD Architecture & Pipeline Overview

The repository defines two GitHub Actions workflow files under `.github/workflows/`:

| Workflow File | Name | Trigger | Target Environment | Current Status |
|---|---|---|---|---|
| `.github/workflows/ci.yml` | `CI` | `pull_request` (branches: `main`), `push` (branches: `main`) | Ephemeral CI container services (`postgres:16`, `redis:7-alpine`) | **GREEN** on `3303f1c` |
| `.github/workflows/cd.yml` | `CD — Database Migrations` | `workflow_run` (workflows: `["CI"]`, types: `[completed]`, branches: `[main]`), `workflow_dispatch` | Production Railway Database | **FAILING** (Blocked) |

---

## 3. Investigation: Production Migration Failure Root Cause

### 3.1 Observed Failure Symptom
In GitHub Actions runs following push to `main`, the `CD — Database Migrations` workflow failed during step:
```bash
pnpm --filter @warkop-yareh/database run db:migrate:deploy
```
with error:
```text
PrismaClientInitializationError / P1012: Environment variable not found: DATABASE_URL
(or empty connection string provided)
```

### 3.2 Detailed Root Cause Analysis

1. **GitHub Environment Context Missing**:
   - In GitHub Actions, secrets can be scoped at the Repository level or at the GitHub Environment level (e.g., Environment `production`).
   - The CD workflow job `migrate` in baseline `3303f1c` lacked an `environment: production` directive:
     ```yaml
     jobs:
       migrate:
         name: Run Database Migrations
         runs-on: ubuntu-latest
         # Missing: environment: production
     ```
   - When an environment is configured in repository settings with approval protections and environment secrets, any job without `environment: <name>` will resolve `${{ secrets.DATABASE_URL }}` as an empty string `""`.

2. **Unsafe Trigger and Gating Mechanism**:
   - `.github/workflows/cd.yml` was triggered automatically via `workflow_run` upon every successful CI run on `main`.
   - This automatically triggered production database migrations without:
     - Explicit release engineer approval
     - Verification of the exact commit SHA being migrated
     - Safe preflight checks to confirm target accessibility or validity

3. **Absence of Preflight Configuration Validation**:
   - The workflow invoked `pnpm --filter @warkop-yareh/database run db:migrate:deploy` directly with `DATABASE_URL: ${{ secrets.DATABASE_URL }}`.
   - If `DATABASE_URL` was unassigned or empty, execution was handed over to Prisma without prior verification.
   - This conflated configuration failure with database engine / SQL migration execution failure.

---

## 4. Separation of Failures: Configuration vs. Execution

To ensure clear observability and reliable incident triage, CI/CD must explicitly separate:

### Category 1: Configuration Failure (Preflight Gate)
- Missing or empty `DATABASE_URL` secret.
- Failure to bind the correct GitHub Environment (`production`).
- Invalid URI scheme (non-PostgreSQL).
- Misconfigured target host (e.g., accidental `localhost` or `127.0.0.1` targeted for production).
- Target database pointing to disposable/test database names (`warkop_audit`, `test`, `postgres`).
- Missing release enablement switch (`PRODUCTION_MIGRATION_ENABLED != true`).

**Behavior**: The workflow must fail immediately in a preflight step before Prisma is invoked, outputting clear diagnostic error messages *without* logging credentials.

### Category 2: Migration Execution Failure (Prisma Engine / Database Layer)
- Network unreachable / timeout reaching production database host.
- Database authentication failure (invalid password / user).
- Schema drift / P3009 (unapplied or partially applied migrations).
- Migration lock conflict or concurrent migration deadlock.
- SQL syntax or constraint violation during migration script execution.

**Behavior**: The preflight step passes, but Prisma CLI fails with an explicit exit code, preserving migration history integrity in `_prisma_migrations`.

---

## 5. Implementation of Fail-Fast Target Validator

To enforce these guarantees, a standalone validator script (`scripts/validate-database-target.mjs`) is introduced and integrated into the workflow:

```javascript
// Validates:
// 1. DATABASE_URL is present and non-empty.
// 2. Protocol is postgres: or postgresql:.
// 3. Username, hostname, and database name are present.
// 4. Production targets cannot be localhost or disposable databases (e.g. warkop_audit).
// 5. Integration targets must explicitly select the disposable test database.
// 6. Never logs passwords, tokens, or query parameters.
```

### Hardened CD Workflow Architecture
1. **Manual Dispatch Only**: Remove automatic `workflow_run` trigger. Production database migrations must be explicitly triggered via `workflow_dispatch`.
2. **Commit SHA Verification**: The workflow requires `commit_sha` input and validates `test "$(git rev-parse HEAD)" = "$EXPECTED_COMMIT"`.
3. **Confirmation Token**: Requires manual input `confirmation: "MIGRATE_PRODUCTION"`.
4. **Environment Binding**: Job explicitly binds `environment: production`.
5. **Preflight Step**: Runs `node scripts/validate-database-target.mjs production`.
6. **Concurrency Guard**: `group: production-database-migrations`, `cancel-in-progress: false` to eliminate race conditions.
