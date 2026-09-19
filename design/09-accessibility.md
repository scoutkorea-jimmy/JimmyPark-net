# Accessibility

> M3 source: https://m3.material.io/foundations/overview/principles (accessibility) ·
> https://m3.material.io/foundations/designing/structure · WCAG 2.2 AA
> Our contract: [design.md §6](../design.md). Values verified 2026-09-19 — [sources.md](sources.md) §D, §F, §G.

## M3 guidance
- **Contrast**: text 4.5:1; large text (≥ 18pt, or 14pt bold) and graphics 3:1; grouped non-text
  elements such as button containers 3:1 against the background (standalone elements like a FAB
  are exempt); disabled states exempt. Role pairs (`on-X` on `X`) are built for ≥ 3:1; the
  high-contrast scheme targets 7:1.
- **Targets**: touch ≥ 48 × 48dp, pointer ≥ 44 × 44dp, ≥ 8dp between targets.
- **Structure**: one clear heading hierarchy, landmarks (header, nav, main, footer), logical focus
  order that follows the visual order.
- **Text**: support 200% zoom/text scaling without loss; don't put text in images; 40–60
  characters per line.
- **Motion**: respect reduced-motion settings; avoid flashing; let people pause moving content.
- **Labels**: every control has an accessible name; icons alone are not labels unless universal.
- **Colour is never the only signal**: pair it with text, icon, weight or shape.

## On jimmypark.net
- Landmarks: `header` / `nav` / `main` / `footer` on every page; `/dev` adds an `.sr-only` H2 before
  the principles so headings stay in order.
- Contrast fixes on record: subtitles and the Scouting timeline note use `#6b665f` (AA on white).
- Focus: 3px primary outline, 2px offset, on `:focus-visible`.
- Drawer: focus moves to the first link on open, returns to the menu button on close; Escape and
  scrim close it; page scroll is locked while open.
- Dialog: native `<dialog>` for the gallery; Escape and backdrop close it.
- Motion: none for `prefers-reduced-motion: reduce`, without JS or in print; the phone mockup
  float and count-ups are motion-only extras.
- Images: portrait and photos have `alt`; mockup screenshots inside cards are backgrounds, so the
  card's text (title + description) carries the meaning.
- Known limits: 40px visible controls rely on spacing for the 48px target; hover-only effects add
  nothing essential.

## Checklist
- [ ] Headings in order (one H1, no skipped levels).
- [ ] Keyboard: every control reachable, visible focus, no trap (except inside an open modal).
- [ ] Contrast checked for any new text/background pair.
- [ ] Works at 200% zoom and at 320px width.
- [ ] Reduced motion leaves everything visible and still.
