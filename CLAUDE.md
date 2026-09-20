# CLAUDE.md — JimmyPark.net

Operating manual for working in this repo. Read this and [design.md](design.md) before editing.
Keep both in sync with reality when you change how the site works.

## What this is
Personal portfolio for **Jimmy Park / 박지민** — a **solution maker** who reaches the client’s goal in the most fitting way
(content & video, websites built with AI, AI workflows, global Scouting). Earlier label (≤ v0.11): Content Strategist ·
AI Practitioner · AX Consultant · Global Collaborator.
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
- Google Sans Flex is the default for public pages and Admin since v0.17.0 (Wanted Sans Variable,
  v0.7.1–v0.16.1, is retired); each page `<head>` loads it from Google Fonts. Keep Material Symbols for icons.
- Keep this contract in [design.md](design.md) and validate it with `.checks/design.py`.

### Insights and portfolio completion (v0.8.0)
- Add `/insights` and `/insights/:slug` to the portfolio. The existing four routes and all
  standalone app files stay intact. With four published AX Series posts, Articles is visible in
  desktop, mobile, and footer navigation.
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

### Stability, professional positioning and Scouting refresh (v0.10.0)
- Owner supplied `https://scoutingapp.net/tour/`: Scout Tour Assistant now links there and is
  marked Live (public URL verified). Its map concerns Scout units, offices and heritage sites;
  AI-assisted development describes how it was built, not a claim of AI inference in the app.
- Remove Card News Generator and BP Media Tools by stable slug/title when upgrading older
  stored documents. Preserve all other projects. Historical migration targets are frozen; later layouts cannot change their semantics. Migrations tolerate removed fields;
  v2 CTA links migrate as intact historical pairs before their newer destinations are applied.
- Scouting hero uses the owner-supplied Be Prepared photo, a 2048px JPEG display derivative
  (~610 KB versus ~11 MB supplied PNG), at 16:9. The source capture is unmodified outside the
  checkout. CMS v8 applies this explicit replacement once; later hero edits remain possible.
- Scouting history is a readable chronology with two era labels, year, role and visible
  context; no repeated Scout/Leader badges and no hidden detail behind per-row toggles.
- Public titles/descriptions consistently describe content strategy, video production,
  applied AI development, practical AI workflow consulting/workshops and global Scouting.
  Keep factual role scope: the 2023 Jamboree role is Korean Contingent media. Do not add
  unverified expert rankings, awards, client results or claims of AI-search guarantees.
- Insights detail has a visible author link and escaped BlogPosting JSON-LD referencing the
  homepage `#person`; missing pages have accurate noindex metadata. The AX Series posts cover
  prompting clarity, work division, ownership of sent output, and organization-wide AX.
- Content GET returns 503 on unavailable/corrupt storage; defaults only for a genuinely missing
  key. PUT requires the complete current schema and rejects malformed/partial documents,
  invalid URLs/email, and stale `updatedAt` before writing. Old editor versions must reload.
- Admin waits for a successful content load before enabling Save, retains unsaved in-flight
  edits and acknowledges the saved server revision, and warns before leaving unsaved changes.
  Article saves match the returned ID/trimmed slug. HTML/SVG uploads are rejected; raster
  signatures determine served MIME and images carry nosniff. Unsafe preview URLs are stripped.
- KV revision comparison is optimistic, NOT atomic. One active editor is still intended;
  simultaneous distributed writes cannot be guaranteed conflict-free without a transactional
  store. Do not claim that these regression checks guarantee all concurrency or uptime.
- Required regression check now includes `node .checks/stability.cjs`: malformed/partial PUT,
  storage failure, stale saves, unsafe URLs, raster uploads and admin recovery, with isolated KV.
  Existing auth, article, content, layout and HTTP checks remain required. No production test writes.

### Media Work / Dev Work split (v0.11.0, 2026-09-19)
- Owner request: split Work into **Media Work** and **Dev Work** as separate navigation tabs, link
  the sites the owner actually developed, and put **Korea Dream Path** at the top of the website
  portfolio. Nav order: Home · Media Work · Dev Work · Global & Scouting · Insights · Contact.
