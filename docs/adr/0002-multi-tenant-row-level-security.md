# 2. Multi-Tenant Row-Level Security (RLS)

- **Status**: Accepted
- **Date**: 2026-06-06
- **Deciders**: Founder, Principal Software Architect, Enterprise Architect, Security Architect

---

## Context

Warkop Ya'reh is expanding to support franchise owners. Each franchise operator owns a subset of branches and must not access transactional data (orders, reservations, sales, staff data) belonging to other franchise branches.

We evaluated three multitenancy patterns:

1. **Database-Per-Tenant**: Separate database instances per franchise.
2. **Schema-Per-Tenant**: Shared database instance with isolated PostgreSQL schemas.
3. **Row-Level Partitioning**: Shared database, shared schema, filtering rows dynamically.

The first two options present significant cost and deployment orchestration overhead for small franchise launches. However, simple application-layer dynamic filtering (e.g. appending `.where({ branchId })` on every query) is highly prone to human error, potentially leading to data leaks if developers overlook constraints.

---

## Decision

We will implement **PostgreSQL Row-Level Security (RLS) with Database Session Contexts**:

- Every transactional table (orders, reservations, tables, branch configurations) will carry a `branchId` or `franchiseId` foreign key.
- PostgreSQL tables will have RLS active. Policies will validate row access based on custom database session parameters (`app.current_branch_id` and `app.current_user_role`).
- The API gateway will execute a connection query (`SET LOCAL app.current_branch_id = ...`) before executing transactional business queries.

---

## Consequences

### Positive (Pros)

- **Native Protection**: The database engine blocks illegal cross-branch queries, shielding the platform from data leaks even if frontend checks are bypassed.
- **Cost Efficiency**: Runs multiple branches on a single serverless database (Neon PostgreSQL cluster) without requiring separate database provisions.

### Negative (Cons)

- **Connection Pooling Issues**: Because connection poolers (pgBouncer) reuse connections, session local states can leak if not managed carefully.
- **Mitigation**: We must run queries inside transactions (`SET LOCAL` instead of `SET`) to ensure variables automatically clear after transactions end.
