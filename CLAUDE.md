# CLAUDE.md — JimmyPark.net

Operating manual for working in this repo. Read this and [design.md](design.md) before editing.
Keep both in sync with reality when you change how the site works.

## What this is
Personal portfolio for **Jimmy Park / 박지민** — Content Strategist · AI Practitioner · AX Consultant · Global Collaborator.
Live at **https://jimmypark.net**. **Vanilla HTML/CSS/JS, no build step, no framework.**
Hosted on **Cloudflare Pages** with Pages Functions for a tiny CMS API + TOTP-gated admin.

### Portfolio positioning (v0.5.0)
- Home leads with four capabilities, then dated experience, selected projects, process, and contact.
- Work order: content strategy (`#video`), AI practice (`#vibecoding`), AX consulting and workshops
  (`#lecture`), then field photography. Legacy section keys and all four routes remain stable.
- `/scouting` is labelled **Global & Scouting** in navigation; roles and international context
  appear before the detailed timeline. Keep historical dates and the owner's exact role titles.
- AX is an offered scope and process, not a claim of completed enterprise engagements or measured results.
- The portrait (v0.5.1) is the owner's supplied `IMG_2902.jpeg`, copied without image edits to
  `assets/img/jimmy-park-portrait.jpg`. Static and CMS image URLs use `?v=0.5.1`.
  Home declares `data-image-position="center 10%"`; the hero renderer honors that position
  so the head remains visible in both desktop and mobile crops. Other heroes default to center.
- Schema v5 migrates unchanged legacy seed values in memory, never writes KV on GET, and preserves
  custom text, media, contacts, hidden sections and custom ordering. Semantically repurposed rows
  (capabilities, snapshot, process and workshop topics) migrate atomically only when unchanged;
  compare their schema values independently of object key order in raw KV documents.
  Normalize missing section IDs against the legacy order before migrating an unchanged order.
- This release changes portfolio code only. Preserve the separate entertainment app and its API/assets.

### Portfolio layout (v0.7.2)
- One container/gutter, a shared spacing scale, explicit heading leading and reusable card rules
  apply across Home, Work, Global & Scouting and Contact.
- Regular/CTA section padding is 48–80px on both ends; only snapshot/stats use compact padding.
- Wanted Sans Variable is the default for public pages and Admin (v0.7.1); load the owner-provided
  version-pinned import once in `assets/site.css`. Keep Material Symbols for icons.
- Keep this contract in [design.md](design.md) and validate it with `.checks/design.py`.

### Insights and portfolio completion (v0.8.0)
- Add `/insights` and `/insights/:slug` to the portfolio. The existing four routes and all
  standalone app files stay intact. Shared header/mobile/footer navigation includes Insights.
- `functions/api/_posts.js` manages separate KV key `insights:v1`; `/api/posts` always requires
  the existing signed admin session. Public server-rendered views and dynamic sitemap select
  published posts only. Draft/unknown slug = 404. Keep `no-store` intact in middleware.
- Posts: title, unique lowercase ASCII slug, date, category, summary, plain-text body with
  optional `## ` paragraph headings, and draft/published state. Escape all rendered fields.
  Validate before writes; revision checks are best-effort against eventual KV reads, not a
  guarantee for simultaneous editors. Do not put drafts in the public `/api/content` document.
- `assets/insights-admin.js` owns article editing and its save/publish/unpublish/delete controls.
  Clone stored rows before editing, disable controls while saving, and preserve unsaved text
  across auth expiry. Explicit sign-out may discard it only after the editor's discard prompt.
  Hide the unrelated page-preview column while writing. Keep article SEO out of public CMS
  global-SEO hydration. `insights.html` and `_insights-shell.js` share the public shell.
- Work uses six locally served Drive portfolio photos (`assets/img/portfolio/`) with
  randomized order per visit and source links. `.checks/photo-sources.json` records provenance.
  Future Drive additions do not auto-sync. The photography hero has a supplied-photo fallback;
  a custom CMS image takes precedence. Do not relabel these event photos as Scouting.
