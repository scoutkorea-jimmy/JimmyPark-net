import { json, isAdmin } from "./_lib.js";

// Full-site content document (KV key "content"). Public pages render their baked-in
// static seed first (SEO / no-JS), then site.js overrides from this document. The
// admin (TOTP) edits and writes it. DEFAULT mirrors the static seed content so an
// empty site and a fresh admin start identical. The site is English-only.
const KEY = "content";
const MAXSTR = 4000;   // per string field
const MAXARR = 60;     // per collection
const HANGUL = /[가-힣]/;

// ── helpers to keep DEFAULT compact ─────────────────────────────────────────
const link = (label, href) => ({ label, href });

const DEFAULT = {
  "version": 21,
  "global": {
    "brand": {
      "name": "Jimmy Park",
      "roleline": "Video · Education · AI · Global Scouting"
    },
    "footer": {
      "tagline": "VIDEO. EDUCATION. AI. · BUILT FOR CONNECTION.",
      "copyright": "© 2026 Jimmy Park"
    },
    "contact": {
      "email": "scoutkorea@kakao.com",
      "phone": "+82 10.5418.6124",
      "linkedin": "https://www.linkedin.com/in/jimmy1420",
      "location": "Korea · Korean / English"
    },
    "seo": {
      "title": "Jimmy Park (박지민) | Video, Education & AI",
      "desc": "Jimmy Park (박지민) makes video, builds learning experiences, and applies AI — branded films, education platforms, AI workflows and AX workshops, plus global Scouting collaboration."
    }
  },
  "pages": {
    "home": {
      "meta": {
        "title": "Jimmy Park (박지민) | Video, Education & AI",
        "desc": "Jimmy Park (박지민) makes video, builds learning experiences, and applies AI — branded films, education platforms, AI workflows and AX workshops, plus global Scouting collaboration."
      },
      "order": [
        "hero",
        "selected",
        "activities",
        "snapshot",
        "projects",
        "approach",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "hero": {
          "eyebrow": "Video · Education · AI",
          "title": "Video that lands.\nLearning that scales.\nAI that works.",
          "lead": "I’m Jimmy Park — branded-film director & producer, education-platform founder, and applied-AI practitioner. Production-grade storytelling, learning products with real users, and AI workflows teams keep using.",
          "ctaPrimary": {
            "label": "Start a conversation",
            "href": "/contact"
          },
          "ctaGhost": {
            "label": "See selected work",
            "href": "#selected"
          },
          "image": "/assets/img/jimmy-park-portrait-960.jpg?v=0.14.0",
          "badge": "Jimmy Park",
          "caption": "Film · Learning platforms · AI workflows",
          "captionRight": "Based in Korea"
        },
        "snapshot": {
          "rows": [
            {
              "label": "Content & media",
              "value": "BP Media · Founder, 2026–"
            },
            {
              "label": "Education",
              "value": "Korea Dream Path · CEO"
            },
            {
              "label": "Asia-Pacific",
              "value": "Communications & Partnerships · 2nd Vice Chair, 2025–2028"
            },
            {
              "label": "International fieldwork",
              "value": "25th World Scout Jamboree · Korean Contingent Media, 2023"
            },
            {
              "label": "Based in",
              "value": "Korea · Korean / English"
            }
          ],
          "eyebrow": "About Jimmy Park",
          "title": "Who is Jimmy Park?",
          "body": "Jimmy Park (박지민, Park Jimin) is a Korea-based video producer, education platform builder, and AI practitioner. He creates branded films and storytelling content, leads Korea Dream Path as CEO, founded BP Media, and helps teams apply AI workflows and AX in real projects — alongside international Scouting collaboration.",
          "detail": "His work spans technology films, educational web series and event media, plus live learning platforms and sites for global education, Scouting media, a food cooperative, after-school program administration and a travel community. He works in Korean and English; project credits and dated Scouting roles are listed on this site."
        },
        "activities": {
          "eyebrow": "How I can help",
          "title": "Video. Education. AI. Where should we start?",
          "items": [
            {
              "kicker": "01 / Video",
              "title": "Film & Branded Content",
              "desc": "Concept, script, filming and edit for films people remember — promotional films, keynotes, interviews and branded storytelling.",
              "tags": [
                "Branded films",
                "Keynotes",
                "Storytelling"
              ],
              "href": "/work",
              "accent": "burgundy"
            },
            {
              "kicker": "02 / Education",
              "title": "Learning Platforms & Teaching",
              "desc": "Learning experiences that travel — education platforms, workshops and teaching formats that help people discover, practice and grow.",
              "tags": [
                "Learning platforms",
                "Workshops",
                "Global education"
              ],
              "href": "/lecture",
              "accent": "burgundy"
            },
            {
              "kicker": "03 / AI",
              "title": "AI Workflows & AX",
              "desc": "Practical AI for everyday creation — review the workflow, pilot an AI-assisted path, and practice it hands-on with your team.",
              "tags": [
                "AI workflows",
                "AI-assisted creation",
                "AX workshops"
              ],
              "href": "/dev#lecture",
              "accent": "burgundy"
            },
            {
              "kicker": "04 / Global",
              "title": "Global Scouting & Collaboration",
              "desc": "When your project crosses borders: international Scouting experience, Asia-Pacific communications and cross-cultural partnerships.",
              "tags": [
                "Asia-Pacific",
                "Scouting",
                "Partnerships"
              ],
              "href": "/scouting#roles",
              "accent": "green"
            }
          ]
        },
        "approach": {
          "eyebrow": "How I work",
          "title": "Start with the story. Shape the learning. Ship with AI.",
          "steps": [
            {
              "num": "01",
              "title": "Listen",
              "desc": "Clarify who it is for, what should change, and what \"done\" looks like."
            },
            {
              "num": "02",
              "title": "Choose",
              "desc": "Pick the form that fits — a film, a learning experience, an AI workflow or a partnership."
            },
            {
              "num": "03",
              "title": "Build with AI",
              "desc": "Produce and prototype with AI-assisted creation, then test with the people who will use it."
            },
            {
              "num": "04",
              "title": "Hand over",
              "desc": "Deliver the film, platform or workflow with the guidance your team needs to keep going."
            }
          ]
        },
        "projects": {
          "eyebrow": "Stay connected",
          "title": "Network, background, and next roles.",
          "feature": {
            "badge": "Content strategy · Global Scouting",
            "sub": "Founder · Scouting media",
            "title": "BP Media",
            "desc": "A Scouting media platform bringing stories, events, and people into a shared editorial space. My work connects field documentation with content planning and international perspectives.",
            "href": "https://bpmedia.net",
            "image": "/assets/img/bp-media-card.jpg"
          },
          "items": [
            {
              "tag": "Professional network",
              "title": "Connect on LinkedIn",
              "desc": "For professional introductions, shared interests and future collaboration.",
              "href": "https://www.linkedin.com/in/jimmy1420",
              "image": ""
            },
            {
              "tag": "International collaboration",
              "title": "Global & Scouting",
              "desc": "My dated roles, international experience and Scouting media work.",
              "href": "/scouting",
              "image": ""
            },
            {
              "tag": "Roles & hiring",
              "title": "Hiring enquiries",
              "desc": "For employment or role discussions. I can share my CV and dated work history on request.",
              "href": "/contact#hiring",
              "image": ""
            }
          ]
        },
        "cta": {
          "title": "Have a film, platform, or AI idea?",
          "body": "Tell me what you want people to see, learn or ship — and when you need it. I’ll suggest a clear next step.",
          "button": {
            "label": "Start a conversation",
            "href": "/contact"
          }
        },
        "selected": {
          "eyebrow": "Selected work",
          "title": "Films, platforms, and AI in the field.",
          "sitesTitle": "Websites",
          "sites": [
            {
              "id": "korea-dream-path",
              "title": "Korea Dream Path",
              "format": "Own platform · Global education",
              "year": "2026",
              "role": "CEO · Planning & development",
              "summary": "Global education platform I lead as CEO — connecting young people worldwide with Korean higher education through learning pathways they can actually use.",
              "need": "One place where young people around the world can discover programs and scholarships and apply online.",
              "built": "Program and scholarship pages, an online application flow, member sign-up, news and stories, and an admin console for the team.",
              "stack": "Cloudflare Workers · KV · D1 · R2",
              "backend": "Edit every page of the site without code, with a live preview\nMove applicants through admission stages, with every change logged\nHandle company email, including attachments, inside the admin\nManage members, groups and role-based permissions, with two-factor sign-in for sensitive sections\nAnswer student inquiries and send notification campaigns\nFollow visitor journeys and catch errors on a monitoring dashboard",
              "stats": "50 admin tabs · 95 API routes · Encrypted personal data · Automatic data-retention clean-up",
              "href": "https://koreadreampath.com",
              "linkLabel": "Visit koreadreampath.com",
              "image": "/assets/img/dev/korea-dream-path.jpg",
              "mobileImage": "/assets/img/dev/korea-dream-path-mobile.jpg",
              "adminImage": "",
              "adminCaption": ""
            },
            {
              "id": "bp-media",
              "title": "BP Media",
              "format": "Own platform · Scouting media",
              "year": "2026",
              "role": "Founder · Planning & development",
              "summary": "Scouting media platform I founded — Korean-language storytelling covering Korea, the Asia-Pacific Region and world Scouting.",
              "need": "An independent home for Scouting news in Korean, with reference material that stays useful beyond the news cycle.",
              "built": "News boards with article pages and sharing, search, a Scout calendar, a glossary with a keyword chatbot, a memorabilia encyclopedia, card news, RSS and sitemaps.",
              "stack": "Cloudflare Pages Functions · D1 · Scheduled Workers",
              "backend": "Write articles in a block editor, keep drafts and schedule publishing\nControl the homepage, with the main story picked automatically each night from the month’s most-read articles\nManage the calendar, glossary, memorabilia, events and a card-news builder\nScore article quality with AI and keep a score history\nSee visits, tag insights and where readers come from\nGive team members menu-level permissions, with two-factor sign-in and a settings audit trail",
              "stats": "111 API routes · 76 database migrations · 3 scheduled jobs · 892 recorded releases",
              "href": "https://bpmedia.net",
              "linkLabel": "Visit bpmedia.net",
              "image": "/assets/img/dev/bp-media.jpg",
              "mobileImage": "/assets/img/dev/bp-media-mobile.jpg",
              "adminImage": "",
              "adminCaption": ""
            },
            {
              "id": "charmjt",
              "title": "Authentic Korean Traditional Fermented Foods Cooperative",
              "format": "Food cooperative · Official website",
              "year": "2026",
              "role": "Planning & development",
              "summary": "Official site for a traditional fermented-foods cooperative, including product pages built with AI-assisted creation.",
              "need": "One site where visitors can learn about fermentation education, apply for the instructor course and order the cooperative’s products.",
              "built": "Education and course-application pages, a product shop whose detail pages and product images were created with AI, guest order lookup, member accounts, a news board and an admin console.",
              "stack": "Cloudflare Pages Functions · D1 · R2",
              "backend": "Manage products, stock and orders from payment to shipping with tracking numbers\nHandle cancellations, returns and exchanges, with sales reports and CSV export\nRun course intakes, applicants and inquiries from one dashboard\nEdit page text and photos in place, with PC and mobile previews\nGive staff accounts role-based permissions\nKeep automatic daily backups and ask a help chatbot that answers from the manual",
              "stats": "AI-made product detail pages · Server-checked order totals · Guest order lookup · AI help chatbot",
              "href": "https://charmjt.org",
              "linkLabel": "Visit charmjt.org",
              "image": "/assets/img/dev/charmjt.jpg",
              "mobileImage": "/assets/img/dev/charmjt-mobile.jpg",
              "adminImage": "/assets/img/dev/charmjt-admin.jpg",
              "adminCaption": "Admin dashboard in local demo mode, with no customer data."
            }
          ],
          "casesTitle": "Films",
          "cases": [
            {
              "id": "samsung-keynote",
              "title": "Samsung Tech Conference 2025",
              "year": "2025",
              "role": "Planning, Direction, Filming & Editing",
              "desc": "Keynote films that blend presenter footage, chroma key and presentation graphics into clear tech storytelling.",
              "href": "https://drive.google.com/drive/folders/1IwaEHy3QLIeYCXLcSPlfMnP-hgoZ9s6g",
              "image": "/assets/img/video/samsung-keynote.jpg",
              "format": "Technology · Keynote videos",
              "linkLabel": "View video collection"
            },
            {
              "id": "ai2re",
              "title": "AI2RE by SPAID",
              "year": "2025",
              "role": "Planning & Direction Lead",
              "desc": "Promotional film for AI2RE’s CES Innovation Award — tight storytelling for a technology brand moment.",
              "href": "https://www.youtube.com/watch?v=OmnvbFs-6Ws",
              "image": "https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg",
              "format": "Technology · Promotional film",
              "linkLabel": "Watch film"
            },
            {
              "id": "daekyo",
              "title": "Daekyo Newif · Jangsuhae",
              "year": "2024",
              "role": "Direction, Production & Editing Lead",
              "desc": "Branded TV commercial for Daekyo Newif’s Jangsuhae deep-sea water.",
              "href": "https://www.youtube.com/watch?v=DJcwT3V79B0",
              "image": "https://i.ytimg.com/vi/DJcwT3V79B0/hqdefault.jpg",
              "format": "Brand · TV commercial",
              "linkLabel": "Watch film"
            }
          ]
        }
      }
    },
    "work": {
      "meta": {
        "title": "Media Work: Video Production & Photography | Jimmy Park",
        "desc": "Explore Jimmy Park’s media work: keynote videos, promotional films, branded series and event films with credited roles, plus press-ready field photography."
      },
      "order": [
        "intro",
        "video",
        "photography",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Media work",
          "title": "Video production\nand field photography.",
          "lead": "Explore video production credits and field photography, from the brief and script to filming, editing and press-ready images."
        },
        "photography": {
          "kicker": "02 / Field production",
          "title": "Photography & Field Media",
          "sub": "Field documentation for immediate use",
          "desc": "I focus on event sketches, field documentation, and press-ready photography. The goal is not only to take good photos, but to prepare images that can be used quickly and clearly.",
          "deliverables": [
            {
              "text": "Event sketch · speaker & participant photos"
            },
            {
              "text": "Press-ready selections · atmosphere shots"
            },
            {
              "text": "Same-day basic edits · purpose-based sorting"
            }
          ],
          "usefulFor": [
            {
              "text": "Press"
            },
            {
              "text": "SNS"
            },
            {
              "text": "Card news"
            },
            {
              "text": "Report"
            },
            {
              "text": "Archive"
            }
          ],
          "caption": "Event documentation · press-ready selection · same-day delivery",
          "image": "",
          "portfolio": {
            "label": "Explore my photography portfolio",
            "href": "https://drive.google.com/drive/folders/1XE1JhGKa6l0uvWVANd-9_h2QIQwmrkY0"
          },
          "portfolioNote": "An ongoing collection of my photography, updated with new work."
        },
        "video": {
          "kicker": "01 / Content strategy",
          "title": "Content Strategy & Video Production",
          "sub": "From the brief to the finished film",
          "desc": "I turn a communication brief into a content plan and finished video: concept, script, direction, filming and editing. The credits below show my role on each project.",
          "formats": [
            {
              "name": "Promotion",
              "desc": "For institutions, brands, projects"
            },
            {
              "name": "Event Film",
              "desc": "For records and highlights"
            },
            {
              "name": "Interview",
              "desc": "For people-centered stories"
            },
            {
              "name": "IR / PR",
              "desc": "For institutional communication"
            },
            {
              "name": "Campaign",
              "desc": "For message-driven content"
            },
            {
              "name": "Short-form",
              "desc": "For social media distribution"
            }
          ],
          "caption": "Content planning · Production · Distribution",
          "casesTitle": "Selected video work",
          "cases": [
            {
              "id": "samsung-keynote",
              "title": "Samsung Tech Conference 2025",
              "year": "2025",
              "role": "Planning, Direction, Filming & Editing",
              "desc": "Keynote films that blend presenter footage, chroma key and presentation graphics into clear tech storytelling.",
              "href": "https://drive.google.com/drive/folders/1IwaEHy3QLIeYCXLcSPlfMnP-hgoZ9s6g",
              "image": "/assets/img/video/samsung-keynote.jpg",
              "format": "Technology · Keynote videos",
              "linkLabel": "View video collection"
            },
            {
              "id": "ai2re",
              "title": "AI2RE by SPAID",
              "year": "2025",
              "role": "Planning & Direction Lead",
              "desc": "Promotional film for AI2RE’s CES Innovation Award — tight storytelling for a technology brand moment.",
              "href": "https://www.youtube.com/watch?v=OmnvbFs-6Ws",
              "image": "https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg",
              "format": "Technology · Promotional film",
              "linkLabel": "Watch film"
            },
            {
              "id": "manas",
              "title": "MANAS — Intelligent Navigation Support System",
              "year": "2024",
              "role": "Planning & Direction Lead",
              "desc": "A promotional film created for use at SMM in Hamburg, Germany.",
              "href": "https://www.youtube.com/watch?v=As1BN53BpFY",
              "image": "https://i.ytimg.com/vi/As1BN53BpFY/hqdefault.jpg",
              "format": "Maritime technology · Exhibition",
              "linkLabel": "Watch film"
            },
            {
              "id": "daekyo",
              "title": "Daekyo Newif · Jangsuhae",
              "year": "2024",
              "role": "Direction, Production & Editing Lead",
              "desc": "Branded TV commercial for Daekyo Newif’s Jangsuhae deep-sea water.",
              "href": "https://www.youtube.com/watch?v=DJcwT3V79B0",
              "image": "https://i.ytimg.com/vi/DJcwT3V79B0/hqdefault.jpg",
              "format": "Brand · TV commercial",
              "linkLabel": "Watch film"
            },
            {
              "id": "d-hack",
              "title": "D-Hack × Sisa Japanese",
              "year": "2021",
              "role": "Planning & Direction",
              "desc": "A Japanese-learning web entertainment series featuring D-Hack.",
              "href": "https://drive.google.com/drive/folders/1oss4rQepxf1_Bi1ryEBJyThOrAzhZeIh",
              "image": "/assets/img/video/d-hack.jpg",
              "format": "Education · Web series",
              "linkLabel": "View series"
            },
            {
              "id": "siheung",
              "title": "Siheung Policy EZ",
              "year": "2021",
              "role": "Planning, Direction, Filming & Editing",
              "desc": "A policy information series using presenter footage, chroma key and motion graphics.",
              "href": "https://drive.google.com/drive/folders/14K3KOWnmX50TZKDFmjr4isRzpRZs6SmO",
              "image": "/assets/img/video/siheung.jpg",
              "format": "Public communication · Video series",
              "linkLabel": "View series"
            },
            {
              "id": "kb-life",
              "title": "KB Life · Hashtag Interviews",
              "year": "",
              "role": "Lead Filming & Editing",
              "desc": "A branded interview series sharing people’s stories and perspectives on life.",
              "href": "https://www.youtube.com/playlist?list=PL7K0gdyN-9BQjyWAFqmtk9vfBv8qwmyuE",
              "image": "/assets/img/video/kb-life.jpg",
              "format": "Brand · Interview series",
              "linkLabel": "View playlist"
            },
            {
              "id": "korean-jamboree-opening",
              "title": "16th Korea National Jamboree · Opening Ceremony",
              "year": "2026",
              "role": "AI, Planning & Editing",
              "desc": "Opening-ceremony video work combining AI, planning and editing.",
              "href": "https://drive.google.com/file/d/16a40q_FxOuc2uRkgvGlNhAWhrSeogo-W/view",
              "image": "/assets/img/video/korean-jamboree-opening.jpg",
              "format": "Scouting · Opening film",
              "linkLabel": "Watch film"
            },
            {
              "id": "military-concert",
              "title": "12th Infantry Division · 69th Anniversary Concert",
              "year": "2021",
              "role": "Video Direction, Filming & Editing Lead",
              "desc": "Military band concert film for the division’s 69th anniversary.",
              "href": "https://youtu.be/36-q294zBtQ",
              "image": "/assets/img/video/concert.jpg",
              "format": "Live event · Concert",
              "linkLabel": "Watch film"
            },
            {
              "id": "inha-mun",
              "title": "Inha Model United Nations",
              "year": "2019",
              "role": "Lead Filming & Editing",
              "desc": "Event sketch and closing film for the first Inha University Model UN.",
              "href": "https://youtu.be/HCb285yis9M",
              "image": "https://i.ytimg.com/vi/HCb285yis9M/hqdefault.jpg",
              "format": "University · Event film",
              "linkLabel": "Watch film"
            }
          ],
          "portfolio": {
            "label": "Explore the full video portfolio",
            "href": "https://drive.google.com/drive/folders/1502bMKOCZIbR0aUb8_AbHQPPLeg4ySJf"
          },
          "portfolioNote": "Keynotes, branded series, interviews, performance films and AI-assisted video."
        },
        "cta": {
          "title": "Have a film, an event or a campaign in mind?",
          "body": "Share the goal, the audience and what you need to deliver. We can plan the video or photography that fits.",
          "button": {
            "label": "Discuss a project",
            "href": "/contact"
          }
        }
      }
    },
    "dev": {
      "meta": {
        "title": "Dev Work: Websites Built Fast with AI | Jimmy Park",
        "desc": "Websites and web tools built around what clients actually need and delivered fast with AI, including Korea Dream Path, BP Media, a fermented-foods cooperative, the nfee reporting service and the BANGINOJA travel community."
      },
      "order": [
        "intro",
        "sites",
        "vibecoding",
        "lecture",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Dev work",
          "title": "Understand the need fast.\nBuild it with AI.",
          "lead": "What matters most in development is not flashy technique. It is quickly understanding what you actually need and building exactly that. AI is what makes this possible: I work with it at every step, from shaping the idea to launching and running the site.",
          "principles": [
            {
              "num": "01",
              "title": "Needs before technique",
              "desc": "Start from what users and the team must be able to do, not from features that only look impressive."
            },
            {
              "num": "02",
              "title": "Fast judgement",
              "desc": "Turn a first conversation into a clear scope and a working first version quickly."
            },
            {
              "num": "03",
              "title": "AI at every step",
              "desc": "Planning, design, code, content and operations all run with AI, so a small team can launch a complete, working site."
            }
          ]
        },
        "sites": {
          "kicker": "01 / Websites",
          "title": "Live Websites",
          "sub": "Built around each organization’s need",
          "desc": "Each site began with what its users and team needed to do, and each runs on its own admin console and back end. Every one is live and in use.",
          "items": [
            {
              "id": "korea-dream-path",
              "title": "Korea Dream Path",
              "format": "Own platform · Global education",
              "year": "2026",
              "role": "CEO · Planning & development",
              "summary": "The global learning platform I lead as CEO, connecting young people worldwide with Korean higher education.",
              "need": "One place where young people around the world can discover programs and scholarships and apply online.",
              "built": "Program and scholarship pages, an online application flow, member sign-up, news and stories, and an admin console for the team.",
              "stack": "Cloudflare Workers · KV · D1 · R2",
              "backend": "Edit every page of the site without code, with a live preview\nMove applicants through admission stages, with every change logged\nHandle company email, including attachments, inside the admin\nManage members, groups and role-based permissions, with two-factor sign-in for sensitive sections\nAnswer student inquiries and send notification campaigns\nFollow visitor journeys and catch errors on a monitoring dashboard",
              "stats": "50 admin tabs · 95 API routes · Encrypted personal data · Automatic data-retention clean-up",
              "href": "https://koreadreampath.com",
              "linkLabel": "Visit koreadreampath.com",
              "image": "/assets/img/dev/korea-dream-path.jpg",
              "mobileImage": "/assets/img/dev/korea-dream-path-mobile.jpg",
              "adminImage": "",
              "adminCaption": ""
            },
            {
              "id": "bp-media",
              "title": "BP Media",
              "format": "Own platform · Scouting media",
              "year": "2026",
              "role": "Founder · Planning & development",
              "summary": "The Korean-language Scouting news platform I founded, covering Korea, the Asia-Pacific Region and world Scouting.",
              "need": "An independent home for Scouting news in Korean, with reference material that stays useful beyond the news cycle.",
              "built": "News boards with article pages and sharing, search, a Scout calendar, a glossary with a keyword chatbot, a memorabilia encyclopedia, card news, RSS and sitemaps.",
              "stack": "Cloudflare Pages Functions · D1 · Scheduled Workers",
              "backend": "Write articles in a block editor, keep drafts and schedule publishing\nControl the homepage, with the main story picked automatically each night from the month’s most-read articles\nManage the calendar, glossary, memorabilia, events and a card-news builder\nScore article quality with AI and keep a score history\nSee visits, tag insights and where readers come from\nGive team members menu-level permissions, with two-factor sign-in and a settings audit trail",
              "stats": "111 API routes · 76 database migrations · 3 scheduled jobs · 892 recorded releases",
              "href": "https://bpmedia.net",
              "linkLabel": "Visit bpmedia.net",
              "image": "/assets/img/dev/bp-media.jpg",
              "mobileImage": "/assets/img/dev/bp-media-mobile.jpg",
              "adminImage": "",
              "adminCaption": ""
            },
            {
              "id": "charmjt",
              "title": "Authentic Korean Traditional Fermented Foods Cooperative",
              "format": "Food cooperative · Official website",
              "year": "2026",
              "role": "Planning & development",
              "summary": "The official website of a traditional fermented-foods cooperative, with product detail pages made with AI.",
              "need": "One site where visitors can learn about fermentation education, apply for the instructor course and order the cooperative’s products.",
              "built": "Education and course-application pages, a product shop whose detail pages and product images were created with AI, guest order lookup, member accounts, a news board and an admin console.",
              "stack": "Cloudflare Pages Functions · D1 · R2",
              "backend": "Manage products, stock and orders from payment to shipping with tracking numbers\nHandle cancellations, returns and exchanges, with sales reports and CSV export\nRun course intakes, applicants and inquiries from one dashboard\nEdit page text and photos in place, with PC and mobile previews\nGive staff accounts role-based permissions\nKeep automatic daily backups and ask a help chatbot that answers from the manual",
              "stats": "AI-made product detail pages · Server-checked order totals · Guest order lookup · AI help chatbot",
              "href": "https://charmjt.org",
              "linkLabel": "Visit charmjt.org",
              "image": "/assets/img/dev/charmjt.jpg",
              "mobileImage": "/assets/img/dev/charmjt-mobile.jpg",
              "adminImage": "/assets/img/dev/charmjt-admin.jpg",
              "adminCaption": "Admin dashboard in local demo mode, with no customer data."
            },
            {
              "id": "nfee",
              "title": "nfee",
              "format": "Education administration · Web service",
              "year": "2026",
              "role": "Planning & development",
              "summary": "A reporting service for after-school program instructors.",
              "need": "Instructors who are not used to computers had to file program reports and fee claims in fixed A4 formats, and administrators had to review them.",
              "built": "A step-by-step writing flow, print-ready A4 forms, school confirmation links with signatures and an administrator review console.",
              "stack": "Cloudflare Pages Functions · D1",
              "backend": "Review submitted reports in their original A4 form and request fixes one by one or in bulk\nApprove monthly fee claims\nDownload the month’s results as CSV or print every submission to PDF in one click\nApprove sign-ups and search members with masked contact details\nReview access logs and handle personal-data requests\nRestore from a full change history, see yearly statistics and read anonymous feedback",
              "stats": "One security gate for every request · Tamper-proof, encrypted access logs · 300+ automated tests",
              "href": "https://nfee.app",
              "linkLabel": "Visit nfee.app",
              "image": "/assets/img/dev/nfee.jpg",
              "mobileImage": "/assets/img/dev/nfee-mobile.jpg",
              "adminImage": "/assets/img/dev/nfee-admin.jpg",
              "adminCaption": "Admin console in the demo build, with sample data only."
            },
            {
              "id": "banginoja",
              "title": "BANGINOJA",
              "format": "Travel community · Korean history & culture",
              "year": "2026",
              "role": "Planning & development",
              "summary": "A travel community for exploring Korea’s history, culture and nature.",
              "need": "A home for a travel community’s tours, lectures and history writing, where members can join in and talk.",
              "built": "Tour and lecture pages, history columns, a members’ community board and an admin console.",
              "stack": "React · Cloudflare Workers · D1 · R2",
              "backend": "Publish history columns as drafts, scheduled or live posts\nRun lectures and tours with sign-ups, payment checks and reviews\nSell books with order, shipping and refund handling\nManage a guesthouse booking system: rooms, rates, availability and coupons\nModerate the community with a report queue and automatic member grades\nWatch analytics, audit and error logs, and manage search-engine settings",
              "stats": "143 API handlers · About 40 database tables · 368 recorded releases",
              "href": "https://bgnj.net",
              "linkLabel": "Visit bgnj.net",
              "image": "/assets/img/dev/banginoja.jpg",
              "mobileImage": "/assets/img/dev/banginoja-mobile.jpg",
              "adminImage": "",
              "adminCaption": ""
            }
          ]
        },
        "vibecoding": {
          "kicker": "02 / AI practice",
          "title": "Applied AI & Web Prototyping",
          "sub": "Practical tools, built around a clear need",
          "desc": "I use AI-assisted development to turn practical ideas into working web tools. These projects demonstrate how I organize information, design user flows and test useful digital services.",
          "items": [
            {
              "slug": "scout-tour-assistant",
              "title": "Scout Tour Assistant",
              "desc": "A map for finding Scout units, national offices and heritage sites near a chosen location.",
              "status": "Live",
              "accent": "green",
              "image": "",
              "href": "https://scoutingapp.net/tour/"
            },
            {
              "slug": "k-trainradar24",
              "status": "Live",
              "accent": "burgundy",
              "title": "K-TrainRadar24",
              "desc": "A map that estimates train positions across South Korea using published timetables and public rail data.",
              "href": "https://scoutingapp.net/ktrainrader24/",
              "image": ""
            }
          ]
        },
        "lecture": {
          "kicker": "03 / AI transformation",
          "title": "AI Workflow Consulting & Workshops",
          "sub": "Focused pilots and hands-on practice",
          "desc": "AX means AI transformation: applying AI to everyday work. I offer workflow reviews, focused pilot planning and hands-on workshops built around content production and web prototyping.",
          "topics": [
            {
              "name": "Workflow review",
              "desc": "Map recurring tasks, handoffs, and opportunities where AI could help."
            },
            {
              "name": "Pilot planning",
              "desc": "Choose one use case, define a useful output, and agree how to review it."
            },
            {
              "name": "AI workshops",
              "desc": "Practice turning a real content or web idea into a working prototype."
            },
            {
              "name": "Field & youth media",
              "desc": "Workshops on documentation, photography, Scouting, and international communication."
            }
          ]
        },
        "cta": {
          "title": "Have a website, a tool or a workflow in mind?",
          "body": "Share the goal, the people who will use it and what it needs to do. We can scope the website, prototype or workshop that fits.",
          "button": {
            "label": "Discuss a project",
            "href": "/contact"
          }
        }
      }
    },

    "lecture": {
      "meta": {
        "title": "Lectures & Workshops | Jimmy Park",
        "desc": "Lectures and workshops by Jimmy Park on branded film, education, applied AI and Scouting communication — book a session for your team or event."
      },
      "order": [
        "intro",
        "talks",
        "topics",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Lecture",
          "title": "Lectures and workshops\nthat travel.",
          "lead": "Talks and hands-on sessions on branded film, education, applied AI and Scouting communication — shaped for the people in the room."
        },
        "talks": {
          "kicker": "01 / History",
          "title": "Lecture history",
          "sub": "Past talks and workshops",
          "desc": "A running list of lectures and workshops. Entries will appear here as they are added.",
          "items": []
        },
        "topics": {
          "kicker": "02 / Themes",
          "title": "Topics I speak on",
          "sub": "Themes that fit a lecture or workshop",
          "desc": "These are the themes I return to — not a schedule, just the ground I cover well.",
          "items": [
            {
              "name": "Branded film",
              "desc": "Story, craft and production for films people remember."
            },
            {
              "name": "Education",
              "desc": "Learning platforms and teaching formats that travel."
            },
            {
              "name": "Applied AI",
              "desc": "Practical AI workflows and hands-on AX practice."
            },
            {
              "name": "Scouting communication",
              "desc": "Field media, youth engagement and international messaging."
            }
          ]
        },
        "cta": {
          "title": "Invite a lecture or workshop",
          "body": "Share the audience, the theme and the format you have in mind. We can shape a talk or a hands-on session that fits.",
          "button": {
            "label": "Book a lecture",
            "href": "/contact"
          }
        }
      }
    },
    "scouting": {
      "meta": {
        "title": "Global Scouting & International Collaboration | Jimmy Park",
        "desc": "Explore Jimmy Park’s Scouting communications roles, Asia-Pacific collaboration, Korean Contingent Jamboree media work and international experience."
      },
      "order": [
        "hero",
        "roles",
        "international",
        "travel",
        "why",
        "stats",
        "mediaprojects",
        "timeline",
        "gallery",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "hero": {
          "eyebrow": "Global network · Scouting",
          "title": "Scouting, media and\ninternational collaboration.",
          "lead": "My international network grows through Scouting, Asia-Pacific communication and partnerships, and media work at global events.",
          "image": "/assets/img/scouting-main.jpg?v=0.10.0",
          "badge": "Scouting",
          "caption": "Scouting, communication and international connections."
        },
        "why": {
          "eyebrow": "The foundation of my network",
          "body": "Scouting is where I learned to work across cultures, understand different audiences, and build trust through shared projects. I bring that experience to content planning, international communication, and collaboration."
        },
        "stats": {
          "items": [
            {
              "value": "10+ Years",
              "label": "Scouting experience"
            },
            {
              "value": "Youth Movement",
              "label": "Growth & social impact"
            },
            {
              "value": "International Exchange",
              "label": "Global network"
            },
            {
              "value": "Media & Documentation",
              "label": "Records · communication"
            }
          ]
        },
        "roles": {
          "title": "Roles behind the relationships",
          "items": [
            {
              "title": "National Commissioner on PR II",
              "org": "Korea Scout Association",
              "period": "2022–2024",
              "accent": "neutral"
            },
            {
              "title": "APR Communication & Partnerships",
              "org": "2nd Vice Chair",
              "period": "2025–2028",
              "accent": "neutral"
            },
            {
              "title": "Deputy Head of Media · Korean Contingent",
              "org": "25th World Scout Jamboree",
              "period": "2023",
              "accent": "neutral"
            },
            {
              "title": "BP Media",
              "org": "Founder",
              "period": "2026–",
              "accent": "green"
            }
          ]
        },
        "international": {
          "title": "A network with a working context",
          "body": "World Scout Jamborees, Asia-Pacific regional activities, and international Scout networks connect me with people working in youth engagement, media, and partnerships. These relationships inform how I approach cross-cultural projects and communication.",
          "tags": [
            {
              "text": "World Scout Jamboree"
            },
            {
              "text": "APR Scouting"
            },
            {
              "text": "International Exchange"
            },
            {
              "text": "Media Operation"
            },
            {
              "text": "Youth Communication"
            }
          ]
        },
        "mediaprojects": {
          "title": "Scouting Media Projects",
          "feature": {
            "badge": "Flagship",
            "title": "BP Media",
            "desc": "A Scouting-specialized media platform documenting stories, events, people, and international movement.",
            "image": "/assets/img/bp-media-card.jpg"
          },
          "items": [
            {
              "title": "Scout Tour Assistant",
              "desc": "A map-based prototype for meaningful Scouting places, heritage sites, offices, and campsites."
            },
            {
              "title": "Jamboree Media Work",
              "desc": "Field media, documentation, and communication for large-scale Scouting events."
            }
          ]
        },
        "timeline": {
          "title": "A life in Scouting. A practice in communication.",
          "note": "From joining in 2003 to leadership, international communication and media projects.",
          "items": [
            {
              "year": "2003",
              "title": "Joined Scouting as a Scout",
              "context": "I started Scouting as a Scout, experiencing people and activities first-hand in the field.",
              "track": "Scout",
              "accent": "neutral"
            },
            {
              "year": "2012",
              "title": "Started Scouting media activities",
              "context": "While active as a Scout, I grew interested in documentation and communication, and began building toward Scouting media work.",
              "track": "Scout",
              "accent": "neutral"
            },
            {
              "year": "2014",
              "title": "Became a Scout Leader",
              "context": "I became a Scout Leader, moving into a role that guides and supports youth activities — built on my years as a Scout.",
              "track": "Leader",
              "accent": "green"
            },
            {
              "year": "2016–2017",
              "title": "World Scout Jamboree bid & related projects",
              "context": "I took part as a leader in the World Scout Jamboree bid and related projects.",
              "track": "Leader",
              "accent": "neutral"
            },
            {
              "year": "2022–2024",
              "title": "National Commissioner, Korea Scout Association",
              "context": "I served as National Commissioner of the Korea Scout Association, working on domestic Scouting activity and communication.",
              "track": "Leader",
              "accent": "green"
            },
            {
              "year": "2023",
              "title": "Korea Contingent Media, 25th World Scout Jamboree",
              "context": "I served as Deputy Director of the Media Department for the Korean Contingent at the 25th World Scout Jamboree.",
              "track": "Leader",
              "accent": "green"
            },
            {
              "year": "2025–2028",
              "title": "APR C&P Sub-Committee, 2nd Vice Chair",
              "context": "I serve as 2nd Vice Chair of the Asia-Pacific Region Communications & Partnerships Sub-Committee.",
              "track": "Leader",
              "accent": "green"
            },
            {
              "year": "2026–",
              "title": "BP Media",
              "context": "I run BP Media, a Scouting-specialized media platform.",
              "track": "Leader",
              "accent": "green"
            },
            {
              "year": "2026–",
              "title": "Scouting web experiments",
              "context": "I experiment with web projects such as Scout Tour Assistant to make Scouting places and information easier to explore.",
              "track": "Leader",
              "accent": "green"
            }
          ]
        },
        "gallery": {
          "title": "Field Gallery",
          "figs": [
            {
              "label": "International Meeting",
              "category": "Scouting field",
              "image": ""
            },
            {
              "label": "Jamboree",
              "category": "Scouting field",
              "image": ""
            },
            {
              "label": "Media Operation",
              "category": "Scouting field",
              "image": ""
            },
            {
              "label": "Scout Field",
              "category": "Scouting field",
              "image": ""
            },
            {
              "label": "Youth Activity",
              "category": "Scouting field",
              "image": ""
            }
          ]
        },
        "cta": {
          "title": "If the project is related to Scouting, youth, or international collaboration, let's talk.",
          "body": "Reach out and tell me the purpose — I'll suggest where to take it.",
          "button": {
            "label": "Contact",
            "href": "/contact"
          }
        },
        "travel": {
          "eyebrow": "Global perspective",
          "title": "Places I’ve visited",
          "body": "Travel across Asia, the Middle East, Africa, and North America has given me first-hand experience of different places, people, and ways of life.",
          "countLabel": "countries & regions visited",
          "listLabel": "Explore countries & destinations",
          "items": [
            {
              "name": "Japan",
              "cities": "Osaka, Kyoto, Kobe, Nara"
            },
            {
              "name": "United States",
              "cities": "Los Angeles"
            },
            {
              "name": "China",
              "cities": "Beijing, Tianjin, Zhuhai"
            },
            {
              "name": "Taiwan",
              "cities": "Taipei, Taichung, Kaohsiung"
            },
            {
              "name": "Hong Kong",
              "cities": ""
            },
            {
              "name": "Macau",
              "cities": ""
            },
            {
              "name": "Vietnam",
              "cities": "Hanoi, Hai Phong"
            },
            {
              "name": "Thailand",
              "cities": "Bangkok"
            },
            {
              "name": "Malaysia",
              "cities": "Kuala Lumpur"
            },
            {
              "name": "Bangladesh",
              "cities": "Jamalpur, Jajira"
            },
            {
              "name": "India",
              "cities": "Mumbai"
            },
            {
              "name": "Nepal",
              "cities": "Kathmandu, Bidur, Trishuli"
            },
            {
              "name": "Oman",
              "cities": "Muscat"
            },
            {
              "name": "Qatar",
              "cities": "Doha"
            },
            {
              "name": "Bahrain",
              "cities": ""
            },
            {
              "name": "United Arab Emirates",
              "cities": "Dubai"
            },
            {
              "name": "Kuwait",
              "cities": "Kuwait City"
            },
            {
              "name": "South Africa",
              "cities": "Cape Town, Gqeberha (Port Elizabeth)"
            },
            {
              "name": "Mongolia",
              "cities": "Ulaanbaatar"
            }
          ]
        }
      }
    },
    "contact": {
      "meta": {
        "title": "Contact Jimmy Park | Video, Education & AI",
        "desc": "Contact Jimmy Park by email or phone (+82). Share your brief for video, learning platforms, AI workflows or global collaboration."
      },
      "order": [
        "intro"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Contact",
          "title": "Tell me what you need\nto achieve.",
          "lead": "Email is the fastest way to reach me. Share your goal and I’ll suggest the most fitting way to get there, whether that is a film, a website, an AI workflow or an international connection."
        }
      }
    }
  },
  "updatedAt": 0
};

