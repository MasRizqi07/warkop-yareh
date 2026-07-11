# 1. Record Architecture Decisions

- **Status**: Accepted
- **Date**: 2026-06-06
- **Deciders**: Founder, Principal Software Architect, Enterprise Architect

---

## Context

As the Warkop Ya'reh platform scales to support multi-branch operations, franchise licensing models, and high-throughput ordering engines, we need a reliable, collaborative way to document significant architectural decisions, their trade-offs, and design rationales.

---

## Decision

We will use Architecture Decision Records (ADRs) as the official record of major software design choices.

- Every ADR will be stored as a Markdown file in the `docs/ADR/` directory.
- Files will follow the numbering format `NNNN-descriptive-title.md` (e.g. `0001-record-architecture-decisions.md`).
- Changes to architecture must be proposed via pull requests containing the respective ADR.

---

## Consequences

- **Changelog of Architecture**: Engineers can track the history of the design and trace changes to specific dates and decision contexts.
- **Onboarding Speed**: New developers can understand why key technologies (such as NestJS, Prisma, Neon RLS, and Next.js App Router) were chosen without needing to guess.
- **Collaboration**: Architectural modifications undergo team review prior to merge.