- Empty Scouting gallery rows render nothing; hide the section until it has an image, while
  respecting CMS visibility. Uploaded images open in a native keyboard-accessible dialog.
- Page save responses rebind controls only when no newer edits exist; preserve newer edits and
  prevent duplicate saves. Preview messages require the same-origin parent and `?preview=1`;
  late live content cannot overwrite a received preview. Copy/upload success must be verified.
- `404.html` stops nonexistent paths from returning the homepage with HTTP 200.
- Required checks: `.checks/design.py`, `.checks/content.cjs`, `.checks/insights.cjs`,
  `.checks/admin-save.cjs`, JS syntax, diff whitespace and local HTTP routes.
  v0.8.0 has code/HTTP verification; browser interaction and visual QA were not run.

### Owner-supplied portfolio evidence (v0.7.0)
- Six video cases preserve the owner's specific planning/direction/filming/editing credits and
  optional years. Photography links to an ongoing Drive folder; both are editable in Admin.
- Scouting uses a page-scoped purple palette. Travel shows 19 countries & regions with an
  automatically derived count and expandable city/destination list; this is personal travel,
  not a count of clients or network relationships. Hamburg is video context, not a travel entry.
- Schema v6 adds these collections and narrowly replaces Jamboree D-count with K-TrainRadar24.
  GET migration never writes KV. Keep home/work indexed legacy slots stable until migrateTo6
  replaces the retired item by identity; do not shift migrateTo5's numeric-index seed targets.
  Recognize both historical Scouting seed orders; preserve other saved custom orders.
- New fields must be reflected in DEFAULT, Admin SCHEMA, static markup and TT renderers.

### Project, identity and network update (v0.9.0)
- Resumed the 2026-09-10 22:48 KST request about enquiries, personal search and network value.
  v0.8.0 was already deployed. The following audit ended in reasoning at 22:51, with no error
  or explicit stop reason recorded; do not claim a technical cause or unfinished v0.8 work.
- Header/footer use a Wanted Sans `Jimmy Park.` wordmark, with an embedded font and burgundy
  terminal square. Favicon is an open frame and square; neither uses a JP monogram.
- Home foregrounds three actual videos, defines engagement scopes, adds a factual biography,
  and links to professional connections, Scouting and Insights. Existing AI projects stay on Work.
- Work preserves the six earlier project credits and adds Samsung keynote, D-Hack, Siheung policy
  and Korea National Jamboree cases from the owner's public Drive filenames. New credits are
  owner-labelled file metadata, not independently verified credits; full films were not watched.
  The full video-folder CTA is editable in Admin. No automatic Drive synchronization.
- Identity exception to English-only: `박지민` is allowed in the homepage name, biography and
  metadata to connect it to Jimmy Park / Park Jimin. This does not authorize full translation.
  Person JSON-LD includes stable identity, portrait, biography and existing LinkedIn sameAs.
- Schema v7 upgrades unchanged v6 seed fields/arrays only, never writes KV on GET, and preserves
  customized credits, cards, portrait, contact, order, visibility and intentionally empty lists.
  Keep the historical K-TrainRadar24 replacement stable in migrateTo6 even as home cards evolve.
- Contact has separate project-brief and introduction mail links. Their subject/body are preserved
  when the current CMS email is applied. Links only open a visitor's mail app; they send nothing.
- Required checks remain below, including v6→v7/custom-value migration tests. Browser visual and
  interaction QA are not implied by code/HTTP checks. No analytics account or enquiry rate was
  inspected; improved search visibility or new work is not a measured result of this release.

## Golden rules
1. **No build step, no dependencies.** Don't add npm packages or bundlers. Fonts are the
   approved set only — **Wanted Sans Variable** (primary, owner-selected v1.0.1 split webfont, weights 400–1000),
   **Pretendard** (fallback), Material Symbols (icons); don't add others. Everything ships as
   static files served as-is.
