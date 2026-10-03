# Security review

Assessment: local source, production-style browser headers, isolated API tests, and `pnpm audit --prod --json` on 2026-09-30. No production secrets or real customer records were used.

| Severity | Finding and action | Release evidence |
| --- | --- | --- |
| High | Three [Multer DoS advisories](https://github.com/expressjs/multer/security/advisories) affected transitive `multer@2.2.0` through `@nestjs/platform-express@11.2.3`. The API dependency is raised to `@nestjs/platform-express@11.2.7`, which declares `multer@2.4.0`. | Require frozen install, dependency audit, API tests, and exact-head CI after lockfile update. |
| Moderate | [js-yaml advisory](https://github.com/advisories/GHSA-r3ph-w7gj-g6xm) affected `js-yaml@5.3.0` pinned by `@nestjs/swagger@11.4.7`. Swagger document generation is disabled in API production (`NODE_ENV=production`). | Track upstream Nest Swagger update; retain as a dependency finding, not a clean-audit claim. |
| Medium | Admin authentication is client-guarded, while new reality writes have server role checks (`ADMIN`, `OWNER`, `SUPERADMIN`). An unauthenticated browser request to `/reality/gallery` returned 401/403; only `/reality/gallery/public` is public. | Browser test and API guards pass locally. Deployed API authorization remains unverified. |
| Medium | Editorial image URLs must be HTTPS, and public gallery display requires primary source, capture date, recent verification, and verified venue/branch provenance. Drafts start private. | Unit and browser persistence tests pass locally. Human verification of source authenticity is still required. |
| Low | Web/admin security headers include frame denial, no sniff, referrer policy, and permissions policy; a scoped CSP forbids embedding. Private web/admin URLs use noindex headers. | Browser smoke verifies indexability; deploy headers need recheck. |

The API exception filter exposes a stable error code and request ID while withholding unhandled stack traces and messages. Request ID input is limited to 64 safe characters. The health readiness route returns 503 when database or Redis is unavailable. This review did not run a penetration test, production secret scan, or real payment/provider test; those are release checks, not inferred from unit tests. No credentials are included here.
