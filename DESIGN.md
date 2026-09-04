# 🎨 Warkop Ya'reh — Design System Documentation

This document defines the visual guidelines, typography, color system, and layout utilities of the Warkop Ya'reh platform. The design system is configured natively within Tailwind CSS v4 in [globals.css](file:///d:/MY%20CODE/ANTIGRAVITY/warkop-yareh/apps/web/src/app/globals.css).

---

## 👁️ Core Aesthetic Principles

Our interface is designed to evoke the warm, welcoming feel of a premium, modern coffee house combined with **State-of-the-Art Dynamic Web Design**. We aim for a "Wow Factor" that immediately captivates the user:

1. **Rich, Immersive Aesthetics**: High contrast, elegant and sleek dark/light interfaces, neon soft glow highlights, and advanced Glassmorphism 2.0 overlays that feel premium and tactile.
2. **Harmonious Premium Palettes**: Clean browns, warm creams, and vibrant premium gold accents that align with specialty coffee styling but punch with high digital saturation.
3. **Dynamic & Responsive Interactivity**: The UI must feel *alive*. We use smooth micro-animations (spring curves), magnetic hover effects, interactive parallax, and seamless page transitions (via Framer Motion).
4. **Fluid Typography & Layout**: Responsive font scaling and meticulously crafted spacing to ensure an editorial, uncluttered layout that guides the user's eye naturally.
5. **Accessibility First**: Visible, high-contrast focus rings and reduced-motion fallbacks for all key interactive elements without sacrificing the premium aesthetic.

---

## 🔠 Typography System

We use Google Fonts optimized via `next/font` in the layout.

- **Heading Font**: `Plus Jakarta Sans` — A clean, expressive geometric sans-serif font designed for modern editorial headings.
- **Body Font**: `Inter` — Highly legible, neutral sans-serif optimizing reading comfort at small or medium sizes.
- **Monospace Font**: `JetBrains Mono` — Tailored for code blocks, receipts, time slots, and layout values.

### Type Hierarchy

| Target                | Font Family       | Weight            | Size Style              | Tailwind Classes | Usage                        |
| :-------------------- | :---------------- | :---------------- | :---------------------- | :--------------- | :--------------------------- |
| **Hero Title (H1)**   | Plus Jakarta Sans | `800` (ExtraBold) | `3rem` to `4.5rem`      | `font-heading text-5xl font-extrabold` | Page headers, hero copy      |
| **Section Head (H2)** | Plus Jakarta Sans | `700` (Bold)      | `2rem` to `2.5rem`      | `font-heading text-3xl font-bold` | Primary layout sections      |
| **Card Header (H3)**  | Plus Jakarta Sans | `600` (SemiBold)  | `1.25rem` to `1.5rem`   | `font-heading text-xl font-semibold` | Cards, popups, inputs        |
| **Body (Main)**       | Inter             | `400` (Regular)   | `1rem` (16px)           | `font-sans text-base` | Article texts, details       |
| **Body (Muted)**      | Inter             | `400` / `300`     | `0.875rem` (14px)       | `font-sans text-sm text-neutral-500` | Subtext, timestamps          |
| **Metadata / Mono**   | JetBrains Mono    | `500` (Medium)    | `0.75rem` to `0.875rem` | `font-mono text-sm font-medium` | Points, costs, codes, tables |

---

## 🎨 Color System

All colors are configured in the `@theme` block using CSS Custom Properties.

```
☕ Primary (Coffee Brown)
██████████████████████████████ #9c6b3a (500)
🍦 Secondary (Cream Beige)
██████████████████████████████ #e8c47a (500)
✨ Accent (Premium Gold)
██████████████████████████████ #f59e0b (500)
🌑 Neutral (Slate Grey)
██████████████████████████████ #0f172a (900)
```

### 1. Palette Values

#### ☕ Primary (Warm Coffee Brown)

- `primary-50` (`#faf6f1`): Sublest surface tint
- `primary-100` (`#f0e6d8`): Light border/card background
- `primary-300` (`#d4b488`): Medium highlight / soft text
- `primary-500` (`#9c6b3a`): Primary brand color (Default Brown)
- `primary-700` (`#5e3f25`): Dark contrast brand text
- `primary-900` (`#20150d`): Deepest coffee grounds background

