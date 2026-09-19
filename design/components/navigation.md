# Navigation

> M3 source: https://m3.material.io/components/app-bars/specs · /components/navigation-drawer/specs ·
> /components/navigation-bar/specs · /components/navigation-rail/specs · /components/tabs/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance

### Top app bar
| Variant | Height | Title |
|---------|--------|-------|
| Small / centre-aligned | 64 | Title Large |
| Medium flexible (Expressive) | 112 (136 with subtitle) | Headline Medium |
| Large flexible (Expressive) | 120 (152 with subtitle) | Display Small |
| Medium / large baseline | 112 / 152 | "No longer recommended" in Expressive |
Container `surface`, level 0; when content scrolls under it: `surface-container`, level 2.
Square corners, 4dp side padding, 24dp icons.

### Navigation drawer
- Width **360**; active indicator **336 × 56**, full shape, `secondary-container`; 28dp side padding,
  12dp indicator padding; 24dp icons; Label Large (active label `on-secondary-container`, weight 700;
  inactive `on-surface-variant`).
- **Standard** drawer: `surface`, level 0. **Modal** drawer: `surface-container-low`, level 1,
  end corners 16 (`0 16 16 0`), over a scrim (32% `scrim`; the drawer's own baseline table shows a
  40% dark neutral — see sources).
- Focus indicator for items is inward (−3dp).
- **M3 Expressive: the navigation drawer is "no longer recommended — use the expanded navigation rail".**

### Navigation bar (compact windows)
| | Flexible (Expressive) | Baseline (no longer recommended) |
|---|---|---|
| Height | 64 | 80 |
| Active indicator | 56 × 32 (horizontal items: 40 tall) | 64 × 32 |
Label Medium, 24dp icons, `surface-container`, level 2.

### Navigation rail
Collapsed **96** wide (narrow 80); expanded **220–360** wide; items 64 tall (short 56); indicator
56 × 32 (vertical) or 56 tall (horizontal); `surface`, level 0. A modal expanded rail uses
`surface-container` with a 16dp corner. The baseline 80dp rail is "no longer recommended".

### Tabs
Primary tabs: 48 tall (64 with icon + label), 3dp `primary` indicator (rounded top, min length 24).
Secondary tabs: 2dp indicator. Label Large, 24dp icons, 1dp divider. Tabs switch views of the same
content, not pages.

## On jimmypark.net
| Element | M3 component | Implementation |
|---------|--------------|----------------|
| `.site-header` | Small top app bar | 64px; `surface` → `surface-container` when scrolled (`.is-scrolled`); 3px scroll-progress bar on its lower edge |
| `.desktop-nav` (≥ 840px) | Top navigation inside the app bar | 40px pill links; active = `secondary-container` + `aria-current="page"`; Contact is a filled button |
| `.mobile-menu` + `.mobile-links` (< 840px) | Modal navigation drawer | `min(360px, 86vw)`, `surface-container-low`, 16px end corners, 56px items, 32% scrim, scroll lock, focus in/out, closes on Escape, scrim or link |

- Five destinations: Home · Media Work · Dev Work · Global & Scouting · Contact (Insights hidden
  until it has posts).
- **Where we differ:** M3 Expressive would use a modal *expanded navigation rail* instead of a modal
  drawer, and a navigation bar on phones. We keep the drawer: five long page names don't fit a bar,
  and a modal expanded rail looks and behaves almost the same (full-width items in a side panel).
  If it's ever rebuilt, follow the rail spec above. Active drawer labels use weight 600 (M3: 700).
- Not used: tabs, navigation bar, navigation rail.

## Do / Don't
- **Do** mark the current page with the indicator pill and `aria-current`.
- **Do** keep the drawer order identical to the top navigation.
- **Don't** hide the Contact action in a menu on large screens.
- **Don't** use tabs to move between pages.
