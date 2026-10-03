# Product v3 repository baseline

Captured 2026-10-02 after `git fetch origin` and `git pull --ff-only origin main`: `HEAD = main = origin/main = b21ee705d845dd2459f39682b164ca4afa26c718`. Branch `codex/product-v3-reality-platform` starts at that SHA. Uncommitted Phase 3 work was preserved in a named stash and applied on the new branch; the stash remains a recovery checkpoint. No production database was touched.

| Area | Observed inventory | Product implication |
| --- | --- | --- |
| Apps | `apps/web` Next 16, `apps/admin` Next 16, `apps/api` Nest 11 | Separate customer, staff and API releases |
| Packages | `packages/database` Prisma 5.22, `packages/types`, `packages/ui` | Canonical facts currently live in types, with duplicates in UI/seed |
| Routes | 35 web `page.tsx`, 23 admin `page.tsx` | Redirected legacy web files and directly accessible legacy admin pages remain |
| API | 16 `apps/api/src/modules/*` modules plus auth/payment/infrastructure | Reservation, event, community and loyalty modules are still registered in `AppModule` |
| Schema | 39 Prisma models, 29 enums, 18 migration directories after carried Phase 3 additions | Historical tables and enum values require staged decommissioning |
| Tests | 41 API test/e2e files, 16 web test/e2e files, 1 admin unit file | Playwright has commerce and admin-persistence suites; product publishing needs new coverage |
| CI | `.github/workflows/ci.yml` runs on PR to `main` and push to `main` with Postgres 16/Redis 7 | Scope, reality, type, lint, build, persistence, API E2E and browser gates exist |
| Deploy | Web/admin Vercel aliases answered 200 during the Phase 3 baseline; production API mapping unknown | Local evidence cannot certify current deployment |
| Docs | Root `PRD.md` still starts with Cold 'N Brew Gubeng; `README.md` markets a specialty/coworking ecosystem | Both are active product-definition drift and must be replaced |

| Domain | Active runtime? | Publicly exposed? | Database dependency? | Tests? | Business evidence? | Target |
| --- | --- | --- | --- | --- | --- | --- |
| Branch information / hours | Yes | Yes | Optional fixture fallback plus DB | Reality and browser checks | Two verified Surabaya outlets | CORE |
| Menu catalog | API/admin yes; public test catalog only in carried Phase 3 work | Public menu currently empty by design | Yes | Catalog and checkout tests | No sourced item-level menu yet | CONDITIONAL |
| Customer identity | Yes | Login/register/OTP | Yes | Unit/E2E | Technical capability, not proof of production provider configuration | ACTIVE |
| Ordering/payment | Yes in API and test fixture | Internal route URLs still reachable; public activation unapproved | Yes | Checkout, payment and browser suites | Operational fulfillment and live gateway unverified | CONDITIONAL |
| Gallery/site content | Carried Phase 3 API/admin drafts | Gallery approved subset only | Yes | New unit/browser tests | No real published photo evidence supplied | CONDITIONAL |
| Table/kitchen/cashier/inventory | Yes in API/admin | Staff only | Yes | Operations/E2E | Site workflow unverified | INTERNAL |
| Reservation/event/community/loyalty | API modules remain registered; web routes mostly redirected | Old direct/admin URLs persist | Yes | Historical tests | No v3 business authorization | LEGACY |
| Marketing/analytics | API/admin code exists | Staff only | Yes | Some tests | Real use/provenance unverified | CONDITIONAL |
| AI/franchise | AI module absent, franchise tables remain | No supported public offer | Yes for franchise history | Limited | None supplied | DEPRECATED |

The inventory is a code map, not a production data count. Production row counts, feature-provider settings, branch protection and Vercel/Railway project ownership were not available through the local checkout. The concrete model-by-model map is [01_DOMAIN_MATRIX.md](01_DOMAIN_MATRIX.md); migration and retention decisions are in [02_SCHEMA_DECOMMISSION_PLAN.md](02_SCHEMA_DECOMMISSION_PLAN.md).
