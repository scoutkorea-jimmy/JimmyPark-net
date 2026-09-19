# Cards

> M3 source: https://m3.material.io/components/cards/specs · /components/cards/guidelines
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance
| Type | Container | Elevation | Border |
|------|-----------|-----------|--------|
| Elevated | `surface-container-low` | level 1 (hover 2) | none |
| Filled | `surface-container-highest` | level 0 (hover 1) | none |
| Outlined | `surface` | level 0 (hover 1) | 1dp `outline-variant` |

- Corner **medium (12dp)** for all three; side padding **16dp**; gap between cards **8dp max**.
  Content: optional media, headline (Title Large/Medium), subhead, supporting text (Body Medium), actions.
- Disabled: container at 38%, outlined-card border at 12%.
- A card is one unit about one subject. If the whole card is clickable, it has **one** primary
  destination; secondary actions inside it must be separate buttons.
- Hover/focus/pressed use the state layer; dragged adds elevation.

## On jimmypark.net
| Class | M3 type | Notes |
|-------|---------|-------|
| `.card` | Outlined | 1px `--md-outline-variant`, 12px, `--card-padding` 16–24px |
| `a.card` | Outlined, clickable | Hover: level 1–2 + `translateY(-4px)` |
| `.card--scouting` | Filled (Scouting tint) | Page-scoped tint and border |
| `.project-card`, `.selected-work-grid` cards | Outlined with media | Media on top (16:9), text in `.card-body`, action pinned to the bottom |
| `.feature-card` | Large outlined card | 28px radius, image area + text column; BP Media cards use the mockup image |
| `.site-showcase` | Large outlined panel | Dev Work: mockups + facts + back-end list |
| `.info-panel`, `.cta-panel` | Filled panels | 28px radius, tonal or primary fill |

- **Owner rule:** side-by-side cards share one height; the last block sits on the common bottom
  line (flex column + `margin-top: auto`). Measured: no row differs by more than 2px.
- Phones: collections become swipe rows (84% cards, next one peeking), equal heights kept.
- **Where we differ:** card padding 16–24px and grid gaps 16–24px (M3: 16 and ≤ 8) — a portfolio
  grid reads better with more air; large feature cards and panels use 28px corners (panels are
  containers, not cards).

## Do / Don't
- **Do** keep one link target per clickable card.
- **Do** use outlined cards on white and filled cards on tinted bands.
- **Don't** nest a card inside a card (panels may contain cards; cards may not).
- **Don't** hide essential information behind hover.
