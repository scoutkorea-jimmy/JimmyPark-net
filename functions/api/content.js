import { json, isAdmin } from "./_lib.js";

// Full-site content document (KV key "content"). Public pages render their baked-in
// static seed first (SEO / no-JS), then site.js overrides from this document. The
// admin (TOTP) edits and writes it. DEFAULT mirrors the static seed content so an
// empty site and a fresh admin start identical.
const KEY = "content";
const MAXSTR = 4000;   // per string field
const MAXARR = 60;     // per collection

// ── helpers to keep DEFAULT compact ─────────────────────────────────────────
const link = (label, href) => ({ label, href });

const DEFAULT = {
  version: 2,
  global: {
    brand: { name: "Jimmy Park", nameKo: "박지민", roleline: "Photographer · Videographer · Scout · Builder" },
    footer: { tagline: "SIMPLE. DIRECT. TRUSTED. · BUILT FOR CONNECTION.", copyright: "© 2026 Jimmy Park / 박지민" },
    contact: { email: "scoutkorea@kakao.com", phone: "+82.010.2646.1635", linkedin: "", location: "Korea · Korean / English" },
    seo: {
      title: "박지민 / Jimmy Park",
      desc: "Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes.",
    },
  },
  pages: {
    home: {
      meta: { title: "박지민 / Jimmy Park", desc: "Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes." },
      order: ["hero", "snapshot", "activities", "approach", "projects", "cta"],
      hidden: [],
      sections: {
        hero: {
          eyebrow: "Photographer · Videographer · Scout · Builder",
          title: "Jimmy Park", nameKo: "박지민",
          lead: "I help turn a clear purpose into the right content, field execution, and working systems.",
          leadKo: "목적을 이해하고, 방향을 제안하고, 실행까지 연결합니다.",
          ctaPrimary: link("View Work", "/work"),
          ctaGhost: link("Contact", "/contact"),
          image: "", badge: "On location",
          caption: "Field documentation · Event media · Scouting", captionRight: "Korea",
        },
        snapshot: {
          rows: [
            { label: "Current Roles", labelKo: "현재 역할", value: "BP Media · Korea Dream Path · APR C&P" },
            { label: "Main Fields", labelKo: "주요 분야", value: "Photography · Video · Scouting · Vibe Coding" },
            { label: "Collaboration", labelKo: "협업 가능 영역", value: "Event media · Video production · Scouting projects · Web prototypes" },
            { label: "Base", labelKo: "활동 기반", value: "Korea · Korean / English" },
          ],
        },
        activities: {
          eyebrow: "What I Actually Do",
          title: "Document → Produce → Connect → Build",
          items: [
            { kicker: "Document", title: "Field Documentation", titleKo: "현장 기록 · 보도용 사진", desc: "I capture events, people, and key moments so they can be used immediately for press, social media, reports, and archives.", tags: ["Press", "SNS", "Report", "Archive"], href: "/work", accent: "burgundy" },
            { kicker: "Produce", title: "Purpose-based Production", titleKo: "목적 기반 영상", desc: "I design video formats according to the purpose — promotion, event film, interview, campaign, IR/PR, or short-form.", tags: ["Promotion", "Interview", "Event Film", "Short-form"], href: "/work", accent: "burgundy" },
            { kicker: "Connect", title: "Scouting Communication", titleKo: "스카우팅 커뮤니케이션", desc: "I connect youth movement, international exchange, media, and field experience through Scouting.", tags: ["Youth", "International", "Media"], href: "/scouting", accent: "green" },
            { kicker: "Build", title: "Working Prototypes", titleKo: "웹 프로토타입 · 콘텐츠 도구", desc: "I use AI and web tools to quickly shape ideas into campaign pages, maps, content tools, and small systems.", tags: ["Campaign Page", "Map", "Content Tool"], href: "/work", accent: "burgundy" },
          ],
        },
        approach: {
          eyebrow: "How I Approach a Project",
          title: "Tell me the purpose. I'll suggest the direction, then execute.",
          titleKo: "목적을 알려주면, 가장 적절한 방향을 제안하고 실행합니다.",
          steps: [
            { num: "01", title: "Understand the Purpose", titleKo: "목적 이해", desc: "Clarify why the project exists, who it is for, and where the output will be used." },
            { num: "02", title: "Suggest the Direction", titleKo: "방향 제안", desc: "Propose the most suitable format, workflow, and communication approach." },
            { num: "03", title: "Execute in the Field", titleKo: "현장 실행", desc: "Document, film, produce, coordinate, or build according to the project's needs." },
            { num: "04", title: "Deliver for Use", titleKo: "활용 가능한 결과물", desc: "Prepare outputs ready for press, social media, reports, websites, or campaigns." },
          ],
        },
        projects: {
          eyebrow: "Selected Projects",
          title: "A few things I've built",
          feature: { badge: "Scouting · Media · Content", sub: "BP Media platform", title: "BP Media", desc: "A Scouting-specialized media platform documenting stories, events, people, and international movement in Korean.", descKo: "스카우트 전문 미디어 플랫폼", href: "/scouting", image: "" },
          items: [
            { tag: "Education · Strategy · Video", title: "Korea Dream Path", desc: "A Life Learning Initiative for education, youth growth, and global collaboration.", descKo: "교육 · 청소년 성장 · 국제 협력", href: "/work", image: "" },
            { tag: "Scouting · Web Prototype", title: "Scout Tour Assistant", desc: "A map-based prototype for meaningful Scouting places worldwide.", descKo: "스카우트 장소 지도 프로토타입", href: "/scouting", image: "" },
            { tag: "Campaign · Scouting", title: "Jamboree D-count", desc: "A participation campaign page for the 16th Korea Jamboree countdown.", descKo: "제16회 한국잼버리 캠페인", href: "/scouting", image: "" },
          ],
        },
        cta: {
          title: "Let's start with the purpose.",
          body: "For collaboration, documentation, video, Scouting projects, or web prototypes — feel free to reach out.",
          bodyKo: "협업 제안이든 가벼운 질문이든 괜찮습니다.",
          button: link("Contact", "/contact"),
        },
      },
    },

    work: {
      meta: { title: "Work · Jimmy Park / 박지민", desc: "Field documentation, purpose-based video, lectures, and small web prototypes — Jimmy Park combines photography, video, teaching, and digital tools depending on what the project needs." },
      order: ["intro", "photography", "video", "vibecoding", "lecture", "cta"],
      hidden: [],
      sections: {
        intro: {
          eyebrow: "Work", eyebrowKo: "작업",
          title: "Made for use, based on purpose.",
          lead: "I work across field documentation, purpose-based video, and small digital tools — depending on what the project needs.",
          leadKo: "프로젝트의 목적에 따라 사진, 영상, 웹 도구를 조합합니다.",
        },
        photography: {
          kicker: "Document", title: "Photography", sub: "Field documentation for immediate use · 현장 기록",
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
          kicker: "Produce", title: "Video", sub: "Formats shaped by purpose · 목적에 따라 달라지는 영상",
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
          kicker: "Build", title: "Vibe Coding", sub: "Small systems that make ideas work · 아이디어를 작동하게",
          desc: "I'm not presenting myself as a traditional developer. I use AI and web tools to quickly test ideas, build campaign pages, organize content flows, and create small tools that support real projects.",
          items: [
            { slug: "scout-tour-assistant", title: "Scout Tour Assistant", desc: "Map-based Scouting place archive", status: "Prototype", accent: "green", image: "" },
            { slug: "jamboree-dcount", title: "Jamboree D-count", desc: "Campaign participation page", status: "Live", accent: "burgundy", image: "" },
            { slug: "card-news", title: "Card News Generator", desc: "Content production tool", status: "Beta", accent: "neutral", image: "" },
            { slug: "bp-media-tools", title: "BP Media Tools", desc: "Media operation support", status: "In Progress", accent: "neutral", image: "" },
          ],
        },
        lecture: {
          kicker: "Teach", title: "Lecture", sub: "Talks & workshops from the field · 강의 · 강연",
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
          bodyKo: "목적을 알려주시면, 필요한 방향과 실행 방식을 함께 정리할 수 있습니다.",
          button: link("Contact", "/contact"),
        },
      },
    },

    scouting: {
      meta: { title: "Scouting · Jimmy Park / 박지민", desc: "Scouting has been Jimmy Park's long-term base for communication, field experience, and international connection — National Commissioner, APR C&P, World Scout Jamboree media, and BP Media." },
      order: ["hero", "why", "stats", "roles", "international", "mediaprojects", "timeline", "gallery", "cta"],
      hidden: [],
      sections: {
        hero: {
          eyebrow: "Scouting", eyebrowKo: "스카우팅",
          title: "Scouting has been my long-term base for communication, field experience, and international connection.",
          leadKo: "스카우팅은 오래된 커뮤니케이션의 기반입니다.",
          image: "", badge: "International event",
          caption: "Scouting field · international event · youth movement",
        },
        why: {
          eyebrow: "Why Scouting Matters",
          body: "Scouting is where I learned how people gather, move, communicate, and build trust across different backgrounds. It shaped the way I document fields, design messages, and connect projects.",
          bodyKo: "사람이 모이고 움직이고 신뢰를 만드는 방식을 배운 현장입니다.",
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
          feature: { badge: "Flagship", title: "BP Media", desc: "A Scouting-specialized media platform documenting stories, events, people, and international movement in Korean.", image: "" },
          items: [
            { title: "Scout Tour Assistant", desc: "A map-based prototype for meaningful Scouting places, heritage sites, offices, and campsites." },
            { title: "Jamboree D-count", desc: "A participation campaign page for the 16th Korea Jamboree countdown." },
            { title: "Jamboree Media Work", desc: "Field media, documentation, and communication for large-scale Scouting events." },
          ],
        },
        timeline: {
          title: "Timeline", note: "Tap an item to expand · 항목을 누르면 펼쳐집니다",
          items: [
            { year: "2012", title: "Started Scouting media activities", context: "스카우트 미디어 활동을 시작하며 기록과 커뮤니케이션의 기반을 다졌습니다.", accent: "neutral" },
            { year: "2016–2017", title: "World Scout Jamboree bid & related projects", context: "세계스카우트잼버리 유치 및 관련 프로젝트에 참여했습니다.", accent: "neutral" },
            { year: "2022–2024", title: "National Commissioner, Korea Scout Association", context: "한국스카우트연맹 중앙커미셔너로 국내 스카우트 활동과 커뮤니케이션에 참여했습니다.", accent: "green" },
            { year: "2023", title: "Korea Contingent Media, 25th World Scout Jamboree", context: "제25회 세계스카우트잼버리 대한민국 대표단 미디어부 부국장으로 활동했습니다.", accent: "green" },
            { year: "2025–2028", title: "APR C&P Sub-Committee, 2nd Vice Chair", context: "아시아·태평양 지역 커뮤니케이션·파트너십 위원회 부의장으로 활동하고 있습니다.", accent: "green" },
            { year: "2026–", title: "BP Media", context: "스카우트 전문 미디어 플랫폼을 운영합니다.", accent: "green" },
            { year: "2026–", title: "Scout Tour Assistant · Jamboree D-count experiments", context: "스카우트 기반 웹 프로젝트를 실험하고 있습니다.", accent: "green" },
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
          bodyKo: "스카우트, 청소년, 국제 프로젝트라면 이야기해 주세요.",
          button: link("Contact", "/contact"),
        },
      },
    },

    contact: {
      meta: { title: "Contact · Jimmy Park / 박지민", desc: "Contact Jimmy Park for collaboration, event documentation, video production, Scouting projects, or small web prototypes. Email, phone, Korean / English." },
      order: ["intro"],
      hidden: [],
      sections: {
        intro: {
          eyebrow: "Contact", eyebrowKo: "연락",
          title: "Let's get in touch.",
          lead: "For collaboration, event documentation, video production, Scouting projects, or small web prototypes, feel free to get in touch.",
          leadKo: "협업, 촬영, 영상 제작, 스카우트 프로젝트, 웹 프로토타입 문의를 받고 있습니다.",
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

// Map a v1 doc ({seo, contact, hero}) onto the v2 defaults so old data survives.
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
  if (doc.version !== 2) doc = fromV1(doc);
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
  if (incoming && incoming.version !== 2) incoming = fromV1(incoming);
  const doc = sanitize(DEFAULT, incoming);
  doc.version = 2;
  doc.updatedAt = Date.now();
  await env.JP_KV.put(KEY, JSON.stringify(doc));
  return json({ ok: true, content: doc });
}
