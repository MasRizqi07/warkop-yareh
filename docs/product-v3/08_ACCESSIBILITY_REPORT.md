# Accessibility and mobile report

The v3 Chromium discovery check exercises home, outlets, Jetis detail, menu and login at 320 px with axe WCAG 2 A/AA and 2.1 AA tags. It asserts zero serious/critical violations and no document horizontal overflow. A menu chip contrast defect was fixed by removing reduced text opacity. The login page uses a short entrance animation; axe runs after the form reaches its stable opacity so the measured colors reflect the visible interface.

The prior Phase 3 smoke checked the ten canonical routes at 390 px and overflow at 320, 360, 390, 430 and 768 px. Those results are historical until repeated at the exact v3 PR SHA. Commerce and admin E2E cover labeled forms, dialogs and keyboard-usable buttons; they are not a complete screen-reader or keyboard-only audit. Human testing of focus order, zoom/reflow, dynamic announcements, touch targets and admin editing remains a preview acceptance task.