// ── generic validator: use DEFAULT as the schema, clamp strings/arrays ────────
const LECTURE_TALK_SHAPE = { year: "", title: "", org: "", role: "", summary: "", href: "" };

function sanitize(def, val) {
  if (typeof def === "string") return val == null ? def : String(val).slice(0, MAXSTR);
  if (typeof def === "number") { const n = Number(val); return Number.isFinite(n) ? n : def; }
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return JSON.parse(JSON.stringify(def));
    const tmpl = def.length ? def[0] : null;
    if (tmpl && typeof tmpl === "object" && tmpl !== null && !Array.isArray(tmpl)) {
      return val.slice(0, MAXARR).map((item) => sanitize(tmpl, item));
    }
    if (typeof tmpl === "string") {
      return val.slice(0, MAXARR).map((item) => String(item == null ? "" : item).slice(0, MAXSTR));
    }
    // Empty DEFAULT collections (e.g. lecture talks): keep object rows so admin can grow the list.
    return val.slice(0, MAXARR).map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        // Prefer the known lecture-talk shape when keys align; otherwise keep stringish fields.
        const keys = Object.keys(item);
        if (keys.length && keys.every((k) => k in LECTURE_TALK_SHAPE)) return sanitize(LECTURE_TALK_SHAPE, item);
        const out = {};
        for (const k of keys) {
          const v = item[k];
          if (typeof v === "string") out[k] = v.slice(0, MAXSTR);
          else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
          else if (v == null) out[k] = "";
          else out[k] = String(v).slice(0, MAXSTR);
        }
        return out;
      }
      return String(item == null ? "" : item).slice(0, MAXSTR);
    });
  }
  if (def && typeof def === "object") {
    const out = {};
    for (const k of Object.keys(def)) out[k] = sanitize(def[k], val ? val[k] : undefined);
    return out;
  }
  return def;
}

