# Phase 2.5: Implementation Diff & Change Classification Audit

## 1. Worktree Forensics

- **Repository**: `MasRizqi07/warkop-yareh`
- **Branch**: `codex/phase9-functional-completeness`
- **Local HEAD**: `7a0ae1481338ccd7f1302767b210e2787af81cd3`
- **Remote HEAD (origin/codex/phase9-functional-completeness)**: `7a0ae1481338ccd7f1302767b210e2787af81cd3`
- **Staged Files**: 0
- **Total Modified Files**: 31
- **Total Deleted Files**: 16
- **Total Newly Created Files**: 13
- **Total Tracked & Untracked Implementation Items**: 60

---

## 2. Change Classification & Audit Matrix

| Path | Action | Category | Reason | Domain Impact | Risk | Validation Performed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `README.md` | modified | DOCUMENTATION | Align branch documentation with verified branches (Jetis Kulon, Prapen) | Removes speculative branches from README | Low | Visual inspection |
| `apps/admin/src/components/layout/Sidebar.tsx` | modified | ADMIN | Remove speculative VIP/Franchise navigation; add Gallery & Site Content | Aligns admin portal with reality | Low | Admin build & typecheck |
| `apps/admin/src/app/(dashboard)/gallery/page.tsx` | added | ADMIN | Admin portal for authentic warkop photo management | Enables staff to manage unhallucinated visual assets | Low | Admin build & lint |
| `apps/admin/src/app/(dashboard)/site-content/page.tsx` | added | ADMIN | Admin portal for verified marketing copy and confidence levels | Auditability for public copy | Low | Admin build & lint |
| `apps/api/src/app.module.ts` | modified | API | De-register speculative AiModule and FranchiseModule | Decouples speculative features from active API | Medium | API unit test suite (37 suites, 246 tests) |
| `apps/api/src/modules/ai/ai.controller.ts` | deleted | LEGACY_REMOVAL | Speculative AI recommendation controller | Purges unverified AI concierge API | Low | API build & test suite |
| `apps/api/src/modules/ai/ai.module.ts` | deleted | LEGACY_REMOVAL | Speculative AI module definition | Purges unverified AI module | Low | API build & test suite |
| `apps/api/src/modules/ai/ai.service.spec.ts` | deleted | LEGACY_REMOVAL | Speculative AI service tests | Cleans out test suite for deleted feature | Low | API test suite |
| `apps/api/src/modules/ai/ai.service.ts` | deleted | LEGACY_REMOVAL | Speculative AI service implementation | Purges unverified AI recommendations | Low | API build & test suite |
| `apps/api/src/modules/ai/dto/recommendation.dto.ts` | deleted | LEGACY_REMOVAL | Speculative AI DTOs | Purges unverified AI data contracts | Low | API build & test suite |
| `apps/api/src/modules/franchise/application/services/franchise.service.spec.ts` | deleted | LEGACY_REMOVAL | Speculative franchise royalty calculation tests | Cleans out tests for deleted feature | Low | API test suite |
| `apps/api/src/modules/franchise/application/services/franchise.service.ts` | deleted | LEGACY_REMOVAL | Speculative franchise revenue sharing service | Purges unverified multi-tenancy logic | Low | API build & test suite |
| `apps/api/src/modules/franchise/franchise.module.ts` | deleted | LEGACY_REMOVAL | Speculative franchise module definition | Purges unverified franchise module | Low | API build & test suite |
| `apps/api/src/modules/franchise/presentation/controllers/franchise.controller.spec.ts` | deleted | LEGACY_REMOVAL | Speculative franchise controller tests | Cleans out tests for deleted feature | Low | API test suite |
| `apps/api/src/modules/franchise/presentation/controllers/franchise.controller.ts` | deleted | LEGACY_REMOVAL | Speculative franchise management controller | Purges unverified franchise endpoints | Low | API build & test suite |
| `apps/api/src/modules/franchise/presentation/dtos/franchise.dto.ts` | deleted | LEGACY_REMOVAL | Speculative franchise DTOs | Purges unverified franchise data contracts | Low | API build & test suite |
| `apps/web/e2e/commerce.e2e.ts` | modified | TEST | Assert against active `warkop-yareh-auth` key and assert legacy key deletion | Keeps e2e tests aligned with new storage key | Low | Typecheck |
| `apps/web/next.config.mjs` | modified | CUSTOMER_WEB | Add HTTP 301/302 redirects for unverified public routes | Prevents customer access to speculative features | Low | Web build (34/34 pages static gen) |
| `apps/web/src/app/(marketing)/about/page.tsx` | modified | CUSTOMER_WEB | Reconstruct about page with strictly factual information | Eliminates fake founding stories and dates | Low | Web build, lint, vitest |
| `apps/web/src/app/(marketing)/contact/page.tsx` | modified | CUSTOMER_WEB | Present verified Prapen phone number and Google Plus Codes | Real customer communication touchpoints | Low | Web build, lint, vitest |
| `apps/web/src/app/(marketing)/gallery/page.tsx` | added | CUSTOMER_WEB | Dedicated gallery route showcasing authentic warkop ambiance | Replaces stock/AI imagery with real photography policy | Low | Web build, lint, vitest |
| `apps/web/src/app/(marketing)/layout.test.tsx` | modified | TEST | Update layout test to remove deleted BaristaConciergeModal check | Keeps tests green for clean layout | Low | Web vitest (42 passed) |
| `apps/web/src/app/(marketing)/layout.tsx` | modified | CUSTOMER_WEB | Remove speculative BaristaConciergeModal mounting | Cleaner customer marketing shell | Low | Web build & vitest |
| `apps/web/src/app/(marketing)/menu/page.tsx` | modified | CUSTOMER_WEB | Add menu verification notice and Rp1–25k spending context | Absolute transparency on unconfirmed menu items | Low | Web build & vitest |
| `apps/web/src/app/(marketing)/outlets/page.tsx` | added | CUSTOMER_WEB | Directory of verified branches (Jetis Kulon & Prapen) | Accurate physical store locations | Low | Web build (SSG) |
| `apps/web/src/app/(marketing)/outlets/[slug]/page.tsx` | added | CUSTOMER_WEB | SSG detail page for Jetis Kulon & Prapen | Deep outlet information and maps link | Low | Web build (SSG 2/2 pages) |
| `apps/web/src/app/(marketing)/page.tsx` | modified | CUSTOMER_WEB | Reconstruct homepage around 24-hour Surabaya warkop reality | Authentic brand identity and branch links | Low | Web build & vitest |
| `apps/web/src/app/ops/kds/page.tsx` | deleted | LEGACY_REMOVAL | Remove kitchen display screen from customer web app | Internal ops belongs only in Admin app | Low | Web build |
| `apps/web/src/app/ops/pos/page.tsx` | deleted | LEGACY_REMOVAL | Remove cashier screen from customer web app | Internal ops belongs only in Admin app | Low | Web build |
| `apps/web/src/app/ops/shift/page.tsx` | deleted | LEGACY_REMOVAL | Remove shift management from customer web app | Internal ops belongs only in Admin app | Low | Web build |
| `apps/web/src/app/sitemap.ts` | modified | CUSTOMER_WEB | Index only verified routes in sitemap | Search engine indexing reflects truth | Low | Web build (`sitemap.xml`) |
| `apps/web/src/components/ai/barista-concierge-modal.test.tsx` | deleted | LEGACY_REMOVAL | Speculative AI modal unit tests | Purges unsupported test files | Low | Web vitest suite |
| `apps/web/src/components/ai/barista-concierge-modal.tsx` | deleted | LEGACY_REMOVAL | Speculative AI barista concierge dialog | Eliminates unverified client UI | Low | Web build |
| `apps/web/src/components/layout/UniversalHeader.tsx` | modified | CUSTOMER_WEB | Remove VIP/Reservations/Loyalty links; link to Menu, Cabang, Galeri, Kontak | Clean customer navigation | Low | Web build & vitest |
| `apps/web/src/components/layout/footer.tsx` | modified | CUSTOMER_WEB | Align footer links and verified branch locations | Truthful footer metadata | Low | Web build |
| `apps/web/src/components/navigation/PwaBottomDock.tsx` | modified | CUSTOMER_WEB | Align bottom dock navigation items | Mobile customer dock reflects truth | Low | Web build |
| `apps/web/src/lib/constants.ts` | modified | BUSINESS_TRUTH | Verified tagline, operating hours, and Prapen phone number | Single source of truth for marketing constants | Low | Web build & audit:reality |
| `apps/web/src/stores/auth.store.ts` | modified | AUTH | Migrate storage key to `warkop-yareh-auth` with migration function | Transparent session migration | Medium | Store unit tests |
| `apps/web/src/stores/persist-storage.test.ts` | modified | TEST | Test transparent migration from `coldnbrew-auth` to `warkop-yareh-auth` | Prevents session regressions | Low | Web vitest suite |
| `apps/web/src/stores/persist-storage.ts` | modified | AUTH | Implement lazy migration adapter for localStorage key | Eliminates legacy brand name from storage | Low | Vitest unit test suite |
| `docs/business/BRANCHES.md` | modified | DOCUMENTATION | Update branch inventory with evidence status and coordinates | Documents verified outlets | Low | Visual inspection |
| `docs/business/BUSINESS_TRUTH.md` | modified | DOCUMENTATION | Update business truth axioms with UNVERIFIED evidence semantics | Accurate domain audit reference | Low | Visual inspection |
| `docs/business/DATA_CONFIDENCE.md` | modified | DOCUMENTATION | Refine confidence grading policy | Standardized data classification | Low | Visual inspection |
| `docs/business/FACILITIES.md` | modified | DOCUMENTATION | Correct facility records for Jetis Kulon & Prapen | Reality-grounded facility notes | Low | Visual inspection |
| `docs/business/MENU.md` | modified | DOCUMENTATION | Document empty menu seed policy and spending range semantics | Prevents menu hallucinations | Low | Visual inspection |
| `docs/reality-rebuild/02_DATABASE_RESET_PLAN.md` | modified | DOCUMENTATION | Refine database migration and seed strategy | Guides database reconstruction | Low | Visual inspection |
| `docs/reality-rebuild/03_ROUTE_RESET_PLAN.md` | modified | DOCUMENTATION | Refine route transition and parking plan | Guides web reconstruction | Low | Visual inspection |
| `docs/reality-rebuild/04_IMPLEMENTATION_PLAN.md` | modified | DOCUMENTATION | Comprehensive implementation specification | Master implementation plan | Low | Visual inspection |
| `docs/reality-rebuild/05_TEST_BASELINE.md` | added | DOCUMENTATION | Record deterministic test baseline (37 suites, 246 tests) | Establishes regression safety baseline | Low | Visual inspection |
| `docs/reality-rebuild/06_DOMAIN_STATUS.md` | added | DOCUMENTATION | Record domain capability status (verified, unverified, removed) | Transparent domain mapping | Low | Visual inspection |
| `docs/reality-rebuild/07_ROUTE_TRANSITION_MATRIX.md` | added | DOCUMENTATION | Route redirect mapping table | Formal route lifecycle management | Low | Visual inspection |
| `docs/reality-rebuild/08_AUTH_MIGRATION_DESIGN.md` | added | DOCUMENTATION | Auth storage migration architecture | Documents zero session disruption | Low | Visual inspection |
| `docs/reality-rebuild/09_SEED_SAFETY.md` | added | DOCUMENTATION | Database seed safety protocols and anti-contamination rules | Prevents re-contamination of DB | Low | Visual inspection |
| `package.json` | modified | CI_OR_TOOLING | Add `"audit:reality"` script | Enables automated reality audit | Low | `pnpm audit:reality` |
| `packages/database/prisma/migrations/20260918000000_core_reality_additions/migration.sql` | added | MIGRATION | Additive migration for BusinessHour, GalleryAsset, SiteContent, BusinessFact | Forward-only database schema evolution | Medium | Prisma generate & build |
| `packages/database/prisma/schema.prisma` | modified | DATABASE | Define core reality models and relations | Schema reflects business facts | Medium | `prisma generate` & build |
| `packages/database/prisma/seed.ts` | modified | DATABASE | Overhaul seed: only Jetis Kulon & Prapen, 0 products, clean admin | Truthful database state | Medium | `pnpm audit:reality` |
| `packages/types/index.ts` | modified | BUSINESS_TRUTH | Export `VERIFIED_BRANCHES`, `DataConfidenceLevel`, `BusinessSourceType` | Canonical domain types | Low | Typecheck across packages |
| `scripts/business-integrity-audit.mjs` | added | CI_OR_TOOLING | Automated reality audit tool running 13 strict checks | Guards against reality regressions | Low | `pnpm audit:reality` (13/13 PASS) |
| `scripts/test-phase1-e2e.ts` | modified | TEST | Update orderPayload branchId to `jetis-kulon` | Aligns test script with verified branch | Low | Code inspection |
