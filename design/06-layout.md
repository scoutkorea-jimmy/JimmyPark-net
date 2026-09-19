# Layout and spacing

> M3 source: https://m3.material.io/foundations/layout/breakpoints/overview (formerly "window size classes") ·
> /styles/spacing/tokens · /foundations/designing/structure (targets)
> Our contract: [design.md §3–4](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §F.

## M3 guidance

### Breakpoints
| Class | Width | Panes | Margins | Spacer | Navigation |
|-------|-------|-------|---------|--------|------------|
| Compact | < 600 | 1 | 16 | — | Navigation bar or modal expanded rail |
| Medium | 600–839 | 1 (or 2 at 50/50) | 24 | 24 | Rail (1 pane) or navigation bar (2 panes) |
| Expanded | 840–1199 | 1 or 2 (recommended) | 24 | 24 | Collapsed or expanded rail |
| Large | 1200–1599 | 2 (recommended) | 24 | 24 | Collapsed or expanded rail |
| Extra-large | ≥ 1600 | 1–3 | 24 | 24 | Expanded rail; a standard side sheet can be the third pane |

- Fixed pane widths: 360 by default at expanded, 412 at large and extra-large; side sheets max 400.
- Adapt by **reflowing** (columns → one column), **revealing** (more detail on larger windows) and
  **swapping navigation**, not by shrinking everything.
- **Line length: 40–60 characters per line** at every breakpoint.

### Spacing
- An **8dp scale** with nested 2, 4, 6 and 10dp steps (tokens announced May 2026; M3 notes the
  tokens themselves ship only in Jetpack Compose so far):
  `space0` 0 · `space25` 2 · `space50` 4 · `space75` 6 · `space100` 8 · `space125` 10 · `space150` 12 ·
  `space175` 14 · `space200` 16 · `space250` 20 · `space300` 24 · `space400` 32 · `space450` 36 ·
  `space500` 40 · `space600` 48 · `space700` 56 · `space800` 64 · `space900` 72.
- Spacing has three kinds: **padding** (inside), **gap** (between siblings), **margin** (outside).
- Density: a denser step usually removes 4dp of vertical padding; it must never shrink targets
  below 48 × 48.

### Targets
Touch targets **≥ 48 × 48dp** (≈ 9mm), pointer targets **≥ 44 × 44dp**, and **≥ 8dp** between
targets. Example: a 24dp icon in a 40dp state layer in a 48dp target.

## On jimmypark.net

| M3 class | Our breakpoint | What changes |
|----------|----------------|--------------|
| Expanded and up | ≥ 840px | Top navigation in the app bar, multi-column grids, split hero |
| Medium | 600–839px (`max-width: 839px`) | Modal navigation drawer; most grids → 1 column |
| Compact | < 600px (`max-width: 599px`) | Card collections become swipe rows; 16px gutter; admin lists collapse behind a disclosure |

| Token | Value | M3 relation |
|-------|-------|-------------|
| `--page-gutter` | 16px (compact), 24px (≥ 600px) | = M3 margins |
| `--content-width` | 1180px incl. gutters | One centred pane on large windows |
| `--space-2 … --space-96` | 2, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96 | M3 steps up to 64; 80/96 are ours, for section rhythm |
| `--section-space` | 48–80px both ends | Vertical rhythm between sections |
| `--card-padding` | 16–24px | Card padding (M3 cards: 16) |
| `--control-size` | 40px | Visible button / icon-button size |

**Where we differ:** one pane everywhere (a portfolio page, not an app); long text blocks run to
~44–72ch (M3 suggests 40–60); the drawer replaces a navigation bar/rail (see
[components/navigation.md](components/navigation.md)).

- Visible controls are 40px; keep ≥ 8px between adjacent controls so their 48px targets don't overlap.
  Drawer items and disclosure summaries are 56px.
- Put new grid rules in the existing `@media (max-width: 839px)` / `(max-width: 599px)` blocks.

## Do / Don't
- **Do** use the spacing tokens; new values should come from the M3 steps above.
- **Do** reflow to one column and swipe rows on compact; keep content, drop decoration.
- **Don't** add breakpoints other than 600 and 840 (never reintroduce 960/520).
- **Don't** let body text run past ~72 characters; aim for 40–60 in new components.

## Checklist
- [ ] No horizontal page scroll at 360, 390, 600, 840, 1280 and 1440px.
- [ ] Targets 48px (touch) with ≥ 8px between them.
- [ ] New spacing values are tokens.