#### 🍦 Secondary (Cream Beige)

- `secondary-50` (`#fefcf8`): Bright warm paper surface
- `secondary-100` (`#fdf8ed`): Light cream card surface
- `secondary-300` (`#f5e4be`): Cream accent border
- `secondary-500` (`#e8c47a`): Warm cream highlight

#### ✨ Accent (Premium Gold)

- `accent-100` (`#fef3c7`): Soft gold badge background
- `accent-300` (`#fcd34d`): Glowing gold border
- `accent-500` (`#f59e0b`): High-importance badges, icons, and points
- `accent-700` (`#b45309`): Rich bronze/gold text

#### 🌑 Neutral (Slate)

- `neutral-50` (`#f8fafc`): Day-mode background
- `neutral-200` (`#e2e8f0`): Default borders
- `neutral-500` (`#64748b`): Secondary muted text
- `neutral-800` (`#1e293b`): Dark-mode cards
- `neutral-950` (`#020617`): Jet black canvas

#### 🛑 Semantic Tones

- **Success**: `success-500` (`#10b981`), `success-600` (`#059669`) — Paid order, confirmed booking.
- **Warning**: `warning-500` (`#f59e0b`), `warning-600` (`#d97706`) — Points expiring, pending approval.
- **Error**: `error-500` (`#f43f5e`), `error-600` (`#e11d48`) — Failed transaction, invalid time.

---

## 🌓 Dark vs Light Mode (Semantic Tokens)

To manage dynamic theme-switching seamlessly, we map color palettes to semantic CSS custom variables:

| Semantic Variable             | Light Mode Value        | Dark Mode Value       | Usage Description                  |
| :---------------------------- | :---------------------- | :-------------------- | :--------------------------------- |
| `--surface-primary`           | `#ffffff`               | `#0a0a0c`             | Primary canvas background          |
| `--surface-secondary`         | `#f8fafc`               | `#111114`             | Secondary canvas/sidebars          |
| `--surface-tertiary`          | `#f1f5f9`               | `#18181c`             | Cards, inner blocks                |
| `--surface-elevated`          | `#ffffff`               | `#1c1c21`             | Modals, floating popups            |
| `--surface-glass`             | `rgba(255,255,255,0.8)` | `rgba(10,10,12,0.85)` | Glassmorphism panels               |
| `--text-primary`              | `#0f172a`               | `#f1f5f9`             | Headline copy, titles              |
| `--text-secondary`            | `#475569`               | `#94a3b8`             | Supporting labels, descriptions    |
| `--text-tertiary`             | `#94a3b8`               | `#64748b`             | Muted metadata, inputs placeholder |
| `--text-brand`                | `#9c6b3a`               | `#d4b488`             | Active brand elements              |
| `--border-default`            | `#e2e8f0`               | `#1e293b`             | General structure lines            |
| `--interactive-primary`       | `#9c6b3a`               | `#d4b488`             | Primary button fill                |
| `--interactive-primary-hover` | `#7d5530`               | `#c69b60`             | Button hover state                 |

### Practical Tailwind Usage Examples

```html
<!-- Background usage -->
<div class="bg-[var(--surface-primary)] dark:bg-[var(--surface-tertiary)] text-[var(--text-primary)]">
  <!-- Text color usage -->
  <h2 class="text-primary-500 dark:text-primary-300">Coffee Blend</h2>
  
  <!-- Semantic colors -->
  <span class="bg-success-500/10 text-success-600 rounded-full px-2 py-1">
    Order Ready
  </span>
</div>
```

---

## 🥞 Z-Index Scale

To prevent element overlapping issues, adhere to the following Z-index layer system:

| Layer                 | Z-Index | Tailwind Class | Usage Scenario                         |
| :-------------------- | :------ | :------------- | :------------------------------------- |
| **Base Canvas**       | `0`     | `z-0`          | Default layout, text, normal cards     |
| **Dropdown Menus**    | `10`    | `z-10`         | Select menus, combo boxes              |
| **Sticky Headers**    | `40`    | `z-40`         | Top navigation, sticky sidebars        |
| **Modals & Overlays** | `50`    | `z-50`         | Popups, full-screen dialogs            |
| **Toasts / Alerts**   | `100`   | `z-100`        | Ephemeral notifications, snackbars     |