2. **Pages render full static content.** SEO and no-JS users must see the real content.
   `site.js` only *enhances* (nav, copy, modal) and applies admin overrides — never gate
   primary content behind JS.
3. **Follow [design.md](design.md) exactly.** Reuse existing header/footer/eyebrow/button/card
   blocks; use the documented color tokens only. Shared spacing/typography belongs in
   `site.css`; page-specific visual styles may be inline using the existing tokens.
4. **English-first; limited identity exception in v0.9.0 above.** Otherwise no Korean anywhere — no companion lines, no `*Ko` content fields, no
   `박지민` by the name. (Removed in v0.3.0; content.js's `dekoreanize` migration scrubs any
   Korean left in older saved docs on read. See design.md §7.)
   **Exception: `/saju` + `/saju-result` + `/saju-detail`** — hidden Korean-UI entertainment
   app (오행 캐릭터 추천). Korean is allowed only in `saju.html`, `saju-result.html`,
   `saju-detail.html`, `assets/saju.js`, `assets/saju.css`; the shared shell and all other
   pages stay English-only.
5. **Don't break the four canonical routes:** `/` `/work` `/scouting` `/contact`
   (+ hidden `/admin`, `/saju`, `/saju-result`, `/saju-detail`). Update `sitemap.xml` if routes change. Hidden
   routes stay out of nav, sitemap, and search (noindex meta + robots.txt Disallow).
6. **Always ship + keep docs current (standing owner policy).** After ANY change, commit
   directly to `main`, push, and deploy (`wrangler pages deploy …`) without waiting to be
   asked — and keep this file and [design.md](design.md) in sync in the same change. This
   overrides the usual "commit only when asked / branch first" defaults for this repo.

