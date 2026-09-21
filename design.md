# Design System — JimmyPark.net

> The single source of truth for how the site looks and feels.
> Visual language: **warm-minimal, English-first, soft rounded corners.**
> Identity (v0.12.0): *Solution maker — the right way to reach the client’s goal, through content, web & AI.*
> Tagline: **SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.**

When in doubt, copy an existing block. Consistency beats cleverness — every page repeats the
same header, footer, eyebrow, button, and card patterns by design.

Since v0.17.0 the site follows Material Design 3. The [design/](design/README.md) folder is the M3
reference library (colour, type, shape, elevation, motion, layout, states, icons, accessibility and
components, each with the M3 values and how this site applies them). This file stays the contract:
where the two differ, this file wins and the difference is recorded here.

### Portfolio composition (v0.7.1)
- Keep the burgundy site identity and approved typefaces. The Scouting page uses the owner-requested purple theme; existing Scouting references on other pages retain their green sub-accent.
- Home: purpose-led headline and existing portrait, four capability cards, dated experience,
  selected projects, working process, and contact. Lead with text on mobile; the portrait follows.
- Portrait v0.5.1 uses the supplied `IMG_2902.jpeg` unchanged; since v0.14.0 the hero shows a 960px display derivative (`jimmy-park-portrait-960.jpg`) and keeps the original file. Use `center 10%` for its
  background position in both static HTML and CMS hydration to retain the top of the head.
- `.capability-grid`: two equal columns, one below 600px. Capability descriptions and tags are
  always visible; keyboard and touch users do not depend on hover to discover the offer.
- `.project-grid`: three equal columns, one below 840px. Cards with no uploaded image render as
  complete text cards instead of empty image placeholders. AI maturity labels remain visible.
- Main body copy in the new components is 16px; regular labels are 14px. The home headline is
  `clamp(40px,5.3vw,62px)` with 1.12 line-height. Use the shared scale below for all headings.
- Public pages have a skip link, a main landmark, and stable IDs matching their `data-section`
  values. Anchor destinations clear the sticky header. All canonical routes remain unchanged.
- Keep static text/collections aligned with the API defaults and runtime templates. Custom CMS
  images remain editable, and removing an image restores the component's fallback presentation.
  Unchanged legacy cards migrate as complete rows; saved field order does not affect matching.
  Earlier default section orders also migrate when a subsequently added section was absent.

### Insights and real photography (v0.8.0)
- Add Insights consistently to desktop, mobile and footer navigation. Its list uses the
  shared container, burgundy identity and a two-column article grid (one below 600px).
  The article view has an 850px maximum container, 17px body text at 1.85 leading, and the
  existing heading scale. Long titles/URLs wrap; date and category remain readable at 14px.
- Show an honest empty state until the owner publishes a first article. Public list/detail
  content renders on the server; drafts and missing articles have no public body.
- Admin writing uses a single 880px column with labelled fields and its own save actions.
  Hide the unrelated page preview. Unsaved-change prompts, disabled pending controls and
  live save/error messages support draft → publish → unpublish transitions.
- Work photography: a supplied-photo hero fallback plus six real event photographs in a
  three-column grid, two below 840px and one below 600px. Preserve original proportions in
  source files; CSS uses 3:2 crops. Shuffle ordering once per visit; no automatic carousel.
  Each image links to its original in Drive. CMS hero replacement remains available.
- Scouting gallery placeholders are hidden until populated. Real uploads use labelled
  buttons opening a native dialog with Escape/focus behavior and the full photo.
- The 404 page reuses the shared shell and provides a direct route home. No indexable
  placeholder article or artificial author content is introduced.

---

## 1. Color

### Brand
| Token | Hex | Use |
|-------|-----|-----|
| **Burgundy (primary accent)** | `#7a1e2c` | Wordmark terminal, primary buttons, links-on-hover, active nav, CTA panel, `::selection`, focus ring |
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
| Muted light | `#8a847c` | Decorative sub-meta only — fails AA for text; section subtitles use `#6b665f` (v0.14.0) |
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

**Rule:** burgundy is the shared site accent. The Scouting page overrides the named accent
and Scouting surface tokens to **purple**: accent `#622599`, hover `#4b167d`, eyebrow `#7e42aa`,
surface `#efe4f7`, tint `#f7f2fb`, border `#deceed`, muted `#7d6695`, ink `#302039`.
Scope these overrides to `.portfolio[data-page="scouting"]`; other pages keep their existing
burgundy/green palette. The shared wordmark stays burgundy/near-black across all pages. Never recolor the standalone app.