---

## 📐 Spacing & Radius Guidelines

Consistency in layout gaps and borders is critical.

- **Standard Gaps**: Use `gap-4` (16px) for adjacent components and `gap-6` (24px) for section divisions.
- **Card Padding**: Standard cards should use `p-6` (24px). Compact cards can use `p-4` (16px).
- **Border Radius**: 
  - `rounded-lg` (8px): Inputs, buttons, and inner elements.
  - `rounded-xl` (12px): Standard cards and container blocks.
  - `rounded-2xl` (16px) or `rounded-3xl` (24px): Large marketing sections and hero wrappers.

---

## ✨ Utility Classes & Glassmorphism

Special tailwind-integrated utility classes provide visual polish:

### 1. `.glass` & `.glass-premium`

Used for sticky headers, modal covers, and side navigation. The premium version adds dynamic noise and glowing edges.

```css
.glass {
  background: var(--surface-glass);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.glass-premium {
  /* Extended version with inner shadows and subtle highlights */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

### 2. `.bg-mesh`

Creates a slow-flowing radial ambient light pattern behind marketing heroes.

- **Light mode**: Uses primary (brown) and accent (gold) with very low opacity (`0.04 - 0.08`).
- **Dark mode**: Uses slightly higher visibility (`0.06 - 0.12`) to cut through pitch black.

### 3. `.bg-noise`

An overlay pseudo-element (`opacity: 0.03`) utilizing inline SVG turbulence to add an organic, tactile paper texture to standard solid color cards.

### 4. `.skeleton`

Used to indicate loading states during server fetches.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-tertiary) 25%,
    var(--surface-secondary) 50%,
    var(--surface-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

### 5. `.card-hover` & `.card-magnetic`

Applied on interactive product, event, and group cards to create a lifelike elevation and spatial interaction.

```css
.card-hover {
  transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1);
}
.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12); /* Dark mode: rgba(0,0,0,0.4) */
}

/* Magnetic effect handled via Framer Motion in React components */
```

---

## 🔄 Animations & Easing Curves

Animations must use customized spring timings over standard CSS linear or ease transitions:

### Custom Easing Constants

- **Spring Curve** (`--ease-spring`): `cubic-bezier(0.22, 1, 0.36, 1)` — Default entry and movement.
- **Expo Out** (`--ease-out-expo`): `cubic-bezier(0.19, 1, 0.22, 1)` — Used for slide-outs.
- **Normal Duration** (`--duration-normal`): `250ms` — Standard card transforms.
- **Slower Duration** (`--duration-slower`): `600ms` — Fade-in and theme switches.

### Custom Keyframe Animations

- `@keyframes float`: Translates `translateY(0)` to `translateY(-10px)` and back, applied to hero graphics.
- `@keyframes pulse-glow`: Pulses soft brand shadow rings around active checkouts or priority calls to action.
- `@keyframes slide-up`: Slides cards upwards (`20px` to `0`) while easing in opacity.

---

## 🛠️ Code Conventions & Component Standards

To keep components clean and uniform across apps:

1. **Never hardcode hex values**: Always use semantic class parameters (`bg-[var(--surface-primary)]` or standard CSS variables).
2. **Support Dark Mode**: Every layout/module must support light and dark modes by utilizing theme CSS variable bindings.
3. **Micro-interactions**: Use Framer Motion or native CSS transitions (`transition-all duration-normal ease-spring`) on clickable inputs.
4. **Use Shared Layout Elements**: Ensure all modules align to standard spacing systems (`p-4`, `p-6`, `gap-4`, etc.) and borders are standard `rounded-lg` or `rounded-xl`.

---

## ♿ Accessibility (a11y) Standards

We build for everyone. Follow these rules rigorously:
1. **Focus States**: Never remove focus outlines (`outline-none`) without providing an accessible alternative (e.g., `focus-visible:ring-2 focus-visible:ring-primary-500`).
2. **Contrast Ratios**: Ensure text against background meets WCAG AA standards (4.5:1 for normal text).
3. **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, and appropriate `aria-labels` for icon-only buttons.
4. **Reduced Motion**: Respect user OS preferences using `motion-safe` and `motion-reduce` Tailwind utilities for non-essential decorative animations.
