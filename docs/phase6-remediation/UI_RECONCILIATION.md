# Phase 4 - shared UI reconciliation

Audited references: `origin/main` at `0b3efd9`, extraction branch at `f83694a`, and the current merged implementation at `90c4366` (file tree equal to `f7c76db`).

Both frontends already consume `@warkop-yareh/ui`: web checkout/account/booking use Button/Input, while admin uses ToastProvider, CountUp and BrandEmblem. Reusing the existing package is justified by actual consumers. No new shared package or component API was needed.

| Duplicate | Extraction branch compared with main's local web file | Final decision |
| --- | --- | --- |
| `aurora-background.tsx` | Branch hardcodes the base gradient as `#0C0D0E`/`#1A0D06`; main uses CSS variables. No props or dependencies differ. | Retain the already-shared current component: semantic canvas/surface and coffee/amber classes, `data-aurora` marker, grid texture. This is the component already mounted by the current homepage. The unused local copy is removed. |
| `badge.tsx` | Same Badge props; branch uses semantic color tokens, adds `StatusType`, `StatusBadgeProps`, and `StatusBadge`, and resolves `cn` inside the package. | Retain the package's complete export/API and semantic colors. The About consumer switches to this existing version. |
| `button.tsx` | Same Button/MotionButton props, variants and Radix/CVA dependencies. Branch changes colors/focus to semantic tokens, adds 44px minimum targets and press scaling. | Retain the current package implementation, including duration tokens and `primary-cta-motion`; the exported props/variants remain compatible. Login/register/OTP/contact now consume it. |
| `input.tsx` | Same `icon`/`error`/native input props and accessibility attributes. Branch uses package-local `cn`, `input-bg`, `border-strong`, `input-focus-ring` and danger tokens. | Retain the package version; no new props or wrappers. |
| `scroll-progress.tsx` | Byte-identical. | Retain one package copy and migrate marketing layout import. |
| `scroll-to-top.tsx` | Only `SPRING` import changes from app alias to package-relative path. The used `SPRING.snappy` values are unchanged. | Retain package copy; migrate layout import. |
| `skeleton.tsx` | Only `cn` import changes to package-relative path. | Remove unused local copy; retain exported package version. |

Rebase was performed in an isolated worktree checked out on `feat/extract-ui-design-system`. The old extraction patch conflicted because its functionality already exists in the current package. Its obsolete patch was skipped after comparison; the branch was rebased onto `90c4366`, then the missing import migration and duplicate removal were committed as `125dcc2b52aab6591fffc974d1ec94283880556e`. That commit is integrated into `codex/phase6-remediation`.

The current package also retains the existing CountUp/brand exports, added easing tokens, token theme, and current toast behavior. Reapplying the old extraction would remove these changes and resurrect deleted Next app scaffolding inside the library. None of that was needed for deduplication.

The original branch tip remains in local `archive/extract-ui-before-phase6` at `f83694a`; the remote branch was neither deleted nor force-pushed. Local branch reconciliation is complete; publishing or integrating the remote branch is not claimed.

Diff size: 13 files, 11 insertions and 359 deletions. Eleven imports across six consumer files replace app aliases; seven local duplicates are deleted. Current `packages/ui` implementations are reused unchanged. Component runtime remains O(1), and this removal adds no render-time work or dependency.

Validation and raw diff are recorded in the final phase report. The browser checkout/auth suite also exercises the migrated Button/Input consumers. Static build evidence alone does not establish visual acceptance for every component.
