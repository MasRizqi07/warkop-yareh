# Runtime inventory

Evidence date: 2026-09-30. A URL returning HTTP 200 proves reachability, not that it runs the working branch.

| Environment | Web | Admin | API and data | Status |
| --- | --- | --- | --- | --- |
| LOCAL | `127.0.0.1:3006` production-style Next start | `127.0.0.1:3007` production-style Next start | `127.0.0.1:4006`, disposable Postgres 16 `warkop_audit` on 55432 and Redis 7 on 56379 | Verified locally; fixture transport, no real payments |
| TEST | GitHub Actions Node 24, Postgres 16, Redis 7 | Built in same job | `warkop_audit` and loopback API | CI workflow defined; exact working-head run pending until push |
| PREVIEW | Vercel project `warkop-yareh-web` | Vercel project `warkop-yareh-admin` | Provider API mapping unknown | New branch preview not yet verified |
| STAGING | No independently confirmed URL | No independently confirmed URL | No independently confirmed API or database | Unverified |
| PRODUCTION | `https://warkop-yareh-web.vercel.app` returned 200 at baseline | `https://warkop-yareh-admin.vercel.app` returned 200 at baseline | Base URL, migration state, and database target not independently verified | Old deployed release; Phase 3 absent |

`https://warkopyareh.id` failed DNS resolution in the baseline check; it must not be used as the canonical origin until ownership and routing are verified. The new build defaults canonical, sitemap, and robots origins to the reachable web alias and accepts `NEXT_PUBLIC_SITE_URL` only as a configured override. Provider configuration must set that variable to the verified public origin; an old localhost value would regress metadata.

Relevant public configuration: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, and social URLs. API configuration includes `FRONTEND_URL`, `ADMIN_URL`, `GOOGLE_CALLBACK_URL`, `TRUST_PROXY`, database/Redis URLs, and provider keys. Values of secrets are omitted. `apps/api/src/main.ts` restricts production CORS to `FRONTEND_URL` and `ADMIN_URL`; authentication callbacks and the deployed API origin need provider-side verification. `apps/web/next.config.mjs` rejects the browser fixture catalog on Vercel or outside a loopback `warkop_audit` target.
