import { json, sameOriginAdminRequest, sessionHash, adminCookie } from "./_lib.js";

export async function onRequestPost({ request, env }) {
  if (!sameOriginAdminRequest(request)) return json({ ok: false, error: 'invalid_origin' }, 403);
  if (!env.TOTP_SECRET || !env.JP_TRAFFIC) return json({ ok: false, error: 'storage_unavailable' }, 503);
  try {
    const hash = await sessionHash(request, env.TOTP_SECRET);
    if (hash) await env.JP_TRAFFIC.prepare('DELETE FROM admin_sessions WHERE session_hash = ?').bind(hash).run();
    const response = json({ ok: true });
    response.headers.set('Set-Cookie', adminCookie('', 0));
    return response;
  } catch {
    return json({ ok: false, error: 'storage_unavailable' }, 503);
  }
}