### /saju — standalone app (fully scoped exception)
The hidden `/saju` (input) + `/saju-result` (result) routes are a **self-contained two-page
web app**: they do NOT use `site.css`, `site.js`, or the shared header/footer. Their shared
look lives in `assets/saju.css` (Pretendard, violet→pink gradient `#7c5cff→#c247ff→#ff6aa0`,
soft rounded cards, single `--wrap:720px` container so every section shares the same left/right
width). Flow: `/saju` collects birth date + 24h·30min time → navigates to
`/saju-result?d=&t=&nt=` which computes and renders in order: **사주팔자 → 해시태그 →
음양 밸런스 → 오행 분포 → 풍성한 기운 → 부족한 기운 + 캐릭터**. (캐릭터 세계관 그리드는
현재 결과 페이지에서 **주석 처리(임시 숨김)** — 별도 페이지로 이전 예정.)
음양은 별도 계산 없이 기존 팔자에서 집계 — 천간은 `STEMS[i].yang`, 지지는 배열 인덱스
짝수(자·인·진·오·신·술)=양. 陽=화 적색 / 陰=수 흑색 2색 막대 + 기본 유형 라벨 + 겉(천간)/
속(지지) 분리 + 일간 음양 + 월지 계절 보정을 함께 표시(근거: [saju-eumyang.md](saju-eumyang.md),
단정·우열 판단 금지). 본문 카피는 전반적으로 간결화(≈50%↓), 글씨는 현행 대비 ~1.5배 확대. 한글은
`word-break: keep-all`로 어절 단위 줄바꿈. 음양 카드 보조 정보는 한자어(천간/지지/일간)
대신 쉬운 말("겉으로 드러나는 나/속마음·생활 리듬/나를 나타내는 기운/태어난 계절")로.
**카드 구분:** 부족-기운 카드는 흰 배경 + 좌측 색 스파인(액센트), 캐릭터 카드는 오행 색
가득 채운 강조 카드 — 나란히 놓인 두 카드가 헷갈리지 않게. **고지문구:** 반복을 줄여
입력 페이지는 히어로 한 줄 + 푸터 legal, 결과 페이지는 푸터 legal만(둘 다 유지).
**결과 페이지 배경:** `.sj-glow`(fixed 앰비언트) 색을 가장 풍성한 기운으로 변주 —
배경 전용 `GLOW_COLORS` 사용(수 흑→파랑 `#3b82f6`, 금 은→골드 `#e3b341`; 목/화/토는
오방색 그대로), 밝기 기반 알파 보정. 카드/글리프의 오방색은 불변.
**타이포 위계(사주 앱):** eyebrow(13, 큰 제목 위 키커 전용 — 결과 페이지 "나의 사주팔자"만)
< 잔글씨 13(micro)/15(caption)/16(UI)/17(quote) < 본문 19 < `.sj-sect`(20–24, 결과 페이지
섹션 제목 — 음양/오행/풍성/부족) < headline·lack-title(24–32) < H1(38–60, sub는 .5em).
**곡률 토큰(사주 앱):** `--r-sm 16`(입력·버튼·CTA·배지·인용구·작은 이모지 타일) /
`--r-md 20`(글리프·내부 카드: strong/lack/vibe/char-emoji/w-card) / `--r-lg 26`(외곽
카드: sj-card·sj-char) / pill `999px`. 새 곡률값 하드코딩 금지 — 이 4단만 사용. Birth date is typed as three separate 연/월/일 numeric fields (not a native
date picker — elderly users disliked scrolling); `saju.js` sanitizes to digits, auto-advances
focus, validates the calendar date, and still emits the `d=YYYY-MM-DD` query param. 풍성한/부족한
기운 both render inside tinted cards (`.sj-strong-card` / `.sj-lack-card`, element color + light
tint). The "다섯 오행, 다섯 친구" (캐릭터 세계관) grid lives only on `/saju-result` (bottom),
not on the input page. None of this leaks into the portfolio pages.
Its five 오행 colors follow **traditional 오방색** (allowed only in `saju.html`/`saju.js`).
Each element carries **three** tones so white/yellow/black stay legible on the light UI:
`color` (solid fill: 글리프·뱃지·이모지·CTA·막대), `text` (흰 배경 위 라벨/보더), `ink`
(solid fill 위 글자색), plus a `light` card tint.
- 목 청(초록) `color #2f9e44` · text `#2f9e44` · ink `#fff` · light `#e9fbef`
- 화 적(빨강) `color #e8352e` · text `#e8352e` · ink `#fff` · light `#fff1f0`
- 토 황(노랑) `color #f5b800` · text `#b07d00` · ink `#4a3800` · light `#fff7d6`
- 금 백(흰/은) `color #c3cad1` · text `#8a929b` · ink `#454b52` · light `#f2f4f6`
- 수 흑(검정) `color #2b2f36` · text `#2b2f36` · ink `#fff` · light `#eef0f2`
순백(금)·순노랑(토)은 흰 배경에서 대비가 안 나와 글자는 은색/골드, 채움 위 글자는 진한
잉크로 처리 — 정체성은 채움 색(밝은 은/노랑)이 담당한다.

