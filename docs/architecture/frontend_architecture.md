# 🖥️ Frontend Architecture Specification — Warkop Ya'reh

This document describes the design system integration, page folder structures, state management mechanisms, and client-side performance patterns for the Warkop Ya'reh frontend applications.

---

## 1. Directory Structure

The frontend is divided into two Next.js applications in a Turborepo monorepo:

### 1.1 Customer Portal (`apps/web/`)
Targeted at consumers. Optimized for mobile, speed, SEO, and smooth animations.
- **Path structure**: Next.js App Router
```
src/app/
├── (marketing)/           # General public-facing routes (unauthenticated)
│   ├── page.tsx           # Home landing page
│   ├── menu/page.tsx      # Digital catalog
│   ├── booking/page.tsx   # Table reservation flow
│   ├── events/page.tsx    # Meetup details
│   ├── community/page.tsx # Forums & feeds
│   ├── about/page.tsx     # Company story page
│   └── contact/page.tsx   # Contact form
├── (auth)/                # Customer sign-in & sign-up flows
├── (dashboard)/           # Member portal (authenticated routes)
│   ├── profile/page.tsx   # User profile details
│   ├── orders/page.tsx    # Customer order history
│   └── rewards/page.tsx   # Loyalty wallet & redemptions
└── layout.tsx             # Global layout (styles, providers)
```

### 1.2 Admin Dashboard Portal (`apps/admin/`)
Targeted at branch employees, baristas, managers, and system administrators. Highly functional, dark-themed, data-rich interface.
- **Path structure**: Next.js App Router
```
src/app/
├── (dashboard)/           # Routes wrapped by shared layout.tsx
│   ├── page.tsx           # Dashboard home overview
│   ├── orders/page.tsx    # Real-time order dispatching
│   ├── products/page.tsx  # Product catalog and stock editing
│   ├── reservations/page.tsx # Coworking table capacities
│   ├── events/page.tsx    # Community events listing
│   ├── events/[id]/page.tsx # Edit event forms
│   ├── community/page.tsx # Thread moderating dashboard
│   ├── loyalty/page.tsx   # Loyalty tiers analytics
│   ├── analytics/page.tsx # Financial dashboard charts
│   ├── branches/page.tsx  # Store operations and weekday hours
│   └── settings/page.tsx  # System administration configurations
├── users/                 # Roster directory
└── layout.tsx             # Root document container
```

---

## 2. Shared UI Component Library (`packages/ui/`)

Pre-compiled reusable components based on Tailwind CSS v4 classes:
- **Button**: Glassmorphic, color variations, hover scaling.
- **Card**: Premium outline, HSL-harmonious borders, background meshes.
- **Badge**: Membership-tiered gradients (Platinum, Gold, Silver, Bronze).
- **DataTable**: Sorted client lists with search filtering and paginations.
- **Modal**: Multi-purpose overlays.

---

## 3. Design System & Style Tokens (Tailwind CSS v4)

Tailwind CSS v4 variables are configured in `apps/admin/src/app/globals.css` and `apps/web/src/app/globals.css`. They provide a premium dark-mode theme by default:

```css
:root {
  --color-primary: #825426;      /* Rich Coffee Brown */
  --color-accent: #cc8e58;       /* Roasted Almond Gold */
  
  --surface-primary: #0a0a0a;    /* Deep Charcoal Black */
  --surface-secondary: #121212;  /* Elevated Card Base */
  --surface-tertiary: #1a1a1a;   /* Inner widgets */

  --text-primary: #ffffff;
  --text-secondary: #a3a3a3;
  --text-tertiary: #737373;
  
  --border-default: #262626;
  --border-subtle: #1f1f1f;
}
```

- **Animations**: Standard micro-interactions are integrated using custom CSS variables (e.g. `motion-safe:card-hover` transitions).
- **Typography**: Inter (Body), Plus Jakarta Sans (Headings), and JetBrains Mono (Code/Numbers).

---

## 4. State Management Strategy

### 4.1 Server State caching (TanStack Query)
TanStack Query (`@tanstack/react-query`) is used for all REST API mutations and fetches.
- **Features**: Automatically handles refetch-on-focus, request deduplication, optimistic updates, and loading/error states.

### 4.2 Client State store (Zustand)
Zustand is used for lightweight client-side state:
- `useCartStore` — Manages customer food orders in the shopping cart.
- `useBranchStore` — Manages selected active branch context (`x-branch-id`).
- `useUserStore` — Holds basic credentials for local sessions.

---

## 5. SEO Best Practices
- **Metadata**: Next.js Metadata API configures title template schemas, meta descriptions, open-graph cards, robots, and sitemaps.
- **Accessibility**: ARIA tags, proper semantic heading structure (`h1` to `h6`), unique DOM identifiers for automated E2E tests, and native screen reader support.
