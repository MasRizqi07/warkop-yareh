# Implementation Plan: Warkop Ya'reh Controlled Domain Reconstruction

**Document Status:** PENDING APPROVAL FOR EXECUTION PASS 2  
**Document Status:** REVISED PHASE 1.5 ATOMIC IMPLEMENTATION ROADMAP  
**Target Monorepo:** `MasRizqi07/warkop-yareh`  
**Current HEAD SHA:** `4370459ef4f3500cb344a3fb6a39528c61fe79f4`  
**Branch:** `codex/phase9-functional-completeness`  

---

## 1. Overview & Strategy
## 1. Overview & Phasing Principles

This implementation plan outlines the atomic, staged execution to transition the repository from its contaminated specialty coffee template state into a truthful, maintainable, production-ready representation of the real Warkop Ya'reh business in Surabaya.
This implementation plan governs the controlled reconstruction of `MasRizqi07/warkop-yareh`. 

Execution is strictly divided into **9 atomic stages**. Each stage has clear rollback points, testing requirements, and binary completion criteria.
To prevent regressions, broken routes, or accidental data loss, the work is strictly partitioned into **11 sequential, atomic stages**. No stage will be executed without prior verification and green quality gates on preceding stages.

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
Stage 1: Evidence Corrections & Domain Policies (Phase 1.5)
   │
   ▼
Stage 2: Semantics-Safe Legacy Namespace Cleanup
   │
   ▼
Stage 3: Business Source-of-Truth Types & Verified Fixtures
   │
   ▼
Stage 4: Seed Replacement & Protection Mechanism
   │
   ▼
Stage 5: Public Navigation & Route Deactivation (Redirects)
   │
   ▼
Stage 6: Core Database Additions (Additive Migrations)
   │
   ▼
Stage 7: Legacy Application Dependency Removal (Compile & Test per domain)
   │
   ▼
Stage 8: Database Physical Cleanup (Only after zero dependencies proved)
   │
   ▼
Stage 9: Customer Website Reconstruction (10-Section Homepage & IA)
   │
   ▼
Stage 10: Admin / CMS Reconstruction
   │
   ▼
Stage 11: Full Regression & Production Validation Baseline
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
## 2. Eleven Atomic Implementation Stages

### Stage 1: Evidence Corrections and Domain Policies (COMPLETED)
- **Scope:** 
  - Standardize confidence semantics (`docs/business/DATA_CONFIDENCE.md`, `BUSINESS_TRUTH.md`).
  - Replace speculative `VERIFIED_ABSENT` claims with `UNVERIFIED` / `NO CURRENT EVIDENCE`.
  - Clarify public venue spending range (`Rp1–25.000 per orang`) vs. item-level prices (`docs/business/MENU.md`).
  - Formulate factual, minimal About-page policy (`docs/reality-rebuild/03_ROUTE_RESET_PLAN.md`).
  - Produce test baseline audit (`docs/reality-rebuild/05_TEST_BASELINE.md`), domain status matrix (`06_DOMAIN_STATUS.md`), route transition matrix (`07_ROUTE_TRANSITION_MATRIX.md`), auth migration design (`08_AUTH_MIGRATION_DESIGN.md`), and seed safety plan (`09_SEED_SAFETY.md`).
- **Files Affected:** `docs/business/*`, `docs/reality-rebuild/*`.
- **Migration Risk:** Zero (Documentation & baseline specification).
- **Completion Criteria:** All audit and specification documents mutually consistent.

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
### Stage 2: Legacy Namespace Cleanup (Semantics-Safe)
- **Scope:** 
  - Migrate auth local storage key from `coldnbrew-auth` to `warkop-yareh-auth` with backward-compatible state migration in `apps/web/src/stores/auth.store.ts` and `persist-storage.ts`.
  - Sanitize non-domain identifiers, comments, and container titles across root files and scripts.
