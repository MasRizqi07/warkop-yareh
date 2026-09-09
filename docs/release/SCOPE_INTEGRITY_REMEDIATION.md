# Scope Integrity Remediation

## Problem

The Phase 0-6 remediation report did not elevate the full impact of merge
`90c4366792b6408cfdf8660981f13c45f3a355d1`. That merge combined
`origin/main` at `0b3efd9e3b97ad8711e1f77ecbc22d4eebcf91d3` with three later commits and
introduced a much broader Admin, API, Web, and database delta than the reported
seven-phase scope. The exact-commit CI run passed, but the subsequent production
database-migration workflow failed.

## Goal

Produce an inspectable, release-gated tree in which every inherited change is
classified, retained behavior is covered by appropriate regression evidence,
product behavior changes are explicit, and CI, deployment, and runtime status
cannot be collapsed into a single "done" claim.

## Scope

- Inventory every path introduced by `90c4366^1..90c4366` and record its origin,
  category, review decision, and required evidence.
- Review the inherited Admin, cashier-shift, public-content, event, ordering,
  state-persistence, database, and cleanup changes.
- Retain inherited features only when their contracts, authorization, tenant
  isolation, persistence, and regression checks are defensible.
- Keep cart pricing server-authoritative while restoring a safe guest quote that
  cannot apply user-specific vouchers or loyalty points.
- Replace automatic production migration with an explicit protected release
  gate and actionable secret/configuration preflight.
- Make roadmap implementation, local, CI, staging, and production states
  independently visible and link the detailed audit from the primary roadmap.
- Add a repeatable scope-integrity gate for future merge/cherry-pick work.
- Run focused checks first, followed by the full Node 24 validation matrix.

## Non-Goals

- No production or staging deployment.
- No production database mutation.
- No history rewrite, force-push, or direct change to `main`.
- No invention of provider credentials, production evidence, or QA approval.
- No reintroduction of browser-calculated checkout totals.

## Acceptance Criteria

- [ ] A machine-checkable scope ledger covers all paths in
      `90c4366^1..90c4366`; missing or stale entries fail validation.
- [ ] Every inherited feature area has an explicit `retain`, `separate`, or
      `remove` decision with evidence and open-risk notes.
- [ ] Cashier shift open/move/close behavior proves authorization, branch
      isolation, concurrency rules, and persisted reload behavior against
      PostgreSQL.
- [ ] Admin pages are classified as real, partial, or mock; retained mutation
      flows have mutation -> reload -> persisted-state evidence.
- [ ] Guest cart totals come from a public server quote with the 11% tax and 5%
      service fee contract; guest requests cannot use voucher or loyalty fields.
- [ ] Production database migration is manual/protected, fails early with a
      clear configuration error, and is exercised safely against a disposable
      database without touching production.
- [ ] `docs/ROADMAP.md` links its detailed rationale and represents
      implementation, local, CI, staging, and production status separately.
- [ ] Final Node 24 lint, typecheck, unit, integration, migration, build, and
      browser suites have fresh exit-code evidence.
- [ ] Exact-commit remote CI, staging, provider, production-migration, and live
      deployment evidence remain separate gates; no unavailable evidence is
      inferred.

## Dependencies and Blockers

- Local PostgreSQL 16 and Redis 7 are required for persistence/integration
  evidence.
- GitHub CLI authentication is unavailable in the current environment, so a
  remote issue/PR and authenticated raw log download cannot yet be created.
- Production `DATABASE_URL`, environment approval, and deployment-provider
  access are intentionally not requested or used in this remediation branch.

## Decision Policy

Inherited functionality is retained only when its design is within the product
direction and its focused plus aggregate gates pass. A failing or unverifiable
area is separated from release acceptance; it is not silently called complete.
If removal becomes necessary, reconstruction starts from `0b3efd9` in a new
branch rather than reverting the merge blindly on `main`.

## Execution

- Status: `ready`
- Execution Gate: `allowed`
- Target environment: `dev/local`
- Maximum remediation rounds: `2`
- Release state: `frozen` until this checklist is resolved and production gates
  receive separate human approval.
