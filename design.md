# Design System — JimmyPark.net

> The single source of truth for how the site looks and feels.
> Visual language: **warm-minimal, English-only, soft rounded corners.**
> Identity: *Content Strategist · AI Practitioner · AX Consultant · Global Collaborator.*
> Tagline: **SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.**

When in doubt, copy an existing block. Consistency beats cleverness — every page repeats the
same header, footer, eyebrow, button, and card patterns by design.

### Portfolio composition (v0.7.1)
- Keep the burgundy site identity and approved typefaces. The Scouting page uses the owner-requested purple theme; existing Scouting references on other pages retain their green sub-accent.
- Home: purpose-led headline and existing portrait, four capability cards, dated experience,
  selected projects, working process, and contact. Lead with text on mobile; the portrait follows.
- Portrait v0.5.1 uses the supplied `IMG_2902.jpeg` unchanged. Use `center 10%` for its
  background position in both static HTML and CMS hydration to retain the top of the head.
- `.capability-grid`: two equal columns, one below 520px. Capability descriptions and tags are
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

**Rule:** burgundy is the shared site accent. The Scouting page overrides the named accent
and Scouting surface tokens to **purple**: accent `#622599`, hover `#4b167d`, eyebrow `#7e42aa`,
surface `#efe4f7`, tint `#f7f2fb`, border `#deceed`, muted `#7d6695`, ink `#302039`.
Scope these overrides to `.portfolio[data-page="scouting"]`; other pages keep their existing
burgundy/green palette. The shared JP logo remains unchanged. Never recolor the standalone app.

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

- **Primary font:** **Wanted Sans Variable** (KR/EN), the owner-selected v1.0.1 split webfont.
  Import it once at the very start of `site.css` from
  `https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.1/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css`.
  Its CSS family is `'Wanted Sans Variable'`, weight range **400–1000**, `font-display:swap`.
  Public pages and Admin use the same primary family; native text controls inherit it.
- **Fallback font:** Pretendard, loaded from jsDelivr CDN
  (`pretendard@v1.3.9/dist/web/static/pretendard.min.css`), then
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`.
- **Icons:** Material Symbols Outlined (Google Fonts), class `.msym`, axis `opsz 24, wght 300,
  FILL 0, GRAD 0`. Always add `aria-hidden="true"` to decorative icons.
- **Base:** `line-height: 1.65`, antialiased.

### Shared portfolio scale
| Role | Token / size | Line height |
|------|--------------|-------------|
| Home H1 | `--title-hero`: 40–62px | 1.12 |
| Page H1 | `--title-page`: 36–52px | 1.15 |
| Section H2 | `--title-section`: 28–36px | 1.2 |
| Card H3 | `--title-card`: 22–26px | 1.3 |
| Lead paragraph | `.hero-lead`: 18–22px | 1.65 |
| Body | 16px | 1.75 |
| Labels / tags / eyebrow | 14px | 1.5 |
| Footer metadata | 12px | 1.6 |

All H1/H2/H3 sizes and leading belong in `site.css`, never in inline page styles.
Use `.hero-title`, `.page-heading`, `.section-title` and `.hero-lead` for their named roles.
Compact process/topic/role headings have explicit shared component rules (18–20px).

### Weight conventions
- Headings: **700**, matching the available font weight.
- Eyebrows / labels / buttons: **600–700**.
- Body: **400–500**.

### Letter-spacing
- Tighten large type (`-.01em` → `-.03em`).
- Open up small uppercase labels (`.08em` → `.16em`).

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

### Border radius
| Element | Token / radius |
|---------|----------------|
| Large panels / CTA / hero image | `--radius-panel`: 28px |
| Cards / gallery images | `--radius-card`: 24px |
| Buttons / controls | `--radius-control`: 12px |
| Pills / tags | `--radius-pill`: 999px |

### Shadows
- Card hover only: `box-shadow: 0 20px 44px -28px rgba(23,23,23,.32)` (`.soft:hover`).
- Toast: `0 14px 30px -12px rgba(0,0,0,.5)`.
- Otherwise **flat** — depth comes from borders, not shadows.

---

## 4. Responsive breakpoints

| Width | Change |
|-------|--------|
| `≤ 880px` | Desktop nav hidden; 44px menu button shown |
| `≤ 840px` | Split/feature/CTA/video/roles/project grids → 1 column; process/gallery → 2 columns; home portrait follows text |
| `≤ 520px` | Capability/process/snapshot-row/format/gallery grids → 1 column; stats → 2 columns |

Contact topics use auto-fit columns with a 190px minimum, allowing a single column
inside a narrow desktop split. The first gallery image stops spanning rows on mobile. Gallery media always has `width:100%`;
its spanning variant uses `aspect-ratio:auto` and returns to 4:3/auto height on mobile,
so the two-row height cannot force its image across a neighboring column.
Mobile role cards stack the date below the role text consistently.
Put reusable grid geometry and breakpoint rules in `site.css`. Page-specific composition
may use inline columns only with a named responsive class; never inline gaps or section padding.

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
<div class="eyebrow">Section label</div>
<h2 class="section-title">Heading</h2>
<p class="body-copy" style="margin:var(--space-16) 0 0;">Supporting copy.</p>
```
Use `var(--scout-accent)` for Scouting eyebrows; it resolves to purple on the Scouting page.

