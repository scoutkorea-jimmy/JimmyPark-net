# CLAUDE.md — JimmyPark.net

Operating manual for working in this repo. Read this and [design.md](design.md) before editing.
Keep both in sync with reality when you change how the site works.

## What this is
Personal portfolio for **Jimmy Park / 박지민** — Photographer · Videographer · Scout · Builder.
Live at **https://jimmypark.net**. **Vanilla HTML/CSS/JS, no build step, no framework.**
Hosted on **Cloudflare Pages** with Pages Functions for a tiny CMS API + TOTP-gated admin.

## Golden rules
1. **No build step, no dependencies.** Don't add npm packages or bundlers. Fonts are the
   approved set only — **Cafe24ProSlim** (primary, woff2 from jsdelivr, weights 300/400/700),
   **Pretendard** (fallback), Material Symbols (icons); don't add others. Everything ships as
   static files served as-is.
2. **Pages render full static content.** SEO and no-JS users must see the real content.
   `site.js` only *enhances* (nav, copy, modal) and applies admin overrides — never gate
   primary content behind JS.
3. **Follow [design.md](design.md) exactly.** Reuse existing header/footer/eyebrow/button/card
   blocks; use the documented color tokens only; style page-specifics inline.
4. **English-only.** No Korean anywhere — no companion lines, no `*Ko` content fields, no
   `박지민` by the name. (Removed in v0.3.0; content.js's `dekoreanize` migration scrubs any
   Korean left in older saved docs on read. See design.md §7.)
5. **Don't break the four canonical routes:** `/` `/work` `/scouting` `/contact`
   (+ hidden `/admin`). Update `sitemap.xml` if routes change.
6. **Always ship + keep docs current (standing owner policy).** After ANY change, commit
   directly to `main`, push, and deploy (`wrangler pages deploy …`) without waiting to be
   asked — and keep this file and [design.md](design.md) in sync in the same change. This
   overrides the usual "commit only when asked / branch first" defaults for this repo.

## File map
```
index.html      Home (/)            work.html      Work (/work)
scouting.html   Scouting (/scouting) contact.html   Contact (/contact)
admin.html      Admin (/admin, noindex) + assets/admin.js
assets/
  site.css      shared design system + responsive rules (the ONLY shared stylesheet)
  site.js       public behavior: active nav, mobile menu, copy-to-clipboard,
                gallery modal, content hydration from /api/content
  admin.js      admin panel logic (TOTP login, content editor, media library)
  img/          favicon.svg + logo.svg (serif JP monogram, burgundy underline), og.png (1200×630)
functions/      Cloudflare Pages Functions (see "Backend" below)
_headers        no-cache (Cache-Control: no-cache) + nosniff + referrer policy
robots.txt      allow all except /admin and /api/ ; points to sitemap
sitemap.xml     the 4 public routes
wrangler.toml   Pages config: pages_build_output_dir=".", JP_KV binding
VERSION         site version string (currently mirrored in ?v= asset query strings)
```

## Conventions when editing pages
- **Every page** repeats: `<head>` SEO block → sticky header → sections → footer →
  `.copy-toast` → `<script src="/assets/site.js?v=...">`. Copy from an existing page.
- `<body data-page="home|work|scouting|contact">` drives the active-nav highlight
  (`site.js` matches `data-nav` against it). Set it correctly on new pages.
- **SEO is mandatory per page:** `<title>`, `meta description`, `link canonical`, full
  `og:*` + `twitter:*`, favicon. `index.html` also carries JSON-LD `Person` schema.
- Page-specific layout is **inline `style="..."`** — that's intentional, not tech debt.
  Shared, reusable behavior/classes go in `site.css`.
- New multi-column grid? Give it a class and add it to the matching breakpoint block in
  `site.css` (don't scatter new `@media` queries).
- Bump `?v=` on `site.css`/`site.js` links (keep it equal to `VERSION`) when those files change.

## Content hydration (admin overrides)
The content doc is a **full-site document** (`global` + `pages.<page>.sections`, see
content.js `DEFAULT`, schema `version: 2`). `site.js` renders the static seed first, then
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
- **Contact behaviors (from `global.contact`):** `a[data-mail]`→`mailto:`, `a[data-tel]`→`tel:`,
  `[data-copy-email]`/`[data-copy-phone]` get a `data-copy` value, `[data-li-block]` (LinkedIn)
  shows/hides + fills its `<a>` (`[data-li-label]`).
Every field also has a baked-in static seed, so pages are correct with no JS / before fetch
resolves — keep the seed and the `DEFAULT`/`TT` output in sync when you edit either.

## Backend — Cloudflare Pages Functions
Routing: files under `functions/` map to paths; a leading `_` excludes a file from routing.
- `functions/_middleware.js` — blocks public access to `*.md`, `wrangler.toml`,
  `package*.json`, dotfiles, `CNAME`, `.claude/` → 404.
- `functions/api/content.js` — `GET` (public) returns the content doc or `DEFAULT`;
  `PUT` (admin) sanitizes against `DEFAULT` (clamps strings to 4000 chars, arrays to 60
  items, coerces shape) and writes to KV key `content`. v1 docs (`{seo,contact,hero}`) are
  migrated to v2 on read/write via `fromV1`, so the shape always matches the current schema.
- `functions/api/image.js` — media library in KV: `POST` (admin, ≤5 MB) store bytes →
  `{id,url}`; `GET ?id=` (public) serve with 1-year immutable cache; `GET ?list=1` (admin)
  index; `DELETE ?id=` (admin). Index key `media:index` (capped 500).
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
