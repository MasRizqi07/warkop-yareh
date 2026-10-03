# Feature flag matrix

Flags are parsed by the shared `isFeatureEnabled` helper; only the exact string `true` enables a flag. Absence defaults off. Browser-test flags are set solely in isolated CI/local E2E. Build-time `NEXT_PUBLIC_` values must match the corresponding API runtime values when intentionally enabling a customer flow.

| Flag | Enforcement | Default / release rule |
| --- | --- | --- |
| `PUBLIC_ORDERING` / `NEXT_PUBLIC_PUBLIC_ORDERING` | API customer order and quote; web cart/checkout/order route and add-to-cart | Off; verified catalog and outlet fulfillment required |
| `ONLINE_PAYMENT` | New Midtrans Snap initiation; signed historical webhook continues | Off; live gateway reconciliation required |
| `QR_ORDERING` / `NEXT_PUBLIC_QR_ORDERING` | Public QR resolution and web QR route | Off; physical table code validation required |
| `TABLE_ORDERING` / `NEXT_PUBLIC_TABLE_ORDERING` | Public table calls/metadata and web table route | Off; staff workflow required |
| `OPERATIONS` / `NEXT_PUBLIC_OPERATIONS` | Only the web staff quick link uses the public-prefixed value | Off; **API/POS/KDS are not globally disabled by this flag** |
| `ANALYTICS` | Name reserved in the central type | No runtime enforcement yet; internal API remains accessible to authorized roles |

Marketing is an internal legacy-capability module and has no central flag. It remains outside primary navigation but its direct route and API are active for authorized staff. Do not infer operational approval from this matrix; provider credentials, permissions, consent, and physical workflows need review.
