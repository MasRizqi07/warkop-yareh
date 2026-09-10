# Roadmap evidence audit

<<<<<<< HEAD
Audit date: 2026-09-10. Source baseline: `68d7d5ca4c9a4816ccf15b7a52f82c90368717b4`.

The audit uses four explicit states defined in `docs/ROADMAP.md`. This avoids both
overclaiming release completion and underclaiming capabilities that already
exist. Forced local typecheck, lint, test, and build passed on the source baseline
above, including the isolated PostgreSQL checkout/operations suites. No remote CI
for that rebased commit, staging, production-provider, measured coverage, or QA
=======
Audit date: 2026-09-09. Source baseline: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`.

The audit uses four explicit states defined in `docs/ROADMAP.md`. This avoids both
overclaiming release completion and underclaiming capabilities that already
exist. No current staging, production-provider, measured coverage, or QA
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
acceptance evidence was found, so no item is `RELEASE_VERIFIED`.

| Roadmap item                   | State               | Direct source evidence                                                                 | Missing release or implementation evidence                                     |
| ------------------------------ | ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
<<<<<<< HEAD
| Customer Next.js portal        | `IMPLEMENTED_LOCAL` | `apps/web/src/app`, checkout and reservation features, browser E2E                     | Remote exact-commit CI, staging, coverage, QA                                  |
| NestJS menu, tracking, booking | `IMPLEMENTED_LOCAL` | `apps/api/src/app.module.ts`, catalog, ordering, reservation, persisted checkout suite | Remote exact-commit CI, staging, coverage, QA                                  |
=======
| Customer Next.js portal        | `IMPLEMENTED_LOCAL` | `apps/web/src/app`, checkout and reservation features, browser E2E                     | Exact-commit CI for remediation, staging, coverage, QA                         |
| NestJS menu, tracking, booking | `IMPLEMENTED_LOCAL` | `apps/api/src/app.module.ts`, catalog, ordering, reservation, persisted checkout suite | Exact-commit CI for remediation, staging, coverage, QA                         |
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
| Midtrans e-wallet              | `IMPLEMENTED_LOCAL` | payment services/specs, browser contract/itemization test                              | Live sandbox callback and staging acceptance                                   |
| Local Docker database          | `IMPLEMENTED_LOCAL` | `infra/docker/docker-compose.yml`; isolated PostgreSQL/Redis CI services               | Full Compose application smoke                                                 |
| Socket.IO tracking             | `IMPLEMENTED_LOCAL` | authenticated gateway and web/admin subscribers                                        | Deployed socket E2E                                                            |
| Branch prices/availability     | `IMPLEMENTED_LOCAL` | catalog repository, admin branch/inventory pages, browser readback                     | Staging mutation/readback and QA                                               |
| Loyalty ledger/four tiers      | `IMPLEMENTED_LOCAL` | transactional loyalty service and persisted concurrency/reversal tests                 | Staging concurrency and QA                                                     |
| Email/WhatsApp check-in        | `PARTIAL`           | OTP email and WhatsApp campaign flows exist                                            | Automated reservation check-in confirmation does not                           |
| Workers menu cache             | `NOT_IMPLEMENTED`   | No Worker handler/config found                                                         | Full capability                                                                |
| Community domain               | `PARTIAL`           | groups, memberships, posts                                                             | Threaded replies, GitHub profile integration, interest tags, branch networking |
| Gemini concierge               | `NOT_IMPLEMENTED`   | Existing AI service is deterministic catalog ranking                                   | Gemini integration and provider evaluation                                     |
<<<<<<< HEAD
| Read replicas                  | `NOT_IMPLEMENTED`   | One Prisma datasource; no replica client or read-routing implementation                | Multi-region provisioning and routing                                          |
=======
| Read replicas                  | `NOT_IMPLEMENTED`   | One datasource and one declared Neon region                                            | Multi-region provisioning and routing                                          |
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
| Forced RLS                     | `IMPLEMENTED_LOCAL` | FORCE RLS migrations, tenant context, isolated Postgres regression                     | Production policy introspection and staging proof                              |
| Franchise provisioning         | `PARTIAL`           | Agreements can be created for existing branches                                        | Automated tenant infrastructure provisioning                                   |
| BI gross-sales suite           | `PARTIAL`           | Revenue/category/customer aggregates and admin analytics UI                            | Full reporting, exports, reconciliation                                        |
| Billing/agreements             | `IMPLEMENTED_LOCAL` | franchise service/schema/controller/specs                                              | Staging billing reconciliation and QA                                          |

Business metrics in the roadmap remain targets. They are not claimed as actuals
until traceable telemetry exists.
<<<<<<< HEAD

## Phase 7.0 row-by-row re-audit

All 16 implementation states were retained after direct source inspection. The
stale source baseline and read-replica evidence wording were corrected. The
phase-level maturity matrix in `docs/ROADMAP.md` was also corrected so it no
longer reports Phase 4 implementation or exact-commit remote CI as complete.

Deployment remains `NOT VERIFIED`: no Railway, Vercel, Fly.io, Render, or Netlify
project configuration is present in the repository; the GitHub Deployments API
returned an empty array; documented public domain candidates did not resolve;
and no authenticated Railway/Vercel dashboard session was available. These
checks do not prove that no private provider project exists, so Rizqi must supply
the project access or canonical URLs before Phase 7.1 runtime verification.
=======
>>>>>>> ab6d338ad275b2d1f3f9673b92666d386e6163d3