// Map a v1 doc ({seo, contact, hero}) onto the defaults so old data survives.
function fromV1(doc) {
  const out = JSON.parse(JSON.stringify(DEFAULT));
  if (doc.seo) { out.global.seo = { ...out.global.seo, ...doc.seo }; out.pages.home.meta = { ...out.pages.home.meta, ...doc.seo }; }
  if (doc.contact) out.global.contact = { ...out.global.contact, ...doc.contact };
  if (doc.hero && doc.hero.image) out.pages.home.sections.hero.image = String(doc.hero.image).slice(0, MAXSTR);
  return out;
}

// Merge any section ids that exist in DEFAULT but are missing from a saved order,
// inserting each right after its DEFAULT predecessor (so a new section lands in its
// intended slot, e.g. "lecture" before "cta", instead of being appended at the end).
function mergeOrder(defOrder, saved) {
  const seen = {};
  const out = (Array.isArray(saved) ? saved : [])
    .filter((x) => defOrder.indexOf(x) >= 0 && !seen[x] && (seen[x] = 1));
  defOrder.forEach((id, i) => {
    if (out.indexOf(id) >= 0) return;
    let pos = 0;
    for (let j = i - 1; j >= 0; j--) { const p = out.indexOf(defOrder[j]); if (p >= 0) { pos = p + 1; break; } }
    out.splice(pos, 0, id);
  });
  return out;
}

// v2 → v3: scouting timeline reworked into Scout / Leader tracks and moved up in the
// page order. Re-seed only if the saved timeline is still the old track-less shape.
function migrateTo3(doc) {
  try {
    const sc = doc.pages && doc.pages.scouting;
    if (sc && sc.sections) {
      const tl = sc.sections.timeline;
      const stale = !tl || !Array.isArray(tl.items) || !tl.items.some((it) => it && it.track);
      if (stale) {
        sc.sections.timeline = JSON.parse(JSON.stringify(DEFAULT.pages.scouting.sections.timeline));
        // Keep a saved custom order; normalizeOrders inserts any new sections.
      }
    }
  } catch (_) {}
  doc.version = 3;
  return doc;
}

// v3 → v4: the site is now English-only. Removed *Ko fields are dropped automatically by
// sanitize() (it only keeps keys present in DEFAULT). For any string still containing
// Hangul, swap in the English DEFAULT value at the same path (arrays matched by index),
// or strip the Korean if there's no English default. This preserves non-Korean edits
// (e.g. uploaded images) while guaranteeing no Korean text reaches the live site.
function dekoreanize(def, val) {
  if (Array.isArray(def) && Array.isArray(val)) {
    val.forEach((item, i) => {
      const d = def[i] != null ? def[i] : def[0];
      if (item && typeof item === "object" && d && typeof d === "object") dekoreanize(d, item);
      else if (typeof item === "string" && HANGUL.test(item)) val[i] = typeof d === "string" ? d : item.replace(/[가-힣]/g, "").trim();
    });
    return;
  }
  if (def && typeof def === "object" && val && typeof val === "object") {
    for (const k of Object.keys(val)) {
      const dv = def[k];
      if (typeof val[k] === "string") {
        if (HANGUL.test(val[k])) val[k] = typeof dv === "string" ? dv : val[k].replace(/[가-힣]/g, "").replace(/\s*·\s*$/, "").replace(/^\s*·\s*/, "").trim();
      } else if (val[k] && typeof val[k] === "object" && dv && typeof dv === "object") {
        dekoreanize(dv, val[k]);
      }
    }
  }
}
function migrateTo4(doc) {
  try { dekoreanize(DEFAULT, doc); } catch (_) {}
  doc.version = 4;
  return doc;
}

