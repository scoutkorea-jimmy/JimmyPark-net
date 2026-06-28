# Design System — JimmyPark.net

> The single source of truth for how the site looks and feels.
> Visual language: **warm-minimal, English-only, soft rounded corners.**
> Identity: *Photographer · Videographer · Scout · Builder.*
> Tagline: **SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.**

When in doubt, copy an existing block. Consistency beats cleverness — every page repeats the
same header, footer, eyebrow, button, and card patterns by design.

---

## 1. Color

### Brand
| Token | Hex | Use |
|-------|-----|-----|
| **Burgundy (primary accent)** | `#7a1e2c` | Logo border, primary buttons, links-on-hover, active nav, CTA panel, `::selection`, focus ring |
| Burgundy dark (hover) | `#651825` | `.btn-primary:hover` only |
| Eyebrow red | `#9b3544` | Small uppercase eyebrow labels, decorative numbers context |
| **Scouting green (sub-accent)** | `#2f5a45` | Scouting-related eyebrows, tags, badges |
| Green muted | `#5e7a6c` | Scouting captions |

### Text (on light)
| Token | Hex | Use |
|-------|-----|-----|
| Primary | `#171717` | Headings, body default |
| Body strong | `#2c2925` | Lead paragraphs, table values |
| Muted | `#66615c` | Secondary paragraphs, footer nav |
| Muted light | `#8a847c` | Captions, sub-meta |
| Muted alt | `#6b665f`, `#4a463f` | Figcaptions, tag text |
| Decorative | `#cdbfb3` (numbers, dot separators), `#bdb6ab` (idle arrows) |

### Surfaces & borders
| Token | Hex | Use |
|-------|-----|-----|
| Canvas | `#ffffff` | Page background, cards |
| Section alt | `#f7f6f3` | Alternating section bands, footer, snapshot panel |
| Card alt | `#fdfcfa` | Secondary card fill |
| Hover fill | `#f4f2ed` (`.act`), `#f3ece9` (copy / white-btn hover) | Hover states |
| Borders | `#ece8e1`, `#e6e1da` (default), `#efebe3`, `#ece7df`, `#e0dacf`, `#f1eee8` (light divider), `#ddd6cc` (ghost btn) |
| Green tints | `#eef4ef` / `#f6faf7` (fill), `#d7e3dc` (border) | Scouting tags/badges |

### Gradients (placeholder image areas)
- Hero / neutral figure: `linear-gradient(150deg,#f0ece5 0%,#e9e2d6 100%)`
- Neutral card: `linear-gradient(150deg,#f1ede6,#e7e0d4)`
- Scouting/green: `linear-gradient(150deg,#eef4ef 0%,#e1ebe4 100%)`

**Rule:** burgundy is the spine of the brand; green appears *only* in Scouting contexts. Never
introduce a new accent hue — pick the nearest token above.

---

## 2. Typography

- **Primary font:** **Cafe24ProSlim** (KR/EN), self-`@font-face`'d in `site.css` from
  jsDelivr (`projectnoonnu/2511-1@1.0`, weights 300/400/700, `font-display:swap`). Weights
  above 700 (e.g. 800 headings) fall back to 700 — keep that in mind for heavy headings.
- **Fallback font:** Pretendard, loaded from jsDelivr CDN
  (`pretendard@v1.3.9/dist/web/static/pretendard.min.css`), then
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.
- **Icons:** Material Symbols Outlined (Google Fonts), class `.msym`, axis `opsz 24, wght 300,
  FILL 0, GRAD 0`. Always add `aria-hidden="true"` to decorative icons.
- **Base:** `line-height: 1.65`, antialiased.

### Scale (all fluid via `clamp()`)
| Role | Size |
|------|------|
| Hero H1 | `clamp(42px, 6.6vw, 68px)`, weight 800, `letter-spacing:-.03em`, `line-height:1.02` |
| Page H1 | `clamp(34px, 5vw, 52px)`, weight 800, `-.025em` |
| Section H2 | `clamp(24px, 3.4vw, 34px)`, weight 800, `-.015em` |
| Activity title | `clamp(21px, 2.8vw, 28px)`, weight 700 |
| Card H3 | `16.5px`–`clamp(22px,2.8vw,28px)`, weight 700–800 |
| Lead paragraph | `clamp(19px, 2.4vw, 25px)`, weight 600 |
| Body | `14.5px`–`15.5px`, weight 400–500 |
| Small / caption | `11px`–`13.5px` |
| **Eyebrow** | `12.5px`, weight 600, `letter-spacing:.13em`, `text-transform:uppercase` |

### Weight conventions
- Headings: **800** (700 for sub-items).
- Eyebrows / labels / buttons: **600–700**.
- Body: **400–500**.

### Letter-spacing
- Tighten large type (`-.01em` → `-.03em`).
- Open up small uppercase labels (`.08em` → `.16em`).

---

## 3. Layout & spacing

- **Container:** `max-width: 1180px; margin: 0 auto;` with horizontal padding
  `clamp(22px, 5vw, 44px)` (utility class `.wrap`, or inline the same values).
- **Section vertical rhythm:** `clamp(44px, 6vw, 80px)` top/bottom.
- **Grid gaps:** `clamp(16px, 2vw, 28px)` typical; hero gap `clamp(32px, 5vw, 64px)`.
- **`* { box-sizing: border-box }`**, smooth scroll on `html`.

### Border radius
| Element | Radius |
|---------|--------|
| Large panels / CTA / hero image | `28px`–`32px` |
| Cards | `22px` |
| Buttons / inputs | `13px`–`14px` |
| Logo monogram | `10px`–`11px` |
| Pills / tags / toast | `999px` |
| Focus ring | `6px` |

