# Product v3 domain matrix

Classification describes the intended active product, not an assertion that legacy tables are empty. `CORE` means part of the target model, `ACTIVE` means currently exercised, `INTERNAL` means staff tooling, `CONDITIONAL` means built but held by evidence/flag, `LEGACY` means unsupported historic behavior, and `REMOVE_LATER` means no destructive migration in this phase.

| Prisma model | Current dependency and exposure | Evidence | Target |
| --- | --- | --- | --- |
| User | Auth, orders, staff relations; legacy loyalty/referral fields | Identity E2E | CORE; decontaminate later |
| Session | Refresh/revocation | Auth tests | CORE |
| UserDevice | Session/device management | Identity code | CORE |
| Branch | Public outlet, catalog, operations | Verified branch fixtures | CORE |
| BusinessHour | Normalized outlet hours | Canonical 24-hour fact | CORE |
| BusinessFact | Provenance data | Source fields, not all runtime-wired | CORE |
| SourceReference | Evidence records | No externally populated production proof | CORE |
| Category | Catalog taxonomy | No verified menu supplied | CONDITIONAL |
| Product | Catalog/order and admin | `isActive` insufficient as publication proof | CONDITIONAL |
| ProductCustomization | Checkout customization | Test fixture only | CONDITIONAL |
| BranchProduct | Availability/override/inventory | Checkout tests | CONDITIONAL |
| GalleryAsset | Public verified feed and admin draft | Phase 3 local tests | CORE |
| SiteContent | Admin editorial draft | Phase 3 local tests | CORE |
| Order | Checkout and staff workflows | Isolated persistence E2E | CONDITIONAL |
| OrderItem | Immutable order line | Checkout E2E | CONDITIONAL |
| Payment | Midtrans state | Mocked sandbox/browser tests | CONDITIONAL |
| AuditLog | Staff mutation evidence | Interceptor/service | CORE |
| OutboxEvent | Durable provider/event dispatch | API tests | INTERNAL |
| Table | QR/table/operations | Physical rollout unverified | INTERNAL |
| CashierShift | POS operation | Admin persistence E2E | INTERNAL |
| CashDrawerMovement | Cash audit | Admin persistence E2E | INTERNAL |
| WaiterCall | Table assistance | Physical rollout unverified | INTERNAL |
| Notification | Messaging | Provider configuration unverified | CONDITIONAL |
| OrderFeedback | Post-order feedback | Ordering public rollout held | CONDITIONAL |
| Review | Historic review UI/data | No sourced public rating | REMOVE_LATER |
| Voucher | Discounts | No public promotion approval | REMOVE_LATER |
| VoucherRedemption | Discount history | Historical order relation | REMOVE_LATER |
| Reservation | API and historical pages | No reservation operation verified | LEGACY |
| Event | API and historical pages | No current events verified | LEGACY |
| EventRegistration | Event relation | Same | LEGACY |
| CommunityGroup | API/historical pages | No current community service verified | LEGACY |
| CommunityMembership | Group relation | Same | LEGACY |
| CommunityPost | Group relation | Same | LEGACY |
| LoyaltyTransaction | API and user relation | No active loyalty program verified | LEGACY |
| Reward | Loyalty relation | Same | LEGACY |
| MarketingCampaign | Admin/API currently coded | No verified production campaign | CONDITIONAL |
| MarketingDelivery | Campaign execution/outbox | No provider proof | CONDITIONAL |
| BlogPost | Old public route redirected | No sourced editorial publishing process | REMOVE_LATER |
| FranchiseAgreement | Historical schema | No franchise offer verified | REMOVE_LATER |
| FranchiseBilling | Historical schema | Same | REMOVE_LATER |

| API module | Current registration | Customer exposure | Target |
| --- | --- | --- | --- |
| identity/auth, branch, health | Active | Auth/branch/health | CORE |
| catalog | Active | Published, active, branch-available products only | CONDITIONAL until operator evidence |
| ordering/payment | Active engine | Public creation/Snap gated; historical signed webhook remains | CONDITIONAL |
| reality/content | Active or carried Phase 3 | Verified gallery public, drafts private | CORE with publication workflow |
| operations/tables/websockets | Active | Staff/QR routes | INTERNAL |
| analytics/marketing | Active | Staff routes | CONDITIONAL |
| reservation/event/community/loyalty | Unregistered from `AppModule` | No API endpoints in the active app | DEPRECATED; tables/source retained |

| Frontend feature | Current code | Target |
| --- | --- | --- |
| Canonical home/menu/outlets/gallery/about/contact | Public web | CORE |
| Login/register/account/OTP | Customer web | ACTIVE subject to provider and security review |
| Cart/checkout/orders/payment/QR/table | Flag-gated web routes and tested engine | CONDITIONAL; no production activation without operator evidence |
| Booking/reservations/community/events/loyalty/blog | Source files remain; Phase 3 redirects public paths | LEGACY; remove dead pages after observing redirects |
| Admin dashboard/branches/menu/gallery/site content/customers/system | Primary staff navigation | CORE/INTERNAL; customer view is read-only |
| Admin audit | Logs persist; no dedicated audit page | INTERNAL, UI planned |
| Admin reservation/event/community/loyalty/CRM | Temporary redirect to dashboard; source retained | DEPRECATED |
| Admin marketing, analytics and POS/KDS | Direct internal routes remain outside primary navigation | CONDITIONAL pending operator controls |

`MembershipTier` and `OrderType.DRIVE_THRU`/`DELIVERY` remain in Prisma for historical compatibility; no enum drop is authorized. The v3 API DTO and service reject new unsupported modes, and the customer cart/checkout now show only dine-in and takeaway. Existing order reads can still represent historical enum values.