// v4 → v5: update only unchanged legacy seed values. Uploaded images, custom
// copy, contact details, visibility and custom section orders remain intact.
// Rows whose purpose changes migrate atomically, avoiding mixed old/new meanings.
// This runs in memory on read; KV is written only by an explicit admin save.
const V5_LEGACY = [
  [["global","brand","roleline"],"Photographer · Videographer · Scout · Builder"],
  [["global","contact","linkedin"],""],
  [["global","contact","location"],"Korea"],
  [["global","seo","title"],"Jimmy Park"],
  [["global","seo","desc"],"Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes."],
  [["pages","home","meta","title"],"Jimmy Park"],
  [["pages","home","meta","desc"],"Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes."],
  [["pages","home","order"],["hero","snapshot","activities","approach","projects","cta"]],
  [["pages","home","sections","hero","eyebrow"],"Photographer · Videographer · Scout · Builder"],
  [["pages","home","sections","hero","title"],"Jimmy Park"],
  [["pages","home","sections","hero","lead"],"I help turn a clear purpose into the right content, field execution, and working systems."],
  [["pages","home","sections","hero","ctaPrimary","label"],"View Work"],
  [["pages","home","sections","hero","ctaGhost","label"],"Contact"],
  [["pages","home","sections","hero","image"],""],
  [["pages","home","sections","hero","badge"],"On location"],
  [["pages","home","sections","hero","caption"],"Field documentation · Event media · Scouting"],
  [["pages","home","sections","hero","captionRight"],"Korea"],
  [["pages","home","sections","activities","eyebrow"],"What I Actually Do"],
  [["pages","home","sections","activities","title"],"Document → Produce → Connect → Build"],
  [["pages","home","sections","approach","eyebrow"],"How I Approach a Project"],
  [["pages","home","sections","approach","title"],"Tell me the purpose. I'll suggest the direction, then execute."],
  [["pages","home","sections","projects","title"],"A few things I've built"],
  [["pages","home","sections","projects","feature","badge"],"Scouting · Media · Content"],
  [["pages","home","sections","projects","feature","sub"],"BP Media platform"],
  [["pages","home","sections","projects","feature","desc"],"A Scouting-specialized media platform documenting stories, events, people, and international movement."],
  [["pages","home","sections","projects","feature","href"],"/scouting"],
  [["pages","home","sections","projects","items",0,"tag"],"Education · Strategy · Video"],
  [["pages","home","sections","projects","items",0,"desc"],"A Life Learning Initiative for education, youth growth, and global collaboration."],
  [["pages","home","sections","projects","items",0,"href"],"/work"],
  [["pages","home","sections","projects","items",1,"tag"],"Scouting · Web Prototype"],
  [["pages","home","sections","projects","items",1,"desc"],"A map-based prototype for meaningful Scouting places worldwide."],
  [["pages","home","sections","projects","items",1,"href"],"/scouting"],
  [["pages","home","sections","projects","items",2,"tag"],"Campaign · Scouting"],
  [["pages","home","sections","projects","items",2,"desc"],"A participation campaign page for the 16th Korea Jamboree countdown."],
  [["pages","home","sections","projects","items",2,"href"],"/scouting"],
  [["pages","home","sections","cta","title"],"Let's start with the purpose."],
  [["pages","home","sections","cta","body"],"For collaboration, documentation, video, Scouting projects, or web prototypes — feel free to reach out."],
  [["pages","home","sections","cta","button","label"],"Contact"],
  [["pages","work","meta","title"],"Work · Jimmy Park"],
  [["pages","work","meta","desc"],"Field documentation, purpose-based video, lectures, and small web prototypes — Jimmy Park combines photography, video, teaching, and digital tools depending on what the project needs."],
  [["pages","work","order"],["intro","photography","video","vibecoding","lecture","cta"]],
  [["pages","work","sections","intro","eyebrow"],"Work"],
  [["pages","work","sections","intro","title"],"Made for use, based on purpose."],
  [["pages","work","sections","intro","lead"],"I work across field documentation, purpose-based video, and small digital tools — depending on what the project needs."],
  [["pages","work","sections","photography","kicker"],"Document"],
  [["pages","work","sections","photography","title"],"Photography"],
  [["pages","work","sections","video","kicker"],"Produce"],
  [["pages","work","sections","video","title"],"Video"],
  [["pages","work","sections","video","sub"],"Formats shaped by purpose"],
  [["pages","work","sections","video","desc"],"Video should change depending on its purpose. I organize the format, rhythm, and message according to the audience and use case."],
  [["pages","work","sections","video","caption"],"Video type · purpose · availability"],
  [["pages","work","sections","vibecoding","kicker"],"Build"],
  [["pages","work","sections","vibecoding","title"],"Vibe Coding"],
  [["pages","work","sections","vibecoding","sub"],"Small systems that make ideas work"],
  [["pages","work","sections","vibecoding","desc"],"I'm not presenting myself as a traditional developer. I use AI and web tools to quickly test ideas, build campaign pages, organize content flows, and create small tools that support real projects."],
  [["pages","work","sections","vibecoding","items",0,"desc"],"Map-based Scouting place archive"],
  [["pages","work","sections","vibecoding","items",1,"desc"],"Campaign participation page"],
  [["pages","work","sections","vibecoding","items",2,"desc"],"Content production tool"],
  [["pages","work","sections","vibecoding","items",3,"desc"],"Media operation support"],
  [["pages","work","sections","lecture","kicker"],"Teach"],
  [["pages","work","sections","lecture","title"],"Lecture"],
  [["pages","work","sections","lecture","sub"],"Talks & workshops from the field"],
  [["pages","work","sections","lecture","desc"],"I share field experience through lectures and workshops — on Scouting and youth communication, field media and documentation, and AI-assisted prototyping. Each session is shaped around the audience and the purpose."],
  [["pages","work","sections","cta","title"],"Need field documentation, video, or a small web prototype? Tell me the purpose first."],
  [["pages","work","sections","cta","body"],"If the purpose and use case are clear, we can plan the structure, execution, and delivery together."],
  [["pages","work","sections","cta","button","label"],"Contact"],
  [["pages","scouting","meta","title"],"Scouting · Jimmy Park"],
  [["pages","scouting","meta","desc"],"Scouting has been Jimmy Park's long-term base for communication, field experience, and international connection — National Commissioner, APR C&P, World Scout Jamboree media, and BP Media."],
  [["pages","scouting","order"],["hero","why","stats","timeline","roles","international","mediaprojects","gallery","cta"]],
  [["pages","scouting","order"],["hero","why","stats","roles","international","mediaprojects","timeline","gallery","cta"]],
  [["pages","scouting","sections","hero","eyebrow"],"Scouting"],
  [["pages","scouting","sections","hero","title"],"Scouting has been my long-term base for communication, field experience, and international connection."],
  [["pages","scouting","sections","hero","lead"],"From Scout to Scout Leader, it taught me how people gather, move, and build trust across borders."],
  [["pages","scouting","sections","why","eyebrow"],"Why Scouting Matters"],
  [["pages","scouting","sections","why","body"],"Scouting is where I learned how people gather, move, communicate, and build trust across different backgrounds. It shaped the way I document fields, design messages, and connect projects."],
  [["pages","scouting","sections","roles","title"],"Key Roles"],
  [["pages","scouting","sections","roles","items",0,"title"],"National Commissioner"],
  [["pages","scouting","sections","roles","items",2,"title"],"25th World Scout Jamboree"],
  [["pages","scouting","sections","roles","items",2,"org"],"Korea Contingent Media"],
  [["pages","scouting","sections","international","title"],"International Experience"],
  [["pages","scouting","sections","international","body"],"Through World Scout Jamboree, Asia-Pacific regional activities, international Scout networks, and field media operations, I work with Scouting as a language of global communication."],
  [["pages","contact","meta","title"],"Contact · Jimmy Park"],
  [["pages","contact","meta","desc"],"Contact Jimmy Park for collaboration, event documentation, video production, Scouting projects, or small web prototypes. Email and phone."],
  [["pages","contact","sections","intro","eyebrow"],"Contact"],
  [["pages","contact","sections","intro","title"],"Let's get in touch."],
  [["pages","contact","sections","intro","lead"],"For collaboration, event documentation, video production, Scouting projects, or small web prototypes, feel free to get in touch."],
  [["pages","home","sections","activities","items",0],{"kicker":"Document","title":"Field Documentation","desc":"I capture events, people, and key moments so they can be used immediately for press, social media, reports, and archives.","tags":["Press","SNS","Report","Archive"],"href":"/work","accent":"burgundy"}],
  [["pages","home","sections","activities","items",1],{"kicker":"Produce","title":"Purpose-based Production","desc":"I design video formats according to the purpose — promotion, event film, interview, campaign, IR/PR, or short-form.","tags":["Promotion","Interview","Event Film","Short-form"],"href":"/work","accent":"burgundy"}],
  [["pages","home","sections","activities","items",2],{"kicker":"Connect","title":"Scouting Communication","desc":"I connect youth movement, international exchange, media, and field experience through Scouting.","tags":["Youth","International","Media"],"href":"/scouting","accent":"green"}],
  [["pages","home","sections","activities","items",3],{"kicker":"Build","title":"Working Prototypes","desc":"I use AI and web tools to quickly shape ideas into campaign pages, maps, content tools, and small systems.","tags":["Campaign Page","Map","Content Tool"],"href":"/work","accent":"burgundy"}],
  [["pages","home","sections","snapshot","rows",0],{"label":"Current Roles","value":"BP Media · Korea Dream Path · APR C&P"}],
  [["pages","home","sections","snapshot","rows",1],{"label":"Main Fields","value":"Photography · Video · Scouting · Vibe Coding"}],
  [["pages","home","sections","snapshot","rows",2],{"label":"Collaboration","value":"Event media · Video production · Scouting projects · Web prototypes"}],
  [["pages","home","sections","snapshot","rows",3],{"label":"Base","value":"Korea"}],
  [["pages","home","sections","approach","steps",0],{"num":"01","title":"Understand the Purpose","desc":"Clarify why the project exists, who it is for, and where the output will be used."}],
  [["pages","home","sections","approach","steps",1],{"num":"02","title":"Suggest the Direction","desc":"Propose the most suitable format, workflow, and communication approach."}],
  [["pages","home","sections","approach","steps",2],{"num":"03","title":"Execute in the Field","desc":"Document, film, produce, coordinate, or build according to the project's needs."}],
  [["pages","home","sections","approach","steps",3],{"num":"04","title":"Deliver for Use","desc":"Prepare outputs ready for press, social media, reports, websites, or campaigns."}],
  [["pages","work","sections","lecture","topics",0],{"name":"Scouting & Youth","desc":"Communication, international exchange, youth movement"}],
  [["pages","work","sections","lecture","topics",1],{"name":"Field Media","desc":"Documentation, event media, content workflows"}],
  [["pages","work","sections","lecture","topics",2],{"name":"Photography for Purpose","desc":"Shooting for press, SNS, and reports"}],
  [["pages","work","sections","lecture","topics",3],{"name":"AI · Vibe Coding","desc":"Turning ideas into working web prototypes"}]
];
function matchesLegacy(value, legacy) {
  if (Array.isArray(legacy)) {
    return Array.isArray(value) && value.length === legacy.length &&
      legacy.every((item, i) => matchesLegacy(value[i], item));
  }
  if (legacy && typeof legacy === "object") {
    // KV objects can have a different key order from the public sanitized doc.
    // Compare schema fields by value; removed fields are discarded by sanitize.
    return !!value && typeof value === "object" && !Array.isArray(value) &&
      Object.keys(legacy).every((key) => matchesLegacy(value[key], legacy[key]));
  }
  return value === legacy;
}

// Freeze the historic destinations: later designs must not mix old titles with new links.
const V5_TARGETS = {
  "[\"global\",\"brand\",\"roleline\"]": "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator",
  "[\"global\",\"contact\",\"linkedin\"]": "https://www.linkedin.com/in/jimmy1420",
  "[\"global\",\"contact\",\"location\"]": "Korea · Korean / English",
  "[\"global\",\"seo\",\"title\"]": "Jimmy Park | Content Strategy, AI & AX Consulting",
  "[\"global\",\"seo\",\"desc\"]": "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration.",
  "[\"pages\",\"home\",\"meta\",\"title\"]": "Jimmy Park | Content Strategy, AI & AX Consulting",
  "[\"pages\",\"home\",\"meta\",\"desc\"]": "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration.",
  "[\"pages\",\"home\",\"order\"]": [
    "hero",
    "activities",
    "snapshot",
    "projects",
    "approach",
    "cta"
  ],
  "[\"pages\",\"home\",\"sections\",\"hero\",\"eyebrow\"]": "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"title\"]": "Content with purpose.\nAI put to work.",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"lead\"]": "I plan content, build with AI, and help teams explore better ways of working — with a global network rooted in Scouting and Asia-Pacific collaboration.",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"ctaPrimary\",\"label\"]": "Explore my work",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"ctaGhost\",\"label\"]": "Discuss a project",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"image\"]": "/assets/img/jimmy-park-portrait.jpg?v=0.5.1",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"badge\"]": "Jimmy Park",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"caption\"]": "Content, technology, and people.",
  "[\"pages\",\"home\",\"sections\",\"hero\",\"captionRight\"]": "Based in Korea",
  "[\"pages\",\"home\",\"sections\",\"activities\",\"eyebrow\"]": "Four ways I contribute",
  "[\"pages\",\"home\",\"sections\",\"activities\",\"title\"]": "From the first idea to work people can use.",
  "[\"pages\",\"home\",\"sections\",\"approach\",\"eyebrow\"]": "How we can work together",
  "[\"pages\",\"home\",\"sections\",\"approach\",\"title\"]": "Start with the work. Build a useful next step.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"title\"]": "Where the work takes shape.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"feature\",\"badge\"]": "Content strategy · Global Scouting",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"feature\",\"sub\"]": "Founder · Scouting media",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"feature\",\"desc\"]": "A Scouting media platform bringing stories, events, and people into a shared editorial space. My work connects field documentation with content planning and international perspectives.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"feature\",\"href\"]": "/scouting#mediaprojects",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",0,\"tag\"]": "Content · Education",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",0,\"desc\"]": "An education and youth-growth initiative connecting content, learning, and global collaboration.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",0,\"href\"]": "/work#video",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",1,\"tag\"]": "AI practice · Prototype",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",1,\"desc\"]": "A map-based prototype that organizes meaningful Scouting places into an explorable resource.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",1,\"href\"]": "/work#vibecoding",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",2,\"tag\"]": "Web · Transport data",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",2,\"desc\"]": "A map that estimates train positions across South Korea using published timetables and public rail data.",
  "[\"pages\",\"home\",\"sections\",\"projects\",\"items\",2,\"href\"]": "https://scoutingapp.net/ktrainrader24/",
  "[\"pages\",\"home\",\"sections\",\"cta\",\"title\"]": "What are you working on?",
  "[\"pages\",\"home\",\"sections\",\"cta\",\"body\"]": "A content challenge, an AI idea, a team workflow, or an international project — let’s work out a useful next step.",
  "[\"pages\",\"home\",\"sections\",\"cta\",\"button\",\"label\"]": "Discuss a project",
  "[\"pages\",\"work\",\"meta\",\"title\"]": "Content, AI & AX Consulting | Jimmy Park",
  "[\"pages\",\"work\",\"meta\",\"desc\"]": "Explore Jimmy Park’s content planning, AI-assisted prototypes, AX consulting and workshops, and field media production.",
  "[\"pages\",\"work\",\"order\"]": [
    "intro",
    "video",
    "vibecoding",
    "lecture",
    "photography",
    "cta"
  ],
  "[\"pages\",\"work\",\"sections\",\"intro\",\"eyebrow\"]": "Work & collaboration",
  "[\"pages\",\"work\",\"sections\",\"intro\",\"title\"]": "Strategy that moves into practice.",
  "[\"pages\",\"work\",\"sections\",\"intro\",\"lead\"]": "Content planning, hands-on AI work, and practical AI adoption — connected by the same question: what will help people do their work better?",
  "[\"pages\",\"work\",\"sections\",\"photography\",\"kicker\"]": "04 / Field production",
  "[\"pages\",\"work\",\"sections\",\"photography\",\"title\"]": "Photography & Field Media",
  "[\"pages\",\"work\",\"sections\",\"video\",\"kicker\"]": "01 / Content strategy",
  "[\"pages\",\"work\",\"sections\",\"video\",\"title\"]": "Plan the story. Shape the content.",
  "[\"pages\",\"work\",\"sections\",\"video\",\"sub\"]": "From communication goals to production and distribution",
  "[\"pages\",\"work\",\"sections\",\"video\",\"desc\"]": "I translate a project’s purpose into an audience, a message, and a format. From campaign concepts to interviews and short-form video, I plan how the content will be made and where it will be used.",
  "[\"pages\",\"work\",\"sections\",\"video\",\"caption\"]": "Content planning · Production · Distribution",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"kicker\"]": "02 / AI practice",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"title\"]": "AI in Practice",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"sub\"]": "Ideas turned into usable tools and prototypes",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"desc\"]": "I use AI and web tools to build campaign pages, organize content flows, and test small systems. These projects show how I move from a practical need to a working prototype.",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"items\",0,\"desc\"]": "A map-based prototype for discovering and organizing meaningful Scouting places.",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"items\",1,\"desc\"]": "A map that estimates train positions across South Korea using published timetables and public rail data.",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"items\",2,\"desc\"]": "A beta tool for turning content into card-news formats.",
  "[\"pages\",\"work\",\"sections\",\"vibecoding\",\"items\",3,\"desc\"]": "Tools in development to support everyday media operations.",
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"kicker\"]": "03 / AI transformation",
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"title\"]": "AX Consulting & Workshops",
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"sub\"]": "Practical AI adoption, shaped around your team",
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"desc\"]": "AX means AI transformation: applying AI to the way a team works. We can review a content workflow, choose a focused pilot, and plan how people will use it. My workshops draw on field media, content workflows, and AI-assisted prototyping.",
  "[\"pages\",\"work\",\"sections\",\"cta\",\"title\"]": "Have a brief, a workflow, or an idea to explore?",
  "[\"pages\",\"work\",\"sections\",\"cta\",\"body\"]": "Share the goal, the people involved, and what you need to deliver. We can define the content, prototype, or workshop that fits.",
  "[\"pages\",\"work\",\"sections\",\"cta\",\"button\",\"label\"]": "Discuss a project",
  "[\"pages\",\"scouting\",\"meta\",\"title\"]": "Global Network & Scouting | Jimmy Park",
  "[\"pages\",\"scouting\",\"meta\",\"desc\"]": "Jimmy Park’s international network is rooted in Scouting, Asia-Pacific communications and partnerships, and World Scout Jamboree media work.",
  "[\"pages\",\"scouting\",\"order\"]": [
    "hero",
    "roles",
    "international",
    "travel",
    "why",
    "stats",
    "mediaprojects",
    "timeline",
    "gallery",
    "cta"
  ],
  "[\"pages\",\"scouting\",\"sections\",\"hero\",\"eyebrow\"]": "Global network · Scouting",
  "[\"pages\",\"scouting\",\"sections\",\"hero\",\"title\"]": "Connections built through shared work.",
  "[\"pages\",\"scouting\",\"sections\",\"hero\",\"lead\"]": "My international network grows through Scouting, Asia-Pacific communication and partnerships, and media work at global events.",
  "[\"pages\",\"scouting\",\"sections\",\"why\",\"eyebrow\"]": "The foundation of my network",
  "[\"pages\",\"scouting\",\"sections\",\"why\",\"body\"]": "Scouting is where I learned to work across cultures, understand different audiences, and build trust through shared projects. I bring that experience to content planning, international communication, and collaboration.",
  "[\"pages\",\"scouting\",\"sections\",\"roles\",\"title\"]": "Roles behind the relationships",
  "[\"pages\",\"scouting\",\"sections\",\"roles\",\"items\",0,\"title\"]": "National Commissioner on PR II",
  "[\"pages\",\"scouting\",\"sections\",\"roles\",\"items\",2,\"title\"]": "Deputy Head of Media Dept.",
  "[\"pages\",\"scouting\",\"sections\",\"roles\",\"items\",2,\"org\"]": "25th World Scout Jamboree",
  "[\"pages\",\"scouting\",\"sections\",\"international\",\"title\"]": "A network with a working context",
  "[\"pages\",\"scouting\",\"sections\",\"international\",\"body\"]": "World Scout Jamborees, Asia-Pacific regional activities, and international Scout networks connect me with people working in youth engagement, media, and partnerships. These relationships inform how I approach cross-cultural projects and communication.",
  "[\"pages\",\"contact\",\"meta\",\"title\"]": "Discuss a Project | Jimmy Park",
  "[\"pages\",\"contact\",\"meta\",\"desc\"]": "Contact Jimmy Park about content strategy, AI prototypes, AX consulting and workshops, or international collaboration.",
  "[\"pages\",\"contact\",\"sections\",\"intro\",\"eyebrow\"]": "Let’s collaborate",
  "[\"pages\",\"contact\",\"sections\",\"intro\",\"title\"]": "Tell me what you want to make possible.",
  "[\"pages\",\"contact\",\"sections\",\"intro\",\"lead\"]": "Content strategy, an AI prototype, a team workshop, or an international project — share the challenge and the people it needs to work for.",
  "[\"pages\",\"home\",\"sections\",\"activities\",\"items\",0]": {
    "kicker": "01 / Content",
    "title": "Content Strategy",
    "desc": "Turn a communication goal into a clear message, the right format, and a plan for production and distribution.",
    "tags": [
      "Editorial planning",
      "Campaigns",
      "Video & media"
    ],
    "href": "/work#video",
    "accent": "burgundy"
  },
  "[\"pages\",\"home\",\"sections\",\"activities\",\"items\",1]": {
    "kicker": "02 / AI",
    "title": "AI in Practice",
    "desc": "Use AI to turn ideas into campaign pages, content tools, and working prototypes built around real project needs.",
    "tags": [
      "Prototyping",
      "Content tools",
      "AI workflows"
    ],
    "href": "/work#vibecoding",
    "accent": "burgundy"
  },
  "[\"pages\",\"home\",\"sections\",\"activities\",\"items\",2]": {
    "kicker": "03 / AX",
    "title": "AX Consulting",
    "desc": "Explore AI transformation from the work itself: identify useful opportunities, test a focused workflow, and help a team take its next step.",
    "tags": [
      "Workflow review",
      "Pilot design",
      "Workshops"
    ],
    "href": "/work#lecture",
    "accent": "burgundy"
  },
  "[\"pages\",\"home\",\"sections\",\"activities\",\"items\",3]": {
    "kicker": "04 / Global",
    "title": "Global Collaboration",
    "desc": "Bring Scouting experience, Asia-Pacific relationships, and international event media work to projects that connect people across borders.",
    "tags": [
      "Asia-Pacific",
      "Scouting",
      "Partnerships"
    ],
    "href": "/scouting#roles",
    "accent": "green"
  },
  "[\"pages\",\"home\",\"sections\",\"snapshot\",\"rows\",0]": {
    "label": "Content & media",
    "value": "BP Media · Founder, 2026–"
  },
  "[\"pages\",\"home\",\"sections\",\"snapshot\",\"rows\",1]": {
    "label": "Asia-Pacific",
    "value": "Communications & Partnerships · 2nd Vice Chair, 2025–2028"
  },
  "[\"pages\",\"home\",\"sections\",\"snapshot\",\"rows\",2]": {
    "label": "International fieldwork",
    "value": "25th World Scout Jamboree · Korean Contingent Media, 2023"
  },
  "[\"pages\",\"home\",\"sections\",\"snapshot\",\"rows\",3]": {
    "label": "Based in",
    "value": "Korea · Korean / English"
  },
  "[\"pages\",\"home\",\"sections\",\"approach\",\"steps\",0]": {
    "num": "01",
    "title": "Understand",
    "desc": "Clarify the audience, the goal, and the way work happens today."
  },
  "[\"pages\",\"home\",\"sections\",\"approach\",\"steps\",1]": {
    "num": "02",
    "title": "Design",
    "desc": "Choose the message, format, or AI use case that fits the need."
  },
  "[\"pages\",\"home\",\"sections\",\"approach\",\"steps\",2]": {
    "num": "03",
    "title": "Make & test",
    "desc": "Produce the content or build a small pilot, then review it with the people who will use it."
  },
  "[\"pages\",\"home\",\"sections\",\"approach\",\"steps\",3]": {
    "num": "04",
    "title": "Put it to use",
    "desc": "Prepare the output, guidance, and next steps for the team."
  },
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"topics\",0]": {
    "name": "Workflow review",
    "desc": "Map recurring tasks, handoffs, and opportunities where AI could help."
  },
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"topics\",1]": {
    "name": "Pilot planning",
    "desc": "Choose one use case, define a useful output, and agree how to review it."
  },
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"topics\",2]": {
    "name": "AI workshops",
    "desc": "Practice turning a real content or web idea into a working prototype."
  },
  "[\"pages\",\"work\",\"sections\",\"lecture\",\"topics\",3]": {
    "name": "Field & youth media",
    "desc": "Workshops on documentation, photography, Scouting, and international communication."
  }
};

