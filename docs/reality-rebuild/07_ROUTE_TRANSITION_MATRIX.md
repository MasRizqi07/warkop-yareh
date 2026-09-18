# Route Transition Matrix: Legacy Route Safety & Retirement

**Document Status:** ROUTE RETIREMENT SPECIFICATION  
**Effective Date:** 2026-09-17  
**Auditor:** Staff Product Engineer  
**Target Application:** `apps/web`  

---

## 1. Safety Principles

To prevent broken internal links, dead bookmarks, or SEO degradation:
1. **Never delete routes abruptly without redirect coverage.**
2. **Unsupported public routes** (e.g. `/booking`, `/loyalty`, `/community`) must be mapped to safe landing destinations via permanent (301) or temporary (302) redirects.
3. **Internal operations routes** (`/ops/*`) bundled in the customer application must be detached from customer bundles.
4. **All navigation headers, footers, and sitemaps** must be updated atomically alongside route changes.

---

## 2. Route Transition Map

| Current Route | Target Status | Redirect Destination | SEO Redirect (301)? | Authenticated User Ref? | Removal Stage | Notes |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| `/booking` | **DECOMMISSION** | `/outlets` | YES (301) | NO | Stage 5 | Table booking unsupported; direct to physical outlets |
| `/reservations` | **DECOMMISSION** | `/outlets` | YES (301) | NO | Stage 5 | Reservation dashboard unsupported |
| `/community` | **DECOMMISSION** | `/` | YES (301) | NO | Stage 5 | Community forum unsupported; redirect to home |
| `/community/groups/[id]` | **DECOMMISSION** | `/` | YES (301) | NO | Stage 5 | Discussion thread unsupported |
| `/events` | **DECOMMISSION** | `/` | YES (301) | NO | Stage 5 | Event ticketing unsupported |
| `/events/[id]` | **DECOMMISSION** | `/` | YES (301) | NO | Stage 5 | Individual event page unsupported |
| `/loyalty` | **DECOMMISSION** | `/` | YES (301) | NO | Stage 5 | Loyalty point dashboard unsupported |
| `/cart` | **PARKED** | `/menu` | NO (302) | NO | Stage 5 | Disable nav links; redirect to menu notice |
| `/checkout` | **PARKED** | `/menu` | NO (302) | NO | Stage 5 | Disable nav links; redirect to menu notice |
| `/checkout/status` | **PARKED** | `/menu` | NO (302) | NO | Stage 5 | Disable nav links |
| `/checkout/success` | **PARKED** | `/menu` | NO (302) | NO | Stage 5 | Disable nav links |
| `/order/track/[orderId]`| **PARKED** | `/` | NO (302) | NO | Stage 5 | Disable nav links |
| `/orders` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Disable nav links |
| `/orders/[id]` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Disable nav links |
| `/orders/[id]/thankyou` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Disable nav links |
| `/payment/status` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Disable nav links |
| `/table/[tableId]` | **PARKED** | `/outlets` | NO (302) | NO | Stage 5 | QR table ordering parked |
| `/qr/[code]` | **PARKED** | `/outlets` | NO (302) | NO | Stage 5 | QR code handler parked |
| `/ops/kds` | **RELOCATE** | Internal Admin | NO (404 on Web) | Internal Staff | Stage 5 | Kitchen display removed from web bundle |
| `/ops/pos` | **RELOCATE** | Internal Admin | NO (404 on Web) | Internal Staff | Stage 5 | POS removed from web bundle |
| `/ops/shift` | **RELOCATE** | Internal Admin | NO (404 on Web) | Internal Staff | Stage 5 | Shift balancing removed from web bundle |
| `/account` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Customer profile parked |
| `/profile` | **PARKED** | `/` | NO (302) | NO | Stage 5 | Customer profile editor parked |
| `/register` | **PARKED** | `/login` | NO (302) | NO | Stage 5 | Self-serve customer registration disabled |
| `/otp` | **PARKED** | `/login` | NO (302) | NO | Stage 5 | Customer OTP login disabled |
| `/auth/callback` | **PARKED** | `/login` | NO (302) | Staff Only | Stage 5 | OAuth callback restricted to staff/admin |
| `/blog` | **PARKED** | `/` | NO (302) | NO | Stage 5 | De-link from navigation |
| `/blog/[slug]` | **PARKED** | `/` | NO (302) | NO | Stage 5 | De-link from navigation |

---

## 3. Implementation in Next.js

Redirect rules will be enforced at the routing edge in `apps/web/next.config.mjs` via `redirects()` configuration to guarantee immediate, efficient HTTP redirection before page bundle evaluation:

```javascript
// apps/web/next.config.mjs
async redirects() {
  return [
    { source: '/booking', destination: '/outlets', permanent: true },
    { source: '/reservations', destination: '/outlets', permanent: true },
    { source: '/community/:path*', destination: '/', permanent: true },
    { source: '/events/:path*', destination: '/', permanent: true },
    { source: '/loyalty', destination: '/', permanent: true },
    { source: '/cart', destination: '/menu', permanent: false },
    { source: '/checkout/:path*', destination: '/menu', permanent: false },
  ];
}
```

