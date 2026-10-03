# Accessibility audit

The read-only deployed baseline passed axe on eight marketing routes but had serious color-contrast findings on login and register. The local working build initially reproduced those findings. The divider and password-help text colors were changed, and the final Chromium sweep uses axe tags `wcag2a`, `wcag2aa`, `wcag21aa`, and `wcag22aa`; all ten canonical routes passed its automated checks at the 390 px audit viewport.

The marketing layout has a keyboard skip link to main content and visible focus styling. Mobile horizontal overflow was checked at 320, 360, 390, 430, and 768 px with no detected overflow on the ten routes. Browser commerce and admin E2E exercised form labels, buttons, authenticated navigation, and reload persistence.

Automated axe success is a baseline, not a complete WCAG certification. Keyboard-only navigation, screen-reader announcements, zoom/reflow at larger text sizes, and real-device touch targets still need human staged verification. The test script and route matrix retain these as release follow-up rather than claiming an independent manual audit.