- `/work` (`work.html`, `data-page="work"`) is now Media Work: intro → `#video` → `#photography`
  (kicker `02`) → CTA. `/dev` (`dev.html`, `data-page="dev"`, CMS page key `dev`) is Dev Work:
  intro → `#sites` → `#vibecoding` → `#lecture` → CTA. Section keys/anchors were kept; only the page changed.
- `#sites` uses collection `sites.items` (v0.12.0: template `siteShowcase`, see below): Korea Dream Path (koreadreampath.com), Authentic Korean Traditional Fermented Foods
  Cooperative (charmjt.org; the site's own English alternateName), nfee (nfee.app) and BANGINOJA
  (bgnj.net). Descriptions describe features visible on the live sites or documented in their repos;
  do not add clients, traffic, revenue or awards.
- Card images are local 960×540 JPEGs in `assets/img/dev/`, captured 2026-09-19 from the live
  homepages with headless Chrome after dismissing consent banners/popups (visitor actions in a
  temporary profile). They do not auto-refresh; replace them from Admin or by recapturing.
- Schema v9 (`migrateTo9`) moves `vibecoding`/`lecture` from `pages.work` to `pages.dev` with their
  custom copy, hidden state and relative order; upgrades only unchanged v8 seeds (`V9_SEEDS`);
  retargets `/work#vibecoding|#lecture` links. Earlier seed tables resolve moved paths via
  `currentDefault()`; the v6 K-TrainRadar24 row is frozen as `V6_TRAIN_PROJECT`. GET still never writes KV.
- Home capability 02 is "Web Development & Applied AI" → `/dev`; 03 → `/dev#lecture`.
- Desktop nav collapses at **960px** (was 880px) so six destinations fit; measured 68px clear of the
  logo at 961px. Admin has a Dev Work tab; the Work tab is labelled Media Work.
- Verified: all `.checks` pass (5 pages), local HTTP routes, desktop/961/960/390px screenshots,
  live routes and live v9 GET of the saved CMS document. The K-TrainRadar24 card still uses its
  old name; its URL redirects to K-TransportRadar24 — rename only on the owner's request.

### Solution maker, need-first Dev Work and Contact essentials (v0.12.0, 2026-09-19)
- Owner request: polish Home; position Jimmy as a **solution maker** who supports what the client
  needs in the most fitting way (not "content strategist / video producer" first); Dev Work must say
  the most important thing is not flashy technique but quickly judging and understanding the need,
  and that **AI makes all of it possible**; show the websites more impressively; Contact without
  "Introduce yourself", only the essentials, phone with +82.
- Home: hero "Your goal. / The right way to reach it."; `selected` holds two groups — `selected.sites`
  (`siteCases`, 3 cards: Korea Dream Path, cooperative, BANGINOJA → /dev) and `selected.cases`
  (films → /work#video); capabilities framed as client needs (Be understood / Launch online /
  Work smarter / Reach further); process Listen → Choose → Build with AI → Hand over; CTA
  "Tell me your goal". Footer role line: "Solutions through content, web & AI · Global Scouting".
- Dev Work intro: "Understand the need fast. / Build it with AI." + `intro.principles` (approachSteps in
  `.principle-grid`: Needs before technique · Fast judgement · AI at every step). `#sites` renders
  `siteShowcase`: alternating white panels with a browser mockup (domain in the URL bar), an
  overlapping phone mockup, summary, The need / What I built / Role, stack tags and a Visit button.
  Website rows: id, title, format, year, role, summary, need, built, stack, href, linkLabel, image,
  mobileImage (desktop 1280×720, mobile 360 wide; KDP mobile captured at 430px because its own
  header clips "Log in" at 390px — a Korea Dream Path issue, not fixed here). Role "Planning &
  development" follows the owner's statement that they judge needs and develop these sites.
- Contact: email + copy, phone `+82 10.5418.6124` + copy, LinkedIn, languages, one "Email a project
  brief" mailto (Goal / Who it is for / Timing / Budget / References) and a five-point "What to
  include" list with "I can help with" tags. The introduction mail link was removed.
- Schema v10 (`migrateTo10`): `V10_SEEDS` replace only unchanged v9 values (incl. phone); v9 website
  rows matching `V10_SITE_ROWS` become the new rows; custom rows keep text (`desc` → `summary`) and
  get empty need/built/mobileImage so they never inherit the first default row via `sanitize`.
- Verified: all `.checks` (v8/v9 → v10 incl. custom rows), local screenshots at 1440/390px, live routes
  and live v10 GET of the saved document. Browser interaction on real devices was not tested.

### Behind the site: admin and back-end evidence (v0.13.0, 2026-09-19)
- Owner request: show the admin features too — the sites are built with the back end in mind, not
  only as homepages. Each Dev Work showcase ends with "Behind the site / Admin console & back end":
  six implemented admin capabilities (`backend`, one per line), verified facts as chips (`stats`,
  separated by ·) and an optional admin screenshot (`adminImage` 1280×800 + `adminCaption`).
- Sources (read-only research of each repo, 2026-09-19): KDP `ui_kits/website/admin-*.js`, `worker.js`
  (50 admin tabs, 95 API routes); cooperative `public/assets/admin.js`, `functions/api/admin/*`;
  nfee `public/admin.html`, `functions/api/admin/*`, `REVIEW-2026-09-18.md` (338 tests → shown as
  "300+"); BANGINOJA `pages/AuthAdminPage.jsx`, `pages/admin/*`, `workers/src/index.js` (143 handlers),
  `version-history.json` (368 entries). Excluded on purpose: BANGINOJA's mock privacy/legal tabs,
  a cooperative "version history" (it has none), nfee bank-account collection (removed 2026-09-18).
- Screenshots never show real people. nfee = its demo build (`docs/`, sample data; header shows the
  owner's demo admin name). Cooperative = local static demo mode (`public/`, demo login, empty
  data). KDP and BANGINOJA have no safe demo, so they show lists only — do not capture live admin
  screens with member, order, booking, application or mail data. Other repos were not modified.
- Schema v11 (`migrateTo11`, `upgradeSiteRows`): unchanged v10 website rows (Dev Work and home
  `selected.sites`) become v11 rows; custom rows get empty back-end fields.

### Client and recruiter review follow-up (v0.14.0, 2026-09-19)
- Review: `Claude_Memories/reports/claude-2026-09-19-jimmypark-발주자-채용자-관점-검토.md` and
  `.impeccable/critique/` (score 20/32). Owner decisions: priority is **winning projects**; hiring is a
  separate path; Korea Dream Path is the owner's **own platform (CEO)**; no new materials supplied yet.
- KDP rows (Dev Work + Home) read "Own platform · Global education", role "CEO · Planning & development";
  Home profile adds "Education · Korea Dream Path · CEO" and the bio says he leads KDP as CEO. Other titles
  in memory (THE MOMENT PM, Korea Jamboree Head of PR, KSA National Commissioner, 25th WSJ Deputy Head
  of Media) are NOT published: unconfirmed, and the 25th WSJ title conflicts with "Korean Contingent Media".
- Home films: Samsung Tech Conference 2025 (text cover — no still; do not pull corporate keynote frames
  from Drive without the owner), AI2RE, Daekyo. Hero eyebrow adds "Video producer & web developer";
  Person JSON-LD jobTitle "Video Producer and Web Developer" (image stays the full-resolution original).
- Hiring: Contact `#hiring` block with a "Role enquiry" mailto; Home "Stay connected" third card is
  "Hiring enquiries" → `/contact#hiring` (replaced the Insights card). Card links read "Learn more".
- Articles is visible in header, mobile, and footer navigation now that the site has four published
  AX Series posts. `/insights` remains the stable route, appears in the sitemap, and has og:image/twitter:image.
- Fixes: section subtitles and the Scouting timeline note use `#6b665f` (AA); `/dev` has an `.sr-only`
  H2 before the principles; the hero uses `jimmy-park-portrait-960.jpg` (152 KB display derivative,
  original 1.19 MB file kept unchanged).
- Schema v12 (`migrateTo12`): v11 defaults → v12, plus exact early-seed values that migrations had missed
  and were live on 2026-09-19 — /work and /contact meta descriptions, "Base" profile label, BP Media
  "…in Korean." descriptions and the Korean `dev.vibecoding.sub`. Custom values stay. Verified by running
  the live saved document through the new GET (no KV write): only the allowed 박지민 identity remains.
- Still open (owner must supply): engagement/pricing/timelines, showreel and stills, client-name
  permission, workshop record, CV/work history, domain email/form approval.

### Equal card heights, BP Media and the cooperative's AI pages (v0.14.1–v0.15.0, 2026-09-19)
- Owner rule: cards side by side in one row share one height, last block on the common bottom line
  (Contact cards were 642/555px). Verify by measuring every page in headless Chrome: no row of `.card`s
  may differ by more than 2px (see design.md §15).
- BP Media (bpmedia.net, owner = Founder) is the second Dev Work showcase, after Korea Dream Path.
  Sources (read-only, 2026-09-19): `gilwell-media` repo — `public/admin.html`, `public/js/admin-v3.js`,
  `functions/api/**` (111 route files excluding Dreampath), `db/migration_*.sql` (76), `wrangler.*.toml`
  (3 confirmed scheduled jobs; the error-alert worker is not confirmed live and is not claimed),
  `public/data/changelog.json` (892 entries). No admin screenshot: no demo mode; live panels hold
  usernames and commenter names.
- The cooperative row says its product detail pages and product images were created with AI (owner
  statement, recorded in `cham/docs/handoff.md`). Chip: "AI-made product detail pages".
- Home website cards: Korea Dream Path, BP Media, cooperative. Home BP Media feature card → bpmedia.net.
- Schema v13 (`migrateTo13`): inserts BP Media once after Korea Dream Path unless a row already points
  to bpmedia.net; replaces the unchanged cooperative row; replaces the untouched home trio (by row
  identity, since older rows may already be newer defaults); curated lists stay as the owner left them.

### Lighter mobile, Samsung still and photo captions (v0.16.0, 2026-09-19)
- Owner: "mobile feels cramped". At ≤520px only: `.selected-work-grid`, `.video-case-grid`,
  `.capability-grid` and `.project-grid` become one horizontal scroll-snap row (84% cards, next card
  peeks, equal heights); Dev Work showcases lose their outer panel; `.backend-details` (the admin list)
  is collapsed by `site.js` `compactDetails()` on phones, open without JS and on larger screens; Work
  photos use two columns. Measured at 390px (live): Home 11,027→7,490px, Work 9,657→4,191px,
  Dev 13,318→10,188px, no horizontal overflow. Desktop is unchanged.
- Samsung Tech Conference 2025 card: `assets/img/video/samsung-keynote.jpg`, a 2×2 still (Drive title
  thumbnail + three frames from "Keynote 5 Jim Jemlin" extracted with AVFoundation), made at the
  owner's request; provenance in `.checks/video-sources.json`; the downloaded video was deleted.
  Schema v14 fills the image only where the card image is still empty.
- Work photos carry project captions (`.photo-item figcaption`): English renderings of their Drive
  folder names (Climate Response Center June roundtable 2026; Geumcheon Vocational Rehabilitation
  Day concert 2024; Mokpo High School alumni golf tournament 2026). Korean originals are recorded in
  `.checks/photo-sources.json` only — the public site stays English.

### Stills for KB Life and the Jamboree opening (v0.16.1, 2026-09-19)
- Owner: each Samsung keynote speaker appears only once; every other video without a thumbnail gets
  its own captured still. `samsung-keynote.jpg` = Opening (Paul Cheun), Keynote 1, Keynote 2 and
  Jim Zemlin, one tile each. `kb-life.jpg` = published YouTube thumbnails of EP1/EP3/EP4/EP7 (each
  interviewee once). `korean-jamboree-opening.jpg` = four frames of the opening film. Provenance
  (file IDs, timestamps) in `.checks/video-sources.json`; downloaded videos were deleted.
- Schema v15 (`migrateTo15`) fills these two images only where the card image is still empty, in
  both `work.video.cases` and `home.selected.cases`. Custom images are never replaced.

### Material 3, Google Sans Flex and motion (v0.17.0, 2026-09-19)
- Owner: follow Material Design 3 (m3.material.io) for all site design — icons, motion, spacing and
  shape — keep the current colours, and use Google Sans Flex. Then: add site-wide animation,
  transitions and transforms so the site looks livelier and more varied.
- Colours are the existing palette mapped to M3 roles (`--md-primary` = burgundy `#7a1e2c`, tonal
  containers from the warm neutrals; Scouting remaps the roles to its purple). No new hues.
  Legacy tokens (`--accent`, `--radius-*`, `--title-*`) now resolve to M3 tokens. See design.md §18.
- Fonts: Google Sans Flex (`opsz,wght@6..144,1..1000`) + Material Symbols Outlined
  (`opsz,wght,FILL,GRAD@20..48,400,0..1,0`) from Google Fonts in every page head, including
  `functions/_insights-shell.js`, `404.html` and Admin. The `Jimmy Park.` logo SVG still embeds its own
  Wanted Sans subset via `@font-face` inside the image (no page font request); it was not redrawn. `/saju` keeps its own look.
- Motion lives at the end of `site.css` and in `site.js` (`html.motion`, `REVEALS`, ripple,
  `countUp`, scroll progress). Everything is gated: no motion for `prefers-reduced-motion`, no JS
  or print, so static content is never hidden. Two traps found in QA, keep them fixed:
  1. a pre-reveal `clip-path` gives the target zero visible area, so IntersectionObserver never
     reveals it — wipe clips only inside its animation, and a wipe panel reveals its children;
  2. an animation with `fill-mode: both` on a transform keeps the element a containing block for
     fixed children — the app bar's entrance uses `backwards`, or the drawer scrim shrinks to 64px.
- QA (local + live): full-page screenshots at 1440/390, equal card rows, no horizontal overflow;
  drawer scrim covers the viewport, closes on scrim/Escape and returns focus. Hover states were not
  screenshot-tested. **Correction (v0.17.2):** the v0.17.0 gradual-scroll reveal check passed the
  viewport as one zsh word (`$W` = "1440 900" is not split), so it ran at headless Chrome's default
  width, not 1440/390. Re-run at true widths it found two phone-only gaps, fixed in v0.17.2 below.
- v0.17.1: documentation (this section, Golden rule 1, design.md §2–5, §8, §17–18), the `site.css`
  header comment and the `?v=` bump only; no visual or behaviour change.

### BP Media card image, phone reveals and the M3 guide folder (v0.17.2, 2026-09-19)
- Owner: "capture the BP Media card too" (the Scouting feature card had an empty image) and "make a
  design folder with all the Google Material Design guidance we can use on our site".
- `assets/img/bp-media-card.jpg` (1600×667): bpmedia.net captured 2026-09-19 in headless Chrome —
  desktop 1280×720 at 2× and a 390×844 phone view, hero carousel paused on the "Central Zone" slide —
  placed in the Dev Work browser + phone mockup on the warm stage gradient. The mockup sits inside
  x 280–920 / y 44–456 of the 1200×500 canvas, the area kept by both the phone crop (≈1.28:1) and the
  Scouting desktop crop (≈2.9:1). No private data: public homepage only. Rebuild it the same way
  when bpmedia.net changes; it does not refresh itself.
- Used by Home `projects.feature.image` and Scouting `mediaprojects.feature.image`. Schema v16
  (`migrateTo16`) fills either only while it is empty. The Home `projects.feature.sub` line is a
  white chip like the badge (italic muted text was unreadable over an image).
- Reveal fixes: a phone swipe row (`scrollWidth > clientWidth`) enters as one row when its first card
  is seen; opening an on-screen `<details>` shows its items at once. Verified at true 1440/390 widths
  on every page, local and live: 0 hidden reveal targets (closed disclosures excluded, each opened
  one checked item by item).
- `design/` holds the Material 3 reference library for this site (see its README). It is guidance;
  [design.md](design.md) stays the contract. `.md` files are never served (middleware 404).

### Article order and interaction accessibility (v0.18.5, 2026-09-20)
- `/insights` defaults to **Series order**, preserving Part 1–4 for each editorial sequence. It offers
  **Latest published** as an explicit alternative; changing order preserves any selected series filter.
- Article order and series filters use server-rendered, keyboard-accessible M3 assist chips. Do not make
  article discovery dependent on client-side state.
- M3 state layers must render above a component surface and below its label. Keep the interaction target
  at least 40px for buttons and 36px for article filter/order chips; retain the shared visible focus ring.
- The Scouting CTA uses the shared `.btn.btn-white.site-button`, not a small underlined text link.

### Scouting terminology and evidence (v0.18.6, 2026-09-20)
- The Scouting terminology authority is `Claude_Memories/reference/scout-terminology-ko.md`; the roles
  authority is `Claude_Memories/core/소속과-직함-2026.md`. Apply their official English role names to
  public profile content and preserve the Korean conventions when Korean is needed elsewhere.
- Public chronology uses owner-recorded dates, organizations, roles and supplied counts only. Do not
  infer reach, partnership scope, audiences, outcomes, or importance from an appointment title.
- The 2026 event is **16th Korea Jamboree**, Head of PR, 5–9 August. The published reference for the
  25th World Scout Jamboree is **Deputy Head of Media Dept.**, 2022–2023. Never reintroduce conflicting
  “15th” or Korean-Contingent-only variants without an owner-approved official source.

## Golden rules
1. **No build step, no dependencies.** Don't add npm packages or bundlers. Fonts are the
   approved set only — **Google Sans Flex** (primary since v0.17.0, owner-selected, Google Fonts,
   weights 1–1000), **Pretendard** (fallback), Material Symbols Outlined (icons, weight 400); don't add others. Everything ships as
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
5. **Don't break the canonical routes:** `/` `/work` `/dev` `/scouting` `/contact` (+ `/insights`)
   (+ hidden `/admin`, `/saju`, `/saju-result`, `/saju-detail`). Update `sitemap.xml` if routes change. Hidden
   routes stay out of nav, sitemap, and search (noindex meta + robots.txt Disallow).
6. **Always ship + keep docs current (standing owner policy).** After ANY change, commit
   directly to `main`, push, and deploy (`wrangler pages deploy …`) without waiting to be
   asked — and keep this file and [design.md](design.md) in sync in the same change. This
   overrides the usual "commit only when asked / branch first" defaults for this repo.

## File map
```
index.html      Home (/)            work.html      Media Work (/work)
dev.html        Dev Work (/dev)     scouting.html  Scouting (/scouting)
contact.html    Contact (/contact)
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
  img/          favicon.svg + logo.svg (open-frame favicon, wordmark with an embedded Wanted Sans subset), og.png (1200×630),
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
design/         Material 3 reference library for this site (Markdown, never served; design.md wins)
VERSION         site version string (currently mirrored in ?v= asset query strings)
```

## Conventions when editing pages
- **Every page** repeats: `<head>` SEO block → sticky header → sections → footer →
  `.copy-toast` → `<script src="/assets/site.js?v=...">`. Copy from an existing page.
- `<body data-page="home|work|dev|scouting|contact">` drives the active-nav highlight
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
content.js `DEFAULT`, schema `version: 16`). `site.js` renders the static seed first, then
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
- Contact phone (v0.12.0, owner request): display/copy `+82 10.5418.6124`; telephone links use `+821054186124`.
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

## SETUKOR connection (2026-09-16)
`/setukor` and `/setukor/` redirect (302) to `https://setukor-learning.jimmy-park.chatgpt.site/`, preserving the query string. Handled in `functions/_middleware.js`.
