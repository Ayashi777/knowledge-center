# Design System Guide

This project uses a token-first UI layer so visual redesigns do not require business-logic rewrites.

## Source Of Truth

- Tokens: `src/app/styles/tokens.css`
- Theme packs: `src/app/styles/themes/`
- Tailwind token mapping: `tailwind.config.cjs`
- Base styles and font wiring: `src/app/styles/tailwind.css`
- UI primitives: `src/shared/ui/primitives/`
- UI states: `src/shared/ui/states/`
- Playground route: `/ui-playground`

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
- Additional theme packs live in `src/app/styles/themes/` and can be applied via html class (`theme-default`, `theme-citrine`).
- Components should not branch by custom color constants.

## Migration Checklist (Legacy -> Tokenized)

1. Replace raw color classes with semantic token classes.
2. Replace raw `<button>`, `<input>`, modal wrappers with primitives.
3. Keep spacing/typography consistent with existing scale unless intentionally updated globally.
4. Run `npm run build` after each migration slice.
5. Validate mobile and desktop layouts for touched screens.

## Current Coverage

Tokenized and primitive-based:

- Main app layout shell
- Login, Document, Document Editor, Category Editor, User Editor, Tag modals
- Admin panel tabs, content/users/tags/requests sections
- Dashboard filters/header/list empty state
- Sidebar and Pagination
- Landing and Services pages
- Support sidebar, language switcher, user access controls

Partially legacy:

- Document card visual styles
- Isolated helper widgets with branded accents

## Recommended Next Steps

1. Keep snapshot baselines current with `npm run test:visual:update`.
2. Add Storybook (optional) if component docs need richer examples than `/ui-playground`.
3. Continue migrating remaining isolated hardcoded accents to semantic tokens.
