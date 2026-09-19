# Typography

> M3 source: https://m3.material.io/styles/typography/type-scale-tokens · https://m3.material.io/styles/typography/applying-type
> Our contract: [design.md §2](../design.md). Font: **Google Sans Flex** (owner choice, v0.17.0),
> Pretendard fallback for Korean glyphs. Values verified 2026-09-19 — [sources.md](sources.md) §A.

## M3 guidance

Five roles × three sizes = 15 baseline styles. Pick by **role** (what the text does), then size.

Public baseline (Roboto; sizes, line heights and weights agree in every source; tracking from
Material Web — Compose rounds a few values, e.g. display-large −0.2):

| Role | Size token | Font size / line height | Weight | Tracking |
|------|-----------|-------------------------|--------|----------|
| Display | Large | 57 / 64 | 400 | −0.25px |
| | Medium | 45 / 52 | 400 | 0 |
| | Small | 36 / 44 | 400 | 0 |
| Headline | Large | 32 / 40 | 400 | 0 |
| | Medium | 28 / 36 | 400 | 0 |
| | Small | 24 / 32 | 400 | 0 |
| Title | Large | 22 / 28 | 400 | 0 |
| | Medium | 16 / 24 | 500 | 0.15px |
| | Small | 14 / 20 | 500 | 0.1px |
| Body | Large | 16 / 24 | 400 | 0.5px |
| | Medium | 14 / 20 | 400 | 0.25px |
| | Small | 12 / 16 | 400 | 0.4px |
| Label | Large | 14 / 20 | 500 | 0.1px |
| | Medium | 12 / 16 | 500 | 0.5px |
| | Small | 11 / 16 | 500 | 0.5px |

- **Display**: the largest, shortest text on a screen — hero statements, big numbers.
- **Headline**: section-level headings on large screens.
- **Title**: medium-emphasis headings — card titles, app bar titles, list headers.
- **Body**: running text. M3 recommends 40–60 characters per line.
- **Label**: text inside components — buttons, chips, tabs, captions.
- **Emphasized styles (M3 Expressive)**: 15 emphasized twins, same size and line height, heavier
  weight — display, headline and title-large 400 → 500; title-medium/small 500 → 700;
  body 400 → 500; label 500 → 700. Components don't use them by default; M3 suggests them for
  badges, primary-action buttons, extended FABs and selected list or menu items.
- **Variable type**: M3's variable typeface tokens (weights 400/500/600/700, `ROND` 0 for emphasized)
  read **Google Sans Flex** in the default token-viewer context — the family this site uses. Its
  axes: wght 1–1000, opsz 6–144, wdth 25–151, slnt −10–0, GRAD 0–100, ROND 0–100. Let optical
  size follow the font size (`font-optical-sizing: auto`).
- The same viewer, in its Google Sans context, shows tracking 0 (0.1pt for body-small, label-medium,
  label-small). Treat that as the Google-product context; the table above is the public baseline.
- **Scripts with taller glyphs**: M3 defines taller line-height sets for other languages; Korean
  and other CJK scripts use the "medium" set, about 7% taller than the base.

## On jimmypark.net

| Our role | Class / token | M3 style | Value |
|----------|---------------|----------|-------|
| Home H1 | `.hero-title`, `--title-hero` | Display Large | `clamp(36px, 5.2vw, 57px)` / 1.12 / 400 |
| Page H1 | `h1`, `.page-heading`, `--title-page` | Display Medium | `clamp(32px, 4.2vw, 45px)` / 1.16 |
| Section H2 | `h2`, `.section-title`, `--title-section` | Headline Large | `clamp(28px, 3vw, 32px)` / 1.25 |
| Showcase H3 | `.showcase-body h3` | Headline Small | 24px / 1.33 |
| Card H3 | `h3`, `--title-card` | Title Large | 22px / 1.27 |
| Hero lead | `.hero-lead` | Title Large (body-large on phones) | 22px / 1.4 |
| Compact headings | `.process-step h3`, `.format-name`, `.snapshot-row dt` | Title Medium | 16px / 24px / 500 |
| Subtitle | `.section-subtitle` | Title Medium, `on-surface-variant` | 16px / 24px / 500 |
| Body | `p`, `.body-copy` | Body Large | 16px / 1.5 / .031em |
| Eyebrow, labels, buttons, chips | `.eyebrow`, `.label-heading`, `.site-button`, `.tag` | Label Large | 14px / 20px / 500 |

- Headings are 400, as M3 intends; hierarchy comes from size and colour, not bold.
- Eyebrows are sentence case in `--md-primary` (no uppercase, no wide tracking).
- Fluid `clamp()` keeps Display/Headline within M3 sizes at the extremes (compact phone → desktop).
- Korean glyphs (`박지민`; the `/saju` app is separate) fall back to Pretendard; keep it in the
  stack. Our 1.5 body leading already clears M3's ~7% taller CJK line height.
- We load only the `opsz` and `wght` axes of Google Sans Flex.
- **Where we differ**: Display/Headline sizes are fluid (`clamp()`) between the M3 sizes, and
  paragraph tracking is .031em (≈ 0.5px at 16px, M3 body-large).

## Do / Don't
- **Do** choose the role before the size. **Don't** set a font size outside the scale.
- **Do** keep headings at 400 and labels at 500. **Don't** bold headings to add hierarchy.
- **Do** set sizes in `site.css` role classes. **Don't** inline font sizes or line heights in pages.
- **Don't** add another web font; Google Sans Flex, Pretendard and Material Symbols are the set.

## Checklist
- [ ] Every text style maps to one M3 role in the table above.
- [ ] Body copy lines 40–60 characters where possible, never beyond ~72 (`max-width` in `ch`).
- [ ] Text survives 200% zoom without clipping or overlap.
