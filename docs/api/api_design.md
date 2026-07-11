# 🔌 API Design Specification — Warkop Ya'reh Bounded Contexts

This document defines the REST API design guidelines and full endpoint contract for the Warkop Ya'reh platform.

## 1. Global API Standards

### 1.1 Base URL & Versioning
All API endpoints are prefixed with version routing to ensure backward compatibility:
```
https://api.warkop-yareh.com/api/v1/
```

### 1.2 Headers
All client-to-server requests must supply standard request headers where appropriate:

| Header | Required | Description |
|:-------|:---------|:------------|
| `Authorization` | Yes (unless public) | Bearer JWT Token (`Bearer <token>`) |
| `Content-Type` | Yes | Must be `application/json` |
| `x-branch-id` | Yes (for commerce) | UUID of the active store branch |
| `x-client-device` | No | ID of user device for audit logs |

### 1.3 Response Envelope
All API responses follow a uniform envelope structure:

**Success Response (`200 OK`, `201 Created`):**
```json
{
  "data": {
    "id": "ord-883a",
    "status": "PREPARING"
  },
  "meta": {
    "timestamp": "2026-06-11T12:00:00Z"
  }
}
```

**Paginated Success Response:**
```json
{
  "data": [
    { "id": "prod-1", "name": "Kopi Aren" }
  ],
  "meta": {
    "pagination": {
      "total": 120,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "timestamp": "2026-06-11T12:00:00Z"
  }
}
```

**Error Response (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `500 Server Error`):**
```json
{
  "errors": [
    {
      "code": "VALIDATION_FAILED",
      "message": "The quantity field must be at least 1.",
      "field": "items[0].quantity"
    }
  ],
  "meta": {
    "timestamp": "2026-06-11T12:00:00Z"
  }
}
```

---

## 2. Bounded Context Endpoints

### 2.1 Identity Context (`/api/v1/auth`)
Handles member registration, authentication, token rotation, and staff access.

- `POST /api/v1/auth/register` — Register a customer member.
- `POST /api/v1/auth/login` — Login client & retrieve JWT access and refresh tokens.
- `POST /api/v1/auth/refresh` — Rotate access token using a valid refresh token.
- `POST /api/v1/auth/logout` — Revoke and invalidate session refresh token.
- `GET /api/v1/users/me` — Fetch authenticated user profile & membership tier state.

### 2.2 Product Catalog Context (`/api/v1/products`)
Manages menus, pricing overrides, categories, and items.

- `GET /api/v1/products` — List products (filtered by `x-branch-id` and category).
- `GET /api/v1/products/:id` — Retrieve detailed product specs.
- `POST /api/v1/products` — Create product (Admin/Manager role required).
- `PUT /api/v1/products/:id` — Update product.
- `DELETE /api/v1/products/:id` — Archive product.

### 2.3 Ordering Context (`/api/v1/orders`)
Handles shopping cart checkout, order placement, payments, and statuses.

- `POST /api/v1/orders` — Create new order (attaches price snapshots).
- `GET /api/v1/orders/:id` — Track order status & Midtrans payment intent link.
- `POST /api/v1/orders/webhook` — Midtrans webhook payment receiver.
- `PATCH /api/v1/orders/:id/status` — Advance order state (e.g. `PREPARING` to `READY`).

### 2.4 Reservation Context (`/api/v1/reservations`)
Covers table bookings, branch capacities, and coworking space checks.

- `GET /api/v1/reservations/availability` — Query open tables for specific date/time.
- `POST /api/v1/reservations` — Book a coworking table.
- `GET /api/v1/reservations/my` — List customer's future reservations.
- `PATCH /api/v1/reservations/:id/cancel` — Cancel future booking.

### 2.5 Event Context (`/api/v1/events`)
Handles local developers events and coffee workshops.

- `GET /api/v1/events` — Retrieve upcoming community events.
- `GET /api/v1/events/:id` — Event details and remaining seats.
- `POST /api/v1/events/:id/join` — Register customer for an event.
- `POST /api/v1/events` — Create event (Staff/Admin role).

### 2.6 Community Context (`/api/v1/community`)
Supports forums, subgroups, posts, and comments.

- `GET /api/v1/community/groups` — Get list of guilds (e.g., Kopi & Design).
- `GET /api/v1/community/posts` — Retrieve post feeds (cursor-based pagination).
- `POST /api/v1/community/posts` — Publish post.
- `POST /api/v1/community/posts/:id/comments` — Comment on post.

### 2.7 Loyalty Context (`/api/v1/loyalty`)
Awards and tracks rewards balances, tiers, and rewards redemption.

- `GET /api/v1/loyalty/wallet` — Check points balance, tier, and transaction history.
- `POST /api/v1/loyalty/redeem` — Exchange points for items/vouchers.

### 2.8 Analytics Context (`/api/v1/analytics`)
Aggregates performance statistics for business dashboards.

- `GET /api/v1/analytics/dashboard` — Overview of revenue, ticket sales, and conversions (Admin only).
- `GET /api/v1/analytics/branch/:branchId` — Branch-specific revenue details.

### 2.9 Franchise Context (`/api/v1/franchise`)
Aggregates franchise business accounts.

- `GET /api/v1/franchise/agreements` — Fetch licensing agreements.
- `POST /api/v1/franchise/billing` — Generate monthly franchise billing invoice.
