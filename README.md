# Warkop Ya'reh digital platform

Warkop Ya'reh operates two verified 24-hour outlets in Surabaya: Jetis Kulon and Prapen. This repository contains its customer website, staff portal, and API. Product decisions follow [Product v3](PRD.md): publish only facts and capabilities supported by business evidence.

| Outlet | Address | Plus Code | Contact |
| --- | --- | --- | --- |
| WARKOP YA'REH — Jetis Kulon | Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243 | MPVJ+2G Wonokromo, Surabaya, Jawa Timur | No verified phone |
| WARKOP YA'REH 2 PRAPEN | Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239 | MQM3+XJ Prapen, Surabaya, Jawa Timur | 0821-3735-4606 |

Both support dine-in and takeaway. The public spending range is Rp1–25.000 per person; it is not a product price list. Canonical typed facts are in `packages/types/index.ts` and are protected by `pnpm audit:reality` and browser checks.

## Active now

- Customer information pages: home, outlets, branch details, directions, about, contact, truthful menu status, and a provenance-controlled gallery.
- Customer identity code for email/password and OTP, subject to deployed provider configuration and security review.
- Staff portal for branch, catalog, gallery, editorial drafts, orders, and internal operations. Staff features are technical capabilities, not a claim that a workflow is active at the outlets.
- NestJS API with PostgreSQL/Prisma, Redis, server-side authorization, and health checks.

## Gated

- Itemized menu publication requires source evidence, review, branch availability, and approved prices. With no verified products, the customer menu shows an honest empty state. Browser fixture products are confined to disposable `warkop_audit` tests.
- Public ordering, online payment, and QR/table ordering default off and require their matching flags plus operational/provider readiness. The public staff shortcut also defaults off behind `NEXT_PUBLIC_OPERATIONS`.
- POS/kitchen, analytics, and outbound marketing remain internal code paths requiring separate operator review; `OPERATIONS` and `ANALYTICS` are reserved flag names and do not yet disable those API modules. Passing a test does not activate a real-world service.
- Gallery and site content begin as private drafts. Only verified venue photography with primary evidence can appear in the public feed. Editorial draft saves do not publish customer copy automatically.

## Planned or deprecated

Reservation, event, community, loyalty, referral, franchise, delivery, drive-thru, and AI recommendation behavior lacks verified business authorization. Reservation/event/community/loyalty API modules are unregistered, and their public and admin entry routes redirect. Historical schema and source files remain for compatibility; they are catalogued in [the domain matrix](docs/product-v3/01_DOMAIN_MATRIX.md) and [decommission plan](docs/product-v3/02_SCHEMA_DECOMMISSION_PLAN.md).

## Repository

| Path | Responsibility |
| --- | --- |
| `apps/web` | Next.js 16 customer site |
| `apps/admin` | Next.js 16 staff portal |
| `apps/api` | NestJS 11 HTTP API, auth, commerce engine, operations |
| `packages/database` | Prisma 5.22 schema, migrations, client and seed |
| `packages/types` | Shared interfaces and verified branch fixtures |
| `packages/ui` | Shared presentation components |
| `scripts` | Scope, business integrity, production contracts, and browser smoke audits |

Use Node 24.x and pnpm 9.x. Local API/persistence tests require disposable PostgreSQL 16 and Redis 7; configure their connection URLs in ignored local environment files. Never point test or seed commands at a production database. Run `pnpm install --frozen-lockfile`, `pnpm --filter @warkop-yareh/database run db:generate`, then the required gates:

```bash
pnpm audit:scope
pnpm audit:reality
pnpm test:contracts
pnpm turbo run lint -- --max-warnings=0
pnpm turbo run typecheck
pnpm turbo run test
pnpm --filter @warkop-yareh/api run test:e2e
pnpm turbo run build --concurrency=1
pnpm test:e2e
```

`pnpm test:e2e` requires the isolated database, Redis, Chromium, and the loopback fixture configuration in `playwright.config.ts`. Do not run it against a live provider. The GitHub Actions workflow runs on PRs targeting `main` and pushes to `main`; exact-head CI and deployed web/admin previews are separate acceptance gates.

Read [product v3 audit](docs/product-v3/00_REPOSITORY_BASELINE.md) for the current architecture, [production readiness evidence](docs/production-readiness/00_EXECUTIVE_SUMMARY.md) for the previous release audit, and [deployment configuration](docs/deployment.md) for provider variable names. Historical audit documents remain historical records, not current release approval.
