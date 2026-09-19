# Feedback: snackbar, progress, tooltips, badges

> M3 source: https://m3.material.io/components/snackbar/specs · /components/progress-indicators/specs ·
> /components/tooltips/specs · /components/badges/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance

### Snackbar
Brief message about a completed action at the bottom of the screen. **48dp** tall (one line),
**68dp** (two lines); corner **4dp**; `inverse-surface` with `inverse-on-surface` text (Body Medium);
optional action in `inverse-primary` (Label Large); 24dp icon; level 3. One at a time; never blocks
input. (Auto-dismiss timing wasn't re-verified on 2026-09-19.)

### Progress indicators
- **Linear**: 4dp tall (thick variant: 8dp track, 14dp indicator; wavy variant: amplitude 3,
  wavelength 40), 4dp gap between indicator and track, 4dp stop indicator, full shape.
- **Circular**: **40dp** (48 wavy, 52 thick), 4dp stroke (8 thick).
- Colours: indicator `primary`, track `secondary-container`. Determinate when progress is known,
  indeterminate otherwise.

### Tooltips
- **Plain**: 24dp tall, 8dp padding, 4dp corner, `inverse-surface` / `inverse-on-surface`, Body Small.
  Labels icon-only controls on hover/focus.
- **Rich**: 12dp corner, `surface-container`, level 2, subhead (Label Large) + supporting text
  (Body Medium) + optional action.

### Badges
Small: 6dp dot. Large: 16dp tall, full shape, `error` / `on-error`, Label Small (11/16). Attach to
icons (navigation items), not to text.

## On jimmypark.net
| Element | M3 component | Implementation |
|---------|--------------|----------------|
| `.copy-toast` | Snackbar | `inverse-surface`, 4px corner, 14px text, bottom-centre, ~1.7s, `role="status"`, after copying email/phone |
| `.md-progress` | Linear progress (determinate) | 3px bar on the app bar's lower edge showing scroll position; primary indicator, transparent track |

- **Where we differ:** the snackbar only confirms a copy, so it is brief (~1.7s; keep ≥ 1.5s); the
  scroll bar is 3px with no track colour so it doesn't read as a loading bar.
- Not used: circular progress, loading indicator, tooltips (icon buttons have `aria-label`s),
  badges.

## Do / Don't
- **Do** announce snackbar text (`role="status"`).
- **Don't** stack snackbars or put critical errors in one.
- **Don't** show a progress bar that doesn't map to something real.
