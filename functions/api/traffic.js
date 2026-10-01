import { json, isAdmin } from './_lib.js';

export const dayAt = (time = Date.now()) => new Date(time + 9 * 3600000).toISOString().slice(0, 10);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATH = /^\/(?:work|dev|lecture|scouting|contact|search|insights(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?$/;
const bot = /bot|crawler|spider|headless|lighthouse|preview/i;
export function sourceOf(referrer, utm) {
  const known = { google: 'Google', naver: 'Naver', bing: 'Bing', instagram: 'Instagram', linkedin: 'LinkedIn', facebook: 'Facebook', youtube: 'YouTube' };
  if (known[utm]) return known[utm] + ' (tagged link)';
  let host;
  try { host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, ''); } catch { return 'Direct / unknown'; }
  if (host === 'jimmypark.net' || host.endsWith('.jimmypark.net')) return 'Direct / unknown';
  for (const [key, label] of Object.entries(known)) {
    if (host === key + '.com' || host.endsWith('.' + key + '.com') || (key === 'google' && /^google\.[a-z.]+$/.test(host))) return label;
  }
  // Store a category, not arbitrary domains, referrer paths, search terms or campaign text.
  return 'Other referral';
}
export async function onRequestPost({ request, env }) {
  const origin = new URL(request.url).origin;
  if (!/^(www\.)?jimmypark\.net$|^localhost$|^127\.0\.0\.1$/.test(new URL(origin).hostname) || request.headers.get('Origin') !== origin || !request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'invalid_request' }, 403);
  if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1' || bot.test(request.headers.get('User-Agent') || '') || await isAdmin(request, env)) return new Response(null, { status: 204 });
  if (!env.JP_TRAFFIC) return json({ error: 'not_configured' }, 503);
  let input;
  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: 'too_large' }, 413);
    input = JSON.parse(text);
  } catch { return json({ error: 'invalid_request' }, 400); }
  if (!input || !UUID.test(input.visitor) || !UUID.test(input.event) || typeof input.path !== 'string' || input.path.length > 200 || !PATH.test(input.path) || typeof input.referrer !== 'string' || input.referrer.length > 255 || typeof input.utm !== 'string' || input.utm.length > 20) return json({ error: 'invalid_request' }, 400);
  const day = dayAt(), cutoff = dayAt(Date.now() - 89 * 86400000), db = env.JP_TRAFFIC;
  try {
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO traffic_visitors(day,visitor,source,landing) VALUES(?,?,?,?)').bind(day, input.visitor, sourceOf(input.referrer, input.utm), input.path),
      db.prepare('INSERT OR IGNORE INTO traffic_views(event,day,path) VALUES(?,?,?)').bind(input.event, day, input.path),
      db.prepare("INSERT OR IGNORE INTO traffic_meta(key,value) VALUES('started',?)").bind(day),
      db.prepare('DELETE FROM traffic_visitors WHERE day < ?').bind(cutoff),
      db.prepare('DELETE FROM traffic_views WHERE day < ?').bind(cutoff),
    ]);
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  } catch { return json({ error: 'storage_unavailable' }, 503); }
}
export async function onRequestGet({ request, env }) {
  if (!await isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
  if (!env.JP_TRAFFIC) return json({ error: 'not_configured' }, 503);
  const day = new URL(request.url).searchParams.get('date') || dayAt();
  const time = Date.parse(day + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day || day > dayAt() || day < dayAt(Date.now() - 89 * 86400000)) return json({ error: 'invalid_date' }, 400);
  const since = new Date(time - 13 * 86400000).toISOString().slice(0, 10), db = env.JP_TRAFFIC;
  try {
    const rows = await db.batch([
      db.prepare('SELECT COUNT(*) AS visitors FROM traffic_visitors WHERE day = ?').bind(day),
      db.prepare('SELECT COUNT(*) AS views FROM traffic_views WHERE day = ?').bind(day),
      db.prepare('SELECT source, COUNT(*) AS visitors FROM traffic_visitors WHERE day = ? GROUP BY source ORDER BY visitors DESC, source').bind(day),
      db.prepare('SELECT landing AS path, COUNT(*) AS visitors FROM traffic_visitors WHERE day = ? GROUP BY landing ORDER BY visitors DESC, path LIMIT 20').bind(day),
      db.prepare('SELECT path, COUNT(*) AS views FROM traffic_views WHERE day = ? GROUP BY path ORDER BY views DESC, path LIMIT 20').bind(day),
      db.prepare('SELECT day, COUNT(*) AS visitors FROM traffic_visitors WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day DESC').bind(since, day),
      db.prepare('SELECT day, COUNT(*) AS views FROM traffic_views WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day DESC').bind(since, day),
      db.prepare("SELECT value FROM traffic_meta WHERE key = 'started'"),
    ]);
    const daily = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(time - i * 86400000).toISOString().slice(0, 10);
      return { day: date, visitors: rows[5].results.find(r => r.day === date)?.visitors || 0, views: rows[6].results.find(r => r.day === date)?.views || 0 };
    });
    return json({ day, visitors: rows[0].results[0].visitors, views: rows[1].results[0].views, sources: rows[2].results, landings: rows[3].results, pages: rows[4].results, daily, started: rows[7].results[0]?.value || null, availableSince: dayAt(Date.now() - 89 * 86400000) });
  } catch { return json({ error: 'storage_unavailable' }, 503); }
}
