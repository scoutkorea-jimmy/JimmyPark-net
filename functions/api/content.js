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
  "version": 8,
  "global": {
    "brand": {
      "name": "Jimmy Park",
      "roleline": "Content strategy · Video production · Applied AI · Global Scouting"
    },
    "footer": {
      "tagline": "SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.",
      "copyright": "© 2026 Jimmy Park"
    },
    "contact": {
      "email": "scoutkorea@kakao.com",
      "phone": "010.5418.6124",
      "linkedin": "https://www.linkedin.com/in/jimmy1420",
      "location": "Korea · Korean / English"
    },
    "seo": {
      "title": "Jimmy Park (박지민) | Content Strategy, Video & AI",
      "desc": "Jimmy Park (박지민) is a Korea-based content strategist and video producer working across branded content, applied AI, AX workshops and global Scouting."
    }
  },
  "pages": {
    "home": {
      "meta": {
        "title": "Jimmy Park (박지민) | Content Strategy, Video & AI",
        "desc": "Jimmy Park (박지민) is a Korea-based content strategist and video producer working across branded content, applied AI, AX workshops and global Scouting."
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
          "eyebrow": "Content strategy · Video production · Applied AI",
          "title": "Content strategy.\nVideo production.\nApplied AI.",
          "lead": "I’m Jimmy Park, a Korea-based content strategist and video producer. I develop content from brief to delivery, build AI-assisted web tools, and help teams explore practical AI workflows.",
          "ctaPrimary": {
            "label": "Start a project",
            "href": "/contact"
          },
          "ctaGhost": {
            "label": "See selected work",
            "href": "#selected"
          },
          "image": "/assets/img/jimmy-park-portrait.jpg?v=0.5.1",
          "badge": "Jimmy Park",
          "caption": "Content, technology, and people.",
          "captionRight": "Based in Korea"
        },
        "snapshot": {
          "rows": [
            {
              "label": "Content & media",
              "value": "BP Media · Founder, 2026–"
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
          "body": "Jimmy Park (박지민, Park Jimin) is a Korea-based content strategist, video producer and AI practitioner. He founded BP Media and works across content production, practical AI tools and international Scouting collaboration.",
          "detail": "His portfolio includes technology films, educational web series, institutional communication and event media. He works in Korean and English; project credits and dated Scouting roles are listed on this site."
        },
        "activities": {
          "eyebrow": "What you can bring me in for",
          "title": "Expertise for your next project.",
          "items": [
            {
              "kicker": "01 / Content",
              "title": "Content Strategy & Video Production",
              "desc": "Turn a communication brief into a clear concept, script and production plan. My project work spans branded films, keynote videos, interviews and event media.",
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
              "title": "Applied AI & Web Prototyping",
              "desc": "Use AI-assisted development to build focused web tools and test workflows around a practical need. Explore the available projects.",
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
              "title": "AI Workflow Consulting & Workshops",
              "desc": "Review recurring content tasks, define a focused AI pilot and give your team hands-on practice with a real workflow.",
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
              "title": "Global Scouting & Collaboration",
              "desc": "Connect content and field media with international Scouting experience, Asia-Pacific communications and cross-cultural collaboration.",
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
          "eyebrow": "How we can work together",
          "title": "Start with the work. Build a useful next step.",
          "steps": [
            {
              "num": "01",
              "title": "Understand",
              "desc": "Clarify the audience, the goal, and the way work happens today."
            },
            {
              "num": "02",
              "title": "Design",
              "desc": "Choose the message, format, or AI use case that fits the need."
            },
            {
              "num": "03",
              "title": "Make & test",
              "desc": "Produce the content or build a small pilot, then review it with the people who will use it."
            },
            {
              "num": "04",
              "title": "Put it to use",
              "desc": "Prepare the output, guidance, and next steps for the team."
            }
          ]
        },
        "projects": {
          "eyebrow": "Stay connected",
          "title": "Projects, writing and professional connections.",
          "feature": {
            "badge": "Content strategy · Global Scouting",
            "sub": "Founder · Scouting media",
            "title": "BP Media",
            "desc": "A Scouting media platform bringing stories, events, and people into a shared editorial space. My work connects field documentation with content planning and international perspectives.",
            "href": "/scouting#mediaprojects",
            "image": ""
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
              "tag": "Writing & ideas",
              "title": "Insights",
              "desc": "A home for notes on content, AI and working across cultures.",
              "href": "/insights",
              "image": ""
            }
          ]
        },
        "cta": {
          "title": "Have a brief in mind?",
          "body": "Tell me the audience, deliverables and timing. For introductions or Scouting collaboration, a short hello is welcome too.",
          "button": {
            "label": "Start a conversation",
            "href": "/contact"
          }
        },
        "selected": {
          "eyebrow": "Selected production work",
          "title": "The brief. The role. The work.",
          "cases": [
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
            }
          ]
        }
      }
    },
    "work": {
      "meta": {
        "title": "Video Production, Applied AI & AX Workshops | Jimmy Park",
        "desc": "Explore Jimmy Park’s video production credits, AI-assisted web projects, practical AX workshops and event photography. View films and discuss a project."
      },
      "order": [
        "intro",
        "video",
        "vibecoding",
        "lecture",
        "photography",
        "cta"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Work & collaboration",
          "title": "Video production, applied AI\nand practical workshops.",
          "lead": "Explore video production credits, web tools built with AI-assisted development, and collaboration opportunities in content strategy and AI adoption."
        },
        "photography": {
          "kicker": "04 / Field production",
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
              "desc": "Keynote presentation videos combining presenter footage, chroma key and presentation graphics.",
              "href": "https://drive.google.com/drive/folders/1IwaEHy3QLIeYCXLcSPlfMnP-hgoZ9s6g",
              "image": "",
              "format": "Technology · Keynote videos",
              "linkLabel": "View video collection"
            },
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
              "image": "",
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
              "image": "",
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
          "title": "Have a brief, a workflow, or an idea to explore?",
          "body": "Share the goal, the people involved, and what you need to deliver. We can define the content, prototype, or workshop that fits.",
          "button": {
            "label": "Discuss a project",
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
            "image": ""
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
        "title": "Contact Jimmy Park | Video, AI & Project Collaboration",
        "desc": "Contact Jimmy Park for content strategy, video production, AI-assisted web projects, practical workshops and international Scouting collaboration."
      },
      "order": [
        "intro"
      ],
      "hidden": [],
      "sections": {
        "intro": {
          "eyebrow": "Let’s collaborate",
          "title": "Discuss a video, AI\nor collaboration project.",
          "lead": "Share your goal, audience, timeline and expected deliverables. Contact me about content strategy and video production, AI prototypes, practical workshops or Scouting collaboration."
        }
      }
    }
  },
  "updatedAt": 0
};

