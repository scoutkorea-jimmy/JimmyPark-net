# Carousel

> M3 source: https://m3.material.io/components/carousel/specs · /components/carousel/guidelines
> Values verified 2026-09-19 — [sources.md](../sources.md) §H.

## M3 guidance
- Layouts: **multi-browse** (large, medium and small items visible together), **uncontained**
  (items of one size scroll past the edge), **hero** (one large item plus a peek) and
  **full-screen** (layout names from the guidelines page, not re-verified on 2026-09-19).
- Spec: item corner **28dp**, 16dp leading/trailing padding, 8dp top/bottom, **8dp between items**,
  small items 40–56dp wide; level 0.
- Good practice (ours, in line with M3's layouts): always show that there is more (a peeking
  item), support swipe and keyboard, and link to a page that lists everything.

## On jimmypark.net
- On compact windows (< 600px) `.selected-work-grid`, `.video-case-grid`, `.capability-grid` and
  `.project-grid` become an **uncontained carousel**: one row, `scroll-snap-type: x mandatory`,
  cards 84% wide so the next one peeks, 12px gap, full-bleed to the viewport edges, no scrollbar,
  equal card heights.
- **Where we differ:** 12px gaps (M3: 8) and 12px card corners (M3 items: 28) — the items are
  full cards with text and actions, not media tiles.
- Keyboard users reach every card through its link; the row reveals as one (v0.17.2).
- Not used: multi-browse/hero layouts, item masking.

## Do / Don't
- **Do** keep a visible peek of the next item.
- **Do** keep every item's link reachable by Tab.
- **Don't** auto-advance.
- **Don't** put the only copy of important content in a carousel without a page that lists it
  (ours link to Media Work / Dev Work).
