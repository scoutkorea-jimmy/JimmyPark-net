import { json, isAdmin, newId } from "./_lib.js";

// Media library backed by KV.
//   POST   /api/image            (admin) raw bytes body → { url, id }   [X-Filename, Content-Type]
//   GET    /api/image?id=<id>    (public) serve the stored image
//   GET    /api/image?list=1     (admin) list media index
//   DELETE /api/image?id=<id>    (admin) remove image + index entry
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const INDEX = "media:index";

function imageType(buffer) {
  const b = new Uint8Array(buffer);
  if (b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255) return 'image/jpeg';
  if (b.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i) => b[i] === v)) return 'image/png';
  const prefix = String.fromCharCode(...b.slice(0,12));
  if (/^GIF8[79]a/.test(prefix)) return 'image/gif';
  if (prefix.startsWith('RIFF') && prefix.slice(8,12) === 'WEBP') return 'image/webp';
  return '';
}
async function getIndex(env) {
  const raw = await env.JP_KV.get(INDEX);
  if (raw === null || raw === undefined) return [];
  const index = JSON.parse(raw);
  if (!Array.isArray(index)) throw new Error('invalid_media_index');
  return index;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get("list")) {
    if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
    return json({ ok: true, items: await getIndex(env) });
  }
  const id = url.searchParams.get("id");
  if (!id) return json({ ok: false, error: "missing_id" }, 400);
  const bytes = await env.JP_KV.get("img:" + id, "arrayBuffer");
  if (!bytes) return new Response("Not found", { status: 404 });
  const ct = imageType(bytes);
  if (!ct) return new Response("Unsupported image", { status: 415 });
  return new Response(bytes, {
    headers: {
      "content-type": ct,
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  const buf = await request.arrayBuffer();
  if (!buf || buf.byteLength === 0) return json({ ok: false, error: "empty" }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ ok: false, error: "too_large" }, 413);
  const ct = imageType(buf);
  if (!ct) return json({ ok: false, error: "unsupported_image" }, 415);
  const index = await getIndex(env);
  const id = newId();
  let name = request.headers.get("X-Filename") || "";
  try { name = decodeURIComponent(name); } catch (_) {}
  await env.JP_KV.put("img:" + id, buf);
  index.unshift({ id, ct, name: String(name).slice(0, 200), size: buf.byteLength, at: Date.now() });
  await env.JP_KV.put(INDEX, JSON.stringify(index.slice(0, 500)));
  return json({ ok: true, id, url: "/api/image?id=" + id });
}

export async function onRequestDelete({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ ok: false, error: "missing_id" }, 400);
  const index = (await getIndex(env)).filter((m) => m.id !== id);
  await env.JP_KV.delete("img:" + id);
  await env.JP_KV.put(INDEX, JSON.stringify(index));
  return json({ ok: true });
}
