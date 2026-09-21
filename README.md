# JimmyPark.net — Jimmy Park

Personal portfolio for a solution maker working across content, web and AI.
Warm-minimal, English-first, with Material Design 3 interaction patterns. Burgundy `#7a1e2c`
is the core accent, with a purple `#622599` theme on Global & Scouting. **Vanilla HTML/CSS/JS — no build step.**
Google Sans Flex is the default typeface, with Pretendard/system fallbacks.

The v0.23.0 selected-work galleries keep each existing card image as its representative frame and
add three locally archived frames per featured website and film. Hovering a card, or focusing its
link by keyboard, crossfades through the archive; touch devices and reduced-motion users retain the
stable representative image. Local copies preserve the portfolio if a live site or media link changes
or expires. The homepage hero now uses balanced wrapping instead of a forced line break.

The v0.22.3 homepage hero starts with reassurance instead of an abstract claim about choosing a
medium. It tells visitors they do not need to arrive with all the answers, then explains Jimmy's
role in turning complex ideas into work people can understand, use, and keep using.

The v0.22.2 article-detail refinement replaces the understated text link with one clear
`View all articles` back button. Series chips remain available as filters on the Articles index,
but no longer repeat above the title on individual article pages.

The v0.22.1 OG refinement removes the domain label from photo and symbol panes. `Jimmy Park.` and
`jimmypark.net` now form one top-left brand lockup with a divider and a full 64px safe area. Cards
are rendered as ordinary HTML/CSS in isolated browser targets to avoid partial SVG/font captures.

The v0.22.0 OG set is rendered from the site's Material 3 tokens. It uses Google Sans Flex,
official Material Symbols, the M3 display/label hierarchy, color roles, 28px/full shapes and the
8px spacing system. The generator waits for and verifies both Google font families before capture;
the resulting social URLs include a new version query so Facebook, LinkedIn and other scrapers do
not keep the previous cards in cache.

The v0.21.0 social-preview system gives every main portfolio page its own 1200×630 Open Graph
image and gives each article an editable representative image and accessible description. Article
pages show that image above the text, expose it through Open Graph, Twitter Card and BlogPosting
metadata, and provide Facebook and LinkedIn share buttons. The 19 checked-in images can be
reproduced with `node scripts/generate-og-images.mjs`; page cards use owned portfolio photography
and article cards use the site's typography and abstract visual language.

The v0.20.0 Articles index separates published writing from scheduled `Upcoming Articles`.
Published articles can be ordered newest-first or oldest-first; each collection is paged in groups
of five. Future-dated published entries expose only their title, summary and 9:00 AM KST release
time until the exact scheduled instant, while drafts remain private.

The v0.19.0 homepage positions Jimmy Park as a producer, platform builder and applied-AI
practitioner. It explains the distinguishing method—listen first, connect the disciplines a complex
brief needs, then carry the work through delivery and handover—and connects that claim to selected work,
documented roles and published Articles. Schema v38 migrates recognized v37 public copy while
preserving owner-edited alternatives.

The home page leads with four capabilities, connects each to supporting work, and
places dated international roles alongside the projects. Work covers content
strategy, AI prototypes, AX consulting/workshops, and field production. The existing
`/scouting` route presents the global network through concrete Scouting experience.
AX is an offered collaboration scope; no client outcomes or productivity metrics
are claimed. Existing prototype maturity labels are preserved.

Content schema v8 adds owner-supplied video credits, the ongoing photography folder, and
a travel collection with an automatically derived country/region count. It refreshes
unchanged legacy defaults and replaces the retired countdown project on read without writing KV.
Custom copy, images, contact details and section preferences survive; repurposed
collection rows migrate only if the entire old row is unchanged.

