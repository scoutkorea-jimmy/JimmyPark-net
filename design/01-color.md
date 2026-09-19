# Color

> M3 source: https://m3.material.io/styles/color/roles · https://m3.material.io/styles/color/system/how-the-system-works
> Our contract: [design.md §1 and §18](../design.md). Our palette is fixed; M3 decides **which role**
> a colour plays, never a new hue. Values verified 2026-09-19 — [sources.md](sources.md) §G.

## M3 guidance

M3 colours are **roles**, not swatches. Each role is a pair: a fill and the "on" colour that sits
on it. Components ask for roles (`primary`, `surface-container`, `outline-variant` …), so a whole
UI re-themes by changing the role values in one place.

### Role families
| Family | Roles | Use |
|--------|-------|-----|
| Primary | `primary`, `on-primary`, `primary-container`, `on-primary-container` | The key action and brand accent: filled buttons, active states, links, focus |
| Secondary | `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container` | Less prominent accents: tonal buttons, selected nav indicators, filter chips |
| Tertiary | `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container` | Contrasting accents that balance primary and secondary (status, highlights) |
| Error | `error`, `on-error`, `error-container`, `on-error-container` | Errors only |
| Surface | `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest` → `-low` → `` → `-high` → `-highest` | Backgrounds and component containers, from least to most emphasis |
| On surface | `on-surface`, `on-surface-variant` | Text and icons on any surface (primary / secondary emphasis) |
| Outline | `outline`, `outline-variant` | `outline`: important boundaries (outlined buttons, text fields). `outline-variant`: decorative dividers and card borders |
| Inverse | `inverse-surface`, `inverse-on-surface`, `inverse-primary` | Elements that must contrast with the surrounding UI (snackbar) |
| Utility | `scrim`, `shadow` | Modal backdrops; elevation shadows |
| Fixed accents | `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`, `on-primary-fixed-variant` (and secondary/tertiary) | Same value in light and dark schemes |

### Tones in the default light scheme (tonal palette 0–100)
| Role | Tone | Role | Tone |
|------|------|------|------|
| primary | 40 | on-primary | 100 |
| primary-container | 90 | on-primary-container | 30 (m3.material.io, colour library); 10 in Material Web / Compose static tokens |
| surface / surface-bright | 98 | surface-dim | 87 |
| surface-container-lowest | 100 | surface-container-low | 96 |
| surface-container | 94 | surface-container-high | 92 |
| surface-container-highest | 90 | on-surface | 10 |
| on-surface-variant | 30 (neutral-variant) | outline | 50 (neutral-variant) |
| outline-variant | 80 (neutral-variant) | inverse-surface | 20 |
| inverse-on-surface | 95 | inverse-primary | 80 |
| scrim / shadow | 0 | surface-tint | deprecated (use elevation levels) |

M3 names **26 standard roles** in six groups (primary, secondary, tertiary, error, surface,
outline); fixed, fixed-dim, surface-dim and surface-bright are add-on roles. The same rule applies
to the other `on-*-container` roles (tone 30 on m3.material.io, 10 in the static tokens).

### Rules
- Pair every fill with its `on-` role. Never put `on-primary` text on a surface.
- Role pairs are built for at least 3:1; the high-contrast scheme targets 7:1.
- Hierarchy by surface tone, not by borders: lift a region by moving it one container step
  (`surface` → `surface-container-low` → `surface-container` …).
- Contrast: text ≥ 4.5:1; large text (≥ 18pt regular / 14pt bold ≈ 24px / 18.66px) and graphics
  ≥ 3:1; grouped non-text elements such as button containers ≥ 3:1 against their background;
  disabled states are exempt.
- `outline-variant` is for decorative lines (dividers, card borders). Boundaries people must see to
  use a control (text fields, outlined buttons) need `outline` or another colour with 3:1.
- Keep error red for errors. Keep primary for the single most important action in a view.

## On jimmypark.net

The palette predates M3; v0.17.0 mapped it onto roles in `assets/site.css` `:root`
(full table in [design.md §18](../design.md)).

| Role | Our value | Where |
|------|-----------|-------|
| `--md-primary` | `#7a1e2c` burgundy | Filled buttons, eyebrows, links, focus ring, scroll progress |
| `--md-primary-container` / on | `#f5e4e3` / `#4b0f1a` | Tonal highlights |
| `--md-secondary-container` / on | `#f3ece9` / `#2c2925` | Active nav pill, stat chips, "Show admin features" toggle |
| `--md-tertiary` / container / on | `#2f5a45` / `#eef4ef` / `#173527` | Live status chips, Scouting green |
| `--md-surface` … `-highest` | `#fff`, `#fdfcfa`, `#f7f6f3`, `#f1eee8`, `#ece8e1` | Page, drawer, section bands, dialog |
| `--md-on-surface` / `-variant` | `#171717` / `#66615c` | Text / secondary text |
| `--md-outline` / `-variant` | `#8a847c` / `#e6e1da` | Outlined buttons, copy buttons / cards, chips, dividers |
| `--md-inverse-surface` / on | `#2c2925` / `#f7f6f3` | Copy snackbar |
| `--md-scrim` | `rgba(0,0,0,.32)` | Drawer and dialog backdrop |

- **Global & Scouting** (`body[data-page="scouting"]`) remaps primary, containers and tertiary to
  its purple palette; components need no page-specific colours.
- Legacy names (`--accent`, `--scout-*`) are aliases; write new CSS with `--md-*`.
- There is no error role in the public site (no forms). Admin uses its own error styling.
- The values are hand-mapped, not generated from a seed with Material Color Utilities, so tones
  are approximate. Check contrast when adding a new pairing instead of assuming tone math.

## Do / Don't
- **Do** pick the role first, then use its token. **Don't** type a hex value in a component rule.
- **Do** use `secondary-container` for selected/active states (nav pill). **Don't** use primary
  fills for passive decoration.
- **Do** separate bands with `surface-container` steps. **Don't** add hairlines where a tonal step works.
- **Don't** introduce a new hue. If a need appears (e.g. an error state on a public form), map it
  to an M3 role and record it in design.md first.

## Checklist
- [ ] Every new colour is an `--md-*` role (or an existing alias of one).
- [ ] Text/background pairs checked for 4.5:1 (3:1 for large text and control edges).
- [ ] Works on both palettes (burgundy pages and purple Scouting).
