# Phase 9 — Phase 1-4 Evidence

Evidence date: 2026-09-16 (Asia/Jakarta)

This record separates source, unit, persistence, and local browser evidence from
CI and staging evidence. Fixture credentials and the isolated database URL are
intentionally not committed.

## Phase 1 — Confirmed customer-facing gaps

### CLAIM

The previously unreachable catalog recommender is mounted in the marketing
layout, uses the active branch for both API requests, and resolves add-to-cart
against the real active-branch catalog. No mock products were added.

The booking page now chooses a future package start in WIB rather than sending
an already-passed start time to the availability endpoint.

### EVIDENCE

Raw unit output from the aggregate verification:

```text
✓ src/features/reservations/booking-date.test.ts (2 tests)
✓ src/app/(marketing)/layout.test.tsx (1 test)
  ✓ mounts the branch-aware barista recommendation entry point
✓ src/components/ai/barista-concierge-modal.test.tsx (2 tests)
  ✓ uses honest customer-facing copy and scopes both requests to the active branch

Test Files  13 passed (13)
Tests       43 passed (43)
```

Implementation trace:

- `apps/web/src/app/(marketing)/layout.tsx` mounts the recommender beneath the
  existing providers.
- `apps/web/src/components/ai/barista-concierge-modal.tsx` sends the same active
  `branchId` to `POST /ai/barista-chat` and
  `POST /ai/recommend-pairings`.
- `apps/web/src/features/reservations/booking-date.ts` derives the first future
  package start in `Asia/Jakarta`.

### KNOWN GAPS

- The real staging catalog and booking configuration have not been mutated by
  this local proof.

### OPEN QUESTIONS FOR RIZQI

- None for Phase 1 implementation scope. Staging credentials remain a Phase 5
  evidence prerequisite.

## Phase 2 — Label versus reality

### CLAIM

Owner option `(a)` is implemented: the deterministic keyword/catalog heuristic
is retained and customer copy calls it **Rekomendasi Barista**, without an LLM
claim.

### EVIDENCE

- Decision record: [AI_FEATURE_DECISION.md](./AI_FEATURE_DECISION.md).
- `rg -n "Barista AI|AI Concierge" apps/web/src docs/PRD.md docs/TECH_STACK.md`
  returns no customer-facing product label; the remaining technical references
  describe the absence of an external model.
- Both request-body assertions passed in
  `barista-concierge-modal.test.tsx`.

### KNOWN GAPS

- The heuristic is intentionally limited to its fixed taste profiles. This is a
  product constraint, not hidden LLM functionality.

### OPEN QUESTIONS FOR RIZQI

- None. The owner decision is recorded and implemented.

## Phase 3 — Admin and operations completeness

### CLAIM

The isolated persistence gate proves shift concurrency, movement persistence,
close serialization, and branch isolation. The browser flow additionally proves
open shift → cash movement → POS cash sale → KDS progression → completed order →
close/balance → analytics update.

### EVIDENCE

Raw persistence output:

```text
PASS test/checkout.e2e-spec.ts
Tests:       7 passed, 7 total

PASS test/operations.e2e-spec.ts
  Cashier shift persistence, concurrency and RLS
    √ allows exactly one concurrent open shift per branch
    √ persists movements, reloads the summary, and serializes close
    √ enforces branch isolation on reads and shift lookup
Tests:       3 passed, 3 total
```

Raw Playwright output:

```text
Running 10 tests using 1 worker

ok  1 database-backed admin operations › all retained admin routes load through authenticated APIs without request failures
ok  2 database-backed admin operations › shift mutations survive full reloads and persist the final variance
ok  3 database-backed admin operations › branch and inventory edits are read back from the API after reload
ok  4 database-backed admin operations › a marketing draft survives a full browser reload
ok  5 guest quote is public, server-authoritative, and rejects personal discounts
ok  6 guest cart -> authenticated dine-in -> server quote -> persisted order -> payment
ok  7 guest cart -> authenticated delivery -> server quote -> persisted order -> payment
ok  8 cart hides stale totals while loading, reports quote errors, and retries with a server split bill
ok  9 register -> rejected password -> login -> HttpOnly refresh rotation -> logout
ok 10 OTP rejects an invalid code, authenticates once, and rejects replay

10 passed (3.2m)
```

The enhanced operations test asserts the exact persisted figures from its
fixture: cash sale `Rp13.920`, expected closing `Rp133.920`, entered closing
`Rp135.920`, and variance `Rp2.000`. It then reads the analytics endpoint and
checks the visible dashboard revenue/order count.

### KNOWN GAPS

- This proof uses a disposable local database and deterministic provider
  fixture. It does not claim Railway, Vercel, or live Midtrans state.

### OPEN QUESTIONS FOR RIZQI

- None for local operations scope.

## Phase 4 — Error states and edge cases

### CLAIM

Payment tracking distinguishes pending, paid, expired, failed, refunded, and
cancelled states using the existing protected order payment-status endpoint.
Failed or expired orders do not offer an invalid repayment action; they direct
the customer to create a new order. The route audit now exercises deterministic
404 states, auth redirects, responsive layouts, accessibility checks, request
failures, and the PWA worker independently.

### EVIDENCE

Raw unit output:

```text
✓ src/features/orders/payment-feedback.test.ts (9 tests)
```

Raw UI audit output:

```json
{
  "audited": 66,
  "failed": 0,
  "failures": [],
  "screenshotDir": "C:\\Users\\rrgtet47\\AppData\\Local\\Temp\\warkop-yareh-ui-audit"
}
```

The route crawl blocks service-worker interception so response failures remain
authoritative network evidence. A separate browser context loads `/offline` and
asserts that the active worker URL ends in `/sw.js`.

### KNOWN GAPS

- UI audit screenshots are local artifacts, not staging proof.
- The aggregate Jest run emits an existing forced-worker-exit warning after all
  40 API suites and 259 assertions pass. No Phase 9 test failed, but the open
  handle warning should remain visible in evidence rather than being omitted.

### OPEN QUESTIONS FOR RIZQI

- None for the implemented error-state scope. Phase 5 still requires staging
  access and owner acceptance.