function migrateTo5(doc) {
  const hero = doc.pages && doc.pages.home && doc.pages.home.sections && doc.pages.home.sections.hero;
  if (hero) {
    for (const [key, oldLabel, oldHref, nextLabel] of [
      ['ctaPrimary', 'View Work', '/work', 'Explore my work'],
      ['ctaGhost', 'Contact', '/contact', 'Discuss a project']
    ]) {
      if (matchesLegacy(hero[key], { label: oldLabel, href: oldHref })) hero[key] = { label: nextLabel, href: oldHref };
    }
  }
  for (const [path, legacy] of V5_LEGACY) {
    if (path[3] === "hero" && ["ctaPrimary", "ctaGhost"].includes(path[4])) continue;
    let target = doc;
    const historic = V5_TARGETS[JSON.stringify(path)];
    for (let i = 0; i < path.length - 1; i++) {
      target = target && target[path[i]];
    }
    const key = path[path.length - 1];
    // Older stored docs may predate sections such as workshops. Normalize with
    // the legacy order before comparing, while retaining genuinely custom order.
    const saved = target && key === "order" && Array.isArray(legacy)
      ? mergeOrder(legacy, target[key]) : target && target[key];
    if (target && historic !== undefined && matchesLegacy(saved, legacy)) {
      target[key] = JSON.parse(JSON.stringify(historic));
    }
  }
  doc.version = 5;
  return doc;
}

// v5 → v6: the owner replaced the countdown project and supplied travel/media work.
// Keep the v5 indexed project slots stable until this identity-based replacement runs.
// New fields are additive via sanitize; customized unrelated rows remain untouched.
const V6_TRAIN_PROJECT = {"slug": "k-trainradar24", "status": "Live", "accent": "burgundy", "title": "K-TrainRadar24", "desc": "A map that estimates train positions across South Korea using published timetables and public rail data.", "href": "https://scoutingapp.net/ktrainrader24/", "image": ""};
function migrateTo6(doc) {
  const copy = value => JSON.parse(JSON.stringify(value));
  const isCountdown = item => item && (/^(?:jamboree[ -]d[ -]?count|d[ _-]?day(?: count)?(?: project)?)$/i.test(item.title || "") || item.slug === "jamboree-dcount");
  const replaceProject = (section, replacement) => {
    if (!section || !Array.isArray(section.items)) return;
    const index = section.items.findIndex(isCountdown);
    section.items = section.items.filter(item => !isCountdown(item));
    if (!section.items.some(item => item.title === replacement.title || (item.href && item.href === replacement.href))) {
      section.items.splice(index < 0 ? section.items.length : index, 0, copy(replacement));
    }
  };
  const pages = doc.pages || {};
  const home = pages.home && pages.home.sections;
  const work = pages.work && pages.work.sections;
  const scouting = pages.scouting && pages.scouting.sections;
  replaceProject(home && home.projects, {"tag": "Web · Transport data", "title": "K-TrainRadar24", "desc": "A map that estimates train positions across South Korea using published timetables and public rail data.", "href": "https://scoutingapp.net/ktrainrader24/", "image": ""});
  replaceProject(work && work.vibecoding, V6_TRAIN_PROJECT);
  if (scouting && scouting.mediaprojects && Array.isArray(scouting.mediaprojects.items)) {
    scouting.mediaprojects.items = scouting.mediaprojects.items.filter(item => !isCountdown(item));
  }
  if (scouting && scouting.timeline && Array.isArray(scouting.timeline.items)) {
    scouting.timeline.items = scouting.timeline.items.map(item => {
      if (!/Jamboree D-count/i.test((item.title || "") + " " + (item.context || ""))) return item;
      return { ...item, title: "Scouting web experiments", context: "I experiment with web projects such as Scout Tour Assistant to make Scouting places and information easier to explore." };
    });
  }
  doc.version = 6;
  return doc;
}

// v6 → v7: resume the owner’s project, identity and network goals.
// No KV writes during reads; replace only unchanged seed values and video rows.
const V7_SEEDS = [
  [
    [
      "global",
      "seo",
      "title"
    ],
    "Jimmy Park | Content Strategy, AI & AX Consulting"
  ],
  [
    [
      "global",
      "seo",
      "desc"
    ],
    "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration."
  ],
  [
    [
      "pages",
      "home",
      "meta",
      "title"
    ],
    "Jimmy Park | Content Strategy, AI & AX Consulting"
  ],
  [
    [
      "pages",
      "home",
      "meta",
      "desc"
    ],
    "Jimmy Park connects content strategy, hands-on AI work, and practical AI transformation consulting with a global network built through Scouting and Asia-Pacific collaboration."
  ],
  [
    [
      "pages",
      "home",
      "order"
    ],
    [
      "hero",
      "activities",
      "snapshot",
      "projects",
      "approach",
      "cta"
    ]
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "lead"
    ],
    "I plan content, build with AI, and help teams explore better ways of working — with a global network rooted in Scouting and Asia-Pacific collaboration."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "title"
    ],
    "Content with purpose.\nAI put to work."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "eyebrow"
    ],
    "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "activities",
      "title"
    ],
    "From the first idea to work people can use."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "activities",
      "eyebrow"
    ],
    "Four ways I contribute"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "activities",
      "items"
    ],
    [
      {
        "kicker": "01 / Content",
        "title": "Content Strategy",
        "desc": "Turn a communication goal into a clear message, the right format, and a plan for production and distribution.",
        "tags": [
          "Editorial planning",
          "Campaigns",
          "Video & media"
        ],
        "href": "/work#video",
        "accent": "burgundy"
      },
      {
        "kicker": "02 / AI",
        "title": "AI in Practice",
        "desc": "Use AI to turn ideas into campaign pages, content tools, and working prototypes built around real project needs.",
        "tags": [
          "Prototyping",
          "Content tools",
          "AI workflows"
        ],
        "href": "/work#vibecoding",
        "accent": "burgundy"
      },
      {
        "kicker": "03 / AX",
        "title": "AX Consulting",
        "desc": "Explore AI transformation from the work itself: identify useful opportunities, test a focused workflow, and help a team take its next step.",
        "tags": [
          "Workflow review",
          "Pilot design",
          "Workshops"
        ],
        "href": "/work#lecture",
        "accent": "burgundy"
      },
      {
        "kicker": "04 / Global",
        "title": "Global Collaboration",
        "desc": "Bring Scouting experience, Asia-Pacific relationships, and international event media work to projects that connect people across borders.",
        "tags": [
          "Asia-Pacific",
          "Scouting",
          "Partnerships"
        ],
        "href": "/scouting#roles",
        "accent": "green"
      }
    ]
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "projects",
      "title"
    ],
    "Where the work takes shape."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "projects",
      "eyebrow"
    ],
    "Selected Projects"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "projects",
      "items"
    ],
    [
      {
        "tag": "Content · Education",
        "title": "Korea Dream Path",
        "desc": "An education and youth-growth initiative connecting content, learning, and global collaboration.",
        "href": "/work#video",
        "image": ""
      },
      {
        "tag": "AI practice · Prototype",
        "title": "Scout Tour Assistant",
        "desc": "A map-based prototype that organizes meaningful Scouting places into an explorable resource.",
        "href": "/work#vibecoding",
        "image": ""
      },
      {
        "tag": "Web · Transport data",
        "title": "K-TrainRadar24",
        "desc": "A map that estimates train positions across South Korea using published timetables and public rail data.",
        "href": "https://scoutingapp.net/ktrainrader24/",
        "image": ""
      }
    ]
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "cta",
      "button",
      "label"
    ],
    "Discuss a project"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "cta",
      "title"
    ],
    "What are you working on?"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "cta",
      "body"
    ],
    "A content challenge, an AI idea, a team workflow, or an international project — let’s work out a useful next step."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "video",
      "desc"
    ],
    "I translate a project’s purpose into an audience, a message, and a format. From campaign concepts to interviews and short-form video, I plan how the content will be made and where it will be used."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "ctaPrimary"
    ],
    {
      "label": "Explore my work",
      "href": "/work"
    }
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "ctaGhost"
    ],
    {
      "label": "Discuss a project",
      "href": "/contact"
    }
  ]
];
const V6_VIDEO_CASES = [
  {
    "id": "ai2re",
    "title": "AI2RE by SPAID",
    "year": "2025",
    "role": "Planning & Direction Lead",
    "desc": "CES Innovation Award promotional film for AI2RE.",
    "href": "https://www.youtube.com/watch?v=OmnvbFs-6Ws",
    "image": "https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg",
    "format": "Technology · Promotional film",
    "linkLabel": "Watch film"
  },
  {
    "id": "manas",
    "title": "MANAS — Intelligent Navigation Support System",
    "year": "2024",
    "role": "Planning & Direction Lead",
    "desc": "A promotional film created for use at SMM in Hamburg, Germany.",
    "href": "https://www.youtube.com/watch?v=As1BN53BpFY",
    "image": "https://i.ytimg.com/vi/As1BN53BpFY/hqdefault.jpg",
    "format": "Maritime technology · Exhibition",
    "linkLabel": "Watch film"
  },
  {
    "id": "daekyo",
    "title": "Daekyo Newif · Jangsuhae",
    "year": "2024",
    "role": "Direction, Production & Editing Lead",
    "desc": "TV commercial for Daekyo Newif’s Jangsuhae deep-sea water.",
    "href": "https://www.youtube.com/watch?v=DJcwT3V79B0",
    "image": "https://i.ytimg.com/vi/DJcwT3V79B0/hqdefault.jpg",
    "format": "Brand · TV commercial",
    "linkLabel": "Watch film"
  },
  {
    "id": "kb-life",
    "title": "KB Life · Hashtag Interviews",
    "year": "",
    "role": "Lead Filming & Editing",
    "desc": "A branded interview series sharing people’s stories and perspectives on life.",
    "href": "https://www.youtube.com/playlist?list=PL7K0gdyN-9BQjyWAFqmtk9vfBv8qwmyuE",
    "image": "",
    "format": "Brand · Interview series",
    "linkLabel": "View playlist"
  },
  {
    "id": "military-concert",
    "title": "12th Infantry Division · 69th Anniversary Concert",
    "year": "2021",
    "role": "Video Direction, Filming & Editing Lead",
    "desc": "Military band concert film for the division’s 69th anniversary.",
    "href": "https://youtu.be/36-q294zBtQ",
    "image": "https://i.ytimg.com/vi/36-q294zBtQ/hqdefault.jpg",
    "format": "Live event · Concert",
    "linkLabel": "Watch film"
  },
  {
    "id": "inha-mun",
    "title": "Inha Model United Nations",
    "year": "2019",
    "role": "Lead Filming & Editing",
    "desc": "Event sketch and closing film for the first Inha University Model UN.",
    "href": "https://youtu.be/HCb285yis9M",
    "image": "https://i.ytimg.com/vi/HCb285yis9M/hqdefault.jpg",
    "format": "University · Event film",
    "linkLabel": "Watch film"
  }
];
// Seeds written before v9 address Work sections that now live on Dev Work.
const V9_MOVED = ['vibecoding', 'lecture'];
function currentDefault(path) {
  const moved = path[0] === 'pages' && path[1] === 'work' && path[2] === 'sections' && V9_MOVED.includes(path[3]);
  return (moved ? ['pages', 'dev', ...path.slice(2)] : path).reduce((value, key) => value == null ? undefined : value[key], DEFAULT);
}
function migrateTo7(doc) {
  const clone = value => JSON.parse(JSON.stringify(value));
  for (const [path, previous] of V7_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1], next = currentDefault(path);
    const saved = target && key === 'order' ? mergeOrder(previous, target[key]) : target && target[key];
    if (target && next !== undefined && matchesLegacy(saved, previous)) target[key] = clone(next);
  }
  const video = doc.pages && doc.pages.work && doc.pages.work.sections && doc.pages.work.sections.video;
  if (video && matchesLegacy(video.cases, V6_VIDEO_CASES)) video.cases = clone(DEFAULT.pages.work.sections.video.cases);
  doc.version = 7;
  return doc;
}

