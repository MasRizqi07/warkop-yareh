# Additive schema and legacy decommission plan

This plan does not authorize production drops. Production row counts and backup/retention policy are unknown, so `Data present?` is `UNKNOWN` for every legacy table. The repository's disposable `warkop_audit` database is not evidence about production.

| Model or field | Runtime dependency | Data present? | Foreign keys / retention concern | Risk | Stage |
| --- | --- | --- | --- | --- | --- |
| `User.membershipTier`, `loyaltyPoints` | Loyalty API, user/profile/admin code | UNKNOWN | User data and transaction history | High | Stop writes/display; export and review before nullable/drop |
| `User.referralCode`, `referredBy` | Referral/loyalty paths | UNKNOWN | Self-reference/history | High | Stop issuance; inspect rows before removal |
| `MembershipTier` enum | User field and DTOs | UNKNOWN | Enum cannot drop while column uses it | High | Last after user migration |
| `OrderType.DRIVE_THRU`, `DELIVERY` | Ordering DTO/service and historical orders | UNKNOWN | Order enum and reports | High | Reject new unsupported types; retain enum for history |
| Reservation | Reservation API, User/Branch/Table relations | UNKNOWN | Orders/payments may reference bookings | High | Remove runtime exposure, retain table until retention decision |
| Event / EventRegistration | Event API, User/Branch | UNKNOWN | Registrations and payment history | High | Disable routes, export, then reviewed drop |
| CommunityGroup / Membership / Post | Community API and User | UNKNOWN | Member/content ownership | High | Disable endpoints, export/retention review |
| LoyaltyTransaction / Reward | Loyalty API and User | UNKNOWN | Balance/audit history | High | Disable accrual/redemption; preserve records |
| Review / OrderFeedback | User/Product/Order | UNKNOWN | Customer-generated content | Medium | Stop public claim; retention review |
| Voucher / VoucherRedemption | Checkout pricing/order | UNKNOWN | Financial discount history | High | Keep historical pricing; no public promotion without evidence |
| MarketingCampaign / MarketingDelivery | API/outbox and User | UNKNOWN | Message consent and delivery audit | High | Keep records; disable unapproved campaigns |
| BlogPost | Redirected web route, content API | UNKNOWN | Editorial history | Medium | Hide public route, archive before drop |
| FranchiseAgreement / FranchiseBilling | Prisma relations and old service history | UNKNOWN | Financial/legal records | Critical | Retain pending explicit legal retention decision |
| `Branch.capacity/features/weekdayHours/weekendHours/latitude/longitude/email` | Admin and branch API; some old UI | UNKNOWN | Legacy metadata may be wrong | Medium | Make unknowns nullable; use normalized `BusinessHour`; no guessed coordinates |

For every candidate: (1) map code reads/writes and constraints, (2) stop new writes and remove navigation/API registration behind compatibility review, (3) measure production rows using read-only credentials, (4) agree retention and export format with owner, (5) snapshot/backup and rehearse on a production-shaped copy, (6) deploy an additive transition, (7) request separate explicit approval before irreversible drop. Preserve old enum values and historical orders throughout Product v3 rollout.

## Implemented v3 stage

`ReservationModule`, `EventModule`, `CommunityModule`, and `LoyaltyModule` are no longer registered in `AppModule`; their tables and code remain. New order DTOs/service reject `DRIVE_THRU` and `DELIVERY`, while historical enum values remain. Customer cart/checkout no longer render those modes or loyalty redemption. Branch defaults for capacity and weekday/weekend hours were removed in an additive migration; production seed writes only canonical 24-hour `BusinessHour` rows and no coordinates or menu products. A separate migration archives seven fictional products created by the older booking migration without deleting them. These changes were rehearsed only on disposable `warkop_audit`; production row counts remain unknown.
