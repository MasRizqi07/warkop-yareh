# Implementation Plan: Warkop Ya'reh Controlled Domain Reconstruction

**Document Status:** PENDING APPROVAL FOR EXECUTION PASS 2  
**Target Monorepo:** `MasRizqi07/warkop-yareh`  
**Current HEAD SHA:** `4370459ef4f3500cb344a3fb6a39528c61fe79f4`  
**Branch:** `codex/phase9-functional-completeness`  

---

## 1. Overview & Strategy

This implementation plan outlines the atomic, staged execution to transition the repository from its contaminated specialty coffee template state into a truthful, maintainable, production-ready representation of the real Warkop Ya'reh business in Surabaya.

Execution is strictly divided into **9 atomic stages**. Each stage has clear rollback points, testing requirements, and binary completion criteria.

---

## 2. Atomic Implementation Stages

```
[ Stage 0: Groundwork & Truth ] ────► [ Stage 1: Design Quarantine ]
                                                │
                                                ▼
[ Stage 3: Namespace Remediation ] ◀── [ Stage 2: Shared Contracts ]
                │
                ▼
[ Stage 4: Database & Seed Reset ] ──► [ Stage 5: Web Reconstruction ]
                                                │
                                                ▼
[ Stage 7: Admin & API Pruning ]   ◀── [ Stage 6: Integrity Safeguards ]
                │
                ▼
[ Stage 8: Quality Gates & Baseline Release ]
```

---

### STAGE 0: Groundwork & Business Truth Establishment (COMPLETED)
- **Files Affected:**
  - `docs/reality-rebuild/00_BASELINE_AUDIT.md` [NEW]
  - `docs/reality-rebuild/01_CONTAMINATION_MATRIX.md` [NEW]
  - `docs/reality-rebuild/02_DATABASE_RESET_PLAN.md` [NEW]
  - `docs/reality-rebuild/03_ROUTE_RESET_PLAN.md` [NEW]
  - `docs/reality-rebuild/04_IMPLEMENTATION_PLAN.md` [NEW]
  - `docs/business/*` (8 files) [NEW]
- **Expected Behavior:** An immutable baseline and authoritative business ground truth are committed to documentation.
- **Migration Risk:** Zero (documentation only).
- **Rollback Strategy:** Delete untracked files or revert commit.
- **Tests Required:** Verification that all required audit documents exist and are internally consistent.
- **Completion Criteria:** All 13 foundation documents created and cross-referenced.

---

### STAGE 1: Design & Documentation Quarantine
- **Files Affected:**
  - `Design/*` (18 folders relocated to `Design/archive/speculative-v1/`)
  - `PRD.md`, `project_audit.md` (marked as historical / deprecated)
  - `apps/web/public/images/darmo-interior.png`, `artisan-toasted-sourdough.png` (quarantined)
- **Expected Behavior:** Speculative visual designs and legacy PRD documents are safely archived so they cannot be mistaken for production requirements.
- **Migration Risk:** Low. Broken asset links in unrendered mockups.
- **Rollback Strategy:** `git mv` reversal.
- **Tests Required:** Verify git status and check for broken static image imports in `apps/web`.
- **Completion Criteria:** Zero speculative designs remain in active `Design/` root.

---

### STAGE 2: Shared Domain Contracts Realignment
- **Files Affected:**
  - `packages/types/index.ts` [MODIFY]
  - `packages/types/package.json` [VERIFY]
- **Expected Behavior:**
  - Define `DataConfidenceLevel` and `BusinessSourceType`.
  - Refactor `Branch` interface to include `plusCode`, verified coordinates, and remove fake capacities.
  - Prune `MembershipTier`, `Reservation`, `Event`, `CommunityGroup`, and `LoyaltyTransaction`.
  - Prune consumer loyalty fields from `User`.
- **Migration Risk:** High. Type errors across downstream packages (`apps/web`, `apps/api`, `apps/admin`).
- **Rollback Strategy:** Revert `packages/types/index.ts`.
- **Tests Required:** `pnpm --filter @warkop-yareh/types run build`.
- **Completion Criteria:** Types cleanly compile and accurately mirror the reality domain.

---

### STAGE 3: Cold 'N Brew Namespace Remediation
- **Files Affected:**
  - `apps/web/src/stores/auth.store.ts` [MODIFY]
  - `apps/web/src/stores/persist-storage.test.ts` [MODIFY]
  - `apps/api/src/modules/branch/branch.controller.spec.ts` [MODIFY]
  - Root configuration comments and scripts referencing `coldnbrew` [MODIFY]
- **Expected Behavior:**
  - Auth storage key migrated from `coldnbrew-auth` to `warkop-yareh-auth` with backward-compatible state migration.
  - Fixture IDs replaced from `coldnbrew-gubeng-001` to `jetis-kulon`.
  - Tests updated to validate clean identifiers.
- **Migration Risk:** Medium. User session invalidation if migration function fails.
- **Rollback Strategy:** Revert store migration function.
- **Tests Required:** `pnpm --filter @warkop-yareh/web test run src/stores/persist-storage.test.ts`.
- **Completion Criteria:** Zero occurrences of `coldnbrew` in client runtime storage or active test assertions.

---

### STAGE 4: Database Schema Transition & Production Seed Realignment
- **Files Affected:**
  - `packages/database/prisma/schema.prisma` [MODIFY]
  - `packages/database/prisma/seed.ts` [REWRITE]
  - `packages/database/prisma/migrations/20260918000000_domain_reality_reset` [NEW]
