# Warkop Ya'reh delivery roadmap

Last audit: 2026-09-09. Source baseline audited: `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`.
Detailed evidence and remaining gates: [Phase 6 roadmap audit](phase6-remediation/ROADMAP_AUDIT.md).

## Status model

Roadmap state and release acceptance are separate:

- `IMPLEMENTED_LOCAL`: the capability exists and has current local automated evidence.
- `PARTIAL`: part of the named capability exists, but required behavior is absent.
- `NOT_IMPLEMENTED`: the named capability was not found.
- `RELEASE_VERIFIED`: implementation, quality, coverage, staging E2E, and QA acceptance all passed.

No item in this document is currently `RELEASE_VERIFIED`. Local/CI evidence never substitutes for staging, provider, or production evidence.

### Phase Evidence Maturity Matrix

| Phase | Implemented | Local | CI | Staging | Production |
|---|---|---|---|---|---|
| **Phase 1: Local Cafe Operations** | PASS | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| **Phase 2: Multi-Branch & Operations** | PASS | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| **Phase 3: Regional & Edge** | PARTIAL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| **Phase 4: Franchise & Multi-Tenant** | PASS | PASS | PASS | NOT VERIFIED | NOT VERIFIED |
| **Release Recovery & DB Migration** | PASS | PASS | PASS | NOT VERIFIED | BLOCKED |

See canonical audit and verification indexes:
- Canonical Release Evidence: [Release Evidence Index](release-recovery/RELEASE_EVIDENCE.md)
- Merge 90c4366 Scope Audit: [Scope Audit 90c4366](release-recovery/SCOPE_AUDIT_90c4366.md)
- Database Migration Audit: [Migration Audit](release-recovery/MIGRATION_AUDIT.md)
- CI/CD Contract Audit: [CI/CD Audit](release-recovery/CI_CD_AUDIT.md)
- Admin Security Audit: [Admin Security Audit](release-recovery/ADMIN_SECURITY_AUDIT.md)
- Guest Cart/Quote Decision: [Guest Quote Decision](release-recovery/GUEST_QUOTE_DECISION.md)

## Definition of Done

A deliverable becomes `RELEASE_VERIFIED` only when all of these are satisfied:

1. Implementation meets the product contract.
2. Lint, formatting, typecheck, tests, and build pass at the exact commit.
3. The applicable unit/integration coverage gate is at least 80%.
4. The exact commit is deployed to staging and passes automated E2E smoke tests.
5. QA accepts explicit acceptance criteria.

## Roadmap overview

| Window  | Phase        | Goal                                                       |
| ------- | ------------ | ---------------------------------------------------------- |
| 2026 Q3 | Local cafe   | Ordering, reservation, and checkout for flagship branches  |
| 2026 Q4 | Multi-branch | Branch operations, loyalty, and real-time tracking         |
| 2027 H1 | Regional     | Edge delivery, community, AI concierge, multi-region reads |
| 2027 H2 | Franchise    | Tenant isolation, provisioning, BI, and billing            |

## Phase 1: Local cafe operations

Target: Q3 2026. Product targets remain unmeasured until production telemetry
exists: order p95 under 2 seconds at 50 concurrent users, mobile LCP under 2
seconds, INP under 200 ms, and 99.5% uptime.

| Deliverable                                    | Implementation state | Release gate                                          |
| ---------------------------------------------- | -------------------- | ----------------------------------------------------- |
| Next.js customer portal                        | `IMPLEMENTED_LOCAL`  | Exact-commit CI, staging E2E, coverage, QA            |
| NestJS menu, order tracking, and table booking | `IMPLEMENTED_LOCAL`  | Exact-commit CI, staging E2E, coverage, QA            |
| Midtrans local e-wallet integration            | `IMPLEMENTED_LOCAL`  | Live sandbox/provider callbacks, staging, QA          |
| Local Docker database settings                 | `IMPLEMENTED_LOCAL`  | Full Compose smoke and documented operator acceptance |

## Phase 2: Multi-branch and real-time tracking

Target: Q4 2026. MAU, conversion, and uptime values remain targets, not reported
measurements.

| Deliverable                                         | Implementation state | Release gate                                    |
| --------------------------------------------------- | -------------------- | ----------------------------------------------- |
| Authenticated Socket.IO order tracking              | `IMPLEMENTED_LOCAL`  | Deployed socket behavior, staging E2E, QA       |
| Branch price overrides and availability             | `IMPLEMENTED_LOCAL`  | Exact-commit CI, staging mutation/readback, QA  |
| Points ledger and Bronze/Silver/Gold/Platinum tiers | `IMPLEMENTED_LOCAL`  | Exact-commit CI, staging concurrency, QA        |
| Automated email and WhatsApp check-in confirmations | `PARTIAL`            | Reservation check-in automation is still absent |

## Phase 3: Regional expansion and edge optimization

Target: H1 2027. Regional MAU, page speed, and uptime values remain targets.

| Deliverable                         | Implementation state | Release gate                                                 |
| ----------------------------------- | -------------------- | ------------------------------------------------------------ |
| Cloudflare Workers menu edge cache  | `NOT_IMPLEMENTED`    | Worker architecture, implementation, tests, deployment       |
| Community domain                    | `PARTIAL`            | Threading, GitHub profiles, interest tags, branch networking |
| Gemini AI concierge                 | `NOT_IMPLEMENTED`    | Gemini-backed implementation and provider evaluation         |
| Multi-region database read replicas | `NOT_IMPLEMENTED`    | Replica provisioning, routing, consistency tests             |

## Phase 4: Franchise licensing and BI

Target: H2 2027. National MAU, provisioning time, and uptime values remain
targets.

| Deliverable                                 | Implementation state | Release gate                                             |
| ------------------------------------------- | -------------------- | -------------------------------------------------------- |
| Forced row-level tenant isolation           | `IMPLEMENTED_LOCAL`  | Production policy introspection and staging tenant tests |
| Automated franchise provisioning            | `PARTIAL`            | Infrastructure provisioning/orchestration                |
| Full BI gross-sales reports                 | `PARTIAL`            | Reporting scope, exports, reconciliation, QA             |
| Multi-tenant billing and agreement tracking | `IMPLEMENTED_LOCAL`  | Exact-commit CI, staging billing reconciliation, QA      |