// v8: owner-requested removals, actual tour URL and professional positioning.
const V8_SEEDS = [
  [
    [
      "global",
      "brand",
      "roleline"
    ],
    "Content Strategist · AI Practitioner · AX Consultant · Global Collaborator"
  ],
  [
    [
      "global",
      "seo",
      "title"
    ],
    "Jimmy Park (박지민) | Content, Video & AI"
  ],
  [
    [
      "global",
      "seo",
      "desc"
    ],
    "Jimmy Park (박지민, Park Jimin) is a Korea-based content strategist, video producer and AI practitioner. Explore credited projects, Scouting roles and ways to collaborate."
  ],
  [
    [
      "pages",
      "contact",
      "sections",
      "intro",
      "lead"
    ],
    "Content strategy, an AI prototype, a team workshop, or an international project — share the challenge and the people it needs to work for."
  ],
  [
    [
      "pages",
      "contact",
      "sections",
      "intro",
      "title"
    ],
    "Tell me what you want to make possible."
  ],
  [
    [
      "pages",
      "contact",
      "meta",
      "title"
    ],
    "Discuss a Project | Jimmy Park"
  ],
  [
    [
      "pages",
      "contact",
      "meta",
      "desc"
    ],
    "Contact Jimmy Park about content strategy, AI prototypes, AX consulting and workshops, or international collaboration."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "eyebrow"
    ],
    "Content strategy · Video production · AI & AX"
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "title"
    ],
    "From a clear brief\nto content that works."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "hero",
      "lead"
    ],
    "I’m Jimmy Park, a Korea-based content strategist and video producer. I plan, direct, film and edit — and build practical AI tools for content teams."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "activities",
      "items"
    ],
    [
      {
        "kicker": "01 / Content",
        "title": "Content & Video Production",
        "desc": "Commission a campaign concept, keynote video, interview series or event film — with a clear brief and defined production responsibilities.",
        "tags": [
          "Concept & script",
          "Direction & production",
          "Editing & delivery"
        ],
        "href": "/work#video",
        "accent": "burgundy"
      },
      {
        "kicker": "02 / AI",
        "title": "AI in Practice",
        "desc": "Build and test a focused content tool, campaign page or AI-assisted prototype around one practical need.",
        "tags": [
          "Prototyping",
          "Content tools",
          "AI workflows"
        ],
        "href": "/work#vibecoding",
        "accent": "burgundy"
      },
      {
        "kicker": "03 / AX",
        "title": "AX Consulting",
        "desc": "Review a content workflow, plan a small AI pilot or arrange a hands-on team workshop with a clear starting point.",
        "tags": [
          "Workflow review",
          "Pilot design",
          "Workshops"
        ],
        "href": "/work#lecture",
        "accent": "burgundy"
      },
      {
        "kicker": "04 / Global",
        "title": "Global Collaboration",
        "desc": "Discuss Scouting media, international events and cross-cultural projects, grounded in my documented Asia-Pacific roles.",
        "tags": [
          "Asia-Pacific",
          "Scouting",
          "Partnerships"
        ],
        "href": "/scouting#roles",
        "accent": "green"
      }
    ]
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "activities",
      "title"
    ],
    "A defined scope. A useful deliverable."
  ],
  [
    [
      "pages",
      "home",
      "sections",
      "projects",
      "title"
    ],
    "A place to start. A reason to stay in touch."
  ],
  [
    [
      "pages",
      "home",
      "meta",
      "title"
    ],
    "Jimmy Park (박지민) | Content, Video & AI"
  ],
  [
    [
      "pages",
      "home",
      "meta",
      "desc"
    ],
    "Jimmy Park (박지민, Park Jimin) is a Korea-based content strategist, video producer and AI practitioner. Explore credited projects, Scouting roles and ways to collaborate."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "intro",
      "lead"
    ],
    "Content planning, hands-on AI work, and practical AI adoption — connected by the same question: what will help people do their work better?"
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "intro",
      "title"
    ],
    "Strategy that moves into practice."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "lecture",
      "desc"
    ],
    "AX means AI transformation: applying AI to the way a team works. We can review a content workflow, choose a focused pilot, and plan how people will use it. My workshops draw on field media, content workflows, and AI-assisted prototyping."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "lecture",
      "title"
    ],
    "AX Consulting & Workshops"
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "lecture",
      "sub"
    ],
    "Practical AI adoption, shaped around your team"
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "vibecoding",
      "desc"
    ],
    "I use AI and web tools to build campaign pages, organize content flows, and test small systems. These projects show how I move from a practical need to a working prototype."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "vibecoding",
      "title"
    ],
    "AI in Practice"
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "vibecoding",
      "sub"
    ],
    "Ideas turned into usable tools and prototypes"
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "video",
      "title"
    ],
    "Plan the story. Shape the content."
  ],
  [
    [
      "pages",
      "work",
      "sections",
      "video",
      "sub"
    ],
    "From communication goals to production and distribution"
  ],
  [
    [
      "pages",
      "work",
      "meta",
      "title"
    ],
    "Content, AI & AX Consulting | Jimmy Park"
  ],
  [
    [
      "pages",
      "work",
      "meta",
      "desc"
    ],
    "Explore Jimmy Park’s content planning, AI-assisted prototypes, AX consulting and workshops, and field media production."
  ],
  [
    [
      "pages",
      "scouting",
      "sections",
      "timeline",
      "note"
    ],
    "From Scout (2003) to Scout Leader (2014) — tap any item to expand."
  ],
  [
    [
      "pages",
      "scouting",
      "sections",
      "timeline",
      "title"
    ],
    "Scouting History"
  ],
  [
    [
      "pages",
      "scouting",
      "sections",
      "hero",
      "title"
    ],
    "Connections built through shared work."
  ],
  [
    [
      "pages",
      "scouting",
      "sections",
      "roles",
      "items"
    ],
    [
      {
        "title": "National Commissioner on PR II",
        "org": "Korea Scout Association",
        "period": "2022–2024",
        "accent": "neutral"
      },
      {
        "title": "APR Communication & Partnerships",
        "org": "2nd Vice Chair",
        "period": "2025–2028",
        "accent": "neutral"
      },
      {
        "title": "Deputy Head of Media Dept.",
        "org": "25th World Scout Jamboree",
        "period": "2023",
        "accent": "neutral"
      },
      {
        "title": "BP Media",
        "org": "Founder",
        "period": "2026–",
        "accent": "green"
      }
    ]
  ],
  [
    [
      "pages",
      "scouting",
      "meta",
      "title"
    ],
    "Global Network & Scouting | Jimmy Park"
  ],
  [
    [
      "pages",
      "scouting",
      "meta",
      "desc"
    ],
    "Jimmy Park’s international network is rooted in Scouting, Asia-Pacific communications and partnerships, and World Scout Jamboree media work."
  ]
];
function migrateTo8(doc) {
  const hero = doc.pages && doc.pages.scouting && doc.pages.scouting.sections && doc.pages.scouting.sections.hero;
  if (hero) { hero.image = DEFAULT.pages.scouting.sections.hero.image; hero.badge = DEFAULT.pages.scouting.sections.hero.badge; hero.caption = DEFAULT.pages.scouting.sections.hero.caption; }
  for (const [path, previous] of V8_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1], next = currentDefault(path);
    if (target && next !== undefined && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(next));
  }
  const work = doc.pages && doc.pages.work && doc.pages.work.sections;
  if (work && work.vibecoding && Array.isArray(work.vibecoding.items)) {
    work.vibecoding.items = work.vibecoding.items.filter(item => !['card-news','bp-media-tools'].includes(item.slug) && !['Card News Generator','BP Media Tools'].includes(item.title));
    for (const item of work.vibecoding.items) {
      if (item.slug === 'scout-tour-assistant' || item.title === 'Scout Tour Assistant') {
        item.href = 'https://scoutingapp.net/tour/'; item.status = 'Live';
        if (item.desc === 'A map-based prototype for discovering and organizing meaningful Scouting places.') item.desc = 'A map for finding Scout units, national offices and heritage sites near a chosen location.';
      }
    }
  }
  doc.version = 8;
  return doc;
}