- **Files Affected:** `apps/web/src/stores/auth.store.ts`, `persist-storage.ts`, `persist-storage.test.ts`.
- **Migration Risk:** Low. In-flight sessions migrate automatically.
- **Rollback Strategy:** Revert storage adapter.
- **Tests Required:** `pnpm --filter @warkop-yareh/web test run src/stores/persist-storage.test.ts`.
- **Completion Criteria:** Zero occurrences of `coldnbrew-auth` in client runtime storage; store unit tests passing.

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
### Stage 3: Business Source-of-Truth Types and Fixtures
- **Scope:**
  - Export `DataConfidenceLevel`, `BusinessSourceType`, and `DynamicExternalFact` in `@warkop-yareh/types`.
  - Update `Branch` interface to include `plusCode`, verified coordinates, and remove fake capacities.
  - Create canonical verified branch fixtures for `jetis-kulon` and `prapen`.
- **Files Affected:** `packages/types/index.ts`.
- **Migration Risk:** Medium (Downstream compilation errors if types are pruned prematurely; use optional deprecations where needed).
- **Rollback Strategy:** Revert `packages/types/index.ts`.
- **Tests Required:** `pnpm --filter @warkop-yareh/types run build`.
- **Completion Criteria:** Types cleanly compile and accurately mirror the reality domain.
- **Completion Criteria:** Types cleanly compile and provide strong typing for verified facts.

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
### Stage 4: Seed Replacement & Protection Mechanism
- **Scope:**
  - Replace `packages/database/prisma/seed.ts` with the truthful production seed.
  - Seed ONLY `jetis-kulon` and `prapen` with verified addresses, Plus Codes, and phone numbers.
  - Enforce completely empty production menu seed (zero products).
  - Use neutral administrative accounts (`admin@warkopyareh.local`).
- **Files Affected:** `packages/database/prisma/seed.ts`.
- **Migration Risk:** Low for existing data; prevents contamination of future databases.
- **Rollback Strategy:** Restore pre-Stage 4 seed script.
- **Tests Required:** `pnpm --filter @warkop-yareh/database run db:seed`.
- **Completion Criteria:** Database seeds 2 verified branches, 0 fictional menu items, and 0 Cold 'N Brew fixtures.

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
### Stage 5: Public Navigation and Route Deactivation
- **Scope:**
  - Update `apps/web/src/components/layout/UniversalHeader.tsx` and `footer.tsx` to link only to verified routes: `/menu`, `/outlets`, `/gallery`, `/about`, `/contact`.
  - Configure HTTP 301 redirects in `apps/web/next.config.mjs` for decommissioned routes (`/booking`, `/reservations`, `/community`, `/events`, `/loyalty`).
  - Configure HTTP 302 redirects for parked commerce routes (`/cart`, `/checkout`) to `/menu`.
  - Remove `/ops/*` from `apps/web`.
- **Files Affected:** `apps/web/next.config.mjs`, `UniversalHeader.tsx`, `footer.tsx`, sitemap.
- **Migration Risk:** Low. Eliminates customer-facing broken links.
- **Rollback Strategy:** Revert `next.config.mjs` and header component.
- **Tests Required:** `pnpm --filter @warkop-yareh/web test`, `pnpm --filter @warkop-yareh/web build`.
- **Completion Criteria:** All decommissioned routes redirect safely; navigation header clean.

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
### Stage 6: Core Database Additions
- **Scope:**
  - Add verified models to `packages/database/prisma/schema.prisma`: `BusinessHour`, `GalleryAsset`, `SiteContent`, `BusinessFact`, `SourceReference`.
  - Add `plusCode`, `brandName` to `Branch`.
  - Generate additive migration (`20260918000000_core_reality_additions`).
- **Files Affected:** `packages/database/prisma/schema.prisma`, new migration file.
- **Migration Risk:** Low (Additive schema changes only; zero tables dropped).
- **Rollback Strategy:** `prisma migrate down` or revert migration file.
- **Tests Required:** `pnpm --filter @warkop-yareh/database run db:generate`, `pnpm --filter @warkop-yareh/database run db:migrate:deploy`.
- **Completion Criteria:** Prisma client generated; new tables created cleanly in database.

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
### Stage 7: Legacy Application Dependency Removal
- **Scope:**
  - Systematically remove code imports, store hooks, and API queries referencing deprecated models (`LoyaltyTransaction`, `Reward`, `Reservation`, `Event`, `CommunityPost`, `FranchiseAgreement`).
  - Prune `apps/api/src/app.module.ts` to unmount unused modules.
  - Compile and test after each coherent domain is decoupled.
