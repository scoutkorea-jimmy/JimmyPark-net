# Chips

> M3 source: https://m3.material.io/components/chips/specs · /components/chips/guidelines
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance
| Type | Purpose | Selected state |
|------|---------|----------------|
| Assist | A smart shortcut or related action ("Add to calendar") | — |
| Filter | Narrow content by a category; multi-select | `secondary-container` fill + check icon |
| Input | A user-entered item (tag, recipient) that can be removed | Trailing ✕ |
| Suggestion | Dynamically suggested reply or query | — |

- Height **32dp**, corner **small (8dp)**, label **Label Large**, icon 18dp, padding 16dp (8dp on an
  icon side), 8dp between elements, input-chip avatar 24dp. Target 48dp.
- Flat chips: 1dp `outline-variant`, level 0. Elevated chips: `surface-container-low`, level 1.
- Label colour: assist `on-surface`; filter, input and suggestion `on-surface-variant`. Selected
  filter/input chips: `secondary-container` / `on-secondary-container`.
- All four M3 chip types are interactive (an action, a filter, an entry, a suggestion). A label
  that only looks like a chip should not borrow interactive styling (hover layer, pointer).

## On jimmypark.net
| Class | Looks like | Actually |
|-------|-----------|----------|
| `.tag` | Assist chip, 32px, 8px, outline | **Static** label (stack, "Useful for", topics) |
| `.tag--large` | 40px chip | Static "I can help with" topics on Contact |
| `.status-tag` | Tertiary container chip | Static status ("Live") |
| `.stat-chip` | Secondary-container chip | Static fact ("95 API routes") |
| `.period` | Surface-container chip | Year / date range |
| Chips over images | White 90% chip, 12px/500 | Feature-card badge and sub line |

- Our chips are **non-interactive labels** styled as chips; they have no hover state layer on
  purpose. If one becomes a filter, give it the filter-chip selected state and a real `<button>`.

## Do / Don't
- **Do** keep chip labels short (1–3 words).
- **Don't** add hover/press feedback to static chips.
- **Don't** use chips for primary actions — that's a button.
