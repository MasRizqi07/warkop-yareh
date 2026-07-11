# 🎨 Design System Guide

## Project: Warkop Ya'reh Digital Platform

This document describes the official design system for the **Warkop Ya'reh** platform, defining typography, color palettes, spacing variables, semantic tokens, and layout guidelines configured in [globals.css](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/apps/web/src/app/globals.css).

---

## 1. Design Philosophy

Warkop Ya'reh combines the warmth of traditional Indonesian coffee culture with clean, modern digital workflows.

- **Warmth & Contrast**: Rich coffee browns, cream beiges, and gold highlights set against high-contrast backgrounds.
- **Micro-interactions**: Subtle hover actions, spring timings, and smooth state changes that keep the app feeling responsive.
- **Theme Adaptability**: True dark/light modes using unified CSS custom variables.

---

## 2. Typography System

We use Google Fonts optimized using the `next/font` compiler:

- **Headings**: `Plus Jakarta Sans` — Expressive, geometric, modern.
- **Body & Labels**: `Inter` — Highly legible at all sizes.
- **Data, Time & Codes**: `JetBrains Mono` — Consistent spacing, ideal for metadata, points, tables, and receipts.

### Typography Hierarchy

| Scale Name      | Font Family       | Size              | Weight | Line Height | Usage                          |
| :-------------- | :---------------- | :---------------- | :----- | :---------- | :----------------------------- |
| **Hero Title**  | Plus Jakarta Sans | `3.75rem` (60px)  | `800`  | 1.1         | Landing page headers           |
| **H1**          | Plus Jakarta Sans | `2.5rem` (40px)   | `800`  | 1.2         | Page header titles             |
| **H2**          | Plus Jakarta Sans | `1.75rem` (28px)  | `700`  | 1.25        | Main sections                  |
| **H3**          | Plus Jakarta Sans | `1.25rem` (20px)  | `600`  | 1.3         | Card titles, popups            |
| **Body Large**  | Inter             | `1.125rem` (18px) | `400`  | 1.6         | Introductory copy              |
| **Body Base**   | Inter             | `1rem` (16px)     | `400`  | 1.5         | General descriptions           |
| **Body Small**  | Inter             | `0.875rem` (14px) | `400`  | 1.5         | Input labels, muted text       |
| **Code / Mono** | JetBrains Mono    | `0.875rem` (14px) | `500`  | 1.4         | Points, slots, transaction IDs |

---

## 3. Color System

Colors are configured as custom properties inside the Tailwind CSS v4 `@theme` block:

### 3.1 Primary Brand Colors (Coffee Browns)

- `primary-50` (`#faf6f1`): Sublest warm tint
- `primary-100` (`#f0e6d8`): Light border/soft card fill
- `primary-300` (`#d4b488`): Soft tan highlight
- `primary-500` (`#9c6b3a`): Primary Brand Coffee Brown
- `primary-700` (`#5e3f25`): Deep contrast text
- `primary-900` (`#20150d`): Deep espresso grounds fill

### 3.2 Secondary Highlight Colors (Cream Beiges)

- `secondary-100` (`#fdf8ed`): Light cream canvas
- `secondary-300` (`#f5e4be`): Soft cream border
- `secondary-500` (`#e8c47a`): Warm brand highlight cream

### 3.3 Accent Color (Premium Gold)

- `accent-100` (`#fef3c7`): Soft gold badge base
- `accent-500` (`#f59e0b`): High-importance badges, ratings, and points indicator
- `accent-700` (`#b45309`): Deep contrast gold text

### 3.4 Neutral Shades (Slate)

- `neutral-50` (`#f8fafc`): Light-mode page fill
- `neutral-200` (`#e2e8f0`): Default borders
- `neutral-500` (`#64748b`): Secondary labels
- `neutral-800` (`#1e293b`): Dark-mode card base
- `neutral-950` (`#020617`): Jet black canvas base

### 3.5 Semantic Colors

- **Success**: `success-500` (`#10b981`), `success-600` (`#059669`) — Paid states, confirmed actions.
- **Warning**: `warning-500` (`#f59e0b`), `warning-600` (`#d97706`) — Pending actions, point expirations.
- **Error**: `error-500` (`#f43f5e`), `error-600` (`#e11d48`) — Failed checkouts, validation alerts.

---

## 4. Light & Dark Mode Semantic Tokens