### Buttons
| Class | Look |
|-------|------|
| `.btn-primary` | Burgundy `#7a1e2c` bg, white text, hover → `#651825` + lift |
| `.btn-ghost` | White bg, `#171717` text, `1px #ddd6cc` border, hover → border `#171717` |
| `.btn-white` | White bg, burgundy text (used on dark CTA), hover → `#f3ece9` |

All public buttons use `.site-button` plus their color variant and `.btn` hover behavior.
Minimum height is **44px**; regular padding is **12px 24px**, navigation **8px 24px**.
Copy and mobile-menu controls are also 44px. Trailing `arrow_forward` icons are decorative.

### Cards
- `.card` owns shared border, radius and 24–32px padding. `.card--compact` uses 24px;
  `.card--scouting` adds the page-aware Scouting surface and border.
- `.capability` uses a vertical flex layout with visible tags and a bottom action link.
- `.project-card` owns clipping; `.card-body` owns padding. Missing images leave a complete
  text card. Status labels always remain visible.
- `.soft` provides optional hover lift/shadow. Never hide essential information on hover.
- `details.tl` is the keyboard-operable timeline disclosure; `.tlctx` expands and `.tlchev` rotates.
- Collection HTML in `site.js` **must match the static seed**; both use these same classes.

### Feedback
- **Copy toast** `.copy-toast` — dark pill, bottom-center, shows ~1.7s after a `[data-copy]`
  click. Markup lives once per page near `</body>`.
- **Gallery modal** `.gal-modal` — dark blurred overlay; opened by `.galfig` clicks, closed by
  backdrop / `[data-gal-close]` / `Escape`.

### Tags / pills
`.tag`: 14px text, pill radius, **4px 12px** padding and a neutral border.
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

**English-only.** The site carries no Korean text — no companion lines, no `*Ko` content
fields, no `박지민` alongside the name. (The site was bilingual through v0.2.x; v0.3.0
removed all Korean. The content schema's `dekoreanize` migration strips any residual
Korean from older saved docs on read.)
- One voice per element: a heading or lead has a single English line, no muted sub-line.
- `lang="en"` on `<html>`.
- **Scoped exception:** the hidden `/saju` entertainment app is Korean-UI by design
  (`saju.html` has `lang="ko"`). It is a standalone page with its own shell — no shared
  header/footer, `site.css`, or `site.js`. The exception covers only `saju.html` + `assets/saju.js`.

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
- Keep shared geometry and typography in `site.css`; inline page visuals may use existing tokens.
- Run `python3 .checks/design.py`, `node --check assets/site.js` and `git diff --check` before deploying.
- Adjust fluid layout through the named tokens, not one-off inline `clamp()` spacing.
- Bump the `?v=` query on `site.css` / `site.js` links when they change (match `VERSION`).

**Don't**
- Don't add a CSS framework, a build step, or web fonts beyond the approved set
  (Wanted Sans Variable primary, Pretendard fallback, Material Symbols icons).
- Don't introduce new accent colors — use the tokens above.
- Don't rely on JS for primary content (JS only *enhances* and applies admin overrides).
- Don't use shadows for separation where a border will do.


## 10. Keeping the rules consistent

Run `python3 .checks/design.py` after portfolio edits. This dependency-free Python/Node check
verifies section/container/CTA ownership, token use, heading scales, matching headers/footers,
valid routes and assets, and exact static/runtime collection parity. `.checks/` is development-only
and blocked from public access by the `.checks` rule in `functions/_middleware.js`. It does not read/write live KV.

After changes to geometry, visually review all four pages at desktop, tablet and narrow mobile
widths, especially CTA boundaries, contact topics, timeline, gallery and the portrait crop.
Check a reordered/hidden neighboring section when changing CMS section structure. Static checks
protect the documented contract; they do not replace visual review of real content.


## 11. Evidence and travel (v0.7.0)

- Work shows six owner-supplied video projects before the expandable format list. Each case
  has format, optional year, title, explicit production credit, context and a direct video/playlist
  link. Use a 16:9 thumbnail or a complete text cover, never an empty image slot. Two columns
  become one at 520px. Keep actual roles separate from project/client context; do not imply
  a personal award, independent credit verification, or travel to an exhibition location.
- The photography CTA links to the ongoing Drive folder. Keep its stable folder URL; do not
  import a one-time snapshot of the folder. Admin supports label/URL/note edits; a blank or
  non-HTTPS URL hides the optional link.
- Travel lists the owner's **19 countries & regions**, with supplied cities/destinations.
  The total is derived from distinct nonempty country/region names in the same CMS collection.
  Hong Kong/Macau are separate region entries. Do not relabel the count as countries alone,
  network partners, clients, or professional engagements. Do not claim a distinct-city count.
- The travel summary and expandable destination grid use the shared section/card/gap tokens.
  The grid is 3 / 2 / 1 columns at desktop / 840px / 520px; mobile keeps the large number above
  its introduction. Native details/summary supports mouse, touch and keyboard.
- K-TrainRadar24 replaces the retired countdown project. Describe positions as timetable-based
  **estimates**, never GPS or live operational tracking. Its URL is editable in Admin.

Run `node .checks/content.cjs` after schema/migration edits; it checks old-document upgrades,
custom value/order preservation, idempotence, explicit empty edits, and no GET writes.
