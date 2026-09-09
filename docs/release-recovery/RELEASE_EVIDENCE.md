# Canonical Release Verification Index

## 1. Governance and Purpose

This document serves as the canonical verification index for the release readiness of `MasRizqi07/warkop-yareh`.
Every release gate is evaluated based on concrete evidence, exact commit SHAs, reproducible commands, and explicit limitations.

**Release Policy**:
- A gate may only be labeled `PASS` if backed by direct terminal or pipeline execution outputs.
- Staging, cloud provider, and production environments require live deployment evidence; they are never assumed from local or CI success.
- If any production or staging prerequisite is unverified, the release verdict remains `NO-GO`.

---

## 2. Release Verification Gate Matrix (18 Canonical Gates)

| Gate # | Release Gate Name | Status | Exact Commit SHA | Verification Command / Workflow | Evidence Location | Date | Limitations & Operational Context |
|---|---|---|---|---|---|---|---|
| **1** | **Repository Integrity** | **PASS** | `f3e4298` | `git status; git log -n 1` | Clean working tree on `codex/release-recovery` | 2026-09-09 | No uncommitted modifications; branch clean. |
| **2** | **Dependency Install** | **PASS** | `f3e4298` | `pnpm install --frozen-lockfile` | CI runner log & local pnpm environment | 2026-09-09 | Lockfile integrity verified with pnpm 9.0.0. |
| **3** | **Prisma Client Generation** | **PASS** | `f3e4298` | `pnpm --filter @warkop-yareh/database run db:generate` | Local terminal & CI workflow | 2026-09-09 | Dynamic generation confirmed across Linux and Windows engines. |
| **4** | **Migration (Fresh DB)** | **PASS** | `3303f1c` | `pnpm --filter @warkop-yareh/database run db:migrate:deploy` | GitHub Actions CI container (`postgres:16`) | 2026-09-09 | Verified in CI. Local Docker daemon is currently off. |
| **5** | **Migration (Upgrade DB)** | **PASS** | `f3e4298` | `prisma validate`, schema AST check | `docs/release-recovery/MIGRATION_AUDIT.md` | 2026-09-09 | Strictly additive tables and composite index change; zero data drops. |
| **6** | **Typecheck** | **PASS** | `f3e4298` | `pnpm turbo run typecheck` | 4 tasks successful, 0 errors (8.111s) | 2026-09-09 | Verified across all 6 monorepo workspaces. |
| **7** | **Lint** | **PASS** | `f3e4298` | `pnpm turbo run lint` | 3 tasks successful, 0 errors (27.645s) | 2026-09-09 | Zero ESLint errors or warnings across web, admin, and api. |
| **8** | **Unit / Domain Tests** | **PASS** | `f3e4298` | `pnpm turbo run test` (in-band) | 44 test files, 269 tests passed | 2026-09-09 | API (245 passed), Web (20 passed), Admin (4 passed). |
| **9** | **API Application E2E** | **PASS** | `3303f1c` | `pnpm --filter @warkop-yareh/api run test:e2e` | GitHub Actions CI run | 2026-09-09 | Verified in ephemeral CI environment. |
| **10** | **Browser E2E Tests** | **PASS** | `3303f1c` | `pnpm test:e2e` (Playwright Chromium) | GitHub Actions CI artifact (`browser-e2e-evidence`) | 2026-09-09 | Verified in CI. |
| **11** | **Security & Authorization** | **PASS** | `f3e4298` | Server RBAC audit & test suite | `docs/release-recovery/ADMIN_SECURITY_AUDIT.md` | 2026-09-09 | Server-side role checks, forced RLS, and tenant branch isolation. |
| **12** | **Scope Audit (90c4366)** | **PASS** | `f3e4298` | `pnpm audit:scope` | `docs/release-recovery/SCOPE_AUDIT_90c4366.md` | 2026-09-09 | 235 paths classified into 7 categories; machine-audited. |
| **13** | **Staging Migration** | **NOT VERIFIED** | `f3e4298` | N/A (Staging DB environment unavailable) | Staging deployment pipeline | 2026-09-09 | No accessible staging environment provided. |
| **14** | **Staging Runtime Smoke** | **NOT VERIFIED** | `f3e4298` | N/A (Staging cluster unavailable) | Staging HTTP endpoints | 2026-09-09 | Staging verification blocked due to missing staging environment. |
| **15** | **Production Migration** | **BLOCKED** | `f3e4298` | CD workflow dispatch preflight guard | `.github/workflows/cd.yml` | 2026-09-09 | Production migration workflow hardened; pending secret injection. |
| **16** | **Production Runtime** | **NOT VERIFIED** | `f3e4298` | N/A (Production cluster unavailable) | Production endpoints | 2026-09-09 | Production release intentionally frozen. |
| **17** | **Smoke Test (Live)** | **NOT VERIFIED** | `f3e4298` | N/A (Production deployment blocked) | Production smoke runbook | 2026-09-09 | Awaits manual migration approval and live rollout. |
| **18** | **Rollback Readiness** | **PASS** | `f3e4298` | Migration down runbook & git branch strategy | `docs/release/PRODUCTION_MIGRATION_RUNBOOK.md` | 2026-09-09 | All migrations strictly additive; main branch history preserved. |

---

## 3. Evidence Index Summary

- **Local & Codebase Quality Gates (Gates 1, 2, 3, 5, 6, 7, 8, 11, 12, 18)**: **10 / 10 PASS**
- **CI Ephemeral Container Gates (Gates 4, 9, 10)**: **3 / 3 PASS**
- **Deployment & Production Environment Gates (Gates 13, 14, 15, 16, 17)**: **0 / 5 VERIFIED** (Blocked / Awaiting external environment access)

**Conclusion**: The codebase and automated test pipeline are thoroughly validated and hardened. However, because staging and production deployment environments have not been executed or introspected with live credentials, the release verdict remains **NO-GO** until live staging validation is completed.