// ── generic validator: use DEFAULT as the schema, clamp strings/arrays ────────
function sanitize(def, val) {
  if (typeof def === "string") return val == null ? def : String(val).slice(0, MAXSTR);
  if (typeof def === "number") { const n = Number(val); return Number.isFinite(n) ? n : def; }
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return def;
    const tmpl = def.length ? def[0] : "";
    return val.slice(0, MAXARR).map((item) =>
      typeof tmpl === "object" && tmpl !== null ? sanitize(tmpl, item) : String(item == null ? "" : item).slice(0, MAXSTR)
    );
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
  replaceProject(work && work.vibecoding, DEFAULT.pages.work.sections.vibecoding.items[1]);
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
function migrateTo7(doc) {
  const clone = value => JSON.parse(JSON.stringify(value));
  for (const [path, previous] of V7_SEEDS) {
    let target = doc, next = DEFAULT;
    for (const key of path.slice(0, -1)) { target = target && target[key]; next = next[key]; }
    const key = path[path.length - 1];
    const saved = target && key === 'order' ? mergeOrder(previous, target[key]) : target && target[key];
    if (target && matchesLegacy(saved, previous)) target[key] = clone(next[key]);
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
    let target = doc, next = DEFAULT;
    for (const key of path.slice(0, -1)) { target = target && target[key]; next = next[key]; }
    const key = path[path.length - 1];
    if (target && matchesLegacy(target[key], previous)) target[key] = JSON.parse(JSON.stringify(next[key]));
  }
  const work = doc.pages && doc.pages.work && doc.pages.work.sections;
  if (work && work.vibecoding && Array.isArray(work.vibecoding.items)) {
    work.vibecoding.items = work.vibecoding.items.filter(item => !['card-news','bp-media-tools'].includes(item.slug) && !['Card News Generator','BP Media Tools'].includes(item.title));
    for (const item of work.vibecoding.items) {
      if (item.slug === 'scout-tour-assistant' || item.title === 'Scout Tour Assistant') {
        item.href = 'https://scoutingapp.net/tour/'; item.status = 'Live';
        if (item.desc === 'A map-based prototype for discovering and organizing meaningful Scouting places.') item.desc = DEFAULT.pages.work.sections.vibecoding.items[0].desc;
      }
    }
  }
  doc.version = 8;
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
  return object(value) && [2,3,4,5,6,7,8].includes(value.version) && object(value.global) && object(value.pages) &&
    ['home','work','scouting','contact'].every(page => object(value.pages[page]) && object(value.pages[page].sections));
}
async function storedContent(env) {
  const raw = await env.JP_KV.get(KEY);
  if (raw === null || raw === undefined) return null;
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_stored_content');
  const legacy = !parsed.pages && !parsed.global && ['seo','contact','hero'].some(key => parsed[key] && typeof parsed[key] === 'object' && !Array.isArray(parsed[key]));
  const shaped = [2,3,4,5,6,7,8].includes(parsed.version) && parsed.global && typeof parsed.global === 'object' && parsed.pages && typeof parsed.pages === 'object' && ['home','work','scouting','contact'].some(key => parsed.pages[key] && parsed.pages[key].sections);
  if (!shaped && !legacy) throw new Error('invalid_stored_content');
  return parsed;
}
export async function onRequestGet({ env }) {
  let doc;
  try { doc = await storedContent(env); } catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
  if (!doc) return json({ ok: true, content: { ...DEFAULT, updatedAt: 0 } });
  if (![2,3,4,5,6,7,8].includes(doc.version)) doc = fromV1(doc);
  if ((doc.version || 0) < 3) doc = migrateTo3(doc);
  if ((doc.version || 0) < 4) doc = migrateTo4(doc);
  if ((doc.version || 0) < 5) doc = migrateTo5(doc);
  if ((doc.version || 0) < 6) doc = migrateTo6(doc);
  if ((doc.version || 0) < 7) doc = migrateTo7(doc);
  if ((doc.version || 0) < 8) doc = migrateTo8(doc);
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
  const doc = normalizeOrders(sanitize(DEFAULT, incoming));
  const invalidUrls = [];
  cleanUrls(doc, invalidUrls);
  if (invalidUrls.length) return json({ ok: false, error: 'invalid_url', field: invalidUrls[0] }, 400);
  if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(doc.global.contact.email)) return json({ ok: false, error: 'invalid_email' }, 400);
  doc.version = 8;
  doc.updatedAt = Math.max(Date.now(), (previous && previous.updatedAt || 0) + 1);
  try { await env.JP_KV.put(KEY, JSON.stringify(doc)); } catch (_) { return json({ ok: false, error: 'storage_unavailable' }, 503); }
  return json({ ok: true, content: doc });
}
