import { json, sameOriginAdminRequest, matchingTotpStep, newSessionId, adminDigest, adminCookie, SESSION_SECONDS, IDLE_SECONDS } from "./_lib.js";

const LOGIN_ATTEMPTS = 10;
const WINDOW_SECONDS = 600;

async function reserveLoginAttempt(db, sourceHash) {
  // Fixed window per trusted edge address. Reserve the attempt before evaluating the code.
  const reservation = db.prepare(
    'INSERT INTO admin_login_windows(source_hash, attempts, ends_at) VALUES(?, 1, unixepoch() + ?) ' +
    'ON CONFLICT(source_hash) DO UPDATE SET ' +
    'attempts = CASE WHEN ends_at <= unixepoch() THEN 1 ELSE attempts + 1 END, ' +
    'ends_at = CASE WHEN ends_at <= unixepoch() THEN excluded.ends_at ELSE ends_at END ' +
    'WHERE ends_at <= unixepoch() OR attempts < ? RETURNING attempts'
  ).bind(sourceHash, WINDOW_SECONDS, LOGIN_ATTEMPTS);
  const results = await db.batch([
    db.prepare('DELETE FROM admin_login_windows WHERE source_hash IN (SELECT source_hash FROM admin_login_windows WHERE ends_at <= unixepoch() LIMIT 64)'),
    reservation,
  ]);
  return results[1].results[0];
}

export async function onRequestPost({ request, env }) {
  if (!sameOriginAdminRequest(request)) return json({ ok: false, error: "invalid_origin" }, 403);
  if (!env.TOTP_SECRET) return json({ ok: false, error: "not_configured" }, 503);
  const db = env.JP_TRAFFIC;
  if (!db) return json({ ok: false, error: "storage_unavailable" }, 503);
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ ok: false, error: 'invalid_request' }, 415);
  }

  try {
    const source = request.headers.get('CF-Connecting-IP') || 'unidentified';
    const sourceHash = await adminDigest(env.TOTP_SECRET, 'admin-login-source', source);
    if (!await reserveLoginAttempt(db, sourceHash)) return json({ ok: false, error: "rate_limited" }, 429);
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "bad_code" }, 401); }
    const step = await matchingTotpStep(env.TOTP_SECRET, body?.code, Math.floor(Date.now() / 1000));
    if (step === null) return json({ ok: false, error: "bad_code" }, 401);

    const token = newSessionId();
    const hash = await adminDigest(env.TOTP_SECRET, 'admin-session', token);
    // D1 batches execute as one transaction. Only the request that claims this step may create a session.
    const results = await db.batch([
      db.prepare('DELETE FROM admin_sessions WHERE expires_at <= unixepoch() OR last_seen <= unixepoch() - ?').bind(IDLE_SECONDS),
      db.prepare('DELETE FROM admin_totp_steps WHERE step < (unixepoch() / 30) - 1'),
      db.prepare('INSERT INTO admin_totp_steps(step, claim_hash) SELECT ?, ? WHERE abs(? - unixepoch() / 30) <= 1 ON CONFLICT(step) DO NOTHING').bind(step, hash, step),
      db.prepare('INSERT INTO admin_sessions(session_hash, expires_at, last_seen) ' +
        'SELECT claim_hash, unixepoch() + ?, unixepoch() FROM admin_totp_steps WHERE step = ? AND claim_hash = ? RETURNING expires_at'
      ).bind(SESSION_SECONDS, step, hash),
    ]);
    const session = results[3].results[0];
    if (!session) return json({ ok: false, error: "bad_code" }, 401);
    const response = json({ ok: true, exp: session.expires_at * 1000 });
    response.headers.set('Set-Cookie', adminCookie(token, SESSION_SECONDS));
    return response;
  } catch {
    return json({ ok: false, error: "storage_unavailable" }, 503);
  }
}
