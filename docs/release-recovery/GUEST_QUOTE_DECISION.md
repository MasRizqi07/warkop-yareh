# Guest Cart & Quote Product Decision

## 1. Context and Problem Statement

Between commit `7e64d4e`, `b93cf79`, and baseline `3303f1c`, the checkout quoting architecture underwent significant changes:

1. **Prior State (`7e64d4e`)**:
   - The frontend used client-side estimation (`apps/web/src/lib/client-checkout-estimate.ts`) to compute subtotals, restaurant tax (11%), and service fees (5%).
   - While responsive for guests, client-side pricing created a risk of price divergence against server branch overrides, promotional rules, and catalog changes.
2. **Current Baseline State (`3303f1c`)**:
   - Cart and checkout calculations were centralized in the backend (`OrderingService.quoteOrder`).
   - However, the quoting route was registered under `@UseGuards(JwtAuthGuard)` at `POST /api/v1/orders/quote`.
   - Consequently, unauthenticated guests visiting `/cart` could not obtain server quotes. The UI displayed a prompt: `"Masuk untuk melihat estimasi harga" (Log in to view price estimates)`.
   - This represents a notable **`PRODUCT_BEHAVIOR_CHANGE`**: guest shoppers cannot preview standard tax and service fee totals before creating an account.

---

## 2. Evaluation of Supported Approaches

### Option A: Retain Strict Authentication Requirement

- **Concept**: Guests may add products to their cart, but order price totals (tax, service fee, total) are only displayed after logging in.
- **Pros**:
  - Zero exposure of unauthenticated order calculation endpoints.
  - Simplest API surface (only one quote endpoint exists).
- **Cons**:
  - Significant friction in the e-commerce purchase funnel: guests cannot see their estimated grand total before signup/login.
  - High bounce rate for quick-service warkop customers expecting instant totals.

### Option B: Dedicated Public Safe Server Quote Endpoint (Selected & Implemented)

- **Concept**: Provide an explicitly unauthenticated, public endpoint `POST /api/v1/orders/quote/guest` for calculating base items, branch price overrides, tax (11%), and service fee (5%).
- **Security Boundaries**:
  - **No Personal Entitlements**: Guest DTO (`GuestOrderQuoteDto`) strictly excludes `userId`, `voucherCode`, and `loyaltyPointsUsed`.
  - **No Information Leakage**: Does not reveal user loyalty balances or internal voucher eligibility rules.
  - **Strict Validation**: Utilizes NestJS `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`. Any payload submitting `userId`, `voucherCode`, `loyaltyPointsUsed`, or `expectedTotal` is rejected with HTTP 400 Bad Request.
  - **Server Authority Preserved**: Subtotals and branch price overrides are fetched authoritatively from the database. No client-authoritative math is trusted.
  - **Authenticated Quote Preserved**: Logged-in customers still use `POST /api/v1/orders/quote` for account-specific voucher redemptions and loyalty point point deductions.
- **Pros**:
  - Seamless customer UX: Guests see exact, authoritative prices, 11% tax, and 5% service fees in real time.
  - Cart page displays clear disclaimer: `"Estimasi berasal dari server. Masuk saat checkout untuk menerapkan voucher dan poin."`
  - 100% server-authoritative.

---

## 3. API Contract Specification (Option B)

### 3.1 Endpoint

`POST /api/v1/orders/quote/guest`

### 3.2 Request Body (`GuestOrderQuoteDto`)

```json
{
  "branchId": "cly1234567890abcdef",
  "type": "TAKE_AWAY",
  "items": [
    {
      "productId": "prod_kopi_susu",
      "quantity": 2,
      "notes": "Less sugar"
    }
  ],
  "tableId": null,
  "notes": null
}
```

### 3.3 Forbidden Fields in Guest Request

- `userId` (HTTP 400 if supplied)
- `voucherCode` (HTTP 400 if supplied)
- `loyaltyPointsUsed` (HTTP 400 if supplied)
- `expectedTotal` (HTTP 400 if supplied)

### 3.4 Response Body (`OrderQuote`)

```json
{
  "data": {
    "subtotal": 24000,
    "tax": 2640,
    "serviceFee": 1200,
    "voucherDiscount": 0,
    "pointsDiscount": 0,
    "discount": 0,
    "loyaltyPointsUsed": 0,
    "maxRedeemablePoints": 0,
    "total": 27840
  }
}
```

---

## 4. Test Verification

- **Unit & Controller Tests**: `apps/api/src/modules/ordering/presentation/controllers/guest-order-quotes.controller.spec.ts`
  - Confirms `@Public()` metadata is present.
  - Confirms standard valid guest payload receives HTTP 200 with accurate tax and service fee calculations.
  - Confirms extra account fields (`voucherCode`, `loyaltyPointsUsed`, `userId`, `expectedTotal`) are rejected with HTTP 400.
- **E2E Commerce Tests**: `apps/web/e2e/commerce.e2e.ts` verifies guest cart loads server quote without requiring login.
