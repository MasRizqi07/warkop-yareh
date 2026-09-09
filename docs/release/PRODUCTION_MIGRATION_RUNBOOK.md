# Production database migration runbook

Production database changes are frozen by default. The migration workflow is
manual and does not run after an ordinary push or successful CI run.

## Required controls

1. The exact commit has a successful CI run and has been reviewed.
2. GitHub environment `production` has required reviewers configured.
3. Its `DATABASE_URL` secret points at the intended non-local production
   database. Never paste the value into an issue, PR, command output, or log.
4. Its environment variable `PRODUCTION_MIGRATION_ENABLED` is set to `true`
   only for the approved migration window and returned to `false` afterward.
5. A current backup and rollback owner are recorded outside this repository.

## Execution

Run **CD — Database Migrations** manually with the full reviewed commit SHA and
the confirmation `MIGRATE_PRODUCTION`. The workflow checks out that exact SHA,
validates the release switch and database target, generates Prisma Client, and
runs `prisma migrate deploy` once under a non-cancelling concurrency group.

## Evidence boundary

A local or CI migration against `warkop_audit` proves migration compatibility,
not production deployment. Production is verified only by the protected
workflow run and post-migration checks against the production environment.