- **Expected Behavior:**
  - Schema defines core models: `Branch`, `BusinessHour`, `MenuCategory`, `MenuItem`, `BranchMenuItem`, `GalleryAsset`, `SiteContent`, `BusinessFact`, `SourceReference`.
  - Speculative models isolated or deprecated.
  - Production seed inserts ONLY `jetis-kulon` and `prapen` with verified addresses, phone number, and hours.
  - Production menu seed remains **completely empty**.
- **Migration Risk:** High. Schema migration failure or data loss on active databases.
- **Rollback Strategy:** Prisma down migration or restore from pre-migration backup.
- **Tests Required:** `pnpm --filter @warkop-yareh/database run db:generate`, `pnpm --filter @warkop-yareh/database run db:migrate:deploy`, `pnpm --filter @warkop-yareh/database run db:seed`.
- **Completion Criteria:** Database seeds cleanly with 2 verified branches and 0 fictional menu items.

---

### STAGE 5: Public Route Reconstruction (`apps/web`)
- **Files Affected:**
  - `apps/web/src/app/(marketing)/page.tsx` [REWRITE] — 10-section authentic warkop homepage
  - `apps/web/src/app/(marketing)/about/page.tsx` [REWRITE] — Surabaya warkop heritage
  - `apps/web/src/app/(marketing)/menu/page.tsx` [REWRITE] — Verified price range & verification notice
  - `apps/web/src/app/(marketing)/contact/page.tsx` [REWRITE] — Prapen phone, Maps directions
  - `apps/web/src/app/outlets/page.tsx` [NEW] — Branch directory
  - `apps/web/src/app/outlets/[slug]/page.tsx` [NEW] — Individual branch details
  - `apps/web/src/app/gallery/page.tsx` [NEW] — Real venue atmosphere
  - `apps/web/src/components/layout/UniversalHeader.tsx` [MODIFY] — Clean navigation links
  - `apps/web/src/components/layout/footer.tsx` [MODIFY] — Clean truthful footer
  - `apps/web/src/app/(marketing)/booking` [DELETE / REDIRECT]
  - `apps/web/src/app/(marketing)/community` [DELETE / REDIRECT]
  - `apps/web/src/app/(marketing)/events` [DELETE / REDIRECT]
  - `apps/web/src/app/loyalty` [DELETE / REDIRECT]
  - `apps/web/src/app/reservations` [DELETE / REDIRECT]
  - `apps/web/src/app/sitemap.ts` [REWRITE] — Sitemap updated for verified routes
- **Expected Behavior:** Public website truthfully and beautifully reflects Warkop Ya'reh in Surabaya without broken links or fictional claims.
- **Migration Risk:** Medium. Next.js Turbopack build regressions.
- **Rollback Strategy:** Revert page components to git baseline.
- **Tests Required:** `pnpm --filter @warkop-yareh/web test`, `pnpm --filter @warkop-yareh/web build`.
- **Completion Criteria:** All public routes build statically and pass unit/integration tests.

---

### STAGE 6: Automated Business Integrity Safeguards
- **Files Affected:**
  - `scripts/business-integrity-audit.mjs` [NEW]
  - `package.json` [MODIFY] — Add `pnpm audit:reality` script
  - `.github/workflows/ci.yml` [MODIFY] — Integrate reality audit into CI pipeline
- **Expected Behavior:** Automated scanner scans code, seeds, and routes for forbidden legacy fixture patterns (`coldnbrew-gubeng-001`, `Warkop Ya'reh Gubeng`, fake phone numbers, fake email addresses, `Nitro Cold Brew`, `Croissant Mentega`, `Meeting Room A`). Fails build if detected.
- **Migration Risk:** Low.
- **Rollback Strategy:** Remove CI step.
- **Tests Required:** `pnpm audit:reality` executes and exits code 0 on clean code, exits code 1 on deliberate test fixture injection.
- **Completion Criteria:** Automated gate active in local scripts and GitHub Actions CI.

---

### STAGE 7: Admin Backoffice & API Scope Realignment
- **Files Affected:**
  - `apps/admin/src/components/layout/Sidebar.tsx` [MODIFY]
  - `apps/admin/src/app/(dashboard)/branches/page.tsx` [REWRITE]
  - `apps/admin/src/app/(dashboard)/products/page.tsx` [REWRITE]
  - `apps/api/src/app.module.ts` [MODIFY] — Unload or park speculative modules (`ai`, `community`, `event`, `franchise`, `loyalty`, `reservation`)
- **Expected Behavior:** Admin and API applications are strictly scoped to managing verified business realities (branches, menu, gallery, site content).
- **Migration Risk:** Medium. API controller route changes.
- **Rollback Strategy:** Re-enable modules in `app.module.ts`.
- **Tests Required:** `pnpm --filter @warkop-yareh/admin build`, `pnpm --filter @warkop-yareh/api build`.
- **Completion Criteria:** Both applications build cleanly with zero unhandled route exceptions.

---

### STAGE 8: Quality Gates & Full Verification Baseline
- **Files Affected:** Monorepo-wide
- **Expected Behavior:** Full workspace typecheck, lint, test, build, and reality audit pass with exit code 0.
- **Commands:**
  1. `pnpm audit:reality`
  2. `pnpm turbo run typecheck`
  3. `pnpm turbo run lint`
  4. `pnpm turbo run test`
  5. `pnpm turbo run build`
- **Completion Criteria:** 100% green quality gates.