---

## 2. Typography

- **Primary font (v0.17.0):** **Google Sans Flex** (Google Fonts, `opsz,wght@6..144,1..1000`,
  `display=swap`), loaded by a `<link>` in every page head after a `preconnect` to
  `fonts.googleapis.com` / `fonts.gstatic.com`. `body` sets `font-optical-sizing: auto`.
  Public pages and Admin use the same family; native text controls inherit it.
  Wanted Sans Variable (v0.7.1–v0.16.1) is retired and no longer imported.
- **Fallback font:** Pretendard, loaded from jsDelivr CDN
  (`pretendard@v1.3.9/dist/web/static/pretendard.min.css`), then
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.
- **Icons:** Material Symbols Outlined (Google Fonts, `opsz,wght,FILL,GRAD@20..48,400,0..1,0`),
  class `.msym`, weight **400**, FILL 0 by default. Always add `aria-hidden="true"` to decorative icons.
- **Base:** body-large 16px, `line-height: 1.5`, `letter-spacing: .031em` on paragraphs, antialiased.

### Shared portfolio scale (M3 type roles)
| Role | M3 token | Size | Line height / weight |
|------|----------|------|----------------------|
| Home H1 | `--title-hero` → `--md-display-large` | 36–57px | 1.12 / 400 |
| Page H1 | `--title-page` → `--md-display-medium` | 32–45px | 1.16 / 400 |
| Section H2 | `--title-section` → `--md-headline-large` | 28–32px | 1.25 / 400 |
| Showcase H3 | `--md-headline-small` | 24px | 1.33 / 400 |
| Card H3 | `--title-card` → `--md-title-large` | 22px | 1.27 / 400 |
| Compact headings (process, format, snapshot) | `--md-title-medium` | 16px | 24px / 500 |
| Body | `--md-body-large` | 16px | 1.5 / 400 |
| Labels, buttons, tags, role lines | `--md-label-large` | 14px | 20px / 500 |
| Small labels | `--md-label-medium` | 12px | 16px / 500 |

All H1/H2/H3 sizes and leading belong in `site.css`, never in inline page styles.
Use `.hero-title`, `.page-heading`, `.section-title` and `.hero-lead` for their named roles.

### Weight conventions
- Display, headline and title-large: **400** (M3). Title-medium and labels: **500**.
- Active navigation and emphasised numbers may use 600. Body: **400**.

### Letter-spacing
- M3 tracking: display/headline 0, title-medium .009em, body .031em, labels .007–.031em.
- No uppercase eyebrows; eyebrows are label-large in `--md-primary`.

---

## 3. Layout & spacing

`assets/site.css` is the source of layout tokens. Public pages use `body.portfolio`;
these rules do not style the standalone app or the admin layout.

| Purpose | Token | Range / value |
|---------|-------|---------------|
| Content width | `--content-width` | 1180px including gutters |
| Horizontal gutter | `--page-gutter` | 20–44px |
| Standard section, including CTA | `--section-space` | 48–80px on **both** ends |
| Explicit compact section | `--compact-space` | 32–48px on both ends |
| Card inset | `--card-padding` | 24–32px |
| CTA panel inset | `--panel-padding` | 32–56px |
| Collection gap | `--grid-gap` | 16–24px |
| Split layout gap | `--split-gap` | 32–48px |

- Base tokens: `--space-2`, `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`, `80`, `96` (px).
  Use these for margins, padding and gaps; do not add arbitrary per-page values.
- Every `section[data-section]` is a direct child of `<main>` and owns one direct
  `.site-container`. Header and footer use the same container, aligning all page edges.
- `.site-section` owns vertical padding; `.site-container` owns horizontal gutters.
  Neither may carry inline spacing/width overrides. Avoid nested containers.
- Only the home snapshot and Scouting stats use `.site-section--compact`.
- Every CTA uses `.site-section--cta > .site-container > .cta-panel`. Its balanced outside
  spacing belongs to the CTA itself, so CMS hiding/reordering cannot remove its top gap.
