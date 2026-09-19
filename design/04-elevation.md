# Elevation

> M3 source: https://m3.material.io/styles/elevation/overview · https://m3.material.io/styles/elevation/tokens
> Our contract: [design.md §3 Elevation](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §C.

## M3 guidance

Elevation is the distance between surfaces on the z-axis. In M3 it is shown mainly by **surface
colour** (higher = a different container tone) and only secondarily by **shadow**.

| Level | Height | Components resting at this level |
|-------|--------|----------------------------------|
| 0 | 0dp | App bar (not scrolled), filled/tonal/outlined buttons, filled and outlined cards, chips, icon buttons, lists, navigation rail, tabs, carousel |
| 1 | 1dp | Elevated button, elevated card, elevated chips, modal navigation drawer, modal bottom/side sheets, banner |
| 2 | 3dp | Scrolled app bar, menus, navigation bar, rich tooltip, toolbar |
| 3 | 6dp | FAB and extended FAB, modal dialogs, search, date/time pickers (snackbars also use 3) |
| 4 | 8dp | Not a resting level — hover and drag only |
| 5 | 12dp | Not a resting level |

- Resting states use levels 0–3; 4 and 5 are reserved for interaction. Hover or focus usually
  raises an element one level.
- "Surface tint" is deprecated; use the level tokens.
- CSS shadow recipe (Material Web): a key shadow at 30% (`0 1px 2px`, `0 1px 2px`, `0 1px 3px`,
  `0 2px 3px`, `0 4px 4px` for levels 1–5) plus an ambient shadow at 15% (`0 1px 3px 1px`,
  `0 2px 6px 2px`, `0 4px 8px 3px`, `0 6px 10px 4px`, `0 8px 12px 6px`), colour `shadow` (#000).
- Use tonal surface containers to separate regions; add shadow only when surfaces overlap or move.
- The top app bar moves from level 0 to level 2 when content scrolls under it, shown by its
  container colour changing from `surface` to `surface-container`.

## On jimmypark.net

| Token | Value | Use |
|-------|-------|-----|
| `--md-elevation-1` | `0 1px 2px rgba(0,0,0,.3), 0 1px 3px 1px rgba(0,0,0,.15)` | Filled/white button hover, linked card hover, drawer panel, hovered showcase |
| `--md-elevation-2` | `0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15)` | Lifted card hover (with the −4px transform) |
| `--md-elevation-3` | `0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15)` | Reserved for floating surfaces |
| Mockup shadow | `0 20px 44px -28px rgba(23,23,23,.32)` | Browser/phone mockups only (static, pre-M3 exception) |

- Cards are **outlined** (level 0) at rest. Section bands use `surface-container`, not shadows.
- Our three shadow tokens are exactly Material Web's level 1–3 recipes.
- The app bar tones to `--md-surface-container` after scrolling (`.is-scrolled`), no shadow.

## Do / Don't
- **Do** reach for a surface-container step before a shadow.
- **Do** raise on hover only for things that are clickable.
- **Don't** give static, non-interactive cards a shadow.
- **Don't** invent new shadow values; use the three tokens.

## Checklist
- [ ] New shadows use `--md-elevation-1|2|3`.
- [ ] Only interactive elements change elevation on hover.
