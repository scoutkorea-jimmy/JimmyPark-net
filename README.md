# JimmyPark.net — Jimmy Park

Personal portfolio: Content Strategist · AI Practitioner · AX Consultant · Global Collaborator.
Clean, modern, warm-minimal. English-only. Burgundy `#7a1e2c`
accent, with a purple `#622599` theme on Global & Scouting. **Vanilla HTML/CSS/JS — no build step.**
Wanted Sans Variable is the default typeface, with Pretendard/system fallbacks.

The home page leads with four capabilities, connects each to supporting work, and
places dated international roles alongside the projects. Work covers content
strategy, AI prototypes, AX consulting/workshops, and field production. The existing
`/scouting` route presents the global network through concrete Scouting experience.
AX is an offered collaboration scope; no client outcomes or productivity metrics
are claimed. Existing prototype maturity labels are preserved.

Content schema v6 adds owner-supplied video credits, the ongoing photography folder, and
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
admin.html      Hidden admin (/admin · noindex)
assets/         site.css · site.js (public) · admin.js · img/ (favicon, og)
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
```

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
node .checks/content.cjs
git diff --check
```
The check uses Python 3 and Node only. It verifies layout rules, shared shell, links/assets and
static/runtime collection parity without network requests or KV writes. Also visually review
changed layouts at desktop, tablet and narrow mobile widths.

## Deploy (Cloudflare Pages)
1. Connect this repo to a Pages project (build output dir = repo root, no build cmd).
2. Create the KV namespace and paste its id into `wrangler.toml`:
   `wrangler kv namespace create JP_KV`
3. Set env var **`TOTP_SECRET`** (base32) in Pages → Settings → Environment variables,
   and register the same secret in your authenticator app.
4. Add custom domain **jimmypark.net**.

Or deploy from CLI:
`wrangler pages deploy . --project-name jimmypark-net --branch main`
