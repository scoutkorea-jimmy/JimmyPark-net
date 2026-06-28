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
  version: 4,
  global: {
    brand: { name: "Jimmy Park", roleline: "Photographer · Videographer · Scout · Builder" },
    footer: { tagline: "SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.", copyright: "© 2026 Jimmy Park" },
    contact: { email: "scoutkorea@kakao.com", phone: "+82.010.2646.1635", linkedin: "", location: "Korea" },
    seo: {
      title: "Jimmy Park",
      desc: "Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes.",
    },
  },
  pages: {
    home: {
      meta: { title: "Jimmy Park", desc: "Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes." },
      order: ["hero", "snapshot", "activities", "approach", "projects", "cta"],
      hidden: [],
      sections: {
        hero: {
          eyebrow: "Photographer · Videographer · Scout · Builder",
          title: "Jimmy Park",
          lead: "I help turn a clear purpose into the right content, field execution, and working systems.",
          ctaPrimary: link("View Work", "/work"),
          ctaGhost: link("Contact", "/contact"),
          image: "", badge: "On location",
          caption: "Field documentation · Event media · Scouting", captionRight: "Korea",
        },
        snapshot: {
          rows: [
            { label: "Current Roles", value: "BP Media · Korea Dream Path · APR C&P" },
            { label: "Main Fields", value: "Photography · Video · Scouting · Vibe Coding" },
            { label: "Collaboration", value: "Event media · Video production · Scouting projects · Web prototypes" },
            { label: "Base", value: "Korea" },
          ],
        },
        activities: {
          eyebrow: "What I Actually Do",
          title: "Document → Produce → Connect → Build",
          items: [
            { kicker: "Document", title: "Field Documentation", desc: "I capture events, people, and key moments so they can be used immediately for press, social media, reports, and archives.", tags: ["Press", "SNS", "Report", "Archive"], href: "/work", accent: "burgundy" },
            { kicker: "Produce", title: "Purpose-based Production", desc: "I design video formats according to the purpose — promotion, event film, interview, campaign, IR/PR, or short-form.", tags: ["Promotion", "Interview", "Event Film", "Short-form"], href: "/work", accent: "burgundy" },
            { kicker: "Connect", title: "Scouting Communication", desc: "I connect youth movement, international exchange, media, and field experience through Scouting.", tags: ["Youth", "International", "Media"], href: "/scouting", accent: "green" },
            { kicker: "Build", title: "Working Prototypes", desc: "I use AI and web tools to quickly shape ideas into campaign pages, maps, content tools, and small systems.", tags: ["Campaign Page", "Map", "Content Tool"], href: "/work", accent: "burgundy" },
          ],
        },
        approach: {
          eyebrow: "How I Approach a Project",
          title: "Tell me the purpose. I'll suggest the direction, then execute.",
          steps: [
            { num: "01", title: "Understand the Purpose", desc: "Clarify why the project exists, who it is for, and where the output will be used." },
            { num: "02", title: "Suggest the Direction", desc: "Propose the most suitable format, workflow, and communication approach." },
            { num: "03", title: "Execute in the Field", desc: "Document, film, produce, coordinate, or build according to the project's needs." },
            { num: "04", title: "Deliver for Use", desc: "Prepare outputs ready for press, social media, reports, websites, or campaigns." },
          ],
        },
        projects: {
          eyebrow: "Selected Projects",
          title: "A few things I've built",
          feature: { badge: "Scouting · Media · Content", sub: "BP Media platform", title: "BP Media", desc: "A Scouting-specialized media platform documenting stories, events, people, and international movement.", href: "/scouting", image: "" },
          items: [
            { tag: "Education · Strategy · Video", title: "Korea Dream Path", desc: "A Life Learning Initiative for education, youth growth, and global collaboration.", href: "/work", image: "" },
            { tag: "Scouting · Web Prototype", title: "Scout Tour Assistant", desc: "A map-based prototype for meaningful Scouting places worldwide.", href: "/scouting", image: "" },
            { tag: "Campaign · Scouting", title: "Jamboree D-count", desc: "A participation campaign page for the 16th Korea Jamboree countdown.", href: "/scouting", image: "" },
          ],
        },
        cta: {
          title: "Let's start with the purpose.",
          body: "For collaboration, documentation, video, Scouting projects, or web prototypes — feel free to reach out.",
          button: link("Contact", "/contact"),
        },
      },
    },

    work: {
      meta: { title: "Work · Jimmy Park", desc: "Field documentation, purpose-based video, lectures, and small web prototypes — Jimmy Park combines photography, video, teaching, and digital tools depending on what the project needs." },
      order: ["intro", "photography", "video", "vibecoding", "lecture", "cta"],
      hidden: [],
      sections: {
        intro: {
          eyebrow: "Work",
          title: "Made for use, based on purpose.",
          lead: "I work across field documentation, purpose-based video, and small digital tools — depending on what the project needs.",
        },
        photography: {
          kicker: "Document", title: "Photography", sub: "Field documentation for immediate use",
          desc: "I focus on event sketches, field documentation, and press-ready photography. The goal is not only to take good photos, but to prepare images that can be used quickly and clearly.",
          deliverables: [
            { text: "Event sketch · speaker & participant photos" },
            { text: "Press-ready selections · atmosphere shots" },
            { text: "Same-day basic edits · purpose-based sorting" },
          ],
          usefulFor: [{ text: "Press" }, { text: "SNS" }, { text: "Card news" }, { text: "Report" }, { text: "Archive" }],
          caption: "Event documentation · press-ready selection · same-day delivery",
          image: "",
        },
        video: {
          kicker: "Produce", title: "Video", sub: "Formats shaped by purpose",
          desc: "Video should change depending on its purpose. I organize the format, rhythm, and message according to the audience and use case.",
          formats: [
            { name: "Promotion", desc: "For institutions, brands, projects" },
            { name: "Event Film", desc: "For records and highlights" },
            { name: "Interview", desc: "For people-centered stories" },
            { name: "IR / PR", desc: "For institutional communication" },
            { name: "Campaign", desc: "For message-driven content" },
            { name: "Short-form", desc: "For social media distribution" },
          ],
          caption: "Video type · purpose · availability",
        },
        vibecoding: {
          kicker: "Build", title: "Vibe Coding", sub: "Small systems that make ideas work",
          desc: "I'm not presenting myself as a traditional developer. I use AI and web tools to quickly test ideas, build campaign pages, organize content flows, and create small tools that support real projects.",
          items: [
            { slug: "scout-tour-assistant", title: "Scout Tour Assistant", desc: "Map-based Scouting place archive", status: "Prototype", accent: "green", image: "" },
            { slug: "jamboree-dcount", title: "Jamboree D-count", desc: "Campaign participation page", status: "Live", accent: "burgundy", image: "" },
            { slug: "card-news", title: "Card News Generator", desc: "Content production tool", status: "Beta", accent: "neutral", image: "" },
            { slug: "bp-media-tools", title: "BP Media Tools", desc: "Media operation support", status: "In Progress", accent: "neutral", image: "" },
          ],
        },
        lecture: {
          kicker: "Teach", title: "Lecture", sub: "Talks & workshops from the field",
          desc: "I share field experience through lectures and workshops — on Scouting and youth communication, field media and documentation, and AI-assisted prototyping. Each session is shaped around the audience and the purpose.",
          topics: [
            { name: "Scouting & Youth", desc: "Communication, international exchange, youth movement" },
            { name: "Field Media", desc: "Documentation, event media, content workflows" },
            { name: "Photography for Purpose", desc: "Shooting for press, SNS, and reports" },
            { name: "AI · Vibe Coding", desc: "Turning ideas into working web prototypes" },
          ],
        },
        cta: {
          title: "Need field documentation, video, or a small web prototype? Tell me the purpose first.",
          body: "If the purpose and use case are clear, we can plan the structure, execution, and delivery together.",
          button: link("Contact", "/contact"),
        },
      },
    },

    scouting: {
      meta: { title: "Scouting · Jimmy Park", desc: "Scouting has been Jimmy Park's long-term base for communication, field experience, and international connection — National Commissioner, APR C&P, World Scout Jamboree media, and BP Media." },
      order: ["hero", "why", "stats", "timeline", "roles", "international", "mediaprojects", "gallery", "cta"],
      hidden: [],
      sections: {
        hero: {
          eyebrow: "Scouting",
          title: "Scouting has been my long-term base for communication, field experience, and international connection.",
          lead: "From Scout to Scout Leader, it taught me how people gather, move, and build trust across borders.",
          image: "", badge: "International event",
          caption: "Scouting field · international event · youth movement",
        },
        why: {
          eyebrow: "Why Scouting Matters",
          body: "Scouting is where I learned how people gather, move, communicate, and build trust across different backgrounds. It shaped the way I document fields, design messages, and connect projects.",
        },
        stats: {
          items: [
            { value: "10+ Years", label: "Scouting experience" },
            { value: "Youth Movement", label: "Growth & social impact" },
            { value: "International Exchange", label: "Global network" },
            { value: "Media & Documentation", label: "Records · communication" },
          ],
        },
        roles: {
          title: "Key Roles",
          items: [
            { title: "National Commissioner", org: "Korea Scout Association", period: "2022–2024", accent: "neutral" },
            { title: "APR Communication & Partnerships", org: "2nd Vice Chair", period: "2025–2028", accent: "neutral" },
            { title: "25th World Scout Jamboree", org: "Korea Contingent Media", period: "2023", accent: "neutral" },
            { title: "BP Media", org: "Founder", period: "2026–", accent: "green" },
          ],
        },
        international: {
          title: "International Experience",
          body: "Through World Scout Jamboree, Asia-Pacific regional activities, international Scout networks, and field media operations, I work with Scouting as a language of global communication.",
          tags: [{ text: "World Scout Jamboree" }, { text: "APR Scouting" }, { text: "International Exchange" }, { text: "Media Operation" }, { text: "Youth Communication" }],
        },
        mediaprojects: {
          title: "Scouting Media Projects",
          feature: { badge: "Flagship", title: "BP Media", desc: "A Scouting-specialized media platform documenting stories, events, people, and international movement.", image: "" },
          items: [
            { title: "Scout Tour Assistant", desc: "A map-based prototype for meaningful Scouting places, heritage sites, offices, and campsites." },
            { title: "Jamboree D-count", desc: "A participation campaign page for the 16th Korea Jamboree countdown." },
            { title: "Jamboree Media Work", desc: "Field media, documentation, and communication for large-scale Scouting events." },
          ],
        },
        timeline: {
          title: "Scouting History",
          note: "From Scout (2003) to Scout Leader (2014) — tap any item to expand.",
          items: [
            { year: "2003", title: "Joined Scouting as a Scout", context: "I started Scouting as a Scout, experiencing people and activities first-hand in the field.", track: "Scout", accent: "neutral" },
            { year: "2012", title: "Started Scouting media activities", context: "While active as a Scout, I grew interested in documentation and communication, and began building toward Scouting media work.", track: "Scout", accent: "neutral" },
            { year: "2014", title: "Became a Scout Leader", context: "I became a Scout Leader, moving into a role that guides and supports youth activities — built on my years as a Scout.", track: "Leader", accent: "green" },
            { year: "2016–2017", title: "World Scout Jamboree bid & related projects", context: "I took part as a leader in the World Scout Jamboree bid and related projects.", track: "Leader", accent: "neutral" },
            { year: "2022–2024", title: "National Commissioner, Korea Scout Association", context: "I served as National Commissioner of the Korea Scout Association, working on domestic Scouting activity and communication.", track: "Leader", accent: "green" },
            { year: "2023", title: "Korea Contingent Media, 25th World Scout Jamboree", context: "I served as Deputy Director of the Media Department for the Korean Contingent at the 25th World Scout Jamboree.", track: "Leader", accent: "green" },
            { year: "2025–2028", title: "APR C&P Sub-Committee, 2nd Vice Chair", context: "I serve as 2nd Vice Chair of the Asia-Pacific Region Communications & Partnerships Sub-Committee.", track: "Leader", accent: "green" },
            { year: "2026–", title: "BP Media", context: "I run BP Media, a Scouting-specialized media platform.", track: "Leader", accent: "green" },
            { year: "2026–", title: "Scout Tour Assistant · Jamboree D-count experiments", context: "I'm experimenting with Scouting-based web projects like Scout Tour Assistant and the Jamboree D-count.", track: "Leader", accent: "green" },
          ],
        },
        gallery: {
          title: "Field Gallery",
          figs: [
            { label: "International Meeting", category: "Scouting field", image: "" },
            { label: "Jamboree", category: "Scouting field", image: "" },
            { label: "Media Operation", category: "Scouting field", image: "" },
            { label: "Scout Field", category: "Scouting field", image: "" },
            { label: "Youth Activity", category: "Scouting field", image: "" },
          ],
        },
        cta: {
          title: "If the project is related to Scouting, youth, or international collaboration, let's talk.",
          body: "Reach out and tell me the purpose — I'll suggest where to take it.",
          button: link("Contact", "/contact"),
        },
      },
    },

    contact: {
      meta: { title: "Contact · Jimmy Park", desc: "Contact Jimmy Park for collaboration, event documentation, video production, Scouting projects, or small web prototypes. Email and phone." },
      order: ["intro"],
      hidden: [],
      sections: {
        intro: {
          eyebrow: "Contact",
          title: "Let's get in touch.",
          lead: "For collaboration, event documentation, video production, Scouting projects, or small web prototypes, feel free to get in touch.",
        },
      },
    },
  },
  updatedAt: 0,
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
        sc.order = DEFAULT.pages.scouting.order.slice();
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