## File map
```
index.html      Home (/)            work.html      Work (/work)
scouting.html   Scouting (/scouting) contact.html   Contact (/contact)
admin.html      Admin (/admin, noindex) + assets/admin.js
saju.html       오행 캐릭터 추천 입력 페이지 (/saju, noindex, Korean-UI exception)
saju-result.html 결과 페이지 (/saju-result, noindex) — 입력값을 쿼리스트링으로 받아 렌더
saju-detail.html 상세 분석 (/saju-detail, noindex) — 결과의 '오행 구성 분석' 카드 아래
                 '좀 더 자세히 분석 보기'로 진입(같은 쿼리). 톤(v0.4.45) =
                 **토스체 기반 MZ 캐주얼**: 해요체·짧은 문장·결론 먼저·"~거든요/
                 ~죠" 구어 리듬, 단 게임 슬랭 남발·수명 짧은 밈("난리자베스"류)
                 금지. 한자 정책(v0.4.45 재지시): **간지·오행 글자는 한자 병기**
                 (경(庚)·수(水)·신사(辛巳)년, 글자 타일은 한자 크게 + 한글 캡션,
                 지장간 무(戊·토)) — 설명 프로즈만 한글(하늘/땅 기운 등). 기둥
                 카드에 **글자 사전**(.sjd-gm: 천간=STEM_PROFILE.sym, 지지=
                 BRANCH_SYM 12종 한 줄 뜻). 구성: ① 총평(~600자,
                 10천간 STEM_PROFILE + 균형/집중/안정형 + 계절 무대 + 보완 예고)
                 ② 사주 구조(도입 문단 + **네 기둥 흐름 스트립** .sjd-flow[뿌리→
                 무대→꽃→열매, 간지 표기] + 기둥 카드 4: 글자 칩·지장간 JANGGAN·
                 확장 서술) (오행 순환 SVG 지도는 v0.4.48에서 **삭제** — "사주 모르는 사람에겐
                 난해" 사용자 피드백) ③ 십성 5행+최약 노트 ④-a **나와
                 잘 맞는 것들** #sjd-fit(일간 결 + 최강 기운, EL_FIT + 어울리는
                 컬러) ④-b 보완 가이드(부족 오행별 친구·색·생활 보완법).
                 v0.4.40 에디토리얼 개편("AI로 만든 티" 제거): 헤드라인 아래
                 **한눈 스탯 타일 3개**(#sjd-stats 일간/최강/보완) · 섹션 헤더 번호
                 킥커(.sjd-h em 01~06) · 총평 = 박스 없는 본문(.sjd-summary) ·
                 네 기둥 = **2열 그리드**(.sjd-pgrid, ≤720px 1열) + 글자 타일
                 (.sjd-mg, 결과 글리프 미니판 — pill 칩 폐기) · 십성 %에 미니 바
                 (.sjd-rb). v0.4.44 정통 분석 확장(01~09 재구성): 03 **합·충 케미**
                 (육합 YUKHAP + 충 (a+6)%12, 지지 쌍 전수) · 05 십성에 **신강·신약
                 저울**(비겁+인성 % — ≥50 신강/≥35 중화/신약, 2색 바) · 06 **신살 5종**
                 (v0.4.46 피드백 보강: 도화·역마·화개 = 삼합 branch%4 조견표
                 [연지·일지 기준] / 천을귀인·문창귀인 = 일간표. **15종 전수 검사
                 → 중요도(rank) 순 Top 5만 노출**(v0.4.50 사용자 지시): 천을·
                 천덕·월덕·도화·역마·화개·문창·건록·장성·금여·암록·학당·반안·
                 천의·홍염 — 각각 조견표(삼합 triCheck/일간 dayToB/월지 기준)
                 + what/life/tip 카피. 성립한 별만 순위 번호와 함께 패널 카드,
                 0개면 긍정 빈상태. 리드에 발견 개수·Top5 안내)
                 **보완 색 = 전통 정색(正色)**(v0.4.50 사실확인: 오방색에서
                 수(水)=흑(黑) — 수 팔레트를 블랙·차콜·먹빛 네이비로 교정,
                 파랑은 목(청)의 색이라 목에 청록 보강. 배경 글로우의 수=파랑은
                 가독용 예외로 유지) · 07 **올해의
                 흐름**(new Date + 입춘 경계로 올해 간지 → 일간과 십성 관계별
                 YEAR_MSG) · 09 보완 카드에 **행운 포인트**(EL_LUCK 방위·숫자·
                 계절). 대운(성별 필요)·궁합·건강 매핑은 의도적 미구현.
                 robots의 Disallow /saju가 prefix로 커버.
assets/
  site.css      shared design system + responsive rules (the ONLY shared stylesheet)
  site.js       public behavior: active nav, mobile menu, copy-to-clipboard,
                gallery modal, content hydration from /api/content
  admin.js      admin panel logic (TOTP login, content editor, media library)
  saju.css      /saju·/saju-result·/saju-detail 공용 스타일 (standalone; NOT site.css).
                **v0.4.38 디자인 시스템(사용자 지시)**: 1px 보더 구획 금지 — 구획은
                미세 배경 대비(--bg #f8fafc vs 카드 #fff, 카드 속 패널 --panel) +
                부드러운 그림자(--sh-1: 0 1px 3px rgba(0,0,0,.05), 호버 --sh-2)로.
                입력 필드 = filled 스타일(#f2f4f6, 포커스 링), 리스트 행(.sj-el-row/
                .sjd-role) = 넉넉한 높이 + 호버 배경, 뉴트럴 그레이(#191f28/#4e5968/
                #8b95a1). 보라 브랜드·오방색·글로우는 유지. 새 보더 추가 금지.
                **v0.4.43 타이포 8단 스케일**(css 상단 주석이 기준 — 이 밖의 크기
                금지): T1 헤드라인 26–34 · T2 섹션 21–25 · T1.5 카드 대제목 24–30 ·
                T3 카드/행 제목 19 · Lead 18–20 · Body 18/lh1.9 · UI 15 ·
                Caption 14 · Micro 13 · Data 스탯 23–28/수치 18/카운트 15.
  saju.js       /saju 엔진+UI: 만세력 engine (solar-longitude 절기 calc, no lookup
                tables, 1900–2100) + 오행 분석 → 풍성/부족 기운 → 캐릭터 추천.
                오행 집계는 **자리별 가중 점수표**(지지: 년10·월30·일15·시15 /
                천간: 각10 — 합 110, 표기는 100% 환산 '%'; 시간 모름 시 시주 25점
                제외. 그래프 각주 — 2026-07-10 사용자 지시, ×2 가중에서 교체;
                음양 카드는 비가중 개수).
                결과 최상단 엠블럼 캐릭터·배경 글로우는 **일간(일주 천간)의 오행**
                기준(최다 오행 아님 — 사용자 지시 2026-07-10; '가장 풍성한 기운'
                텍스트 카드만 최다 오행 유지). 두 페이지 공통으로 부팅 시
                POST /api/saju-visit 방문 핑 → 입력 페이지 #sj-visits 에
                "지금까지 N명 · 오늘 N명" 표시(집계 시작 2026-07-10).
                (캐릭터 5종 — v0.4.57 이름·종족 개편: 목 모리[숲의 정령]·화 루아
                [불꽃 요정]·토 두리[포근한 감자]·금 가디[은빛 기사]·수 노아[물방울
                정령]. 추천 카드 타일은 이모지 대신 **프로필 이미지**
                img/saju-ch-<el>.png [흰 배경 1:1, .sj-char-img] — CHARACTERS[].img).
                생년월일은 연/월/일 숫자 3칸 직접 입력
                (네이티브 date picker 대신 — 어르신 스크롤 불편 해소; 숫자만·자동 포커스
                이동·달력 유효성 검사 후 d=YYYY-MM-DD 조합). 입력 페이지는
                /saju-result?d=&t=&nt= 로 이동, 결과 페이지는 쿼리에서 읽어 렌더
                (음양陰陽 밸런스 카드 — 겉천간/속지지·일간·월지 계절·기본유형까지,
                근거 saju-eumyang.md. 지지 음양은 **용(체용전도) 기준**: 자·오=음,
                사·해=양 — 2026-07-10 사용자 확정, 카드에 각주 —
                + 오행 분포, 풍성/부족 기운은 각각 카드 안. **일간 딥다이브
                #sj-ilgan**(v0.4.47, "일간 빈약" 피드백): 풍성한 기운과 부족
                캐릭터 사이(사용자 지정 위치) — STEM_DEEP 10천간 프로필(키워드
                해시태그 4 + 이런 사람/관계/일/한 끗 팁 4축, 한자 대형 타일).
                일간 표기는 **천간+오행 두 글자**: `stemFull()` = 경금(庚金)·
                계수(癸水) 식(v0.4.48 사용자 지시 — 한 글자 '경(庚)' 금지).
                순서: 사주팔자→해시태그→음양→오행→풍성→부족. 풍성 섹션 =
                강점 서사(각 오행 ~2배 분량, 2026-07-10) + 별도 '나의 오행 구성
                분석' 카드(균형/집중/완만 형태 + 상위 2기운 상생/상극 + 최저
                기운 %, counts 기반 동적 생성). "다섯 오행, 다섯 친구"
                세계관 그리드는 임시 주석 처리(다른 페이지 이전 예정). 글씨 ~1.5배,
                본문 카피 ≈50%↓). 마지막 입력은 localStorage
                (`saju:last:v1`, 7일 TTL)에 저장해 재방문 시 폼 자동 채움 — 쿠키 아님
                (서버 미전송). Fully client-side; birth data never leaves the browser.
  img/          favicon.svg + logo.svg (open-frame favicon, Wanted Sans wordmark), og.png (1200×630),
                saju-icon.svg (/saju's own tab icon: violet→pink 오행 pentagon mark),
                saju-el-{wood,fire,earth,metal,water}.png (결과 상단 원형 엠블럼 배지),
                saju-ch-{wood,fire,earth,metal,water}.png (캐릭터 프로필 컷아웃,
                흰 배경 1:1 — 추천 카드 타일용, v0.4.57)
functions/      Cloudflare Pages Functions (see "Backend" below)
_headers        no-cache (Cache-Control: no-cache) + nosniff + referrer policy
robots.txt      allow all except /admin, /api/, /saju ; points to sitemap
sitemap.xml     the 4 public routes
wrangler.toml   Pages config: pages_build_output_dir=".", JP_KV binding
.checks/        development-only layout contract + static/runtime collection checks
VERSION         site version string (currently mirrored in ?v= asset query strings)
```

