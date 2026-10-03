# Public product audit

Product v3 exposes eight discovery URLs: `/`, `/menu`, `/outlets`, `/outlets/jetis-kulon`, `/outlets/prapen`, `/gallery`, `/about`, and `/contact`. The two outlet pages render the exact typed branch fixture, 24-hour schedule, dine-in/takeaway, Plus Code, and the per-person spending range. Jetis has no phone link; Prapen uses only its verified number. The spending range is explicitly separated from item prices. The home and footer use the same facts. The shared logo no longer asserts an unsupported founding year.

| Surface | Current behavior | Publication condition |
| --- | --- | --- |
| Menu | Branch-specific published catalog or factual empty state | A product must be published, active, in an active category, and available at the branch |
| Gallery | Drafts stay private | Primary dated evidence and verification required |
| Site content | Staff can save drafts | Draft save does not publish public copy |
| Cart/checkout | Routes redirect to `/menu` by default | `PUBLIC_ORDERING=true` in API and `NEXT_PUBLIC_PUBLIC_ORDERING=true` in web, plus verified menu and operational approval |
| QR/table | Redirect or API rejection by default | Explicit QR/table flags and site workflow approval |
| Retired public paths | Redirect to outlet list or home | No active reservation, event, loyalty or community service |

No verified itemized menu, product photographs, coordinates, rating, review count, founder biography, or business email was provided. None was added to production seed or structured data. The local Playwright browser fixture is confined to `warkop_audit` and loopback URLs. Legacy route source remains in the repository behind Next redirects pending the staged decommission plan.

Remaining release check: test the exact PR preview and API deployment. A local build cannot establish what is live on either Vercel alias.
