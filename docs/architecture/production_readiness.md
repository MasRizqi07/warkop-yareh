# ✅ Production Readiness Checklist — Warkop Ya'reh Digital Ecosystem

## 1. Security

| # | Item | Status | Owner |
|:--|:-----|:-------|:------|
| S1 | HTTPS enforced on all endpoints | `[ ]` | DevOps |
| S2 | JWT RS256 keys generated and rotated | `[ ]` | Security |
| S3 | Refresh token rotation implemented | `[ ]` | Backend |
| S4 | RBAC guards on all protected endpoints | `[ ]` | Backend |
| S5 | Rate limiting enabled (Redis-backed) | `[ ]` | Backend |
| S6 | CORS allowlist configured (no wildcards) | `[ ]` | Backend |
| S7 | Input validation on all endpoints (Zod) | `[ ]` | Backend |
| S8 | SQL injection prevention (Prisma parameterized) | `[ ]` | Backend |
| S9 | XSS prevention (CSP headers, sanitized output) | `[ ]` | Frontend |
| S10 | CSRF protection (SameSite cookies) | `[ ]` | Backend |
| S11 | Secrets in environment variables (not in code) | `[ ]` | DevOps |
| S12 | Dependency vulnerability scan (Snyk/Dependabot) | `[ ]` | DevOps |
| S13 | Security headers (HSTS, X-Frame-Options, etc.) | `[ ]` | DevOps |
| S14 | Audit logging for all mutations | `[ ]` | Backend |
| S15 | Tenant isolation (branchId enforcement) | `[ ]` | Backend |

---

## 2. Performance

| # | Item | Target | Status | Owner |
|:--|:-----|:-------|:-------|:------|
| P1 | Lighthouse Performance score | ≥ 95 | `[ ]` | Frontend |
| P2 | Lighthouse Accessibility score | ≥ 95 | `[ ]` | Frontend |
| P3 | Lighthouse SEO score | ≥ 95 | `[ ]` | Frontend |
| P4 | LCP (Largest Contentful Paint) | < 2.0s | `[ ]` | Frontend |
| P5 | INP (Interaction to Next Paint) | < 200ms | `[ ]` | Frontend |
| P6 | CLS (Cumulative Layout Shift) | < 0.1 | `[ ]` | Frontend |
| P7 | API p95 response time | < 500ms | `[ ]` | Backend |
| P8 | Database query p95 | < 200ms | `[ ]` | Backend |
| P9 | Bundle size budget (main JS) | < 150KB gzip | `[ ]` | Frontend |
| P10 | Image optimization (WebP, lazy load) | All images | `[ ]` | Frontend |
| P11 | Font loading strategy (swap/optional) | Configured | `[ ]` | Frontend |
| P12 | Redis caching for hot paths | Menu, user | `[ ]` | Backend |

---

## 3. Reliability

| # | Item | Target | Status | Owner |
|:--|:-----|:-------|:-------|:------|
| R1 | Health check endpoint (`/api/health`) | Responding | `[ ]` | Backend |
| R2 | Readiness probe (`/api/health/ready`) | Configured | `[ ]` | DevOps |
| R3 | Liveness probe (`/api/health/live`) | Configured | `[ ]` | DevOps |
| R4 | Graceful shutdown (SIGTERM handling) | Implemented | `[ ]` | Backend |
| R5 | Database connection pooling | Configured | `[ ]` | Backend |
| R6 | Retry logic for external services | Midtrans, R2 | `[ ]` | Backend |
| R7 | Circuit breaker for payment gateway | Implemented | `[ ]` | Backend |
| R8 | Queue dead-letter handling | DLQ configured | `[ ]` | Backend |
| R9 | Zero-downtime deployments | Rolling updates | `[ ]` | DevOps |
| R10 | Uptime SLO | ≥ 99.9% | `[ ]` | SRE |

---

## 4. Monitoring

| # | Item | Status | Owner |
|:--|:-----|:-------|:------|
| M1 | Sentry error tracking enabled (web + API) | `[ ]` | DevOps |
| M2 | OpenTelemetry traces configured | `[ ]` | Backend |
| M3 | Structured JSON logging (Pino) | `[ ]` | Backend |
| M4 | PostHog product analytics | `[ ]` | Frontend |
| M5 | Grafana dashboards (API latency, DB, Redis) | `[ ]` | DevOps |
| M6 | Alert rules configured (Slack + PagerDuty) | `[ ]` | DevOps |
| M7 | Uptime monitoring (external ping) | `[ ]` | DevOps |
| M8 | Log retention policy (90 days) | `[ ]` | DevOps |

---

## 5. Disaster Recovery

| # | Item | Target | Status | Owner |
|:--|:-----|:-------|:-------|:------|
| D1 | Database backup frequency | Every 24h | `[ ]` | DBA |
| D2 | Point-in-time recovery (PITR) | 7 days | `[ ]` | DBA |
| D3 | Backup restoration tested | Quarterly | `[ ]` | DBA |
| D4 | Recovery Time Objective (RTO) | < 4 hours | `[ ]` | SRE |
| D5 | Recovery Point Objective (RPO) | < 1 hour | `[ ]` | SRE |
| D6 | Runbook for incident response | Documented | `[ ]` | SRE |
| D7 | Contact escalation matrix | Documented | `[ ]` | SRE |
| D8 | Multi-region failover plan | Phase 3+ | `[ ]` | DevOps |

---

## 6. Pre-Launch Verification

| # | Item | Status |
|:--|:-----|:-------|
| L1 | All unit tests passing (≥80% coverage) | `[ ]` |
| L2 | All integration tests passing | `[ ]` |
| L3 | E2E critical paths verified (Playwright) | `[ ]` |
| L4 | Load testing completed (target: 500 orders/min) | `[ ]` |
| L5 | Staging environment smoke test passed | `[ ]` |
| L6 | DNS and SSL certificates configured | `[ ]` |
| L7 | Environment variables set in production | `[ ]` |
| L8 | Database migrations applied | `[ ]` |
| L9 | Seed data loaded (categories, branches) | `[ ]` |
| L10 | Payment gateway sandbox → production toggle | `[ ]` |
