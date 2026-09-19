# Icons

> M3 source: https://m3.material.io/styles/icons/overview · /styles/icons/applying-icons · /styles/icons/designing-icons ·
> https://fonts.google.com/icons (Material Symbols)
> Our contract: [design.md §2](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §I.

## M3 guidance

**Material Symbols** is a variable icon font in three styles (Outlined, Rounded, Sharp). Use one
style across a product.

| Axis | Range | M3 guidance |
|------|-------|-------------|
| Fill (`FILL`) | 0–1 | 0 = outlined, 1 = filled; use the change for state (e.g. a selected nav item) |
| Weight (`wght`) | 100–700 | 400 (regular) recommended; don't go below 200 at 24dp; don't mix weights |
| Grade (`GRAD`) | −50 to 200 | 0 for dark icons on light backgrounds, −25 for light icons on dark backgrounds; positive values add emphasis |
| Optical size (`opsz`) | 20–48 | Match the rendered size |

- Sizes: **24dp** standard; **20dp** for dense desktop layouts; **40 or 48dp** next to display or
  headline text and on large screens. Inside components: 18dp in baseline buttons and chips,
  20dp in Expressive small buttons, 24dp in icon buttons (40dp container).
- A 24dp icon is drawn in a 20dp live area with 2dp padding, 2dp strokes and 2dp corners.
- Icon colour follows the component (`on-surface-variant` when inactive).
- Decorative icons are hidden from assistive tech; icon-only controls need an accessible label.

## On jimmypark.net

- Loaded once per page (Admin included):
  `Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0` — weight fixed at 400, fill 0–1
  available, grade 0. (v0.17.2 removed a leftover weight-300 copy from Admin.)
- Class `.msym`; decorative icons carry `aria-hidden="true"`.
- In use: `arrow_forward` / `arrow_outward` (trailing in buttons and links, 18px), `check_circle`
  (back-end and deliverable lists, primary colour), `content_copy`, `mail`, `call`, `link`,
  `menu` / `close`, `expand_more` (disclosures; rotates 180° when open).
- Icon-only buttons (`.copybtn`, `.nav-toggle`) have `aria-label`s.

## Do / Don't
- **Do** use Outlined everywhere; switch to `FILL 1` only for a selected state.
- **Do** size icons 18 (in buttons/chips), 20 or 24; set `opsz` to match if larger.
- **Don't** mix icon fonts or add another SVG icon set.
- **Don't** rely on an icon alone for anything non-obvious.

## Checklist
- [ ] `aria-hidden="true"` on decorative icons; `aria-label` on icon-only controls.
- [ ] One style, weight 400, standard sizes.
