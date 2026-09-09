# Admin and cashier-shift review matrix

Decision: retain the admin rebuild and cashier-shift implementation that entered
`main` through merge `90c4366792b6408cfdf8660981f13c45f3a355d1` as an explicit,
separately reviewed scope. This is not production release approval.

## Review result

- The pages are API-backed; no imported page uses `apps/web/src/data/mock.ts`,
  in-memory fixture arrays, or fabricated provider success.
- Settings is intentionally informational and does not pretend to mutate secrets.
- `/pos/shifts` is intentionally a compatibility redirect to `/shifts`.
- Successful mutations either reload their owning resource or navigate to a
  resource that reads the persisted record. Branch, inventory, and marketing
  were corrected during this review to reload from the API before reporting
  durable success.
- Cashier-shift open/close uses database serialization and lock protection. The
  review also normalized PostgreSQL serialization failures to stable HTTP 409
  conflicts.

## Route matrix

| Route           | Classification         | Backing resource                      | Mutation/readback contract                                                                                   |
| --------------- | ---------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/login`        | Real                   | auth login/logout/refresh             | HttpOnly refresh plus session access token; browser auth suite                                               |
| `/`             | Real, read-only        | orders, inventory, analytics, events  | Manual/API reload action                                                                                     |
| `/analytics`    | Real, read-only        | revenue, categories, customers        | API reload; no invented metrics                                                                              |
| `/branches`     | Real                   | branch and branch-product APIs        | capacity, price, availability -> full API reload                                                             |
| `/community`    | Real                   | groups and posts                      | create/delete -> resource reload                                                                             |
| `/crm`          | Real                   | customer insights and campaigns       | retention draft -> customer/API reload                                                                       |
| `/events`       | Real                   | events                                | create/status -> resource reload                                                                             |
| `/events/[id]`  | Real                   | event and registrations               | event/registration update -> resource reload                                                                 |
| `/inventory`    | Real                   | branch products                       | inventory update -> branch-product API reload                                                                |
| `/loyalty`      | Real                   | rewards                               | create/update/availability -> resource reload                                                                |
| `/marketing`    | Real                   | campaign database and WhatsApp status | save/test/dispatch -> campaign/provider API reload; unconfigured provider returns 503                        |
| `/orders`       | Real                   | orders                                | status transition -> resource reload                                                                         |
| `/products`     | Real                   | products/categories                   | create/update -> resource reload                                                                             |
| `/reservations` | Real                   | reservations                          | status transition -> resource reload                                                                         |
| `/settings`     | Configuration boundary | deployment environment                | no browser secret mutation or fake connectivity state                                                        |
| `/shifts`       | Real                   | cashier shifts and drawer movements   | open/movement/close -> resource reload                                                                       |
| `/users`        | Real                   | identities and loyalty                | point award -> user resource reload                                                                          |
| `/kitchen`      | Real                   | orders plus authenticated WebSocket   | transition -> resource reload and socket sync                                                                |
| `/pos`          | Real                   | quote, order, cash payment, shifts    | server quote -> idempotent order -> cash settlement -> catalog reload; order visible after navigation/reload |
| `/pos/shifts`   | Redirect               | `/shifts`                             | compatibility route only                                                                                     |
| `/tables`       | Real                   | tables/waiter calls plus WebSocket    | status/resolve -> resource reload and socket sync                                                            |

## Automated evidence

| Gate                                   | What it proves                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/web/e2e/admin-operations.e2e.ts` | Authenticated route smoke; shift/movement/POS/close; branch, inventory, and campaign mutation -> reload |
| `apps/api/test/operations.e2e-spec.ts` | Concurrent open/close, durable movements/variance, service reload, branch RLS                           |
| `apps/api/test/checkout.e2e-spec.ts`   | Persisted order, loyalty, booking, pricing, concurrency, RLS                                            |
| API unit/controller suites             | Authorization, state transitions, event/community/marketing/table/catalog domain contracts              |

## Remaining external evidence

Exact-commit CI, staging UI/API behavior, live provider calls, and production
database state remain separate release gates. They cannot be inferred from this
local review.
