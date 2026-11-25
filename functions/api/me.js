import { json, readAdminSession } from "./_lib.js";

export async function onRequestGet({ request, env }) {
  try {
    const session = await readAdminSession(request, env);
    if (session) return json({ ok: true, exp: session.expires_at * 1000 });
    return json({ ok: false }, 401);
  } catch {
    return json({ ok: false, error: 'storage_unavailable' }, 503);
  }
}