## Structure
```
index.html      Home  (/)
work.html       Work  (/work)
scouting.html   Scouting (/scouting)
contact.html    Contact (/contact)
insights.html   Articles static fallback; Pages Functions render /insights and /insights/:slug
404.html        Missing-page response (disables the Pages SPA fallback)
admin.html      Hidden admin (/admin · noindex)
assets/         site.css · site.js (public) · admin.js · img/ (favicon, logo, page/article OG images)
functions/      Cloudflare Pages Functions (API)
  _middleware.js          block *.md / config files from public serving
  api/_lib.js             TOTP verify + signed sessions
  api/login.js            POST {code} → session token
  api/me.js               GET → 200 if admin session valid
  api/content.js          GET (public) / PUT (admin) site content doc
  api/image.js            media library (POST/GET/DELETE) in KV
_headers        no-cache (deploy applies immediately)
robots.txt · sitemap.xml
wrangler.toml   Pages config + KV binding
.checks/        dependency-free layout consistency checks (not public)
scripts/        deterministic OG/social-image generator and deployment helpers
```

## Stability and Scouting refresh (v0.10.0 · 2026-09-10)
- Connected the actual Scout Tour app and removed the two retired/incomplete tool cards.
- Added the owner's main Scouting photo, optimized from ~11 MB to ~610 KB, and replaced the
  badge-heavy history with a readable year/role/context chronology.
- Refined specialty language, metadata, factual role scope and article author attribution.
- Hardened content reads/saves, schema/revision checks, URL handling, admin failure recovery
  and raster-only media serving. Regression checks use isolated data; no production test writes.
- KV remains eventually consistent with one active editor intended. Sequential stale saves
  are rejected; simultaneous writes need a transactional store for a strict guarantee.

## Project, identity and network update (v0.9.0 · 2026-09-10)
- Replaced the JP monogram with a Wanted Sans wordmark and an abstract frame favicon.
- Home now leads with three credited video projects, explicit collaboration scopes, a factual
  Jimmy Park / 박지민 biography and links to LinkedIn, Scouting and Insights.
- Work shows ten selected video projects and links to the ongoing video Drive folder. Four
  additions use the owner's file/folder labels for roles and dates; no full-film review is claimed.
- Contact provides project-brief and introduction email links; it does not automatically send mail.
- v7 migration retains custom content, roles, ordering and hidden/empty collections without KV
  writes on read. New fields are editable in Admin. Search/enquiry outcomes are unmeasured.
- Resume audit: v0.8.0 was complete. The next strategic audit ended in reasoning with no recorded
  error or explicit interruption reason. Continued from that audit, preserving existing features.

## Insights and portfolio update (v0.8.0 · 2026-09-10)
- `/admin` → **Insights** → **New draft**. Edit title, URL, date, category, summary and
  article text, then **Save draft** or **Publish**. Existing articles can be edited,
  unpublished or deleted. Article controls save independently of the page editor.
- A blank line separates paragraphs; `## ` starts a heading. HTML is displayed as text.
- Article metadata and body stay in the remote `insights:v1` KV store. The repository contains
  rendering and validation code only; revise published writing through `/admin` after an editorial
  review, not by changing a static fallback.
- Drafts require the existing admin login. Only published posts enter public HTML and
  the sitemap. The published AX Series covers prompt clarity, human-AI work division,
  accountability for AI-generated work, and AI transformation as a shared operating model.
  Its index defaults to series Part 1–4 order, can switch to latest-published order, and shows scheduled
  9:00 AM KST publication times.
  Content is rendered on the server
  for reading without JavaScript and carries article-specific metadata.
- Public navigation calls this section **Articles**, while `/insights` remains the stable URL.
  The public `/sitemap` page lists portfolio routes and published Articles only.
- Posts live in a separate `insights:v1` KV document. One editor is intended; revision
  checks reject observed stale saves but Cloudflare KV is eventually consistent, not a
  transactional multi-editor database. Publishing visibility may lag briefly between regions.
- Work displays six actual photos from the supplied public Drive portfolio, in shuffled
  order on each visit, with original-file links. These are locally served selected images,
  **not automatic synchronization** of future Drive uploads; the folder link remains current.