- Flow: eyebrow → title **12px** (page H1 **16px**), title → description **16px**,
  intro → collection **32px**. Card title → description **12px**.
- Use `.collection-grid` for shared collection gaps and top spacing. Grids use `minmax(0,1fr)`
  and `min-width:0`; auto-fit minimums use `min(100%, minimum)` to avoid horizontal overflow.
- `* { box-sizing: border-box }`, smooth scroll on `html`.

### Border radius (M3 shape scale)
| Element | Token | Radius |
|---------|-------|--------|
| Tags, chips, badges | `--radius-chip` → `--md-shape-sm` | 8px |
| Cards, gallery images, controls | `--radius-card` / `--radius-control` → `--md-shape-md` | 12px |
| Drawer edge | `--md-shape-lg` | 16px |
| Panels, CTA, hero image, dialog | `--radius-panel` → `--md-shape-xl` | 28px |
| Buttons, nav pills, stat chips | `--radius-pill` → `--md-shape-full` | full |

### Elevation
- Cards are **outlined** (1px `--md-outline-variant`), flat at rest.
- `--md-elevation-1` on filled-button hover and hovered showcases; `--md-elevation-2` on lifted
  card hover; `--md-elevation-3` reserved for floating surfaces. Device mockups keep their static shadow.
- The app bar has no shadow; it changes to `--md-surface-container` once the page scrolls.

---

## 4. Responsive breakpoints (M3 window classes, v0.17.0)

| Window class | Width | Change |
|--------------|-------|--------|
| Expanded | `≥ 840px` | Full app bar navigation, multi-column grids |
| Medium | `600–839px` | Navigation moves into the modal drawer; split/feature/CTA/video/roles/project/showcase grids → 1 column; process/gallery → 2 columns; home portrait follows text |
| Compact | `≤ 599px` | Capability/process/snapshot-row/format/timeline grids → 1 column; card lists become swipe rows (§17); 16px gutter (24px from 600px) |

Write the queries as `max-width: 839px` and `max-width: 599px`; don't reintroduce 960/840/520.
Contact topics use auto-fit columns with a 190px minimum. Gallery media always has `width:100%`;
its spanning variant uses `aspect-ratio:auto` and returns to 4:3 on phones.
Mobile role cards stack the date below the role text. Timeline entries stack the year above their title and context.
Put reusable grid geometry and breakpoint rules in `site.css`. Page-specific composition
may use inline columns only with a named responsive class; never inline gaps or section padding.

---

## 5. Core components

### Header (identical on every page)
M3 top app bar: sticky, `z-index:60`, 64px, `--md-surface` with no divider; it tones up to
`--md-surface-container` after scrolling and carries a 3px scroll-progress bar on its lower edge.
Left: **Jimmy Park.** with a small burgundy terminal square. No initials, serif monogram
or repeated name. The SVG embeds its own Wanted Sans subset, so the logo needs no font-network request.
Use 190×38px in the header and 170×34px in the footer, with accessible `alt="Jimmy Park"`.
Right: Home, Media Work, Dev Work, Global & Scouting, Insights and Contact,
as 40px pill links; the current page gets a `--md-secondary-container` pill. Below 840px a 40px icon
button opens the **modal navigation drawer**: `--md-scrim` over the page, a 360px (max 86vw)
`--md-surface-container-low` panel with a 16px trailing radius, 56px pill items. It locks page
scroll, focuses the first link and closes on scrim click, link click or Escape.
The matching favicon uses an abstract open frame and terminal square with no lettering.

### Footer (identical on every page)
`--md-surface-container` band, the same wordmark and role line, nav links, tagline and copyright.

### Eyebrow + heading pattern
```html
<div class="eyebrow">Section label</div>
<h2 class="section-title">Heading</h2>
<p class="body-copy" style="margin:var(--space-16) 0 0;">Supporting copy.</p>
```
Use `var(--scout-accent)` for Scouting eyebrows; it resolves to purple on the Scouting page.

### Buttons (M3 common buttons)
| Class | M3 type | Look |
|-------|---------|------|
| `.btn-primary` | Filled | `--md-primary` fill, `--md-on-primary` label; hover adds elevation 1 |
| `.btn-ghost` | Outlined | Transparent, `--md-outline` 1px border, primary label |
| `.btn-white` | Filled tonal on dark CTA | White fill, primary label |
| `a.card-link` | Text button | Primary label, no container |

