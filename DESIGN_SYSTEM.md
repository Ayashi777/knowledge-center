# Design System Guide

This project uses a token-first UI layer so visual redesigns do not require business-logic rewrites.

## Source Of Truth

- Tokens: `src/app/styles/tokens.css`
- Tailwind token mapping: `tailwind.config.cjs`
- Base styles and font wiring: `src/app/styles/tailwind.css`
- UI primitives: `src/shared/ui/primitives/`

## Core Rules

1. Do not hardcode semantic UI colors in feature components (`gray-*`, `blue-*`, `red-*` etc.) unless used for a deliberate, isolated visual accent.
2. Prefer semantic utility classes mapped from tokens:
   - `bg-bg`, `bg-surface`, `bg-muted`
   - `text-fg`, `text-muted-fg`
   - `border-border`
   - `text-primary`, `text-danger`, `text-success`, `text-warning`
3. Use primitives for interactive and layout foundations:
   - `Button`
   - `Input`
   - `Card`
   - `ModalOverlay`, `ModalPanel`
4. Keep business logic out of primitives. Primitives are visual and behavioral wrappers only.
5. For new UI, composition order is:
   - tokens -> Tailwind semantic class -> primitive -> feature component

## Component States

Every interactive component should support at least:

- `default`
- `hover`
- `focus-visible`
- `disabled`
- `loading` (where applicable)
- `error` (for validation surfaces)

Use token-driven states (`primary`, `danger`, `muted`) rather than ad-hoc colors.

## Theming

- Light/dark values live in `:root` and `.dark` blocks in `tokens.css`.
- Theme switching should only toggle `.dark`; components should not branch by custom color constants.

## Migration Checklist (Legacy -> Tokenized)

1. Replace raw color classes with semantic token classes.
2. Replace raw `<button>`, `<input>`, modal wrappers with primitives.
3. Keep spacing/typography consistent with existing scale unless intentionally updated globally.
4. Run `npm run build` after each migration slice.
5. Validate mobile and desktop layouts for touched screens.

## Current Coverage

Tokenized and primitive-based:

- Main app layout shell
- Login, Document, Document Editor, Category Editor, User Editor modals
- Admin panel tabs, content/users/tags/requests sections
- Dashboard filters/header/list empty state
- Sidebar and Pagination

Partially legacy:

- Landing page sections
- Services page
- Support sidebar
- Some shared widgets still using direct utility colors

## Recommended Next Steps

1. Finish token migration for `LandingPage` and `ServicesPage`.
2. Standardize `SupportSidebar` to primitives and semantic colors.
3. Add UI playground (or Storybook) to document primitive variants and states.
