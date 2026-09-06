/* ============================================
   WARKOP YA'REH — ANIMATION SYSTEM v2.0
   Complete motion token system with Framer Motion
   ============================================ */

import type { Variants, Transition } from "framer-motion";

// ══════════════════════════════════════════
// DURATION TOKENS
// ══════════════════════════════════════════

export const DURATION = {
  instant:   0.05,
  micro:     0.15,
  fast:      0.2,
  normal:    0.3,
  smooth:    0.4,
  slow:      0.6,
  verySlow:  0.8,
} as const;

// ══════════════════════════════════════════
// EASING CURVES
// ══════════════════════════════════════════

export const EASE = {
  enter:     [0.0, 0.0, 0.2, 1.0] as const,
  exit:      [0.4, 0.0, 1.0, 1.0] as const,
  inOut:     [0.4, 0.0, 0.2, 1.0] as const,
  overshoot: [0.34, 1.56, 0.64, 1.0] as const,
  fluid:     [0.25, 0.46, 0.45, 0.94] as const,
  linear:    "linear" as const,
} as const;

// ══════════════════════════════════════════
// SPRING CONFIGURATIONS
// ══════════════════════════════════════════

export const SPRING = {
  gentle:   { type: "spring" as const, stiffness: 120, damping: 20, mass: 1 },
  snappy:   { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 },
  bouncy:   { type: "spring" as const, stiffness: 600, damping: 20, mass: 0.6 },
  stiff:    { type: "spring" as const, stiffness: 800, damping: 40, mass: 0.5 },
  slow:     { type: "spring" as const, stiffness: 80, damping: 18, mass: 1.2 },
  magnetic: { type: "spring" as const, stiffness: 150, damping: 15, mass: 0.5 },
} as const;

// ══════════════════════════════════════════
// STAGGER CONFIGS
// ══════════════════════════════════════════

export const STAGGER = {
  fast:   { staggerChildren: 0.03, delayChildren: 0 },
  normal: { staggerChildren: 0.05, delayChildren: 0 },
  slow:   { staggerChildren: 0.08, delayChildren: 0.1 },
  hero:   { staggerChildren: 0.12, delayChildren: 0.2 },
} as const;

// ══════════════════════════════════════════
// VIEWPORT TRIGGER CONFIGS
// ══════════════════════════════════════════

export const VIEWPORT = {
  once:   { once: true, margin: "-50px" as const },
  repeat: { once: false, margin: "-80px" as const },
  early:  { once: true, margin: "50px" as const },
  late:   { once: true, margin: "-150px" as const },
} as const;

// ══════════════════════════════════════════
// TRANSITION PRESETS (legacy compat)
// ══════════════════════════════════════════

export const springTransition: Transition = SPRING.snappy;
export const gentleSpring: Transition = SPRING.gentle;

export const smoothEase: Transition = {
  duration: DURATION.slow,
  ease: [0.22, 1, 0.36, 1],
};

export const slowEase: Transition = {
  duration: DURATION.verySlow,
  ease: [0.19, 1, 0.22, 1],
};

// ══════════════════════════════════════════
// FADE VARIANTS
// ══════════════════════════════════════════

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.normal, ease: EASE.enter } },
  exit:    { opacity: 0, transition: { duration: DURATION.fast, ease: EASE.exit } },
};

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.smooth, ease: EASE.enter } },
  exit:    { opacity: 0, y: 16, transition: { duration: DURATION.fast, ease: EASE.exit } },
};

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.normal, ease: EASE.enter } },
};

export const fadeInLeft: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: SPRING.gentle },
};

export const fadeInRight: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: SPRING.gentle },
};

// ══════════════════════════════════════════
// SCALE VARIANTS
// ══════════════════════════════════════════

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING.snappy },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: DURATION.fast, ease: EASE.exit } },
};

export const scaleInBounce: Variants = {
  hidden:  { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING.gentle },
};

// ══════════════════════════════════════════
// BLUR FADE
// ══════════════════════════════════════════

export const blurFade: Variants = {
  hidden:  { opacity: 0, filter: "blur(8px)", y: 8 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: DURATION.smooth, ease: EASE.enter } },
  exit:    { opacity: 0, filter: "blur(4px)", y: -4, transition: { duration: DURATION.fast } },
};

// ══════════════════════════════════════════
// CLIP REVEAL
// ══════════════════════════════════════════

export const clipReveal: Variants = {
  hidden:  { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: DURATION.verySlow, ease: EASE.enter } },
};

// ══════════════════════════════════════════
// WORD REVEAL (for word-by-word animation)
// ══════════════════════════════════════════

export const wordReveal: Variants = {
  hidden:  { opacity: 0, y: "110%" },
  visible: { opacity: 1, y: "0%", transition: { duration: DURATION.smooth, ease: EASE.fluid } },
};

// ══════════════════════════════════════════
// STAGGER CONTAINERS
// ══════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: STAGGER.normal },
  exit:    { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

export const staggerContainerSlow: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: STAGGER.slow },
};

export const heroStagger: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: STAGGER.hero },
};

// ══════════════════════════════════════════
// STAGGER ITEMS
// ══════════════════════════════════════════

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: SPRING.gentle },
  exit:    { opacity: 0, y: -8, transition: { duration: DURATION.fast } },
};

export const staggerItemScale: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...smoothEase, duration: 0.5 } },
};

// ══════════════════════════════════════════
// SLIDE VARIANTS
// ══════════════════════════════════════════

export const slideInFromBottom: Variants = {
  hidden:  { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: SPRING.gentle },
  exit:    { y: "100%", opacity: 0, transition: { duration: DURATION.fast, ease: EASE.exit } },
};

export const slideInFromRight: Variants = {
  hidden:  { x: "100%" },
  visible: { x: 0, transition: SPRING.gentle },
  exit:    { x: "100%", transition: { duration: DURATION.fast, ease: EASE.exit } },
};

// ══════════════════════════════════════════
// HERO SECTION
// ══════════════════════════════════════════

export const heroTitle: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

export const heroSubtitle: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 } },
};

export const heroCTA: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 } },
};

// ══════════════════════════════════════════
// PAGE TRANSITIONS
// ══════════════════════════════════════════

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.smooth, ease: EASE.enter } },
  exit:    { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE.exit } },
};

// ══════════════════════════════════════════
// HOVER PRESETS (for whileHover / whileTap)
// ══════════════════════════════════════════

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap:   { scale: 0.97 },
};

export const hoverLift = {
  whileHover: { y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(196,98,45,0.08)", transition: SPRING.snappy },
  whileTap:   { y: -3 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 32px rgba(196, 98, 45, 0.35)",
    transition: { duration: 0.3 },
  },
};

// ══════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════

export const navbarVariants: Variants = {
  top: {
    backdropFilter: "blur(0px)",
    backgroundColor: "transparent",
  },
  scrolled: {
    backdropFilter: "blur(20px) saturate(180%)",
    backgroundColor: "rgba(12, 13, 14, 0.8)",
  },
};

// ══════════════════════════════════════════
// COUNTER ANIMATION
// ══════════════════════════════════════════

export const countUp = (end: number, duration: number = 2) => ({
  initial: { count: 0 },
  animate: {
    count: end,
    transition: { duration, ease: "easeOut" },
  },
});

// ══════════════════════════════════════════
// VIEWPORT CONFIG (legacy compat)
// ══════════════════════════════════════════

export const viewportOnce = {
  once: true,
  amount: 0.2 as const,
  margin: "-50px" as const,
};
