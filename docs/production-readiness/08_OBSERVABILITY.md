# Observability and failure behavior

`apps/api/src/common/request-correlation.ts` validates or creates an `X-Request-Id` for each API request. The response header and global exception body carry that ID. The exception filter logs method, path, status, request ID, and error class for unexpected failures, without logging stack traces or exception text that may contain request data. Process-level fatal handlers log only an error class before exiting, allowing the supervisor to restart the service.

`GET /api/v1/health/live` reports process liveness. `GET /api/v1/health` checks PostgreSQL and Redis concurrently and returns service unavailable when either dependency fails or Redis does not respond with PONG. The health controller unit tests include the failure case. API E2E and persistence tests use an isolated database; they do not prove Railway or production health.

Web and admin expose a clear failure or retry state for the newly added gallery and editorial API resources. The public gallery never silently substitutes stock photos when the API fails. The production-style smoke script treats a gallery API error as a failed route. Error and not-found pages were added for the customer app.

No provider log sink, uptime alert, trace backend, incident routing, or production error dashboard was independently confirmed. Those integrations must be inspected after provider access is available. The browser smoke reports client exceptions but does not replace production telemetry.