- Empty Scouting gallery entries stay hidden. Existing CMS image uploads can populate them.
- Fixed repeated page saves, edits during a pending save, Korean upload filenames,
  false upload/copy success, and untrusted preview messages. Article text survives an
  expired session while the current admin tab remains open.

## How it works
- Public pages render full static content (good for SEO / no-JS). `site.js` enhances
  (nav, mobile menu, copy-to-clipboard, gallery modal) and applies admin overrides
  fetched from `/api/content` — a **full-site content document** covering every page:
  per-page SEO, section text, repeatable collections, images, and section order /
  visibility. The static markup is the seed; `site.js` only overrides it.
- Admin (`/admin`) logs in with a **6-digit TOTP** code (authenticator app), gets a
  12h signed session, and edits the **whole site** through a schema-driven editor
  (Global + one tab per page) with a live-preview iframe, section reorder/hide, and a
  Media Library (uploads auto-resized to ≤1600px JPEG). 30-min idle auto sign-out.

## Design maintenance
Shared layout tokens in `assets/site.css` control container width, gutters, section spacing,
card padding, radii and heading scales across all four public pages. Every CTA owns balanced
outside padding, independent of CMS section order or visibility. See [design.md](design.md).

Before deploying portfolio changes:
```sh
python3 .checks/design.py
node --check assets/site.js
node .checks/home-brand.cjs
node .checks/home-brand-browser.mjs http://127.0.0.1:4173
node .checks/content.cjs
node .checks/insights.cjs
node .checks/admin-save.cjs
node .checks/stability.cjs
node .checks/button-contrast.mjs https://jimmypark.net
git diff --check
```
The check uses Python 3 and Node only. It verifies layout rules, shared shell, links/assets and
static/runtime collection parity without network requests or KV writes. Also visually review
changed layouts at desktop, tablet and narrow mobile widths.

The additional checks exercise authenticated draft/publication transitions, escaped HTML,
invalid/stale writes, repeated saves and in-flight edits with isolated data. Local HTTP checks
cover public routes, sitemap, missing routes and unauthorized admin requests. No production
test posts are created. This release did not run browser interaction or visual QA.

`button-contrast.mjs` uses the locally installed Google Chrome to capture each public portfolio
route at 1440px and 390px, check visible button geometry, and reject an opaque button whose
computed foreground/background contrast is below WCAG AA. It does not write site content.

## Deploy (Cloudflare Pages)
1. Connect this repo to a Pages project (build output dir = repo root, no build cmd).
2. Create the KV namespace and paste its id into `wrangler.toml`:
   `wrangler kv namespace create JP_KV`
3. Set env var **`TOTP_SECRET`** (base32) in Pages → Settings → Environment variables,
   and register the same secret in your authenticator app.
4. Add custom domain **jimmypark.net**.

Or deploy from CLI:
`wrangler pages deploy . --project-name jimmypark-net --branch main`

## KOTMA temporary preview

The Korean Traditional Music Association sample site is built in the separate `KOTMA` repository and temporarily served at [https://jimmypark.net/kotma/](https://jimmypark.net/kotma/). It is a static preview only; its future production deployment remains separate.

Deploy the portfolio and its latest KOTMA export together without replacing Pages Functions:

```sh
./scripts/deploy-kotma-preview.sh
```

The script builds `../KOTMA/apps/web`, merges the generated files under `/kotma` in a temporary directory, and deploys that combined directory to the existing `jimmypark-net` Pages project. It never copies generated KOTMA output into either Git repository.

Unknown KOTMA content paths are served with KOTMA's `/kotma/coming-soon/` temporary page by Pages middleware. Missing KOTMA static assets and Next.js chunks stay HTTP 404 so real loading errors remain visible.

## SETUKOR connection (2026-09-16)
`/setukor` and `/setukor/` redirect (302) to `https://setukor-learning.jimmy-park.chatgpt.site/`, preserving the query string. Handled in `functions/_middleware.js`.
