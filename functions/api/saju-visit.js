// /api/saju-visit — /saju · /saju-result 일일 방문자 카운터.
// POST: 방문 1회 기록(같은 IP는 KST 기준 하루 1회만, IP는 SHA-256 해시로만 저장)
// GET : 집계만 반환. 생년월일 등 사주 입력값은 절대 다루지 않는다.
// KV: sjv:d:<YYYY-MM-DD>(일별, 영구 보관) · sjv:total(누적) · sjv:ip:<date>:<hash>(중복 방지, 26h TTL)
import { json } from './_lib.js';

function kstDay() {
  const t = new Date(Date.now() + 9 * 3600 * 1000); // KST = UTC+9
  return t.toISOString().slice(0, 10);
}

async function ipHash(ip) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sjv|' + ip));
  return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest({ request, env }) {
  const kv = env.JP_KV;
  if (!kv) return json({ error: 'not_configured' }, 503);
  if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const day = kstDay();
  const dKey = 'sjv:d:' + day;
  const tKey = 'sjv:total';
  let [today, total] = (await Promise.all([kv.get(dKey), kv.get(tKey)])).map((v) => parseInt(v, 10) || 0);

  if (request.method === 'POST') {
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const seenKey = 'sjv:ip:' + day + ':' + (await ipHash(ip));
    if (!(await kv.get(seenKey))) {
      today += 1;
      total += 1;
      await Promise.all([
        kv.put(seenKey, '1', { expirationTtl: 26 * 3600 }),
        kv.put(dKey, String(today)),
        kv.put(tKey, String(total))
      ]);
    }
  }
  return json({ day, today, total });
}