All public buttons use `.site-button` plus a variant: **40px** tall (`--control-size`), full radius,
label-large 14px/500, 24px side padding (16px with a trailing icon). Hover/focus/press use M3
state layers (`::before` at 8% / 10% / 10% of the label colour) plus a ripple on press.
Trailing `arrow_forward` / `arrow_outward` icons are decorative and nudge on hover.
Icon buttons (menu, copy) are 40px circles.

On a filled CTA surface, `.btn-white` retains `--md-primary` text with `!important`: the CTA
foreground rule must never turn a white button label white. Verify this with
`.checks/button-contrast.mjs` whenever a button or CTA rule changes.

Articles use assist-chip controls for series filters and ordering. **Series order** is the default so
multi-part writing reads as intended; **Latest published** is an explicit alternate. Preserve the
selected series when changing order. Controls use the same 36px assist-chip target, visible selected
state, keyboard focus ring, and M3 state layers as the rest of the interface.

### Cards
- `.card` is an M3 outlined card: `--md-outline-variant` border, 12px radius, 16–24px padding. `.card--compact` uses 24px;
  `.card--scouting` adds the page-aware Scouting surface and border.
- `.capability` uses a vertical flex layout with visible tags and a bottom action link.
- `.project-card` owns clipping; `.card-body` owns padding. Missing images leave a complete
  text card. Status labels always remain visible.
- `.soft` provides optional hover lift/shadow. Never hide essential information on hover.
- `.timeline-entry` shows year, role and context directly; era labels separate the two stages.
- Collection HTML in `site.js` **must match the static seed**; both use these same classes.

### Feedback
- **Copy toast** `.copy-toast` — M3 snackbar: `--md-inverse-surface`, 4px radius, 14px text,
  bottom-center, ~1.7s after a `[data-copy]` click. Markup lives once per page near `</body>`.
- **Gallery modal** `.gal-modal` — M3 dialog on `--md-surface-container-high`, 28px radius, scales in;
  opened by `.galfig` clicks, closed by backdrop / `[data-gal-close]` / `Escape`.

### Tags / pills
`.tag`: M3 chip — 14px/500 label, 8px radius, 32px tall, `--md-outline-variant` border.
`.status-tag` (e.g. Live) uses the tertiary container; `.stat-chip` uses the secondary container.
Chips over an image (feature-card badge and sub line) use a white 90% fill, 12px/500 label and
`--radius-chip`, so they stay legible on any picture.
`.tag--scouting`: page-aware Scouting text/border. `.tag--large`: **12px 16px** padding and control radius.

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

**English-first.** A limited v0.9.0 exception allows `박지민` in the home identity line, biography and metadata for name disambiguation. All remaining portfolio copy stays English. The site carries no other Korean text — no companion lines, no `*Ko` content
fields, no `박지민` alongside the name. (The site was bilingual through v0.2.x; v0.3.0
removed all Korean. The content schema's `dekoreanize` migration strips any residual
Korean from older saved docs on read.)
- One voice per element: a heading or lead has a single English line, no muted sub-line.
- `lang="en"` on `<html>`.
- **Scoped exception:** the hidden `/saju` entertainment app is Korean-UI by design
  (`saju.html` has `lang="ko"`). It is a standalone page with its own shell — no shared
  header/footer, `site.css`, or `site.js`. The exception covers only `saju.html` + `assets/saju.js`.

---

## 8. Motion (M3, v0.17.0)

Tokens: `--md-ease-standard` `cubic-bezier(.2,0,0,1)`, `--md-ease-emphasized-decelerate`
`cubic-bezier(.05,.7,.1,1)`; durations 150 / 300 / 500ms (`--md-duration-short|medium|long`).
`site.js` adds `html.motion` only when IntersectionObserver exists and the visitor has no
reduced-motion preference. Every rule below is scoped to `.motion`, so without JS, with reduced
motion and in print all content is static and fully visible.

| Effect | Where | Behaviour |
|--------|-------|-----------|
| Scroll reveal `rise` | eyebrows, titles, intros, disclosures, showcase bodies | fade + 28px rise |
| `card` | `.collection-grid > *` | fade + 40px rise + scale .96, staggered 70ms per item (max 6) |
| `zoom` | photos, `[data-img]`, Scouting hero photo | fade, scale 1.06 → 1, desaturated → full colour |
| `wipe` | `.cta-panel`, `.info-panel`, `.feature-card` | top-to-bottom clip-path wipe (800ms); reveals its nested items with it |
| `slide` | timeline entries, snapshot rows, back-end and brief lists, showcase facts, browser mockups | fade + 36px slide from the left |
| `pop` | phone mockups | rise + tilt + scale, then a gentle 6s float |
| Hero entrance | home hero, page intros, app bar | staggered rise; headline unmasks upward; portrait unmasks from a smaller rounded frame |
| Hover | cards, media, icons, chips, showcases | card lift −4px + elevation 2; media scale 1.05; trailing icons nudge 4px; phone tilts |
| Press | buttons, nav, cards, disclosures | M3 ripple (550ms) + button scale .97 |
| Numbers | `.stat-value`, travel count | count up over 1.1s when revealed |
| Navigation | active pill, drawer | pill fills in; drawer slides in, scrim fades, links stagger |
| Scroll progress | app bar lower edge | primary 3px bar scaled to scroll position |