## Conventions when editing pages
- **Every page** repeats: `<head>` SEO block → sticky header → sections → footer →
  `.copy-toast` → `<script src="/assets/site.js?v=...">`. Copy from an existing page.
- `<body data-page="home|work|scouting|contact">` drives the active-nav highlight
  (`site.js` matches `data-nav` against it). Set it correctly on new pages.
- **SEO is mandatory per page:** `<title>`, `meta description`, `link canonical`, full
  `og:*` + `twitter:*`, favicon. `index.html` also carries JSON-LD `Person` schema.
- Public pages use `body.portfolio`. Each `section[data-section]` is a direct `<main>` child,
  has `.site-section`, and owns exactly one `.site-container`. CTA sections own their balanced
  outside spacing through `.site-section--cta`; never borrow padding from adjacent sections.
- Shared layout, spacing, radii and typography live in `site.css`. Use its named tokens for
  contextual inline spacing; never inline raw spacing values or heading size/line-height.
  Reusable cards and all runtime collection templates must match the static seed markup.
- Run `python3 .checks/design.py`, `node --check assets/site.js` and `git diff --check` before
  every portfolio deployment. Run `node .checks/content.cjs` for schema/migration changes. Review narrow/mobile and desktop layouts after geometry changes.
  `.checks/` requires only Python 3 and Node; it has no package install, network or KV writes.
