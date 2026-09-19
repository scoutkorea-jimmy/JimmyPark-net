# Dialogs and sheets

> M3 source: https://m3.material.io/components/dialogs/specs · /components/bottom-sheets/specs ·
> /components/side-sheets/specs
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance

### Dialogs
- **Basic dialog**: `surface-container-high`, corner **28dp**, level 3, width **280–560dp**, 24dp
  padding. Optional 24dp icon (`secondary`), headline Headline Small (`on-surface`), supporting text
  Body Medium (`on-surface-variant`), actions Label Large (`primary`). Gaps: icon → title 16,
  title → body 16, body → actions 24, between buttons 8.
- **Full-screen dialog** (compact windows, complex tasks): square corners, 56dp header, 56dp bottom
  action bar, 24dp padding.
- Backdrop `scrim` at 32%. Dialogs interrupt: decisions and critical information only.

### Bottom sheets
Standard (coexists with content) or modal (with scrim, level 1). Top corners 28dp (square when
minimised), drag handle 32 × 4dp (`on-surface-variant` at 40%), full width up to 640dp; wider
windows add 56dp top and side margins. Good for phone menus and extra detail.

### Side sheets
Standard (docked) or modal. Width: 256dp token, 400dp maximum. 24dp start/end padding, 12dp
between top elements, 72dp bottom action area, headline Title Large. Modal: start corners 16dp
(`16 0 0 16`), level 1, scrim; detached: 16dp margins and large corners. Good for filters or
details on large screens.

## On jimmypark.net
| Element | M3 component | Implementation |
|---------|--------------|----------------|
| `.gal-modal` (Scouting gallery) | Basic dialog (media) | Native `<dialog>`, `surface-container-high`, 28px radius, scale-in 400ms; Escape, backdrop and close button |
| Admin confirmations | Dialog | Browser `confirm()` (discard prompt); not styled |

- Not used: bottom sheets, side sheets. A bottom sheet would suit a future phone "Contact options"
  panel; keep dialogs for image viewing only.

## Do / Don't
- **Do** return focus to the element that opened the dialog.
- **Don't** open a dialog on page load or on scroll.
- **Don't** put long reading content in a dialog; link to a page instead.