// v9: Work splits into Media Work (/work) and Dev Work (/dev). The AI practice and AX
// workshop sections move intact with their visibility and relative order; custom copy is
// kept. Only unchanged v8 seed values change, and links to the moved anchors follow them.
const V9_SEEDS = [
  [["pages","home","sections","activities","items"],[{"kicker":"01 / Content","title":"Content Strategy & Video Production","desc":"Turn a communication brief into a clear concept, script and production plan. My project work spans branded films, keynote videos, interviews and event media.","tags":["Concept & script","Direction & production","Editing & delivery"],"href":"/work#video","accent":"burgundy"},{"kicker":"02 / AI","title":"Applied AI & Web Prototyping","desc":"Use AI-assisted development to build focused web tools and test workflows around a practical need. Explore the available projects.","tags":["Prototyping","Content tools","AI workflows"],"href":"/work#vibecoding","accent":"burgundy"},{"kicker":"03 / AX","title":"AI Workflow Consulting & Workshops","desc":"Review recurring content tasks, define a focused AI pilot and give your team hands-on practice with a real workflow.","tags":["Workflow review","Pilot design","Workshops"],"href":"/work#lecture","accent":"burgundy"},{"kicker":"04 / Global","title":"Global Scouting & Collaboration","desc":"Connect content and field media with international Scouting experience, Asia-Pacific communications and cross-cultural collaboration.","tags":["Asia-Pacific","Scouting","Partnerships"],"href":"/scouting#roles","accent":"green"}]],
  [["pages","work","meta","title"],"Video Production, Applied AI & AX Workshops | Jimmy Park"],
  [["pages","work","meta","desc"],"Explore Jimmy Park’s video production credits, AI-assisted web projects, practical AX workshops and event photography. View films and discuss a project."],
  [["pages","work","sections","intro","eyebrow"],"Work & collaboration"],
  [["pages","work","sections","intro","title"],"Video production, applied AI\nand practical workshops."],
  [["pages","work","sections","intro","lead"],"Explore video production credits, web tools built with AI-assisted development, and collaboration opportunities in content strategy and AI adoption."],
  [["pages","work","sections","photography","kicker"],"04 / Field production"],
  [["pages","work","sections","cta","title"],"Have a brief, a workflow, or an idea to explore?"],
  [["pages","work","sections","cta","body"],"Share the goal, the people involved, and what you need to deliver. We can define the content, prototype, or workshop that fits."]
];
const V9_LINKS = { "/work#vibecoding": "/dev#vibecoding", "/work#lecture": "/dev#lecture" };
function retargetMovedLinks(value) {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (key === 'href' && typeof value[key] === 'string' && V9_LINKS[value[key].trim()]) value[key] = V9_LINKS[value[key].trim()];
    else retargetMovedLinks(value[key]);
  }
}
function migrateTo9(doc) {
  const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const pages = object(doc.pages) ? doc.pages : (doc.pages = {});
  const work = object(pages.work) ? pages.work : null;
  const dev = object(pages.dev) ? pages.dev : (pages.dev = {});
  if (!object(dev.sections)) dev.sections = {};
  if (work && object(work.sections)) {
    for (const id of V9_MOVED) {
      if (work.sections[id] !== undefined && dev.sections[id] === undefined) dev.sections[id] = work.sections[id];
      delete work.sections[id];
    }
  }
  if (work && Array.isArray(work.hidden)) {
    const moved = work.hidden.filter(id => V9_MOVED.includes(id));
    work.hidden = work.hidden.filter(id => !V9_MOVED.includes(id));
    if (moved.length) dev.hidden = [...new Set([...(Array.isArray(dev.hidden) ? dev.hidden : []), ...moved])];
  }
  if (work && Array.isArray(work.order) && !Array.isArray(dev.order)) {
    const movedOrder = work.order.filter((id, i) => V9_MOVED.includes(id) && work.order.indexOf(id) === i);
    if (movedOrder.length === V9_MOVED.length) dev.order = ['intro', 'sites', ...movedOrder, 'cta'];
  }
  for (const [path, previous] of V9_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  retargetMovedLinks(pages);
  doc.version = 9;
  return doc;
}

// v10: solution-maker positioning, need-first Dev Work showcase and a clearer Contact page.
// Only unchanged v9 seed values move; website rows gain summary/need/built/mobileImage.
const V10_SEEDS = [
  [["global","brand","roleline"],"Content strategy · Video production · Applied AI · Global Scouting"],
  [["global","seo","title"],"Jimmy Park (박지민) | Content Strategy, Video & AI"],
  [["global","seo","desc"],"Jimmy Park (박지민) is a Korea-based content strategist and video producer working across branded content, applied AI, AX workshops and global Scouting."],
  [["global","contact","phone"],"010.5418.6124"],
  [["pages","home","meta","title"],"Jimmy Park (박지민) | Content Strategy, Video & AI"],
  [["pages","home","meta","desc"],"Jimmy Park (박지민) is a Korea-based content strategist and video producer working across branded content, applied AI, AX workshops and global Scouting."],
  [["pages","home","sections","hero","eyebrow"],"Content strategy · Video production · Applied AI"],
  [["pages","home","sections","hero","title"],"Content strategy.\nVideo production.\nApplied AI."],
  [["pages","home","sections","hero","lead"],"I’m Jimmy Park, a Korea-based content strategist and video producer. I develop content from brief to delivery, build AI-assisted web tools, and help teams explore practical AI workflows."],
  [["pages","home","sections","hero","ctaPrimary"],{"label":"Start a project","href":"/contact"}],
  [["pages","home","sections","hero","caption"],"Content, technology, and people."],
  [["pages","home","sections","selected","eyebrow"],"Selected production work"],
  [["pages","home","sections","selected","title"],"The brief. The role. The work."],
  [["pages","home","sections","activities","eyebrow"],"What you can bring me in for"],
  [["pages","home","sections","activities","title"],"Expertise for your next project."],
  [["pages","home","sections","activities","items"],[{"kicker":"01 / Content","title":"Content Strategy & Video Production","desc":"Turn a communication brief into a clear concept, script and production plan. My project work spans branded films, keynote videos, interviews and event media.","tags":["Concept & script","Direction & production","Editing & delivery"],"href":"/work#video","accent":"burgundy"},{"kicker":"02 / AI","title":"Web Development & Applied AI","desc":"Build websites and focused web tools with AI-assisted development, from public pages to the forms and admin consoles behind them. Explore the live sites.","tags":["Websites","Web tools","AI workflows"],"href":"/dev","accent":"burgundy"},{"kicker":"03 / AX","title":"AI Workflow Consulting & Workshops","desc":"Review recurring content tasks, define a focused AI pilot and give your team hands-on practice with a real workflow.","tags":["Workflow review","Pilot design","Workshops"],"href":"/dev#lecture","accent":"burgundy"},{"kicker":"04 / Global","title":"Global Scouting & Collaboration","desc":"Connect content and field media with international Scouting experience, Asia-Pacific communications and cross-cultural collaboration.","tags":["Asia-Pacific","Scouting","Partnerships"],"href":"/scouting#roles","accent":"green"}]],
  [["pages","home","sections","snapshot","body"],"Jimmy Park (박지민, Park Jimin) is a Korea-based content strategist, video producer and AI practitioner. He founded BP Media and works across content production, practical AI tools and international Scouting collaboration."],
  [["pages","home","sections","snapshot","detail"],"His portfolio includes technology films, educational web series, institutional communication and event media. He works in Korean and English; project credits and dated Scouting roles are listed on this site."],
  [["pages","home","sections","approach","eyebrow"],"How we can work together"],
  [["pages","home","sections","approach","title"],"Start with the work. Build a useful next step."],
  [["pages","home","sections","approach","steps"],[{"num":"01","title":"Understand","desc":"Clarify the audience, the goal, and the way work happens today."},{"num":"02","title":"Design","desc":"Choose the message, format, or AI use case that fits the need."},{"num":"03","title":"Make & test","desc":"Produce the content or build a small pilot, then review it with the people who will use it."},{"num":"04","title":"Put it to use","desc":"Prepare the output, guidance, and next steps for the team."}]],
  [["pages","home","sections","cta","title"],"Have a brief in mind?"],
  [["pages","home","sections","cta","body"],"Tell me the audience, deliverables and timing. For introductions or Scouting collaboration, a short hello is welcome too."],
  [["pages","home","sections","cta","button"],{"label":"Start a conversation","href":"/contact"}],
  [["pages","dev","meta","title"],"Dev Work: Websites & Applied AI | Jimmy Park"],
  [["pages","dev","meta","desc"],"Live websites developed by Jimmy Park, including Korea Dream Path, a fermented-foods cooperative, the nfee reporting service and the BANGINOJA travel community, plus applied AI tools and AX workshops."],
  [["pages","dev","sections","intro","title"],"Websites and web tools,\nbuilt for real use."],
  [["pages","dev","sections","intro","lead"],"Live websites I have developed for education, a food cooperative, after-school program administration and a travel community, alongside applied AI tools and practical AI workflow workshops."],
  [["pages","dev","sections","sites","sub"],"Developed, launched and in use"],
  [["pages","dev","sections","sites","desc"],"Websites I have developed and launched, from public pages to the forms, member accounts and admin consoles behind them. Each link opens the live site."],
  [["pages","contact","meta","title"],"Contact Jimmy Park | Video, AI & Project Collaboration"],
  [["pages","contact","meta","desc"],"Contact Jimmy Park for content strategy, video production, AI-assisted web projects, practical workshops and international Scouting collaboration."],
  [["pages","contact","sections","intro","eyebrow"],"Let’s collaborate"],
  [["pages","contact","sections","intro","title"],"Discuss a video, AI\nor collaboration project."],
  [["pages","contact","sections","intro","lead"],"Share your goal, audience, timeline and expected deliverables. Contact me about content strategy and video production, AI prototypes, practical workshops or Scouting collaboration."]
];
const V10_SITE_ROWS = [{"id":"korea-dream-path","title":"Korea Dream Path","year":"2026","role":"Web development","desc":"A global learning platform connecting young people worldwide with Korean higher education, with program, scholarship and online application pages.","stack":"Cloudflare Workers · KV · D1 · R2","format":"Education · Global learning platform","href":"https://koreadreampath.com","linkLabel":"Visit koreadreampath.com","image":"/assets/img/dev/korea-dream-path.jpg"},{"id":"charmjt","title":"Authentic Korean Traditional Fermented Foods Cooperative","year":"2026","role":"Web development","desc":"The cooperative’s official website for fermentation education, instructor-course applications, a product shop with order lookup, news and an admin console.","stack":"Cloudflare Pages Functions · D1 · R2","format":"Food cooperative · Official website","href":"https://charmjt.org","linkLabel":"Visit charmjt.org","image":"/assets/img/dev/charmjt.jpg"},{"id":"nfee","title":"nfee","year":"2026","role":"Web development","desc":"A web service for after-school program instructors to write result reports and fee claims, print them in the original A4 forms and submit them for administrator review.","stack":"Cloudflare Pages Functions · D1","format":"Education administration · Web service","href":"https://nfee.app","linkLabel":"Visit nfee.app","image":"/assets/img/dev/nfee.jpg"},{"id":"banginoja","title":"BANGINOJA","year":"2026","role":"Web development","desc":"A community for exploring Korea’s history, culture and nature through palace and regional tours, lectures, history columns and a members’ community.","stack":"React · Cloudflare Workers · D1 · R2","format":"Travel community · Korean history & culture","href":"https://bgnj.net","linkLabel":"Visit bgnj.net","image":"/assets/img/dev/banginoja.jpg"}];
function migrateTo10(doc) {
  for (const [path, previous] of V10_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  const sites = doc.pages && doc.pages.dev && doc.pages.dev.sections && doc.pages.dev.sections.sites;
  if (sites && Array.isArray(sites.items)) {
    sites.items = sites.items.map(row => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
      const seed = V10_SITE_ROWS.find(previous => matchesLegacy(row, previous));
      const next = seed && DEFAULT.pages.dev.sections.sites.items.find(item => item.id === seed.id);
      if (next) return JSON.parse(JSON.stringify(next));
      // Custom rows keep their text; new fields start empty rather than inheriting the first default row.
      return { ...row, summary: row.summary !== undefined ? row.summary : (row.desc || ''), need: row.need || '', built: row.built || '', mobileImage: row.mobileImage || '' };
    });
  }
  doc.version = 10;
  return doc;
}

// v11: each website row shows what runs behind it — admin features, key back-end facts and,
// where a demo without personal data exists, an admin screenshot.
const V11_SEEDS = [
  [["pages","dev","sections","sites","desc"],"Each site began with what its users and team needed to do. Every one is live and in use."]
];
const V11_SITE_ROWS = [{"id":"korea-dream-path","title":"Korea Dream Path","format":"Education · Global learning platform","year":"2026","role":"Planning & development","summary":"A global learning platform connecting young people worldwide with Korean higher education.","need":"One place where young people around the world can discover programs and scholarships and apply online.","built":"Program and scholarship pages, an online application flow, member sign-up, news and stories, and an admin console for the team.","stack":"Cloudflare Workers · KV · D1 · R2","href":"https://koreadreampath.com","linkLabel":"Visit koreadreampath.com","image":"/assets/img/dev/korea-dream-path.jpg","mobileImage":"/assets/img/dev/korea-dream-path-mobile.jpg"},{"id":"charmjt","title":"Authentic Korean Traditional Fermented Foods Cooperative","format":"Food cooperative · Official website","year":"2026","role":"Planning & development","summary":"The official website of a traditional fermented-foods cooperative.","need":"One site where visitors can learn about fermentation education, apply for the instructor course and order the cooperative’s products.","built":"Education and course-application pages, a product shop with guest order lookup, member accounts, a news board and an admin console.","stack":"Cloudflare Pages Functions · D1 · R2","href":"https://charmjt.org","linkLabel":"Visit charmjt.org","image":"/assets/img/dev/charmjt.jpg","mobileImage":"/assets/img/dev/charmjt-mobile.jpg"},{"id":"nfee","title":"nfee","format":"Education administration · Web service","year":"2026","role":"Planning & development","summary":"A reporting service for after-school program instructors.","need":"Instructors who are not used to computers had to file program reports and fee claims in fixed A4 formats, and administrators had to review them.","built":"A step-by-step writing flow, print-ready A4 forms, school confirmation links with signatures and an administrator review console.","stack":"Cloudflare Pages Functions · D1","href":"https://nfee.app","linkLabel":"Visit nfee.app","image":"/assets/img/dev/nfee.jpg","mobileImage":"/assets/img/dev/nfee-mobile.jpg"},{"id":"banginoja","title":"BANGINOJA","format":"Travel community · Korean history & culture","year":"2026","role":"Planning & development","summary":"A travel community for exploring Korea’s history, culture and nature.","need":"A home for a travel community’s tours, lectures and history writing, where members can join in and talk.","built":"Tour and lecture pages, history columns, a members’ community board and an admin console.","stack":"React · Cloudflare Workers · D1 · R2","href":"https://bgnj.net","linkLabel":"Visit bgnj.net","image":"/assets/img/dev/banginoja.jpg","mobileImage":"/assets/img/dev/banginoja-mobile.jpg"}];
function upgradeSiteRows(items, nextRows) {
  if (!Array.isArray(items)) return items;
  return items.map(row => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
    const seed = V11_SITE_ROWS.find(previous => matchesLegacy(row, previous));
    const next = seed && (nextRows.find(item => item.id === seed.id) || DEFAULT.pages.dev.sections.sites.items.find(item => item.id === seed.id));
    if (next) return JSON.parse(JSON.stringify(next));
    // Custom rows start without back-end details instead of inheriting the first default row.
    return { ...row, backend: row.backend || '', stats: row.stats || '', adminImage: row.adminImage || '', adminCaption: row.adminCaption || '' };
  });
}
function migrateTo11(doc) {
  for (const [path, previous] of V11_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  const pages = doc.pages || {};
  const sites = pages.dev && pages.dev.sections && pages.dev.sections.sites;
  if (sites) sites.items = upgradeSiteRows(sites.items, DEFAULT.pages.dev.sections.sites.items);
  const selected = pages.home && pages.home.sections && pages.home.sections.selected;
  if (selected) selected.sites = upgradeSiteRows(selected.sites, DEFAULT.pages.home.sections.selected.sites);
  doc.version = 11;
  return doc;
}

// v12: the owner's goal is winning projects. Korea Dream Path is shown as the owner's own
// platform (CEO), home features the strongest recent films, Insights leaves the navigation
// until it has posts, and early seed values that older migrations missed are refreshed.
const V12_SEEDS = [
  [["pages","home","sections","hero","eyebrow"],"Solution maker · Content · Web · AI"],
  [["pages","home","sections","hero","image"],"/assets/img/jimmy-park-portrait.jpg?v=0.5.1"],
  [["pages","home","sections","selected","cases"],[{"id":"ai2re","title":"AI2RE by SPAID","year":"2025","role":"Planning & Direction Lead","desc":"CES Innovation Award promotional film for AI2RE.","href":"https://www.youtube.com/watch?v=OmnvbFs-6Ws","image":"https://i.ytimg.com/vi/OmnvbFs-6Ws/hqdefault.jpg","format":"Technology · Promotional film","linkLabel":"Watch film"},{"id":"d-hack","title":"D-Hack × Sisa Japanese","year":"2021","role":"Planning & Direction","desc":"A Japanese-learning web entertainment series featuring D-Hack.","href":"https://drive.google.com/drive/folders/1oss4rQepxf1_Bi1ryEBJyThOrAzhZeIh","image":"/assets/img/video/d-hack.jpg","format":"Education · Web series","linkLabel":"View series"},{"id":"siheung","title":"Siheung Policy EZ","year":"2021","role":"Planning, Direction, Filming & Editing","desc":"A policy information series using presenter footage, chroma key and motion graphics.","href":"https://drive.google.com/drive/folders/14K3KOWnmX50TZKDFmjr4isRzpRZs6SmO","image":"/assets/img/video/siheung.jpg","format":"Public communication · Video series","linkLabel":"View series"}]],
  [["pages","home","sections","snapshot","body"],"Jimmy Park (박지민, Park Jimin) is a Korea-based solution maker. He starts from what a client needs to achieve, then delivers the most fitting solution: video production, a website built with AI, an AI workflow or international Scouting collaboration. He founded BP Media."],
  [["pages","home","sections","snapshot","rows"],[{"label":"Content & media","value":"BP Media · Founder, 2026–"},{"label":"Asia-Pacific","value":"Communications & Partnerships · 2nd Vice Chair, 2025–2028"},{"label":"International fieldwork","value":"25th World Scout Jamboree · Korean Contingent Media, 2023"},{"label":"Based in","value":"Korea · Korean / English"}]],
  [["pages","home","sections","projects","title"],"Projects, writing and professional connections."],
  [["pages","home","sections","projects","items"],[{"tag":"Professional network","title":"Connect on LinkedIn","desc":"For professional introductions, shared interests and future collaboration.","href":"https://www.linkedin.com/in/jimmy1420","image":""},{"tag":"International collaboration","title":"Global & Scouting","desc":"My dated roles, international experience and Scouting media work.","href":"/scouting","image":""},{"tag":"Writing & ideas","title":"Insights","desc":"A home for notes on content, AI and working across cultures.","href":"/insights","image":""}]],
  [["pages","dev","sections","sites","sub"],"Built around each client’s need"],
  [["pages","home","sections","snapshot","rows"],[{"label":"Content & media","value":"BP Media · Founder, 2026–"},{"label":"Asia-Pacific","value":"Communications & Partnerships · 2nd Vice Chair, 2025–2028"},{"label":"International fieldwork","value":"25th World Scout Jamboree · Korean Contingent Media, 2023"},{"label":"Base","value":"Korea · Korean / English"}]],
  [["pages","work","meta","desc"],"Field documentation, purpose-based video, and small web prototypes — Jimmy Park combines photography, video, and digital tools depending on what the project needs."],
  [["pages","contact","meta","desc"],"Contact Jimmy Park for collaboration, event documentation, video production, Scouting projects, or small web prototypes. Email, phone, Korean / English."],
  [["pages","home","sections","projects","feature","desc"],"A Scouting-specialized media platform documenting stories, events, people, and international movement in Korean."],
  [["pages","scouting","sections","mediaprojects","feature","desc"],"A Scouting-specialized media platform documenting stories, events, people, and international movement in Korean."],
  [["pages","dev","sections","vibecoding","sub"],"Small systems that make ideas work · 아이디어를 작동하게"]
];
const V12_KDP_ROW = {"id":"korea-dream-path","title":"Korea Dream Path","format":"Education · Global learning platform","year":"2026","role":"Planning & development","summary":"A global learning platform connecting young people worldwide with Korean higher education.","need":"One place where young people around the world can discover programs and scholarships and apply online.","built":"Program and scholarship pages, an online application flow, member sign-up, news and stories, and an admin console for the team.","stack":"Cloudflare Workers · KV · D1 · R2","backend":"Edit every page of the site without code, with a live preview\nMove applicants through admission stages, with every change logged\nHandle company email, including attachments, inside the admin\nManage members, groups and role-based permissions, with two-factor sign-in for sensitive sections\nAnswer student inquiries and send notification campaigns\nFollow visitor journeys and catch errors on a monitoring dashboard","stats":"50 admin tabs · 95 API routes · Encrypted personal data · Automatic data-retention clean-up","href":"https://koreadreampath.com","linkLabel":"Visit koreadreampath.com","image":"/assets/img/dev/korea-dream-path.jpg","mobileImage":"/assets/img/dev/korea-dream-path-mobile.jpg","adminImage":"","adminCaption":""};
function migrateTo12(doc) {
  for (const [path, previous] of V12_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  const pages = doc.pages || {};
  const lists = [
    [pages.dev && pages.dev.sections && pages.dev.sections.sites, 'items', DEFAULT.pages.dev.sections.sites.items],
    [pages.home && pages.home.sections && pages.home.sections.selected, 'sites', DEFAULT.pages.home.sections.selected.sites],
  ];
  for (const [owner, key, next] of lists) {
    if (!owner || !Array.isArray(owner[key])) continue;
    owner[key] = owner[key].map(row => matchesLegacy(row, V12_KDP_ROW) ? JSON.parse(JSON.stringify(next.find(item => item.id === V12_KDP_ROW.id))) : row);
  }
  doc.version = 12;
  return doc;
}

// v13: BP Media joins the website showcase (the owner's own Scouting media platform) and the
// cooperative's row tells how its product detail pages were made with AI.
const V13_SEEDS = [
  [["pages","home","sections","projects","feature","href"],"/scouting#mediaprojects"],
  [["pages","home","sections","snapshot","detail"],"His work includes technology films, educational web series and event media, as well as live websites for global education, a food cooperative, after-school program administration and a travel community. He works in Korean and English; project credits and dated Scouting roles are listed on this site."],
  [["pages","dev","meta","desc"],"Websites and web tools built around what clients actually need and delivered fast with AI, including Korea Dream Path, a fermented-foods cooperative, the nfee reporting service and the BANGINOJA travel community."]
];
const V13_HOME_SITES = [{"id":"korea-dream-path","title":"Korea Dream Path","format":"Own platform · Global education","year":"2026","role":"CEO · Planning & development","summary":"The global learning platform I lead as CEO, connecting young people worldwide with Korean higher education.","need":"One place where young people around the world can discover programs and scholarships and apply online.","built":"Program and scholarship pages, an online application flow, member sign-up, news and stories, and an admin console for the team.","stack":"Cloudflare Workers · KV · D1 · R2","backend":"Edit every page of the site without code, with a live preview\nMove applicants through admission stages, with every change logged\nHandle company email, including attachments, inside the admin\nManage members, groups and role-based permissions, with two-factor sign-in for sensitive sections\nAnswer student inquiries and send notification campaigns\nFollow visitor journeys and catch errors on a monitoring dashboard","stats":"50 admin tabs · 95 API routes · Encrypted personal data · Automatic data-retention clean-up","href":"https://koreadreampath.com","linkLabel":"Visit koreadreampath.com","image":"/assets/img/dev/korea-dream-path.jpg","mobileImage":"/assets/img/dev/korea-dream-path-mobile.jpg","adminImage":"","adminCaption":""},{"id":"charmjt","title":"Authentic Korean Traditional Fermented Foods Cooperative","format":"Food cooperative · Official website","year":"2026","role":"Planning & development","summary":"The official website of a traditional fermented-foods cooperative.","need":"One site where visitors can learn about fermentation education, apply for the instructor course and order the cooperative’s products.","built":"Education and course-application pages, a product shop with guest order lookup, member accounts, a news board and an admin console.","stack":"Cloudflare Pages Functions · D1 · R2","backend":"Manage products, stock and orders from payment to shipping with tracking numbers\nHandle cancellations, returns and exchanges, with sales reports and CSV export\nRun course intakes, applicants and inquiries from one dashboard\nEdit page text and photos in place, with PC and mobile previews\nGive staff accounts role-based permissions\nKeep automatic daily backups and ask a help chatbot that answers from the manual","stats":"Server-checked order totals · Guest order lookup · Locked-down admin sign-in · AI help chatbot","href":"https://charmjt.org","linkLabel":"Visit charmjt.org","image":"/assets/img/dev/charmjt.jpg","mobileImage":"/assets/img/dev/charmjt-mobile.jpg","adminImage":"/assets/img/dev/charmjt-admin.jpg","adminCaption":"Admin dashboard in local demo mode, with no customer data."},{"id":"banginoja","title":"BANGINOJA","format":"Travel community · Korean history & culture","year":"2026","role":"Planning & development","summary":"A travel community for exploring Korea’s history, culture and nature.","need":"A home for a travel community’s tours, lectures and history writing, where members can join in and talk.","built":"Tour and lecture pages, history columns, a members’ community board and an admin console.","stack":"React · Cloudflare Workers · D1 · R2","backend":"Publish history columns as drafts, scheduled or live posts\nRun lectures and tours with sign-ups, payment checks and reviews\nSell books with order, shipping and refund handling\nManage a guesthouse booking system: rooms, rates, availability and coupons\nModerate the community with a report queue and automatic member grades\nWatch analytics, audit and error logs, and manage search-engine settings","stats":"143 API handlers · About 40 database tables · 368 recorded releases","href":"https://bgnj.net","linkLabel":"Visit bgnj.net","image":"/assets/img/dev/banginoja.jpg","mobileImage":"/assets/img/dev/banginoja-mobile.jpg","adminImage":"","adminCaption":""}];
const V13_CHAM_ROW = {"id":"charmjt","title":"Authentic Korean Traditional Fermented Foods Cooperative","format":"Food cooperative · Official website","year":"2026","role":"Planning & development","summary":"The official website of a traditional fermented-foods cooperative.","need":"One site where visitors can learn about fermentation education, apply for the instructor course and order the cooperative’s products.","built":"Education and course-application pages, a product shop with guest order lookup, member accounts, a news board and an admin console.","stack":"Cloudflare Pages Functions · D1 · R2","backend":"Manage products, stock and orders from payment to shipping with tracking numbers\nHandle cancellations, returns and exchanges, with sales reports and CSV export\nRun course intakes, applicants and inquiries from one dashboard\nEdit page text and photos in place, with PC and mobile previews\nGive staff accounts role-based permissions\nKeep automatic daily backups and ask a help chatbot that answers from the manual","stats":"Server-checked order totals · Guest order lookup · Locked-down admin sign-in · AI help chatbot","href":"https://charmjt.org","linkLabel":"Visit charmjt.org","image":"/assets/img/dev/charmjt.jpg","mobileImage":"/assets/img/dev/charmjt-mobile.jpg","adminImage":"/assets/img/dev/charmjt-admin.jpg","adminCaption":"Admin dashboard in local demo mode, with no customer data."};
function migrateTo13(doc) {
  for (const [path, previous] of V13_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  const pages = doc.pages || {};
  const clone = value => JSON.parse(JSON.stringify(value));
  // Home website cards: replace the untouched earlier trio (rows may already be newer defaults).
  const selected = pages.home && pages.home.sections && pages.home.sections.selected;
  const current = id => DEFAULT.pages.dev.sections.sites.items.find(item => item.id === id);
  if (selected && Array.isArray(selected.sites) && selected.sites.length === V13_HOME_SITES.length &&
      selected.sites.every((row, i) => row && row.id === V13_HOME_SITES[i].id && (matchesLegacy(row, V13_HOME_SITES[i]) || matchesLegacy(row, current(row.id)) || matchesLegacy(row, V13_CHAM_ROW)))) {
    selected.sites = clone(DEFAULT.pages.home.sections.selected.sites);
  }
  const nextCham = DEFAULT.pages.dev.sections.sites.items.find(item => item.id === V13_CHAM_ROW.id);
  const lists = [pages.dev && pages.dev.sections && pages.dev.sections.sites, pages.home && pages.home.sections && pages.home.sections.selected];
  lists.forEach((owner, i) => {
    const key = i === 0 ? 'items' : 'sites';
    if (owner && Array.isArray(owner[key])) owner[key] = owner[key].map(row => matchesLegacy(row, V13_CHAM_ROW) ? clone(nextCham) : row);
  });
  // Add the BP Media row once, right after Korea Dream Path, unless the owner already listed it.
  const sites = lists[0];
  if (sites && Array.isArray(sites.items)) {
    const bp = DEFAULT.pages.dev.sections.sites.items.find(item => item.id === 'bp-media');
    const listed = sites.items.some(row => row && (row.id === bp.id || /(^|\/\/)bpmedia\.net/.test(row.href || '')));
    if (!listed) {
      const kdp = sites.items.findIndex(row => row && row.id === 'korea-dream-path');
      sites.items.splice(kdp < 0 ? 0 : kdp + 1, 0, clone(bp));
    }
  }
  doc.version = 13;
  return doc;
}

// v14: the Samsung keynote card gets a still (owner-approved frames from the keynote videos).
// Only a card whose image is still empty receives it; an uploaded image stays.
function migrateTo14(doc) {
  const pages = doc.pages || {};
  const lists = [pages.work && pages.work.sections && pages.work.sections.video && pages.work.sections.video.cases,
    pages.home && pages.home.sections && pages.home.sections.selected && pages.home.sections.selected.cases];
  for (const rows of lists) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) if (row && row.id === 'samsung-keynote' && !String(row.image || '').trim()) row.image = "/assets/img/video/samsung-keynote.jpg";
  }
  doc.version = 14;
  return doc;
}

// v15: the remaining video cards without a still (KB Life interviews, Korea Jamboree opening)
// get owner-requested captures. Only cards whose image is still empty receive them.
const V15_STILLS = {"kb-life": "/assets/img/video/kb-life.jpg", "korean-jamboree-opening": "/assets/img/video/korean-jamboree-opening.jpg"};
function migrateTo15(doc) {
  const pages = doc.pages || {};
  const lists = [pages.work && pages.work.sections && pages.work.sections.video && pages.work.sections.video.cases,
    pages.home && pages.home.sections && pages.home.sections.selected && pages.home.sections.selected.cases];
  for (const rows of lists) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) if (row && V15_STILLS[row.id] && !String(row.image || '').trim()) row.image = V15_STILLS[row.id];
  }
  doc.version = 15;
  return doc;
}

