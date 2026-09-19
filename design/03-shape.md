# Shape

> M3 source: https://m3.material.io/styles/shape/corner-radius-scale · https://m3.material.io/styles/shape/overview-principles
> Our contract: [design.md §3 Border radius](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §B.

## M3 guidance

Corner radius signals what a thing is and how prominent it is. Small controls get small corners;
large containers get large corners; "full" makes a pill or circle.

| Token | Radius | Typical components |
|-------|--------|--------------------|
| none | 0 | Full-bleed media, top app bar |
| extra-small | 4px (`-top` 4 4 0 0) | Snackbar, baseline menus, text fields, plain tooltips |
| small | 8px | Chips |
| medium | 12px | Cards, small FAB |
| large | 16px (`-top`, `-start` 16 0 0 16, `-end` 0 16 16 0) | FAB, modal drawer (end corners), modal side sheet (start corners), Expressive menus |
| large-increased | 20px | Medium FAB (Expressive) — Compose/M3 only, not in Material Web tokens |
| extra-large | 28px (`-top` 28 28 0 0) | Dialogs, bottom sheets (top), large FAB, carousel items, docked search view |
| extra-large-increased | 32px | Large Expressive containers (not in Material Web tokens) |
| extra-extra-large | 48px | Very large Expressive containers (not in Material Web tokens) |
| full | 50% / 999px | Buttons, icon buttons, navigation indicators, badges, search bar |

- M3 calls this a ten-level scale; symmetric and asymmetric shapes use the same steps.
- **Expressive**: buttons come in round (full) and square (12–28dp) shapes and **morph** when
  pressed (e.g. the small button tightens to 8dp). M3 Expressive also adds decorative shapes for
  small accents; use them sparingly, never for containers of text.
- Nested shapes: inner radius = outer radius − padding (M3's optical-roundness rule).

## On jimmypark.net

| Our token | M3 token | Radius | Used by |
|-----------|----------|--------|---------|
| `--radius-chip` → `--md-shape-sm` | small | 8px | `.tag`, `.stat-chip`, badges over images |
| `--radius-card`, `--radius-control` → `--md-shape-md` | medium | 12px | `.card`, browser mockup, work photos |
| `--md-shape-lg` | large | 16px | Showcase stage, phone mockup, drawer trailing edge |
| `--radius-panel` → `--md-shape-xl` | extra-large | 28px | CTA panel, info panel, feature card, showcase, hero image, gallery dialog |
| `--radius-pill` → `--md-shape-full` | full | 999px | Buttons, nav pills, drawer items, copy/menu icon buttons |
| `--md-shape-xs` | extra-small | 4px | Copy snackbar |

- Not used yet: large-increased, extra-large-increased, extra-extra-large, Expressive shapes and
  shape morphing. If you add them, add the token to `site.css` `:root` and to design.md first.

## Do / Don't
- **Do** use the token that matches the component type. **Don't** write raw radii.
- **Do** keep one radius per component type across pages.
- **Don't** round full-bleed images at the viewport edge; round only contained media.
- **Don't** mix pill and 12px buttons; all buttons are full-shape.

## Checklist
- [ ] Every `border-radius` in new CSS uses an `--md-shape-*` or `--radius-*` token.
- [ ] Nested corners look concentric (inner < outer).