function normalizeOrders(doc) {
  for (const p of Object.keys(DEFAULT.pages)) {
    if (doc.pages && doc.pages[p]) doc.pages[p].order = mergeOrder(DEFAULT.pages[p].order, doc.pages[p].order);
  }
  return doc;
}

export async function onRequestGet({ env }) {
  let doc = null;
  try { doc = JSON.parse((await env.JP_KV.get(KEY)) || "null"); } catch (_) {}
  if (!doc) return json({ ok: true, content: DEFAULT });
  if (doc.version !== 2 && doc.version !== 3 && doc.version !== 4) doc = fromV1(doc);
  if ((doc.version || 0) < 3) doc = migrateTo3(doc);
  if ((doc.version || 0) < 4) doc = migrateTo4(doc);
  // Re-sanitize on read so older/partial docs always match the current shape.
  const clean = normalizeOrders(sanitize(DEFAULT, doc));
  clean.updatedAt = doc.updatedAt || 0;
  return json({ ok: true, content: clean });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  let body = {};
  try { body = await request.json(); } catch (_) {}
  let incoming = body.content || body;
  if (incoming && incoming.version !== 2 && incoming.version !== 3 && incoming.version !== 4) incoming = fromV1(incoming);
  if (incoming && (incoming.version || 0) < 4) migrateTo4(incoming);
  const doc = sanitize(DEFAULT, incoming);
  doc.version = 4;
  doc.updatedAt = Date.now();
  await env.JP_KV.put(KEY, JSON.stringify(doc));
  return json({ ok: true, content: doc });
}
