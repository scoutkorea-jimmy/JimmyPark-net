// Middleware blocklist, security headers, HEAD handling and fail-closed login.
// Isolated: no network, no live KV.
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const load = file => import('data:text/javascript;base64,' + Buffer.from(readFileSync(file, 'utf8')).toString('base64'));
(async () => {
  const { onRequest } = await load('functions/_middleware.js');
  const call = (path, init, next) => {
    const request = new Request('https://jimmypark.net' + path, init);
    return onRequest({ request, next: next || (async () => new Response('page', { headers: { 'content-type': 'text/html' } })) });
  };
  for (const path of ['/.env', '/.env.example', '/scripts/deploy.sh', '/scripts', '/VERSION', '/CLAUDE.md', '/design/01-color.md', '/.checks/content.cjs', '/wrangler.toml', '/.impeccable/x']) {
    const res = await call(path, {}, () => { throw new Error('blocked path reached the handler: ' + path); });
    assert.equal(res.status, 404, path);
  }
  for (const path of ['/', '/insights', '/assets/site.css', '/environment', '/versions', '/designs']) assert.equal((await call(path)).status, 200, path);
  const page = await call('/');
  assert.equal(page.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  assert.match(page.headers.get('Strict-Transport-Security'), /max-age=31536000/);
  assert.equal(page.headers.get('X-Content-Type-Options'), 'nosniff');
  assert.match(page.headers.get('Content-Security-Policy'), /frame-ancestors 'self'/);
  assert.match(page.headers.get('Content-Security-Policy-Report-Only'), /script-src 'self'/);
  assert.equal(page.headers.get('Cache-Control'), 'no-cache');
  assert.equal(await page.text(), 'page');
  // A stricter route policy is kept, and static assets keep their CORS default.
  const image = await call('/api/image?id=a', {}, async () => new Response('x', { headers: { 'Content-Security-Policy': "default-src 'none'", 'Access-Control-Allow-Origin': '*' } }));
  assert.equal(image.headers.get('Content-Security-Policy'), "default-src 'none'");
  assert.equal(image.headers.get('Content-Security-Policy-Report-Only'), null);
  assert.equal(image.headers.get('Access-Control-Allow-Origin'), null);
  const asset = await call('/assets/img/logo.svg', {}, async () => new Response('x', { headers: { 'Access-Control-Allow-Origin': '*' } }));
  assert.equal(asset.headers.get('Access-Control-Allow-Origin'), '*');
  // HEAD mirrors GET: same status and headers, empty body, handler sees GET.
  let seen = '';
  const head = await call('/insights/some-article', { method: 'HEAD' }, async request => { seen = request ? request.method : 'none'; return new Response('body', { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }); });
  assert.equal(seen, 'GET'); assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal(head.headers.get('content-type'), 'text/html; charset=utf-8'); assert.equal(head.headers.get('cache-control'), 'no-store');
  const missing = await call('/insights/none', { method: 'HEAD' }, async () => new Response('nf', { status: 404 }));
  assert.equal(missing.status, 404);
  assert.equal((await call('/quotly', { method: 'HEAD' }, () => { throw new Error('unexpected'); })).status, 302);

  // Login limiter fails closed.
  const lib = readFileSync('functions/api/_lib.js', 'utf8').replace(/\bexport /g, '');
  const login = readFileSync('functions/api/login.js', 'utf8').replace(/^import .*;\n/m, '').replace(/\bexport /g, '');
  const { onRequestPost } = await import('data:text/javascript;base64,' + Buffer.from(lib + '\n' + login + '\nexport { onRequestPost };').toString('base64'));
  const post = env => onRequestPost({ env, request: new Request('https://jimmypark.net/api/login', { method: 'POST', body: JSON.stringify({ code: '000000' }), headers: { 'CF-Connecting-IP': '203.0.113.9' } }) });
  const secret = 'JBSWY3DPEHPK3PXP';
  assert.equal((await post({})).status, 503);
  assert.equal((await post({ TOTP_SECRET: secret })).status, 503);
  assert.equal((await post({ TOTP_SECRET: secret, JP_KV: { get: async () => { throw new Error('kv'); } } })).status, 503);
  assert.equal((await post({ TOTP_SECRET: secret, JP_KV: { get: async () => null, put: async () => { throw new Error('kv'); } } })).status, 503);
  let stored = null;
  const kv = { get: async () => stored, put: async (_k, v) => { stored = v; }, delete: async () => { stored = null; } };
  assert.equal((await post({ TOTP_SECRET: secret, JP_KV: kv })).status, 401); assert.equal(stored, '1');
  stored = '10';
  assert.equal((await post({ TOTP_SECRET: secret, JP_KV: kv })).status, 429);
  console.log('PASS: blocklist, security headers, CSP split, HEAD parity and fail-closed login limiter.');
})().catch(error => { console.error(error); process.exit(1); });