- New multi-column grid? Give it a class and add it to the matching breakpoint block in
  `site.css` (don't scatter new `@media` queries).
- Bump `?v=` on `site.css`/`site.js` links (keep it equal to `VERSION`) when those files change.

## Content hydration (admin overrides)
The content doc is a **full-site document** (`global` + `pages.<page>.sections`, see
content.js `DEFAULT`, schema `version: 7`). `site.js` renders the static seed first, then
fetches `/api/content` (and also accepts a live-preview doc from `/admin` via `postMessage`)
and overrides the seed through these markup hooks — **add them to new markup so admin edits
reach it.** Page is chosen by `<body data-page>`; binds resolve against that page's sections.
- **SEO:** `document.title` ← `pages.<page>.meta.title`; `<meta name=description>` ← `…meta.desc`.
- `[data-bind="section.field"]` — text from the current page's section (e.g. `hero.lead`,
  `cta.button.label`). `[data-gbind="path"]` — text from `global` (e.g. `footer.tagline`,
  `contact.email`).
- `[data-collection="section.field"]` + `[data-template="name"]` — re-renders a repeatable
  list; `name` must be a renderer in `site.js`'s `TT` map (its markup mirrors the static seed
  / design.md). Add a new `TT` entry when you add a new collection.
- `[data-img="section.field"]` (or `"@global.path"`) sets a background image;
  `[data-href="section.field.href"]` sets a link target.
- `[data-section="id"]` wrappers are reordered to match `pages.<page>.order` and hidden when
  in `pages.<page>.hidden`.
- Contact phone (v0.7.2): display/copy `010.5418.6124`; telephone links use `+821054186124`.
  Keep the static seed, Person JSON-LD, API default and live CMS contact field synchronized.
- **Contact behaviors (from `global.contact`):** `a[data-mail]`→`mailto:`, `a[data-tel]`→`tel:`,
  `[data-copy-email]`/`[data-copy-phone]` get a `data-copy` value, `[data-li-block]` (LinkedIn)
  shows/hides + fills its `<a>` (`[data-li-label]`).
Every field also has a baked-in static seed, so pages are correct with no JS / before fetch
resolves — keep the seed and the `DEFAULT`/`TT` output in sync when you edit either.