Rules learned in QA — keep them:
- Never give a reveal target a pre-reveal `clip-path` that hides all of it; IntersectionObserver
  counts clipped area, so it would never be revealed. Clip only inside the reveal animation.
- The observer uses threshold 0 (tall targets still reveal); anything hydrated above the viewport
  is shown immediately.
- A phone swipe row enters as one row (cards past the right edge never meet the viewport), and an
  on-screen `<details>` shows its items as soon as it opens (v0.17.2).
- Test reveals at the real widths: pass viewport width and height as separate arguments (in zsh an
  unquoted `$W` holding "1440 900" stays one word).
- Page-load animations on containers use `animation-fill-mode: backwards`. A transform animation
  held with `both` keeps the app bar a containing block, and the fixed drawer scrim shrinks to 64px.

---

## 9. Do / Don't

**Do**
- Reuse the header/footer/eyebrow/button/card blocks verbatim across pages.
- Keep shared geometry and typography in `site.css`; inline page visuals may use existing tokens.
- Run `python3 .checks/design.py`, `node --check assets/site.js` and `git diff --check` before deploying.
- Adjust fluid layout through the named tokens, not one-off inline `clamp()` spacing.
- Bump the `?v=` query on `site.css` / `site.js` links when they change (match `VERSION`).

**Don't**
- Don't add a CSS framework, a build step, or web fonts beyond the approved set
  (Google Sans Flex primary, Pretendard fallback, Material Symbols Outlined icons).
- Don't introduce new accent colors — use the tokens above.
- Don't rely on JS for primary content (JS only *enhances* and applies admin overrides).
- Don't use shadows for separation where an outline or tonal surface will do.
- Don't add motion outside `.motion`, or motion that hides content when JS or motion is unavailable.


## 10. Keeping the rules consistent

Run `python3 .checks/design.py` after portfolio edits. This dependency-free Python/Node check
verifies section/container/CTA ownership, token use, heading scales, matching headers/footers,
valid routes and assets, and exact static/runtime collection parity. `.checks/` is development-only
and blocked from public access by the `.checks` rule in `functions/_middleware.js`. It does not read/write live KV.

After changes to geometry, visually review all five portfolio pages at desktop, tablet and narrow mobile
widths, especially CTA boundaries, contact topics, timeline, gallery and the portrait crop.
Check a reordered/hidden neighboring section when changing CMS section structure. Static checks
protect the documented contract; they do not replace visual review of real content.


## 11. Evidence and travel (v0.7.0)

- Work shows ten owner-supplied video projects before the expandable format list. Each case
  has format, optional year, title, explicit production credit, context and a direct video/playlist
  link. Use a 16:9 thumbnail or a complete text cover, never an empty image slot. Two columns
  become one at 600px. Keep actual roles separate from project/client context; do not imply
  a personal award, independent credit verification, or travel to an exhibition location.
- The photography CTA links to the ongoing Drive folder. Keep its stable folder URL; do not
  import a one-time snapshot of the folder. Admin supports label/URL/note edits; a blank or
  non-HTTPS URL hides the optional link.
- Travel lists the owner's **19 countries & regions**, with supplied cities/destinations.
  The total is derived from distinct nonempty country/region names in the same CMS collection.
  Hong Kong/Macau are separate region entries. Do not relabel the count as countries alone,
  network partners, clients, or professional engagements. Do not claim a distinct-city count.
- The travel summary and expandable destination grid use the shared section/card/gap tokens.
  The grid is 3 / 2 / 1 columns at desktop / 840px / 600px; mobile keeps the large number above
  its introduction. Native details/summary supports mouse, touch and keyboard.
- K-TrainRadar24 replaces the retired countdown project. Describe positions as timetable-based
  **estimates**, never GPS or live operational tracking. Its URL is editable in Admin.

Run `node .checks/content.cjs` after schema/migration edits; it checks old-document upgrades,
custom value/order preservation, idempotence, explicit empty edits, and no GET writes.


