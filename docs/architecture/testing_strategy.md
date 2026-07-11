# 🧪 Testing Strategy — Warkop Ya'reh Digital Ecosystem

This document describes the testing strategy, frameworks, and coverage requirements for the Warkop Ya'reh platform.

---

## 🎯 Testing Hierarchy

```
┌────────────────────────────────────────────────────────┐
│             E2E Tests: Playwright                      │
│             (Critical user checkout & flows)           │
├────────────────────────────────────────────────────────┤
│             Integration/API: Jest + Testcontainers    │
│             (PostgreSQL schema & Redis sessions)       │
├────────────────────────────────────────────────────────┤
│             Unit Tests: Vitest / Jest                  │
│             (Isolated domain services & components)    │
└────────────────────────────────────────────────────────┘
```

### 1. Unit Testing
- **Backend (NestJS)**: Enforced via Jest. Focuses on isolated domain logic (services, value-object validations, calculations).
- **Frontend (Next.js)**: Enforced via Vitest + React Testing Library. Focuses on user interaction hooks, state store modifications (Zustand), and visual rendering.

### 2. Integration Testing
- **Database Integration**: Powered by **Testcontainers** to spin up dynamic, ephemeral PostgreSQL instances during local or CI runs. This ensures migrations apply and raw SQL operations validate without polluting shared staging resources.
- **Cache/Queue Integration**: Spins up ephemeral Redis container instances to validate BullMQ worker behaviors and session token lifecycle rotations.

### 3. End-to-End (E2E) Testing
- **Playwright**: Orchestrates real browser testing of critical paths:
  - Seat Reservations ➡️ Booking Confirmation.
  - Product Customization ➡️ Checkout ➡️ Midtrans Simulation Gateway ➡️ Payment Success.

---

## 📈 Coverage Thresholds & Quality Gates

To ensure code health, commits that decrease coverage metrics or introduce test failures are blocked at CI boundaries.

| Layer    | Minimum Statement Coverage | Minimum Branch Coverage |
| :------- | :------------------------- | :---------------------- |
| Core API | **85%**                    | **80%**                 |
| Web Client | **80%**                  | **75%**                 |
| Admin    | **75%**                    | **70%**                 |

### Pipeline Integrations
Testing steps run automatically inside the GitHub Actions pipeline (`ci.yml`) on every pull request target:
```bash
# Run unit & API tests
pnpm test
```
If statement or branch coverage falls below the required threshold, the CI pipeline fails.