// v16: both BP Media feature cards (Home "Stay connected", Scouting "Media projects") show an
// owner-requested capture of bpmedia.net. Only a card whose image is still empty receives it.
const V16_BP_MEDIA_IMAGE = "/assets/img/bp-media-card.jpg";
function migrateTo16(doc) {
  const pages = doc.pages || {};
  const features = [pages.home && pages.home.sections && pages.home.sections.projects && pages.home.sections.projects.feature,
    pages.scouting && pages.scouting.sections && pages.scouting.sections.mediaprojects && pages.scouting.sections.mediaprojects.feature];
  for (const feature of features) if (feature && typeof feature === 'object' && !String(feature.image || '').trim()) feature.image = V16_BP_MEDIA_IMAGE;
  doc.version = 16;
  return doc;
}


// v17: homepage Video + Education + AI positioning. Only unchanged v16 seed values move.
const V17_SEEDS = [
  [["global","brand","roleline"],"Solutions through content, web & AI · Global Scouting"],
  [["global","footer","tagline"],"SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION."],
  [["global","seo","title"],"Jimmy Park (박지민) | Solutions Through Content, Web & AI"],
  [["global","seo","desc"],"Jimmy Park (박지민) is a Korea-based solution maker who helps clients reach their goals in the most fitting way: video production, websites built with AI, AI workflows and global Scouting collaboration."],
  [["pages","home","meta","title"],"Jimmy Park (박지민) | Solutions Through Content, Web & AI"],
  [["pages","home","meta","desc"],"Jimmy Park (박지민) is a Korea-based solution maker who helps clients reach their goals in the most fitting way: video production, websites built with AI, AI workflows and global Scouting collaboration."],
  [["pages","home","sections","hero","eyebrow"],"Solution maker · Video producer & web developer"],
  [["pages","home","sections","hero","title"],"Your goal.\nThe right way to reach it."],
  [["pages","home","sections","hero","title"],"I make video.\nBuild learning experiences.\nApply AI."],
  [["pages","home","sections","hero","lead"],"I’m Jimmy Park — a Korea-based video producer, education platform builder, and AI practitioner. From branded films and storytelling to learning platforms, workshops, and AI-assisted creation, I help teams turn ideas into work people can watch, use, and teach from."],

  [["pages","home","sections","hero","lead"],"I’m Jimmy Park, a Korea-based solution maker. I work out what you actually need, then deliver it in the form that fits best: a film, a website, an AI workflow or an international connection. AI helps me move from idea to result quickly."],
  [["pages","home","sections","hero","ctaPrimary"],{"label":"Tell me your goal","href":"/contact"}],
  [["pages","home","sections","hero","caption"],"The need first, then the right tool."],
  [["pages","home","sections","selected","title"],"Different goals. Different solutions."],
  [["pages","home","sections","activities","title"],"What do you need to achieve?"],
  [["pages","home","sections","activities","items"],[{"kicker":"01 / Be understood","title":"Content & Video Production","desc":"When people need to understand, remember or act on your message: concept, script, filming and editing, delivered as a film or series.","tags":["Promotional films","Keynotes","Interviews & series"],"href":"/work","accent":"burgundy"},{"kicker":"02 / Launch online","title":"Websites & Web Tools","desc":"When you need a website or tool people will actually use: public pages, forms, member accounts and admin consoles, built quickly with AI.","tags":["Websites","Admin tools","Built with AI"],"href":"/dev","accent":"burgundy"},{"kicker":"03 / Work smarter","title":"AI Workflows & Workshops","desc":"When your team wants AI in everyday work: review the workflow, pilot one use case and practice it hands-on together.","tags":["Workflow review","Pilot","Workshops"],"href":"/dev#lecture","accent":"burgundy"},{"kicker":"04 / Reach further","title":"Global Scouting & Collaboration","desc":"When your project crosses borders: international Scouting experience, Asia-Pacific communications and cross-cultural partnerships.","tags":["Asia-Pacific","Scouting","Partnerships"],"href":"/scouting#roles","accent":"green"}]],
  [["pages","home","sections","snapshot","body"],"Jimmy Park (박지민, Park Jimin) is a Korea-based solution maker. He starts from what a client needs to achieve, then delivers the most fitting solution: video production, a website built with AI, an AI workflow or international Scouting collaboration. He founded BP Media and leads Korea Dream Path as CEO."],
  [["pages","home","sections","snapshot","detail"],"His work includes technology films, educational web series and event media, as well as live websites for global education, Scouting media, a food cooperative, after-school program administration and a travel community. He works in Korean and English; project credits and dated Scouting roles are listed on this site."],
  [["pages","home","sections","approach","title"],"Understand the need. Choose the fitting way. Deliver it fast."],
  [["pages","home","sections","approach","steps"],[{"num":"01","title":"Listen","desc":"Clarify your goal, the people involved and what a good result looks like."},{"num":"02","title":"Choose","desc":"Pick the most fitting form, whether a film, a website, an AI workflow or a partnership."},{"num":"03","title":"Build with AI","desc":"Make it quickly with AI, then test it with the people who will use it."},{"num":"04","title":"Hand over","desc":"Deliver the result with the guidance your team needs to keep using it."}]],
  [["pages","home","sections","projects","title"],"Network, background and hiring."],
  [["pages","home","sections","cta","title"],"Have a goal in mind?"],
  [["pages","home","sections","cta","body"],"Tell me what you want to achieve, who it is for and when you need it. I’ll suggest the most fitting way to get there."],
  [["pages","home","sections","cta","button"],{"label":"Tell me your goal","href":"/contact"}],
  [["pages","contact","meta","title"],"Contact Jimmy Park | Tell Me Your Goal"],
  [["pages","contact","meta","desc"],"Contact Jimmy Park by email or phone (+82). Share your goal, audience, timing and budget, and get the most fitting approach: video, website, AI workflow or global collaboration."]
];
function migrateTo17(doc) {
  for (const [path, previous] of V17_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  doc.version = 17;
  return doc;
}

// v18: tighten homepage hero lead only.
const V18_SEEDS = [
  [["pages","home","sections","hero","lead"],"I’m Jimmy Park — a Korea-based video producer, education platform builder, and AI practitioner. From branded films and storytelling to learning platforms, workshops, and AI-assisted creation, I help teams turn ideas into work people can watch, use, and teach from."],
];
function migrateTo18(doc) {
  for (const [path, previous] of V18_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  doc.version = 18;
  return doc;
}

// v19: more magnetic homepage hero lead.
const V19_SEEDS = [
  [["pages","home","sections","hero","lead"],"I’m Jimmy Park — Korea-based video producer, education builder, and AI practitioner. I make films people remember, learning platforms people use, and AI workflows teams can actually run."],
];
function migrateTo19(doc) {
  for (const [path, previous] of V19_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  doc.version = 19;
  return doc;
}

// v20: sharper professional homepage hero lead.
const V20_SEEDS = [
  [["pages","home","sections","hero","lead"],"I’m Jimmy Park. I craft video people remember, build learning that travels, and put AI to work in the day-to-day — so ideas become something you can watch, teach, and ship."],
];
function migrateTo20(doc) {
  for (const [path, previous] of V20_SEEDS) {
    let target = doc;
    for (const key of path.slice(0, -1)) target = target && target[key];
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(currentDefault(path)));
  }
  doc.version = 20;
  return doc;
}

// v21: add Lecture page (empty talk history) and retarget homepage education card to /lecture.
function migrateTo21(doc) {
  const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const pages = object(doc.pages) ? doc.pages : (doc.pages = {});
  if (!object(pages.lecture)) {
    pages.lecture = JSON.parse(JSON.stringify(DEFAULT.pages.lecture));
  }
  const acts = pages.home && pages.home.sections && pages.home.sections.activities && pages.home.sections.activities.items;
  if (Array.isArray(acts)) {
    for (const a of acts) {
      if (!a || typeof a !== 'object') continue;
      if (a.href === '/dev' && typeof a.kicker === 'string' && /education/i.test(a.kicker)) a.href = '/lecture';
    }
  }
  doc.version = 21;
  return doc;
}









function normalizeOrders(doc) {
  for (const p of Object.keys(DEFAULT.pages)) {
    if (doc.pages && doc.pages[p]) doc.pages[p].order = mergeOrder(DEFAULT.pages[p].order, doc.pages[p].order);
  }
  return doc;
}

// Only navigation/asset URLs can reach executable DOM attributes.
function safeSiteUrl(value, externalOnly = false) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  if (!url) return '';
  if (/[\u0000-\u0020\\]/.test(url)) return '';
  if (!externalOnly && (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//')))) return url;
  if (!url.startsWith('https://')) return '';
  try { const parsed = new URL(url); return parsed.hostname && !parsed.username && !parsed.password ? url : ''; } catch (_) { return ''; }
}
function cleanUrls(value, errors, path = '') {
  if (!value || typeof value !== 'object') return value;
  for (const key of Object.keys(value)) {
    const current = value[key], location = path ? path + '.' + key : key;
    if (['href','image','linkedin'].includes(key) && typeof current === 'string') {
      const safe = safeSiteUrl(current, key === 'linkedin');
      if (current.trim() && !safe && errors) errors.push(location);
      value[key] = safe;
    } else if (current && typeof current === 'object') cleanUrls(current, errors, location);
  }
  return value;
}
function completeShape(def, value) {
  if (Array.isArray(def)) return Array.isArray(value) && value.every(item => !def.length || completeShape(def[0], item));
  if (def && typeof def === 'object') return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(def).every(key => completeShape(def[key], value[key]));
  if (typeof def === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === typeof def;
}
function validDocument(value) {
  const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
  return object(value) && [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].includes(value.version) && object(value.global) && object(value.pages) &&
    ['home','work','scouting','contact'].every(page => object(value.pages[page]) && object(value.pages[page].sections));
}
async function storedContent(env) {
  const raw = await env.JP_KV.get(KEY);
  if (raw === null || raw === undefined) return null;
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_stored_content');
  const legacy = !parsed.pages && !parsed.global && ['seo','contact','hero'].some(key => parsed[key] && typeof parsed[key] === 'object' && !Array.isArray(parsed[key]));
  const shaped = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].includes(parsed.version) && parsed.global && typeof parsed.global === 'object' && parsed.pages && typeof parsed.pages === 'object' && ['home','work','scouting','contact'].some(key => parsed.pages[key] && parsed.pages[key].sections);
  if (!shaped && !legacy) throw new Error('invalid_stored_content');
  return parsed;
}
export async function onRequestGet({ env }) {
  let doc;
  try { doc = await storedContent(env); } catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
  if (!doc) return json({ ok: true, content: { ...DEFAULT, updatedAt: 0 } });
  if (![2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21].includes(doc.version)) doc = fromV1(doc);
  if ((doc.version || 0) < 3) doc = migrateTo3(doc);
  if ((doc.version || 0) < 4) doc = migrateTo4(doc);
  if ((doc.version || 0) < 5) doc = migrateTo5(doc);
  if ((doc.version || 0) < 6) doc = migrateTo6(doc);
  if ((doc.version || 0) < 7) doc = migrateTo7(doc);
  if ((doc.version || 0) < 8) doc = migrateTo8(doc);
  if ((doc.version || 0) < 9) doc = migrateTo9(doc);
  if ((doc.version || 0) < 10) doc = migrateTo10(doc);
  if ((doc.version || 0) < 11) doc = migrateTo11(doc);
  if ((doc.version || 0) < 12) doc = migrateTo12(doc);
  if ((doc.version || 0) < 13) doc = migrateTo13(doc);
  if ((doc.version || 0) < 14) doc = migrateTo14(doc);
  if ((doc.version || 0) < 15) doc = migrateTo15(doc);
  if ((doc.version || 0) < 16) doc = migrateTo16(doc);
  if ((doc.version || 0) < 17) doc = migrateTo17(doc);
  if ((doc.version || 0) < 18) doc = migrateTo18(doc);
  if ((doc.version || 0) < 19) doc = migrateTo19(doc);
  if ((doc.version || 0) < 20) doc = migrateTo20(doc);
  if ((doc.version || 0) < 21) doc = migrateTo21(doc);
  const clean = cleanUrls(normalizeOrders(sanitize(DEFAULT, doc)));
  clean.updatedAt = doc.updatedAt || 0;
  return json({ ok: true, content: clean });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 2 * 1024 * 1024) return json({ ok: false, error: 'too_large' }, 413);
    body = JSON.parse(raw);
  } catch (_) { return json({ ok: false, error: 'invalid_json' }, 400); }
  const incoming = body && (body.content || body);
  if (!validDocument(incoming)) return json({ ok: false, error: 'invalid_content' }, 400);
  if (incoming.version !== DEFAULT.version) return json({ ok: false, error: 'schema_changed' }, 409);
  if (!completeShape(DEFAULT, incoming)) return json({ ok: false, error: 'incomplete_content' }, 400);
  if (incoming.updatedAt !== undefined && (!Number.isFinite(incoming.updatedAt) || incoming.updatedAt < 0)) return json({ ok: false, error: 'invalid_revision' }, 400);
  let previous;
  try { previous = await storedContent(env); } catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
  // Optimistic conflict detection; KV is eventually consistent, so use one active editor.
  if ((incoming.updatedAt || 0) !== (previous && previous.updatedAt || 0)) return json({ ok: false, error: 'conflict' }, 409);
  if (incoming.version < 3) migrateTo3(incoming);
  if (incoming.version < 4) migrateTo4(incoming);
  if (incoming.version < 5) migrateTo5(incoming);
  if (incoming.version < 6) migrateTo6(incoming);
  if (incoming.version < 7) migrateTo7(incoming);
  if (incoming.version < 8) migrateTo8(incoming);
  if (incoming.version < 9) migrateTo9(incoming);
  if (incoming.version < 10) migrateTo10(incoming);
  if (incoming.version < 11) migrateTo11(incoming);
  if (incoming.version < 12) migrateTo12(incoming);
  if (incoming.version < 13) migrateTo13(incoming);
  if (incoming.version < 14) migrateTo14(incoming);
  if (incoming.version < 15) migrateTo15(incoming);
  if (incoming.version < 16) migrateTo16(incoming);
  if (incoming.version < 17) migrateTo17(incoming);
  if (incoming.version < 18) migrateTo18(incoming);
  if (incoming.version < 19) migrateTo19(incoming);
  if (incoming.version < 20) migrateTo20(incoming);
  if (incoming.version < 21) migrateTo21(incoming);
  const doc = normalizeOrders(sanitize(DEFAULT, incoming));
  const invalidUrls = [];
  cleanUrls(doc, invalidUrls);
  if (invalidUrls.length) return json({ ok: false, error: 'invalid_url', field: invalidUrls[0] }, 400);
  if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(doc.global.contact.email)) return json({ ok: false, error: 'invalid_email' }, 400);
  doc.version = 21;
  doc.updatedAt = Math.max(Date.now(), (previous && previous.updatedAt || 0) + 1);
  try { await env.JP_KV.put(KEY, JSON.stringify(doc)); } catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
  return json({ ok: true, content: doc });
}
