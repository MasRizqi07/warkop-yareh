# Business truth and provenance

Canonical branches are locked in `packages/types/index.ts`, checked by `pnpm audit:reality`, and checked again against rendered outlet pages by `test:production-smoke`.

| Branch | Verified name | Address | Plus Code | Telephone |
| --- | --- | --- | --- | --- |
| Jetis Kulon | WARKOP YA'REH | Jl. Raya Jetis Kulon I No.38, Wonokromo, Kec. Wonokromo, Surabaya, Jawa Timur 60243 | MPVJ+2G Wonokromo, Surabaya, Jawa Timur | No verified number; no branch phone published |
| Prapen | WARKOP YA'REH 2 PRAPEN | Jl. Raya Prapen No.39, Prapen, Kec. Tenggilis Mejoyo, Surabaya, Jawa Timur 60239 | MQM3+XJ Prapen, Surabaya, Jawa Timur | 0821-3735-4606 |

The approved business baseline also states both outlets operate 24 hours, with dine-in and takeaway. The public menu now shows an honest visit-outlet state until a sourced menu exists; the browser-only catalog requires an isolated database and cannot build on Vercel. The public gallery queries only verified venue/branch photos with primary source, capture date, and verification within 90 days. Saving an admin editorial draft does not publish it. No photos were asserted to be genuine without evidence.

The deployed baseline failed the rendered truth check on all ten customer routes, including an inherited legacy brand on registration and unsupported claims in the shared shell. The working build removes those. Static audit now rejects use of `NEXT_PUBLIC_BRAND_NAME` in account pages so an old provider setting cannot rename the business again. Historical code under permanently redirected routes remains in the repository but is not a canonical public route; removal can be handled separately once redirects are observed after deployment.
