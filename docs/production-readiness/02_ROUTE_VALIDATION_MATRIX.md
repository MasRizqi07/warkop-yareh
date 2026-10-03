# Customer route validation

The baseline browser sweep used the deployed Vercel aliases. The working-build sweep used `next start` with `NEXT_PUBLIC_TEST_CATALOG=false` and the isolated API. Both ran Chromium at 320, 360, 390, 430 and 768 px, checked rendered facts, metadata, accessibility with axe WCAG A/AA tags, image failures, and client exceptions. Raw local reports and screenshots are generated under ignored `test-results/production-*`; the script is `scripts/production-smoke.mjs`.

| Route | Deployed baseline | Working build | Main baseline defect |
| --- | --- | --- | --- |
| `/` | FAIL | PASS | Unsupported business claims in rendered shell |
| `/menu` | FAIL | PASS | Duplicate metadata; unsupported public menu claims |
| `/outlets` | FAIL | PASS | Duplicate metadata and fictional shell claim |
| `/outlets/jetis-kulon` | FAIL | PASS | Wrong/missing outlet schema and metadata |
| `/outlets/prapen` | FAIL | PASS | Wrong/missing outlet schema and metadata |
| `/gallery` | FAIL | PASS | Stock scene claims; no provenance-controlled public feed |
| `/about` | FAIL | PASS | Duplicate metadata and unsupported shell claim |
| `/contact` | FAIL | PASS | Duplicate metadata and unsupported shell claim |
| `/login` | FAIL | PASS | Indexable route and contrast issue |
| `/register` | FAIL | PASS | Indexable route, contrast, legacy brand and service claim |

`PASS` means HTTP 200, mobile, axe, SEO, and truth checks passed in the local automated sweep. It does not certify every manual interaction or production deployment. The baseline had 46 findings; the working build's final count is recorded by the final `test:production-smoke` run.

The same sweep checks 12 private URLs for noindex, six retired-route redirects, sitemap/robots, and admin login noindex. `/booking`, `/reservations`, `/community`, `/events`, `/loyalty`, and `/blog` now redirect permanently to approved destinations. Browser commerce E2E tests separately cover guest/authenticated checkout, payment fixture, OTP, login/logout, admin writes, and reload persistence. Error and loading state coverage is limited to gallery API and tested commerce paths; other private flows need staged manual checks before release.