### Contact phone formatting
Since v0.12.0 display and copy the owner’s international formatting (`+82 10.5418.6124`). Use an
international dial target (`tel:+821054186124`) for the link. The renderer strips separators for
dialing and still converts an 11-digit Korean 010 number to +82 if the CMS holds one.

## 12. Evidence-led homepage (v0.9.0)
- First flow: positioning and enquiry CTA → three credited videos → concrete scopes → factual
  personal introduction → dated experience → network links. Existing project and article routes stay.
- Selected videos use three desktop columns and one below 840px; all labels/roles are always
  visible, images retain 16:9 and source filenames/links are recorded in `.checks/video-sources.json`.
- Additional Drive cases describe only what titles and owner-labelled credits support. No invented
  performance results, end-client employment, independent credit verification or automatic sync.
- Keep a visible biography aligned with the home Person JSON-LD. The Korean name exception is
  identity metadata and one biographical mention, not a bilingual site redesign.
- Contact presents project-brief and introduction mail links, plus existing email/phone/LinkedIn.
  Brief prompts include audience, deliverables, timing and optional budget; no submission backend.

## 13. Professional scope and Scouting presentation (v0.10.0)
- Use precise specialty language: content strategy, video production, applied AI development,
  AI workflow consulting and workshops, and international Scouting communication. Project
  credits and dated roles carry credibility; avoid superlatives or unmeasured results.
- The Scouting hero is a full-width 16:9 owner-supplied photograph below its introduction,
  keeping both the person and Be Prepared backdrop visible. Use the optimized local JPEG.
- History is grouped into Early Scouting and Leadership & media. Each entry has a 120px year
  column and a flexible title/context column, with subtle dividers. On narrow screens the year
  sits above the text. All context is visible, without repeating track pills or disclosure arrows.
- Card News Generator and BP Media Tools are removed. Scout Tour Assistant has its actual URL.
- Author bylines and BlogPosting JSON-LD share the homepage Person identity. These improve
  clarity and machine-readable attribution; they are not claims of search inclusion or ranking.

## 14. Media Work and Dev Work (v0.11.0)
- Work is two tabs. Media Work (`/work`): video credits then field photography. Dev Work (`/dev`):
  live websites first, then Applied AI tools and AI workflow workshops. Both reuse the shared
  intro, alternating section bands, card and CTA blocks; no new colors or fonts.
- Website cards (`.site-case`) mirror the video case card (screenshot with a `#ece8e1` divider, sector,
  year, title, role, summary, "Visit <domain>" link). Since v0.12.0 they appear on Home only; Dev Work
  uses the §15 showcase. Korea Dream Path leads both.
- Screenshots are real first screens of the owner's live sites, stored locally at 960×540.
- Six header destinations need the desktop row above 960px; the hamburger takes over below.

## 15. Solution-maker home, Dev Work showcase and Contact (v0.12.0)
- Home copy leads with the client’s goal. Selected work shows two labelled groups (`.selected-group-head`
  with a right-aligned "All …" link): three website cards, then three film cards, both 3 → 1 columns.
- Dev Work intro uses the lead scale for the key message and a three-column `.principle-grid`
  (1 column at 840px) of process-step items under a `#e0dacf` rule.
- `.site-showcase`: white panel (`--radius-panel`, `#e6e1da` border, card padding), grid 1.2fr / .8fr
  (reversed and swapped on even rows), 1 column at 840px with the stage first. `.showcase-stage` uses
  the neutral card gradient; browser frame = control radius, `#f7f6f3` bar with three `#e0dacf` dots
  and a pill URL; phone frame = 24% width (30% below 600px), 5px `#171717` bezel, card radius, anchored
  bottom-right over the browser. Facts use eyebrow-red 14px labels and 16px text; stack as `.tag`s;
  the visit action is a primary `.site-button`.
- Contact `.contact-layout`: channels card (uppercase 14px labels, 44px copy buttons, full-width brief
  button) beside a numbered `.brief-list`; 1 column at 840px. No introduction button.
- **Side-by-side cards share one height** (owner request, v0.14.1): rows of cards stretch to the tallest
  card and each card’s last block sits on the common bottom line (flex column + `margin-top: auto`).
  Never top-align cards in the same row. Measured check: no row of `.card`s differs by more than 2px.

## 16. Behind the site (v0.13.0)
- `.showcase-backend` spans the whole showcase panel below a `#ece8e1` rule and always comes last
  (`order: 3`, so alternating rows never move the mockup below it). Head: eyebrow + 20px H4 +
  `.stat-chip`s (`#f7f6f3` fill, `#e0dacf` border, 14px/600).
