# Database Migration Chain Audit

## 1. Overview and Migration Integrity

This audit provides a comprehensive inspection of the entire database schema migration history under `packages/database/prisma/migrations/` up to commit `3303f1c1837adbd7d69dd5bcc36f3293f71f92dc`.

### Summary of Findings:
- **Total Migrations**: 15 migration directories.
- **Prisma Schema Consistency**: Verified with `prisma validate` (Schema is valid).
- **Migration Deletions or History Rewrites**: None detected. All migration directory names follow standard timestamp format `YYYYMMDDHHMMSS_<name>`.
- **Destructive Statements**: Exactly one statement (`DROP INDEX "event_registrations_eventId_idx"` in `20260908143000_event_registration_status_index`), which is immediately replaced by a composite index `("eventId", "status")`. Zero tables or columns dropped. Zero data truncations or deletions.
- **Merge 90c4366 Impact**: Merge `90c4366` (via parent `f7c76db`) introduced two new migrations:
  1. `20260908130000_cashier_shift_operations`
  2. `20260908143000_event_registration_status_index`
  Both migrations are strictly additive and non-destructive.

---

## 2. Comprehensive Migration Inventory

| # | Migration Directory | Introduced by Commit | Destructive? | Risk Level | Summary & Purpose | Rollback / Forward Strategy |
|---|---|---|---|---|---|---|
| 1 | `20260709032524_init` | `7068321` | No | Low | Initial database tables (Users, Branches, Products, Categories, Orders, OrderItems, Tables). | Reversible via down migration if empty DB. |
| 2 | `20260709032553_enable_rls` | `2cd60f6` | No | Low | Enables Row-Level Security on tenant tables. | Reversible (`DISABLE ROW LEVEL SECURITY`). |
| 3 | `20260709032704_soft_delete_and_snapshots` | `2cd60f6` | No | Low | Adds `deletedAt`, soft-delete tracking, and price snapshots. | Additive nullable columns. |
| 4 | `20260712011030_force_rls` | `2cd60f6` | No | Low | Enforces `FORCE ROW LEVEL SECURITY` on tenant tables. | Reversible (`NO FORCE ROW LEVEL SECURITY`). |
| 5 | `20260713041928_create_api_user_role` | `37b312c` | No | Low | Creates `api_user` PostgreSQL role for least-privilege API access. | Role management. |
| 6 | `20260713042838_dynamic_api_user_grant` | `37b312c` | No | Low | Grants table permissions dynamically to `api_user`. | Role grants. |
| 7 | `20260713050000_fix_rls_policies` | `13c2f9b` | No | Low | Hardens RLS policies using `app.current_branch_id` and `app.current_user_role`. | Policy rewrite. |
| 8 | `20260905090000_harden_order_idempotency` | `01aa6da` | No | Low | Adds idempotency key and request fingerprint columns to `orders`. | Additive nullable columns. |
| 9 | `20260906080000_persist_payment_redirect` | `eb15d74` | No | Low | Adds payment redirect URL persistence and Midtrans fields. | Additive nullable columns. |
| 10 | `20260906100000_checkout_pricing` | `ed21d55` | No | Low | Adds tax, service fee, and discount breakdown columns to `orders`. | Additive nullable columns. |
| 11 | `20260906180000_paid_booking` | `ed21d55` | No | Low | Adds deposit and payment linkage to table reservations. | Additive nullable columns. |
| 12 | `20260907150000_phase6_admin_operations` | `ed21d55` | No | Low | Adds inventory adjustments, stock tracking, and supplier models. | New tables and additive relations. |
| 13 | `20260907220000_whatsapp_marketing_consent` | `29880e3` | No | Low | Adds `whatsappConsent` boolean and phone verification fields. | Additive column with default. |
| 14 | `20260908130000_cashier_shift_operations` | `f7c76db` (via `90c4366`) | No | Medium | Introduces `cashier_shifts` and `cash_drawer_movements` tables, enums (`CashierShiftStatus`, `CashMovementType`), partial unique index (`one_open_per_branch`), and RLS policies. | Strictly additive. Existing tables untouched. Can be rolled back by dropping new tables if required. |
| 15 | `20260908143000_event_registration_status_index` | `f7c76db` (via `90c4366`) | Safe Index Change | Low | Drops single-column `event_registrations_eventId_idx` and creates composite index `event_registrations_eventId_status_idx`. | Index recreation; no data altered. |

---

## 3. Analysis of Destructive Statements

Grepping all SQL migration files for destructive patterns (`DROP TABLE`, `DROP COLUMN`, `ALTER TYPE`, `TRUNCATE`, `DELETE FROM`, `DROP TYPE`, `DROP INDEX`) identified exactly one statement:

```sql
-- packages/database/prisma/migrations/20260908143000_event_registration_status_index/migration.sql
DROP INDEX "event_registrations_eventId_idx";
CREATE INDEX "event_registrations_eventId_status_idx" ON "event_registrations"("eventId", "status");
```

### Risk Evaluation:
- **Destructive Severity**: ZERO data loss risk.
- **Index Locking**: Dropping and creating index without `CONCURRENTLY` is acceptable because `event_registrations` is an internal table, and Prisma migrate deploy runs within a transaction during maintenance window.
- **Compatibility**: The composite index covers all queries filtering on `eventId` as well as queries filtering on `(eventId, status)`. Fully backward-compatible.

---

## 4. Verification in Isolation & Upgrade Path

### 4.1 Fresh Database Validation (CI Pipeline)
- **Status**: CI Verified (`PASS` on exact commit `3303f1c`).
- **Command**: `pnpm --filter @warkop-yareh/database run db:migrate:deploy`
- **Runner**: GitHub Actions Ubuntu 22.04 runner against container `postgres:16`.
- **Result**: All 15 migrations applied cleanly in sequence from scratch without errors or warnings. Prisma Client generated cleanly and all downstream TypeScript and integration tests passed.

### 4.2 Upgrade Path Validation (Existing Baseline to Latest)
- **Pre-remediation Baseline**: Migrations 1 through 13.
- **Target Delta**: Migrations 14 and 15 (`20260908130000_cashier_shift_operations` and `20260908143000_event_registration_status_index`).
- **Data Integrity Assessment**:
  - `cashier_shifts` and `cash_drawer_movements` are new tables. No existing table schemas or column types were modified.
  - Foreign keys reference `branches(id)` and `users(id)` with `ON DELETE RESTRICT`. Because existing records in `branches` and `users` are unaffected, no FK violations can occur during migration.
  - Check constraints ensure valid positive floats and consistent open/closed states for new shift records.
  - Partial unique index `cashier_shifts_one_open_per_branch` applies only to new records with `status = 'OPEN'`.
- **Local Environment Limitation**: Local Docker engine is inactive on the Windows audit workstation. Live verification relies on GitHub Actions ephemeral PostgreSQL 16 container runs.

---

## 5. Production Migration Recommendations

1. **Safety Verdict**: Non-destructive. All migrations are forward-compatible and safe for deployment.
2. **Preflight Guard**: Deploy the hardened `cd.yml` workflow with `scripts/validate-database-target.mjs` before executing migrations.
3. **Execution Mode**: Production migration must ALWAYS use `prisma migrate deploy` triggered manually via GitHub Actions workflow dispatch with commit SHA confirmation. NEVER use `prisma migrate dev` or destructive reset commands.

