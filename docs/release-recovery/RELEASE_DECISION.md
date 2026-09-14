# Release Decision & Readiness Status — Phase 8

## Current Release Status

| Metric                       | Status                         | Evidence Reference                                                                                         |
| ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Baseline Integrity**       | **UNVERIFIED FOR CURRENT TIP** | A fresh exact-commit CI run is required after the Phase 8 remediation changes.                             |
| **Local Test Suite**         | **UNVERIFIED FOR CURRENT TIP** | Run the complete Node 24 matrix, including isolated persistence, API E2E, and browser E2E.                 |
| **Container Engine**         | **UNVERIFIED FOR CURRENT TIP** | The Dockerfile targets `node:24-alpine`; a fresh image build and runtime smoke test are still required.    |
| **Staging Deployment**       | **NOT VERIFIED**               | CD workflow exists, but no successful staging deployment/runtime evidence is recorded for the current tip. |
| **Production Certification** | **PENDING**                    | Strictly pending Phase 4 staging deployment and live runtime verification                                  |

---

## Release Acceptance Criteria

A production release is **NOT** certified until all following gates are satisfied with verbatim evidence:

1. **Remote CI Gate**: Remote GitHub Actions workflow green on tip of release branch (Lint, Typecheck, Build, Unit, Persistence, E2E).
2. **Container Build Gate**: Docker production image builds successfully without legacy node layers.
3. **Staging Runtime Gate**: Staging API responds with HTTP 200 on health check, and Next.js frontends render without hydration errors.
4. **Tenant & Persistence Gate**: RLS permissions, PostgreSQL persistence, and Redis lock concurrency verified on target cloud instances.
5. **Operational Verification**: Manual trigger with required confirmation (`DEPLOY-PROD`) executed and documented.

---

## Decision Summary

- **Production Ready?**: **NO (Pending Phase 4 Evidence)**
- **Staging Ready?**: **UNVERIFIED**
- **Action**: Run the final local matrix and exact-commit CI, then collect staging API, web, admin, database/RLS, OAuth, PWA, and provider evidence before any release decision.
