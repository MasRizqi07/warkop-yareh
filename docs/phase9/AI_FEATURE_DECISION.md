# Phase 9 — AI Feature Decision

## Decision record

| Field | Value |
| --- | --- |
| Decision owner | Rizqi |
| Decision date | 2026-09-15 |
| Selected option | **(a) Keep the deterministic heuristic and correct the label** |
| Customer-facing name | **Rekomendasi Barista** |
| External LLM | Not used |

## Owner instruction

Rizqi approved retaining the existing deterministic catalog-recommendation
heuristic. Every customer-facing label that implies an LLM or generative AI
must be changed to **Rekomendasi Barista**. Each recommendation request must
carry the active `branchId`, and the feature must be mounted where customers
can actually reach it without presenting it as more capable than it is.

## Reality represented by the label

The API does not call an external model. `AiService` infers one of five taste
profiles from fixed keywords, ranks products returned by the real branch-aware
catalog service, excludes current cart products when supplied, and returns real
catalog product identifiers and prices. The feature is therefore a deterministic
menu recommender, not an LLM conversation agent.

## Implementation boundaries

- Keep the existing heuristic and catalog-backed recommendation flow.
- Send the active branch identifier to both `/ai/barista-chat` and
  `/ai/recommend-pairings`.
- Do not send a request until a branch is available; show a user-visible state
  asking the customer to wait or retry instead.
- Mount the client component inside the marketing layout, beneath the existing
  query provider, so it is reachable on customer discovery pages but absent
  from authentication, checkout, order tracking, and operations routes.
- Rename customer-facing `Barista AI` and `AI Concierge` copy to
  `Rekomendasi Barista` and remove language implying model reasoning.
- Continue resolving add-to-cart actions against the currently loaded catalog;
  never construct a product from response data alone.

## Rationale and trade-offs

This option has no provider cost, secret-management requirement, or new latency
dependency. Recommendations remain limited to explicit keyword/profile scoring,
so the UI must not promise open-ended reasoning. Branch scoping prevents a
recommendation from being produced from one branch and offered against another
branch's cart/catalog.

## Verification contract

Acceptance requires automated coverage that proves:

1. the public trigger is rendered under the marketing layout;
2. both POST bodies contain the same active `branchId`;
3. no customer-facing source label still calls the feature AI; and
4. a missing branch produces a visible handled state and no API request.
