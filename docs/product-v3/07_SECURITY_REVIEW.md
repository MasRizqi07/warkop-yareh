# Security review

Assessment scope: source and isolated PostgreSQL/Redis tests on 2026-10-03. No production credentials, payment provider calls or customer database were used.

| Severity | Finding / control | Remaining action |
| --- | --- | --- |
| High if misconfigured | Public ordering and payment initiation now fail closed; API recalculates prices from published branch products. Historical webhook handling remains enabled for signed callbacks. | Verify production flags are unset, Midtrans mode/secret and live state transitions before activation. |
| Medium | Admin Next UI is client-authenticated. Sensitive writes are guarded by API roles; redirecting old admin pages does not replace server authorization. | Recheck deployed API guards and server-side admin page controls at preview. |
| Medium | Marketing and operational API modules still exist for authorized staff without global `OPERATIONS`/`ANALYTICS` enforcement. | Require operator approval and stronger rollout gates before exposing those workflows. |
| Moderate dependency | `pnpm audit --prod --json`: 0 critical, 0 high, 0 low, 1 moderate (`js-yaml@5.3.0` via Nest Swagger 11.4.7). Swagger setup runs only outside production. | Track upstream patched Swagger dependency and rerun audit. |
| Medium | Web/admin CSP currently restricts framing but is not a complete CSP. API uses Helmet CSP. | Design and test a report-only web/admin policy against Next assets and required external services before enforcing. |
| Low | Request IDs are sanitized and propagated; exception responses omit raw unhandled error details. `/api/v1/health` tests database/Redis and returns no secrets. | Confirm deployed logging, rate limits and health routing. |

The API uses HttpOnly refresh cookies, JWT guards, session revocation and request throttling. Isolated tests cover ownership, RLS, duplicate checkout, payment callbacks and auth rotation. The local source scan found no newly tracked `.env` or key material; a production secret inventory and provider-side rotation check remain outside local evidence. No irreversible schema drop was performed.
