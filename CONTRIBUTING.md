# Contributing Guide

## UI And Design Rules

1. Use design tokens from `src/app/styles/tokens.css` and theme packs from `src/app/styles/themes/`.
2. Prefer semantic classes (`bg-surface`, `text-fg`, `text-muted-fg`, `border-border`, `text-primary`) over raw color utilities.
3. Use shared primitives from `src/shared/ui/primitives/`:
   - `Button`, `Input`, `Card`
   - `ModalOverlay`, `ModalPanel`
4. For status UIs, use `StatePanel` from `src/shared/ui/states/`.
5. Avoid new hardcoded palette classes in feature components unless explicitly required for a temporary visual experiment.

## Accessibility Baseline

1. Interactive elements must be keyboard reachable.
2. Add `aria-label` for icon-only controls.
3. Keep visible focus state (`focus-visible`) on controls.
4. Modal-like blocks must keep dialog semantics (`role="dialog"`, `aria-modal="true"`).

## Visual Regression

1. Run `npm run test:visual` before merging UI-heavy changes.
2. If intentional visual updates were made, refresh baselines with:
   - `npm run test:visual:update`
3. Review snapshot diffs before approving.

## Required Checks Before Push

1. `npm run build`
2. `npm run test:visual` (for UI changes)
