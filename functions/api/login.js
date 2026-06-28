import { json, verifyTotp, issueSession, clientIp } from "./_lib.js";

// POST /api/login { code } → { ok, token, exp }
// Rate-limited: 10 failures per IP per 10 minutes.
export async function onRequestPost({ request, env }) {
  if (!env.TOTP_SECRET) return json({ ok: false, error: "not_configured" }, 503);
  let body = {};
  try { body = await request.json(); } catch (_) {}
  const ip = clientIp(request);
  const rlKey = "rl:login:" + ip;
  let fails = 0;
  try { fails = parseInt((await env.JP_KV.get(rlKey)) || "0", 10) || 0; } catch (_) {}
  if (fails >= 10) return json({ ok: false, error: "rate_limited" }, 429);

  const ok = await verifyTotp(env, body.code);
  if (!ok) {
    try { await env.JP_KV.put(rlKey, String(fails + 1), { expirationTtl: 600 }); } catch (_) {}
    return json({ ok: false, error: "bad_code" }, 401);
  }
  try { await env.JP_KV.delete(rlKey); } catch (_) {}
  const { token, exp } = await issueSession(env);
  return json({ ok: true, token, exp });
}
