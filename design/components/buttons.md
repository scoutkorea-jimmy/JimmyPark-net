# Buttons

> M3 source: https://m3.material.io/components/buttons/specs · /components/icon-buttons/specs ·
> /components/floating-action-button/specs · /components/extended-fab/specs · /components/segmented-buttons/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance

### Common buttons — pick by emphasis
| Type | Emphasis | Container | Label / icon | Use |
|------|----------|-----------|--------------|-----|
| Filled | Highest | `primary`, level 0 | `on-primary` | The one primary action in a view |
| Filled tonal | High | `secondary-container`, level 0 | `on-secondary-container` | Important secondary actions |
| Elevated | Medium | `surface-container-low`, level 1 | `primary` | When a flat fill gets lost on a busy background |
| Outlined | Medium | transparent + 1dp border | baseline: `outline` border, `primary` label · Expressive: `outline-variant` border, `on-surface-variant` label | Secondary actions next to a filled button |
| Text | Lowest | none | `primary` | Tertiary and inline actions |

### Sizes
| | Baseline | Exp. XS | Exp. S (default) | Exp. M | Exp. L | Exp. XL |
|---|---|---|---|---|---|---|
| Height | 40 | 32 | 40 | 56 | 96 | 136 |
| Round / square corner | full / — | full / 12 | full / 12 | full / 16 | full / 28 | full / 28 |
| Pressed-morph corner | — | 8 | 8 | 12 | 16 | 16 |
| Side padding | 24 (16 on the icon side; text button 12) | 12 | 16 | 24 | 48 | 64 |
| Icon / icon–label gap | 18 / 8 | 20 / 4 | 20 / 8 | 24 / 8 | 32 / 12 | 40 / 16 |
| Label | Label Large | Label Large | Label Large | Title Medium | Headline Small | Headline Large |
| Outline (outlined type) | 1 | 1 | 1 | 1 | 2 | 3 |

- Touch target 48dp (XS and S need extra hit area). In Expressive, M3 marks 24dp padding on the
  small button "not recommended — use 16dp".
- Expressive toggle buttons change shape when selected; **button groups** keep related buttons
  together and **split buttons** pair an action with a menu (both rest at level 0).

### Icon buttons
| | XS | S (default) | M | L | XL |
|---|---|---|---|---|---|
| Container | 32 | 40 | 56 | 96 | 136 |
| Icon | 20 | 24 | 24 | 32 | 40 |
| Square corner | 12 | 12 | 16 | 28 | 28 |
Round shape = full. Styles: standard (`on-surface-variant` icon), filled (`primary`), tonal
(`secondary-container`), outlined (`outline-variant` border, `on-surface-variant` icon). 48dp target.

### FAB and extended FAB
| | FAB | Medium FAB | Large FAB | Small FAB (not recommended) |
|---|---|---|---|---|
| Size | 56 | 80 | 96 | 40 |
| Corner | 16 | 20 | 28 | 12 |
| Icon | 24 | 28 | 36 (Compose: 32) | 24 |
Extended FAB heights 56 / 80 / 96 with Title Medium / Title Large / Headline Small labels.
Level 3 (lowered: 1). Colours: `primary-container` ("tonal primary"), secondary/tertiary
containers, or solid primary/secondary/tertiary. One FAB per screen, for the most common action.

### Segmented buttons
Height 40, full shape, 1dp `outline`, selected segment `secondary-container` + check icon (18dp).
**M3 Expressive: "no longer recommended — use a connected button group".**

## On jimmypark.net
| Class | M3 type | Notes |
|-------|---------|-------|
| `.site-button.btn-primary` | Filled | "Tell me your goal", "Visit …", "Discuss a project"; hover level 1 |
| `.site-button.btn-ghost` | Outlined (baseline colours) | "See selected work", "Send a role enquiry"; 1px `--md-outline`, primary label |
| `.site-button.btn-white` | Filled, inverted, on the dark CTA | White container, primary label |
| `a.card-link`, `.lnk` | Text button | Card actions ("Learn more", "Watch film") |
| `.copybtn` | Outlined icon button | 40px circle, `content_copy`, `--md-outline` border |
| `.nav-toggle` | Standard icon button | 40px circle, `menu` / `close` |
| `.backend-toggle` (summary) | Filled tonal | "Show admin features" on phones |

- All: 40px (`--control-size`), full radius, Label Large, trailing 18px icon, state layer +
  ripple + `scale(.97)` on press.
- **Where we differ:** baseline padding (24px, 16px on the icon side) rather than Expressive's 16px;
  no shape morphing; outlined buttons use the baseline colours (`outline` + primary label).
- Not used: elevated buttons, FAB (a portfolio has no single repeated action), segmented buttons,
  button groups, split buttons. A future Work filter (All · Films · Websites) would be a
  connected button group.

## Do / Don't
- **Do** keep one filled button per section; pair it with outlined or text buttons.
- **Do** write labels as verbs in sentence case ("Email a project brief").
- **Don't** place two filled buttons side by side.
- **Don't** shrink visible buttons below 40px on touch layouts.
