/* Shared helpers (the leading "_" keeps this file out of routing). */

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "0.0.0.0";
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Admin session dates are stored in UTC Unix seconds; the API reports expiry in milliseconds.
export const ADMIN_COOKIE = '__Host-jp_admin';
export const SESSION_SECONDS = 12 * 3600;
export const IDLE_SECONDS = 30 * 60;

function base32Decode(str) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  str = String(str).toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = "";
  for (const c of str) { const v = A.indexOf(c); if (v < 0) continue; bits += v.toString(2).padStart(5, "0"); }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.substr(i, 8), 2));
  return new Uint8Array(bytes);
}

function bytesToB64url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hotp(keyBytes, counter) {
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, Math.floor(counter / 0x100000000));
  dv.setUint32(4, counter >>> 0);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const off = sig[19] & 0xf;
  const code = ((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3];
  return (code % 1000000).toString().padStart(6, "0");
}

export async function matchingTotpStep(secret, code, now) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secret);
  if (!key.length) return null;
  const step = Math.floor(now / 30);
  for (const offset of [0, -1, 1]) {
    if ((await hotp(key, step + offset)) === code) return step + offset;
  }
  return null;
}

export function sameOriginAdminRequest(request) {
  const url = new URL(request.url);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol);
  if (url.origin !== 'https://admin.jimmypark.net' && !loopback) return false;
  const origin = request.headers.get('Origin');
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;
  const safe = request.method === 'GET' || request.method === 'HEAD';
  return (safe && !origin) || origin === url.origin;
}

// A secret rotation still invalidates all sessions. D1 stores only keyed hashes.
export async function adminDigest(secret, label, value) {
  const utf8 = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', utf8.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return bytesToB64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, utf8.encode(label + ':' + value))));
}

export function newSessionId() {
  return bytesToB64url(crypto.getRandomValues(new Uint8Array(32)));
}

export function adminCookie(value, lifetime) {
  return ADMIN_COOKIE + '=' + value + '; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=' + lifetime;
}

export async function sessionHash(request, secret) {
  const cookie = request.headers.get('Cookie') || '';
  const prefix = ADMIN_COOKIE + '=';
  const values = cookie.split(';').map(part => part.trim()).filter(part => part.startsWith(prefix));
  if (values.length !== 1 || !secret) return null;
  const token = values[0].slice(prefix.length);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? adminDigest(secret, 'admin-session', token) : null;
}

export async function readAdminSession(request, env) {
  if (!sameOriginAdminRequest(request)) return null;
  const hash = await sessionHash(request, env.TOTP_SECRET);
  if (!hash) return null;
  // Authenticate and extend the idle deadline in one write on the D1 primary.
  return env.JP_TRAFFIC.prepare(
    'UPDATE admin_sessions SET last_seen = max(last_seen, unixepoch()) ' +
    'WHERE session_hash = ? AND expires_at > unixepoch() AND last_seen > unixepoch() - ? RETURNING expires_at'
  ).bind(hash, IDLE_SECONDS).first();
}

export async function isAdmin(request, env) {
  try { return Boolean(await readAdminSession(request, env)); } catch { return false; }
}
