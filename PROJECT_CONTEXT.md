# Current work

Homepage hero v0.24.1 expands only the hero canvas to 1280px. At the single-column breakpoint, the
headline cap grows from 18ch to 24ch and the portrait may grow from 440px to 560px. Supporting
copy and all non-hero section widths remain unchanged.

Preview galleries v0.24.0 appear consistently on Home, Media Work, and Dev Work. Each card keeps its
representative image first and can store up to three additional preview frames. Hover and keyboard
focus trigger the slow crossfade; touch and reduced-motion contexts keep the representative frame.
The admin exposes representative and preview images separately, with add, remove, and reorder controls;
matching Home and full-page rows synchronize by project ID.
Schema v41 carries the existing homepage galleries into the corresponding full-page work entries.

Homepage hero v0.22.3 replaces the abstract `I choose the right medium` claim with a visitor-centred
promise: people do not need to arrive with all the answers. The supporting copy states the concrete
value—listening, connecting disciplines, and staying through delivery and handover so the result can
be understood, used, and kept in use. Schema v39 migrates only the exact v38 hero copy.

Article detail pages v0.22.2 begin with one clear `View all articles` back button. Series chips are
index-level discovery controls and do not repeat inside published or scheduled article pages.

OG cards v0.22.1 correct the careless floating domain treatment: the URL no longer sits on the
bottom edge of photo or symbol panes. Identity and domain are grouped in a deliberate top-left
brand lockup, and isolated HTML/CSS browser rendering prevents partial text paint during generation.

OG cards v0.22.0 replace the earlier M3-inspired artwork with a token-based Material 3 system:
Google Sans Flex, official Material Symbols, M3 type hierarchy, color roles, spacing and shapes.
The deterministic generator verifies the required fonts before capture. Versioned image URLs force
social crawlers to request the revised files instead of reusing the v0.21.0 cache.

Social previews v0.21.0 replace the single site-wide image with distinct 1200×630 cards for the
seven main pages and the twelve current articles. Article image URL and alt text are part of the
Insights post schema and admin editor; live and scheduled detail pages show the image, while only
live articles expose Facebook and LinkedIn share buttons. Open Graph, Twitter Card and BlogPosting
metadata use the same canonical representative image. Scheduled bodies remain private.

Articles v0.20.0 separates published and future-scheduled writing, provides newest/oldest published
ordering, and paginates each collection independently at five items. Scheduled entries reveal only
metadata until exactly 9:00 AM KST on their date; draft entries remain private. The four-part
`The Work Behind the Work` series is scheduled for 28 and 30 September and 2 and 4 October 2026.

Homepage v0.19.0 / content schema v38 shifts the lead from a repeated service list to Jimmy Park's
personal method and evidence. The hero now says why his cross-medium range matters: he starts with
people and purpose, chooses the fitting medium, and carries work through as a finished film, working
platform or practical AI workflow. The former capability section now explains judgment, ownership,
range and contextual experience; the identity cards connect visitors to Articles instead of repeating
a hiring enquiry. Static HTML, runtime rendering and recognized v37 live CMS copy are aligned; custom
owner copy remains migration-protected.

JimmyPark.net is a static portfolio with Cloudflare Pages Functions and KV. The public writing area is labelled Articles while retaining stable `/insights` URLs and the remote `insights:v1` post store. It contains four published AX Series articles and four Message in Motion articles: Part 1 is published, while Parts 2–4 are scheduled for 22, 24 and 26 September 2026 at 9:00 AM KST. Scheduled article pages expose the title and summary but withhold the body until publication. Article pages have a desktop-only linked contents rail, a clear return-to-all-articles button, a human-first discussion CTA, and optional hashtag chips. Series filters and published-order controls live on the Articles index only. Mobile keeps the uninterrupted reading layout. A public `/sitemap` page and the XML sitemap index only public portfolio pages and published articles; saju, KOTMA, admin, and API routes remain excluded. Public copy and metadata now use a formal, practical, service-oriented tone grounded in collaboration, care, and Scouting values. The M3 interaction pass makes state layers visible above component surfaces, applies consistent keyboard focus to selects as well as other controls, and gives the Scouting CTA a full 40px M3 button target.

Global & Scouting should describe verifiable history, not personal claims: lead with dates, named roles, terms, event scopes, and supplied counts such as the 2003 start date and 19 countries/regions visited. Do not invent audience, reach, partnership, participation, financial, or impact metrics. The production CMS document may contain customized content and must be updated separately when changing public Scouting copy.

Scouting role names and Korean terminology follow `Claude_Memories/reference/scout-terminology-ko.md`; the owner-maintained roles record is `Claude_Memories/core/소속과-직함-2026.md`. Button QA uses `.checks/button-contrast.mjs`, which inspects all public portfolio routes at 1440px and 390px in headless Chrome, enforces visible 40px controls and verifies non-transparent button foreground/background contrast.

The separately built KOTMA static preview is temporarily mounted at `/kotma/`; `scripts/deploy-kotma-preview.sh` stages the portfolio plus the KOTMA export outside both repositories before deploying to the existing Pages project. Unknown KOTMA content routes use its temporary page through middleware; missing KOTMA assets remain real 404s. No generated KOTMA files are committed here. Read `README.md`, `CLAUDE.md`, `functions/api/_posts.js`, and `scripts/deploy-kotma-preview.sh` when resuming.
