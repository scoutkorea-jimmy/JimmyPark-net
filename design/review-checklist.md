# M3 review checklist (run before shipping a page change)

Use with [design.md](../design.md) and the required checks in [CLAUDE.md](../CLAUDE.md).

## Styles
- [ ] Colours are `--md-*` roles (or their aliases); every fill has its `on-` pair. → [01](01-color.md)
- [ ] Text uses a role class/token from the type scale; headings 400, labels 500. → [02](02-typography.md)
- [ ] Radii are shape tokens (8 chips · 12 cards · 16 stage/drawer · 28 panels · full buttons). → [03](03-shape.md)
- [ ] Shadows only from `--md-elevation-1|2|3`, only on interactive or overlapping surfaces. → [04](04-elevation.md)
- [ ] Icons are Material Symbols Outlined, `aria-hidden` when decorative. → [08](08-icons.md)

## Behaviour
- [ ] New controls have state layers, ripple, `:focus-visible` outline and a 48px target. → [07](07-interaction-states.md)
- [ ] Motion uses the easing/duration tokens, lives under `.motion`, and leaves content visible
      without JS and with reduced motion. → [05](05-motion.md)
- [ ] Reveals checked with a gradual scroll at **real** 1440 and 390 widths (width and height as
      separate arguments), including phone swipe rows and opened disclosures.

## Layout
- [ ] Breakpoints only at 600 and 840; spacing from the 4px token scale. → [06](06-layout.md)
- [ ] No horizontal page scroll at 360–1440px; side-by-side cards share one height.
- [ ] Body text lines ≤ ~75 characters.

## Accessibility
- [ ] Heading order, landmarks, keyboard path, contrast (4.5:1 text, 3:1 UI). → [09](09-accessibility.md)

## Components
- [ ] The component matches its M3 type (filled vs outlined button, outlined card, etc.) and the
      site's class for it. → [components/](components/)
- [ ] Static seed markup and the `site.js` `TT` template still match (`python3 .checks/design.py`).