We translate theme colors into semantic tokens mapped to custom properties:

```css
:root {
  --surface-primary: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-tertiary: #f1f5f9;
  --surface-elevated: #ffffff;
  --surface-glass: rgba(255, 255, 255, 0.8);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --border-default: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-focus: #9c6b3a;
  --interactive-primary: #9c6b3a;
  --interactive-primary-hover: #7d5530;
}

.dark {
  --surface-primary: #0a0a0c;
  --surface-secondary: #111114;
  --surface-tertiary: #18181c;
  --surface-elevated: #1c1c21;
  --surface-glass: rgba(10, 10, 12, 0.85);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --border-default: #1e293b;
  --border-hover: #334155;
  --border-focus: #d4b488;
  --interactive-primary: #d4b488;
  --interactive-primary-hover: #c69b60;
}
```

---

## 5. Layout Utilities & Design Tokens

### 5.1 Glassmorphism (`.glass`)

Used for fixed headers, contextual drawers, and modal panels.

```css
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-subtle);
}
```

### 5.2 Mesh Backgrounds (`.bg-mesh`)

Fades slowly flowing ambient radial gradients:

- **Light mode**: Opacity set at `0.04 - 0.08` utilizing primary and accent highlights.
- **Dark mode**: Opacity set at `0.06 - 0.12` to stand out against absolute dark.

### 5.3 Elevation & Shadows

- `radius-md`: `8px` — Default input fields, badges.
- `radius-lg`: `12px` — Standard product and event cards.
- `radius-xl`: `16px` — Large panels, drawers, checkout popups.
- `.card-hover`:
  ```css
  .card-hover {
    transition: all 250ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); /* Dark mode: rgba(0,0,0,0.3) */
  }
  ```

---

## 6. Responsive Breakpoints & Grid (Audited)

We map responsive layouts to specific tailwind media queries:

- **Mobile-First (xs)**: `min-width: 375px` — Designed for standard single-column mobile menus.
- **Mobile (sm)**: `min-width: 640px` — Compact double-column grids.
- **Tablet (md)**: `min-width: 768px` — Side navigation transforms into standard drawers.
- **Laptop (lg)**: `min-width: 1024px` — Table maps and split screens.
- **Desktop (xl)**: `min-width: 1280px` — Flagship BI dashboard matrices.

---

## 7. Performance Budget & GPU Guidelines (Audited)

To achieve Lighthouse score performance Targets (≥ 95) on mobile devices:

1. **GPU Layer Promotion**: Heavy properties (such as `.glass` utilizing `backdrop-filter`) must be scoped with `will-change: transform, opacity` hints to trigger hardware acceleration.
2. **Animation Deferral**: No complex continuous loops (like `@keyframes float`) can run above the fold on mobile viewports.
3. **Bundle Weight Control**: Dynamic client-side dynamic loading must be configured on Framer Motion:
   ```typescript
   // Example of dynamically importing framer motion features in Next.js React 19
   import { LazyMotion, domAnimation } from "framer-motion"
   export function App({ children }) {
     return <LazyMotion features={domAnimation}>{children}</LazyMotion>
   }
   ```

---

## 8. Accessible Motion Guidelines (WCAG 2.3.3)

To prevent vestibular disorder triggers:

1. **Global CSS Animation Blocker**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
2. **React Motion Controls**: Developers must use the `useReducedMotion()` hook from Framer Motion. If true, replace transitions with simple, instant opacity cuts (`duration: 0`).

---

## 9. Loading States & Skeletons (Audited)

To maintain styling consistency while waiting for queries:

1. **Skeleton Pulse Component**: Use a CSS-only gradient shimmer:
   ```css
   .skeleton-shimmer {
     background: linear-gradient(
       90deg,
       var(--surface-tertiary) 25%,
       var(--surface-secondary) 50%,
       var(--surface-tertiary) 75%
     );
     background-size: 200% 100%;
     animation: skeleton-pulse 1.5s ease-in-out infinite;
   }
   @keyframes skeleton-pulse {
     0% {
       background-position: 200% 0;
     }
     100% {
       background-position: -200% 0;
     }
   }
   ```
2. **Minimum Duration Guidelines**: All dynamic search queries and skeleton displays must implement a minimum loading state buffer of **300ms** to prevent layout flashes on high-speed internet connections.
3. **Spinners**: Limited strictly to button submit actions (`isSubmitting`) or incremental pagination indicators.