- **Files Affected:** `apps/web/src/*`, `apps/api/src/*`, `apps/admin/src/*`.
- **Migration Risk:** High (Refactoring across multiple packages).
- **Rollback Strategy:** Git branch checkpoint before Stage 7.
- **Tests Required:** `pnpm turbo run typecheck`, `pnpm turbo run test`.
- **Completion Criteria:** Workspace compiles with zero runtime dependencies on deprecated models.

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
### Stage 8: Database Physical Cleanup (Only After Dependency Proof)
- **Scope:**
  - Once Stage 7 proves zero dependencies remain, remove deprecated models (`Voucher`, `Reservation`, `Event`, `CommunityGroup`, `LoyaltyTransaction`, `FranchiseAgreement`) from `schema.prisma`.
  - Generate cleanup migration (`20260918010000_drop_deprecated_speculative_models`).
  - Verify migration against fresh and representative existing databases.
- **Files Affected:** `packages/database/prisma/schema.prisma`, new migration file.
- **Migration Risk:** Medium (Physical table drops).
- **Rollback Strategy:** Pre-migration database dump.
- **Tests Required:** `pnpm --filter @warkop-yareh/database run db:migrate:deploy`, full regression test suite.
- **Completion Criteria:** Clean schema; zero orphaned tables in production database.

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
### Stage 9: Customer Website Reconstruction
- **Scope:**
  - Reconstruct `/`: 10-section authentic Surabaya warkop homepage.
  - Reconstruct `/about`: Minimal, factual profile without fictional folklore.
  - Reconstruct `/menu`: Display verified spending range (`Rp1–25.000 per orang`) and verification banner.
  - Reconstruct `/contact`: Verified Prapen phone (`0821-3735-4606`), Plus Codes, and Google Maps directions.
  - Create `/outlets`, `/outlets/jetis-kulon`, `/outlets/prapen`.
  - Create `/gallery`: Real venue atmosphere visual showcase.
- **Files Affected:** `apps/web/src/app/*`.
- **Migration Risk:** Medium (UI / Turbopack build).
- **Rollback Strategy:** Git revert page components.
- **Tests Required:** `pnpm --filter @warkop-yareh/web test`, `pnpm --filter @warkop-yareh/web build`.
- **Completion Criteria:** Customer website renders authentic Warkop Ya'reh branding with 100% build pass.

---

### Stage 10: Admin / CMS Reconstruction
- **Scope:**
  - Realign admin dashboard sidebar to verified modules: `/branches`, `/products` (catalog), `/gallery`, `/site-content`, `/settings`.
  - Remove deprecated links (`/loyalty`, `/community`, `/events`, `/reservations`, `/crm`).
  - Update branch management view to support Plus Codes and verified operating schedules.
- **Files Affected:** `apps/admin/src/*`.
- **Migration Risk:** Low.
- **Rollback Strategy:** Git revert admin dashboard components.
- **Tests Required:** `pnpm --filter @warkop-yareh/admin test`, `pnpm --filter @warkop-yareh/admin build`.
- **Completion Criteria:** Admin backoffice operates as a clean content manager for verified assets.

---

### Stage 11: Full Regression & Production Validation Baseline
- **Scope:**
  - Add automated business integrity check (`scripts/business-integrity-audit.mjs`) to CI pipeline.
  - Run full suite of quality gates: lint, typecheck, unit tests, E2E tests, and production build.
- **Files Affected:** `package.json`, `.github/workflows/ci.yml`.
- **Commands Executed:**
  ```bash
  pnpm audit:reality
  pnpm turbo run typecheck
  pnpm turbo run lint
  pnpm turbo run test
  pnpm turbo run build
  ```
- **Completion Criteria:** 100% passing quality gates across the entire monorepo.
