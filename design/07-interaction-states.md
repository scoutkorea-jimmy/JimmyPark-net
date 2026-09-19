# Interaction states

> M3 source: https://m3.material.io/foundations/interaction/states/overview · /states/state-layers ·
> /states/applying-states
> Our contract: [design.md §5 Buttons](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §D.

## M3 guidance

States show what an element is doing: enabled, hovered, focused, pressed, dragged, selected,
activated, disabled. Most are drawn with a **state layer**: a translucent overlay in the element's
content ("on") colour, between container and content.

| State | State-layer opacity | Notes |
|-------|--------------------|-------|
| Hover | 8% | Pointer devices |
| Focus | 10% (Material Web tokens still say 12%) | Plus a focus indicator for keyboard focus |
| Pressed | 10% (Material Web: 12%) | Plus a ripple |
| Dragged | 16% | Plus elevation |
| Disabled | no state layer | Content `on-surface` at 38%; container `on-surface` at 12% (baseline) or 10% (Expressive buttons) |

- State layer 40dp inside a 48dp target.
- Only one hover, one focus and one pressed state can exist at a time.
- Disabled components show no hover, focus or pressed states, and don't need to meet contrast.
- **Focus indicator**: 3dp thick, 2dp outward offset, colour `secondary`. Items inside containers
  (list items, navigation bar/drawer items, menu items, primary tabs) use an **inward** offset of −3dp.
- **Ripple**: pressed feedback radiates from the touch point across the component shape.
- Selected / activated: a colour change (e.g. `secondary-container` indicator), optionally a filled
  icon; combines with hover/focus/pressed layers.

## On jimmypark.net

- State layers: a `::before` overlay (`background: currentColor`, `z-index: -1`, host has
  `isolation: isolate`) at `--md-state-hover` .08, `--md-state-focus` .10, `--md-state-pressed` .10.
  Hosts: `.site-button`, `.nav-link`, drawer links, `.copybtn`, `.nav-toggle`, linked cards,
  `a.card-link`, disclosure summaries, `.profile-link`, `.travel-link`.
- Focus indicator: `outline: 3px solid var(--md-primary); outline-offset: 2px` on `:focus-visible`.
  **Differs from M3** in colour only: our palette defines no `secondary` role, and burgundy
  (purple on Scouting) meets 3:1 on every surface.
- Ripple: `site.js` adds a `.md-ripple` on `pointerdown` to the same hosts (550ms,
  `--md-ease-standard`); hosts clip overflow.
- Selected: active navigation = `secondary-container` pill + `aria-current="page"`.
- Disabled: none on public pages (no forms). Admin disables controls while saving.

## Do / Don't
- **Do** add every new interactive element to the state-layer and ripple host lists.
- **Do** keep `:focus-visible` outlines; never remove one without a replacement.
- **Don't** signal hover with colour, size and shadow at once — one clear change.
- **Don't** give non-clickable elements hover effects.

## Checklist
- [ ] Hover, focus and pressed visible on every new control.
- [ ] Keyboard focus reaches it and shows the 3px outline.
- [ ] Selected state has a non-colour cue too (weight, indicator, `aria-current`).