- `.backend-list`: accent `check_circle` icons, 16px text; two columns without a screenshot, one
  column beside a screenshot. With a screenshot the grid is 1.2fr / .8fr, mirrored on even rows;
  everything is one column below 840px. Admin screenshots sit in the browser frame with the URL pill
  reading "Admin console", a 16:10 screen and a 14px caption stating the demo/sample-data source.

## 17. Phones (v0.16.0)
- Below 600px (v0.17.0; 520px before), card collections scroll sideways instead of stacking: one row, `scroll-snap`,
  cards 84% wide so the next one peeks in, full-bleed to the viewport edges, no visible scrollbar,
  equal card heights. Keyboard users reach every card through its link.
- Dev Work showcases have no outer panel on phones; items are separated by a `#e0dacf` rule. The
  back-end list sits behind a 44px "Show admin features" disclosure; stat chips stay visible.
- Work photos: two columns with an 8px gap; every photo has a 14px `#6b665f` project caption.

## 18. Material 3 colour roles (v0.17.0)
The palette is unchanged; its colours are mapped onto M3 roles in `site.css` `:root`.
| Role | Value | Use |
|------|-------|-----|
| `--md-primary` / `--md-on-primary` | `#7a1e2c` / `#fff` | filled buttons, links, eyebrows, focus ring |
| `--md-primary-container` / on | `#f5e4e3` / `#4b0f1a` | tonal highlights |
| `--md-secondary-container` / on | `#f3ece9` / `#2c2925` | active nav pill, stat chips |
| `--md-tertiary` / container / on | `#2f5a45` / `#eef4ef` / `#173527` | Live status, Scouting green accents |
| `--md-surface` → `-container-highest` | `#fff`, `#fdfcfa`, `#f7f6f3`, `#f1eee8`, `#ece8e1` | page, drawer, bands, dialog |
| `--md-on-surface` / `-variant` | `#171717` / `#66615c` | text / secondary text |
| `--md-outline` / `-variant` | `#8a847c` / `#e6e1da` | outlined button / card and chip borders |
| `--md-inverse-surface` / on | `#2c2925` / `#f7f6f3` | snackbar |
| `--md-scrim` | `rgba(0,0,0,.32)` | drawer and dialog backdrop |

Global & Scouting (`body[data-page="scouting"]`) remaps primary, containers and tertiary to its
purple palette. Legacy tokens (`--accent`, `--radius-*`, `--title-*`, `--scout-*`) are aliases of
these roles; new rules should use the `--md-*` names directly.

## 19. Personal-brand homepage (v0.19.0)
- The first viewport identifies Jimmy before listing services: producer, platform builder and
  applied-AI practitioner. Its value statement is the ability to choose the right medium and carry
  the work through, followed immediately by selected-work evidence.
- `activities` remains the stable CMS section key but presents four reasons to work with Jimmy:
  judgment, ownership, range and context. Do not turn it back into a second service catalogue.
- The primary hero path is selected work; the secondary path is Articles. Contact remains in the
  global navigation and closing CTA, keeping the hero focused on personal-brand evidence.
- The identity section combines claims with dated roles, and the lower project cards connect the
  work to professional network, international record and published perspective.

## 20. Article collections and pagination (v0.20.0)
- The Articles index presents `Published Articles` first and a clearly separated `Upcoming Articles`
  collection below it. Upcoming cards expose metadata and schedule only; article bodies remain hidden.
- Published order controls use `Newest first` and `Oldest first`. Both collections paginate in groups
  of five with independent previous/next controls and an explicit page count.
- Reuse the existing chips, dividers, type roles and spacing tokens. The upcoming boundary uses a
  top divider and larger section spacing rather than a new color surface.

## 21. Social previews and article sharing (v0.21.0)
- Every primary page and current article has a distinct 1200×630 social image in `assets/img/og/`.
  Page cards pair owned portfolio photography with the page promise; article cards use an off-white
  editorial field, burgundy or green series accent, and one abstract motif tied to the subject.
- Article representative images appear after the summary in a rounded, outlined 1200:630 figure.
  The same image and description are used for Open Graph, Twitter Card and BlogPosting metadata.
- Share controls follow the existing outlined M3 button treatment. Facebook and LinkedIn sit in a
  wrapping row below tags and above the conversation CTA, so the reading column remains usable at
  phone widths without platform-specific colors competing with the site identity.

## SETUKOR connection (2026-09-16)
`/setukor` and `/setukor/` redirect (302) to `https://setukor-learning.jimmy-park.chatgpt.site/`, preserving the query string. Handled in `functions/_middleware.js`.
