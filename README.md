# JimmyPark.net — Jimmy Park / 박지민

Personal profile site: Photographer · Videographer · Scout · Builder.
Clean, modern, warm-minimal. English-first with Korean support. Burgundy `#7a1e2c`
accent, Scouting green `#2f5a45` sub-accent. **Vanilla HTML/CSS/JS — no build step.**

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
```

## How it works
- Public pages render full static content (good for SEO / no-JS). `site.js` enhances
  (nav, mobile menu, copy-to-clipboard, gallery modal) and applies admin overrides
  fetched from `/api/content` (SEO title/desc, contact email/phone/LinkedIn/location,
  hero image).
- Admin (`/admin`) logs in with a **6-digit TOTP** code (authenticator app), gets a
  12h signed session, and edits Contact / SEO / Hero image + a Media Library (uploads
  auto-resized to ≤1600px JPEG). 30-min idle auto sign-out.

## Deploy (Cloudflare Pages)
1. Connect this repo to a Pages project (build output dir = repo root, no build cmd).
2. Create the KV namespace and paste its id into `wrangler.toml`:
   `wrangler kv namespace create JP_KV`
3. Set env var **`TOTP_SECRET`** (base32) in Pages → Settings → Environment variables,
   and register the same secret in your authenticator app.
4. Add custom domain **jimmypark.net**.

Or deploy from CLI:
`wrangler pages deploy . --project-name jimmypark-net --branch main`
