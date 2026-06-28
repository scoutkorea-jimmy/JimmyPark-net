import { json, isAdmin } from "./_lib.js";

// Site content document (KV key "content"). Public pages read it to override
// their baked-in defaults; the admin (TOTP) writes it.
const KEY = "content";

const DEFAULT = {
  seo: {
    title: "박지민 / Jimmy Park",
    desc: "Jimmy Park is a photographer, videographer, Scout, and builder working across field documentation, purpose-based video production, Scouting communication, and AI-assisted web prototypes.",
  },
  contact: {
    email: "scoutkorea@kakao.com",
    phone: "+82.010.2646.1635",
    linkedin: "",
    location: "Korea · Korean / English",
  },
  hero: { image: "" },
  updatedAt: 0,
};

function clean(body) {
  const b = body && typeof body === "object" ? body : {};
  const s = b.seo || {};
  const c = b.contact || {};
  const h = b.hero || {};
  const str = (v, max) => String(v == null ? "" : v).slice(0, max);
  return {
    seo: {
      title: str(s.title, 200) || DEFAULT.seo.title,
      desc: str(s.desc, 600) || DEFAULT.seo.desc,
    },
    contact: {
      email: str(c.email, 200),
      phone: str(c.phone, 80),
      linkedin: str(c.linkedin, 400),
      location: str(c.location, 200) || DEFAULT.contact.location,
    },
    hero: { image: str(h.image, 800) },
    updatedAt: Date.now(),
  };
}

export async function onRequestGet({ env }) {
  let doc = null;
  try { doc = JSON.parse((await env.JP_KV.get(KEY)) || "null"); } catch (_) {}
  return json({ ok: true, content: doc || DEFAULT });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  let body = {};
  try { body = await request.json(); } catch (_) {}
  const doc = clean(body.content || body);
  await env.JP_KV.put(KEY, JSON.stringify(doc));
  return json({ ok: true, content: doc });
}
