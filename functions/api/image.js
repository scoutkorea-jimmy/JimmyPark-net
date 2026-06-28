import { json, isAdmin, newId } from "./_lib.js";

// Media library backed by KV.
//   POST   /api/image            (admin) raw bytes body → { url, id }   [X-Filename, Content-Type]
//   GET    /api/image?id=<id>    (public) serve the stored image
//   GET    /api/image?list=1     (admin) list media index
//   DELETE /api/image?id=<id>    (admin) remove image + index entry
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const INDEX = "media:index";

async function getIndex(env) {
  try { return JSON.parse((await env.JP_KV.get(INDEX)) || "[]") || []; } catch (_) { return []; }
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get("list")) {
    if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
    return json({ ok: true, items: await getIndex(env) });
  }
  const id = url.searchParams.get("id");
  if (!id) return json({ ok: false, error: "missing_id" }, 400);
  const meta = (await getIndex(env)).find((m) => m.id === id);
  const bytes = await env.JP_KV.get("img:" + id, "arrayBuffer");
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(bytes, {
    headers: {
      "content-type": (meta && meta.ct) || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  const buf = await request.arrayBuffer();
  if (!buf || buf.byteLength === 0) return json({ ok: false, error: "empty" }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ ok: false, error: "too_large" }, 413);
  const id = newId();
  const ct = request.headers.get("content-type") || "image/jpeg";
  const name = request.headers.get("X-Filename") || "";
  await env.JP_KV.put("img:" + id, buf);
  const index = await getIndex(env);
  index.unshift({ id, ct, name: String(name).slice(0, 200), size: buf.byteLength, at: Date.now() });
  await env.JP_KV.put(INDEX, JSON.stringify(index.slice(0, 500)));
  return json({ ok: true, id, url: "/api/image?id=" + id });
}

export async function onRequestDelete({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ ok: false, error: "missing_id" }, 400);
  await env.JP_KV.delete("img:" + id);
  const index = (await getIndex(env)).filter((m) => m.id !== id);
  await env.JP_KV.put(INDEX, JSON.stringify(index));
  return json({ ok: true });
}
