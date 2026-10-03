# Performance observations

The Chromium smoke script records navigation timing, observed largest-contentful-paint entries, cumulative layout-shift entries, and resource timing for each route. It uses one reusable browser context and local warm caches, so the numbers are diagnostic only. It does not measure field INP or certify Core Web Vitals.

In the deployed baseline sample, the homepage observed LCP was 5,632 ms and CLS was 0. In a local production-style sample after the marketing homepage became a server component, the homepage observed LCP was 180 ms and CLS was 0. These runs have different network/cache conditions; the difference is not a defensible production improvement percentage. The local gallery sample observed CLS of 0.01. Baseline secondary-route LCP ranged from 716 to 1,136 ms; local warm secondary-route values were 56 to 128 ms. Per-route `scriptBytes` from the resource timeline is cumulative across the reused context and should not be interpreted as bundle size per page.

The new public pages avoid client hooks where static verified content suffices. A field-data or controlled cold-load Lighthouse comparison after deployment remains necessary to establish real performance impact. No performance score is used to override business-truth or deployment blockers.