### Shadows
- Card hover only: `box-shadow: 0 20px 44px -28px rgba(23,23,23,.32)` (`.soft:hover`).
- Toast: `0 14px 30px -12px rgba(0,0,0,.5)`.
- Otherwise **flat** — depth comes from borders, not shadows.

---

## 4. Responsive breakpoints

| Width | Change |
|-------|--------|
| `≤ 880px` | Desktop nav hidden; hamburger `.nav-toggle` shown; `.mobile-menu` toggles `.open` |
| `≤ 840px` | `.split`, `.feat`, `.cta-grid`, `.vid-grid`, `.roles2` → 1 col; `.flow` → 2 col; `.gal-grid` → 2 col; `.split-img` moves above text (`order:-1`) |
| `≤ 520px` | `.flow` → 1 col; `.snap4` → 2 col; `.snap-grid` → 1 col |

Grids are declared inline (`grid-template-columns`) and **overridden** by these named classes
in `site.css`. When you add a new multi-column grid, give it a class and add it to the right
breakpoint block rather than writing a new media query.

---

## 5. Core components

### Header (identical on every page)
Sticky, `z-index:60`, translucent `rgba(255,255,255,.82)` + `backdrop-filter: saturate(150%)
blur(10px)`, bottom border `#ece8e1`, height `68px`. Left: **JP monogram** (`assets/img/logo.svg`
— elegant serif "JP" in near-black `#141414` with a short burgundy `#7a1e2c` underline under the
J) + `Jimmy Park` wordmark. Right: desktop nav (`Home · Work · Scouting`)
+ burgundy **Contact** button; hamburger on mobile.

### Footer (identical on every page)
`#f7f6f3` band, JP monogram + name + role line, nav links, then a baseline row with the
tagline (`SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.`) and `© 2026 Jimmy Park`.

### Eyebrow + heading pattern
```html
<div style="font-size:12.5px; font-weight:600; letter-spacing:.13em; text-transform:uppercase; color:#9b3544;">Section Label</div>
<h2 style="margin:10px 0 0; font-size:clamp(24px,3.4vw,34px); font-weight:800; letter-spacing:-.015em;">Heading</h2>
```
Use green `#2f5a45` for the eyebrow in Scouting sections.

### Buttons
| Class | Look |
|-------|------|
| `.btn-primary` | Burgundy `#7a1e2c` bg, white text, hover → `#651825` + lift |
| `.btn-ghost` | White bg, `#171717` text, `1px #ddd6cc` border, hover → border `#171717` |
| `.btn-white` | White bg, burgundy text (used on dark CTA), hover → `#f3ece9` |

All buttons: `.btn` adds `translateY(-1px)` lift on hover. Pad `14px 26px` (large) / `10px 20px`
(nav). Trailing `arrow_forward` icon is common.

### Cards
- `.soft` — hover lift + shadow; optional `.pmeta` reveals extra meta on hover.
- `.act` — full-width activity row (home "What I Actually Do"); hover tints bg, slides arrow,
  reveals `.out` tag row.
- `details.tl` — timeline disclosure; `.tlctx` expands, `.tlchev` rotates 90°.
- Reveal-on-hover pattern: collapsed element has `max-height:0; opacity:0; overflow:hidden`,
  parent `:hover` sets `max-height` + `opacity:1`.

### Feedback
- **Copy toast** `.copy-toast` — dark pill, bottom-center, shows ~1.7s after a `[data-copy]`
  click. Markup lives once per page near `</body>`.
- **Gallery modal** `.gal-modal` — dark blurred overlay; opened by `.galfig` clicks, closed by
  backdrop / `[data-gal-close]` / `Escape`.

### Tags / pills
`font-size:11–12px; border-radius:999px; padding:5px 12px;` — neutral (`1px #e6e1da`) or green
(`#2f5a45` text, `#f6faf7` bg, `#d7e3dc` border).

---

## 6. Accessibility

- Focus: `outline: 2px solid #7a1e2c; outline-offset:3px` on all interactive elements
  (`:focus-visible`).
- `@media (prefers-reduced-motion: reduce)` disables all animation/transition/smooth-scroll.
- Decorative icons get `aria-hidden="true"`; nav toggle exposes `aria-expanded`; active nav
  link gets `aria-current="page"`.
- Every page renders **full static content** so it works with no JS and reads well to crawlers.

---

## 7. Language rule

**English-only.** The site carries no Korean text — no companion lines, no `*Ko` content
fields, no `박지민` alongside the name. (The site was bilingual through v0.2.x; v0.3.0
removed all Korean. The content schema's `dekoreanize` migration strips any residual
Korean from older saved docs on read.)
- One voice per element: a heading or lead has a single English line, no muted sub-line.
- `lang="en"` on `<html>`.

---

## 8. Motion

- Durations `.15s`–`.3s`, easing `ease`.
- Hover affordances: button lift, card lift+shadow, arrow nudge (`translateX(5px)`),
  reveal-on-hover expansions, link color → burgundy.
- Keep it subtle; respect reduced-motion.

---

## 9. Do / Don't

**Do**
- Reuse the header/footer/eyebrow/button/card blocks verbatim across pages.
- Keep page-specific styling **inline** (no build step); put *shared behavior* in `site.css`.
- Use `clamp()` for anything that should scale with viewport.
- Bump the `?v=` query on `site.css` / `site.js` links when they change (match `VERSION`).

**Don't**
- Don't add a CSS framework, a build step, or web fonts beyond the approved set
  (Cafe24ProSlim primary, Pretendard fallback, Material Symbols icons).
- Don't introduce new accent colors — use the tokens above.
- Don't rely on JS for primary content (JS only *enhances* and applies admin overrides).
- Don't use shadows for separation where a border will do.
