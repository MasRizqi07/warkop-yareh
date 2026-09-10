# Phase 0 — Baseline and Repository Freeze

## 1. Baseline Metadata

- **Audit Date / Time**: 2026-09-09T23:36:00+07:00
- **Base Main SHA**: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`
- **Origin Main SHA**: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`
- **Audit Recovery Branch**: `codex/release-recovery`
- **Branch Strategy**: Branched directly from `origin/main` at `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc` without rewriting or force-pushing `main`.
- **Worktree State**: Clean (`working tree clean, nothing to commit`).

## 2. Toolchain and Execution Environment

- **Operating System**: Windows 11 Pro / `win32 x64`
- **Shell**: PowerShell (`pwsh`)
- **Node.js**: `v26.7.0` (Root `package.json` specifies `"node": ">=24.0.0 <25"`; CI runner uses Node `24`)
- **pnpm**: `9.0.0`
- **Prisma CLI / Client**: `5.22.0` (`@prisma/client@5.22.0`, schema engine `windows-x64`)
- **Docker / Local Services**: Local isolated PostgreSQL 16 and Redis 7 required for live integration suites.

## 3. Workflow & Pipeline Status (Baseline)

### CI (`.github/workflows/ci.yml`)

- **Status**: GREEN on exact commit `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`.
- **Pipeline Components**:
  - `pnpm install --frozen-lockfile` (Succeeds)
  - `pnpm --filter @warkop-yareh/database run db:generate` (Succeeds)
  - `pnpm --filter @warkop-yareh/database run db:migrate:deploy` against CI PostgreSQL 16 service container (Succeeds)
  - `pnpm turbo run typecheck` (Succeeds)
  - `pnpm turbo run lint` (Succeeds)
  - `pnpm turbo run build` (Succeeds)
  - `pnpm turbo run test` (Succeeds)
  - `pnpm --filter @warkop-yareh/api run test:e2e` (Succeeds)
  - `pnpm test:e2e` (Playwright Chromium) (Succeeds)

### CD (`.github/workflows/cd.yml`)

- **Status**: FAILING (Blocked)
- **Failure Point**: `pnpm --filter @warkop-yareh/database run db:migrate:deploy` in step `Run Database Migrations (production)`
- **Observed Error**: Prisma `P1012: Environment variable not found: DATABASE_URL` (or invalid/empty URL)
- **Root Cause**: `DATABASE_URL` resolved to an empty string `""` in GitHub Actions.
  1. The workflow lacks a bound GitHub Environment (e.g. `environment: production`), meaning environment-scoped secrets are unavailable.
  2. If the secret is missing or named differently (`PRODUCTION_DATABASE_URL`), it silently resolves to an empty string.
  3. No preflight configuration validation exists before executing Prisma migrate.

## 4. Current Release & Scope Verdict

- **Release Status**: BLOCKED (NO-GO)
- **Scope Integrity**: AUDIT REQUIRED (Merge commit `90c4366792b6408cfdf8660981f13c45f3a355d1` contains unreviewed payload including `7e64d4e`, `6c89899`, and `f7c76db`).
- **Staging Verification**: NOT VERIFIED (No verified staging deployment/migration logs).
- **Production Runtime Verification**: NOT VERIFIED (Migration blocked; production deployment unverified).