## Backend — Cloudflare Pages Functions
Routing: files under `functions/` map to paths; a leading `_` excludes a file from routing.
- `functions/_middleware.js` — blocks public access to `*.md`, `wrangler.toml`,
  `package*.json`, dotfiles, `CNAME`, `.claude/` → 404. Also forces
  `Cache-Control: no-cache` on every non-`/api/` response — middleware-wrapped
  static assets ignore `_headers`, so without this Pages served max-age=14400
  and deploys took hours to reach returning visitors (fixed 2026-07-10).
- `functions/api/content.js` — `GET` (public) returns the content doc or `DEFAULT`;
  `PUT` (admin) sanitizes against `DEFAULT` (clamps strings to 4000 chars, arrays to 60
  items, coerces shape) and writes to KV key `content`. v1 docs (`{seo,contact,hero}`) are
  migrated to v2 on read/write via `fromV1`, so the shape always matches the current schema.
- `functions/api/image.js` — media library in KV: `POST` (admin, ≤5 MB) store bytes →
  `{id,url}`; `GET ?id=` (public) serve with 1-year immutable cache; `GET ?list=1` (admin)
  index; `DELETE ?id=` (admin). Index key `media:index` (capped 500).
- `functions/api/saju-visit.js` — /saju 일일 방문자 카운터. `POST` 방문 기록(같은 IP는
  KST 하루 1회, IP는 SHA-256 해시로만 · 12h TTL), `GET`/`POST` → `{day,today,total}`.
  KV: `sjv:d:<date>`(영구 보관 — 사용자 지시 2026-07-10) · `sjv:total` · `sjv:ip:<date>:<hash>`.
  사주 입력값 미전송.
- `functions/api/login.js` — `POST {code}` verifies 6-digit TOTP, returns signed session.
  Rate-limited: **10 failures / IP / 10 min** (KV `rl:login:<ip>`).
- `functions/api/me.js` — `GET` → 200 if a valid admin session is presented.
- `functions/api/_lib.js` — shared helpers: `json()`, TOTP verify, HMAC-signed sessions
  (**12h TTL**, `Authorization: Bearer <token>`), `isAdmin()`. Sessions are keyed off
  `TOTP_SECRET`, so rotating the secret invalidates all sessions.

Auth model: admin logs in with a **TOTP code** (authenticator app) → gets a session token;
all write/admin endpoints require `isAdmin()`. There are no passwords stored.

## Required Cloudflare config (don't commit secrets)
- **KV namespace `JP_KV`** — bound in `wrangler.toml` (`id` already set). Stores `content`,
  `img:*`, `media:index`, `rl:login:*`.
- **Env var `TOTP_SECRET`** (base32) — set in Pages → Settings → Environment variables, and
  registered in the authenticator app. Admin login returns 503 `not_configured` until it's set.

## Deploy
```bash
# From repo root (static + functions deploy together):
wrangler pages deploy . --project-name jimmypark-net --branch main
```
- Pages project: **`jimmypark-net`** → `jimmypark-net.pages.dev`.
- Custom domains **jimmypark.net** + **www.jimmypark.net** are attached to this project, with
  proxied CNAME DNS records → `jimmypark-net.pages.dev`. (Note: `scoutingapp.net` lives on a
  separate `jimmyport` project — don't deploy this repo there.)
- `_headers` sets `Cache-Control: no-cache`, so deploys take effect immediately (ETag → 304).

## Quick verification after a deploy
```bash
curl -s https://jimmypark.net | grep -m1 "<title>"   # expect the portfolio title
curl -s -o /dev/null -w "%{http_code}\n" https://jimmypark.net/api/content   # expect 200
```

## Don't
- Don't add a framework, build step, bundler, or new web font.
- Don't put real content only in JS, or behind the API.
- Don't introduce new accent colors (see design.md tokens).
- Don't commit `TOTP_SECRET` or any secret. Don't expose `/admin` in nav/sitemap.
