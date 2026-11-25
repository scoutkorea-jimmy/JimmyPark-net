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

  // The login rate counter and session store are both authoritative on D1.
  const { fixture, signIn } = require('./admin-session-fixture.cjs');
  const { sql, env } = fixture();
  assert.equal((await signIn({}, null)).status, 503);
  assert.equal((await signIn({ TOTP_SECRET: env.TOTP_SECRET }, null)).status, 503);
  assert.equal((await signIn({ ...env, JP_TRAFFIC: {} }, null)).status, 503);
  const responses = await Promise.all(Array.from({ length: 11 }, () => signIn(env, null)));
  assert.equal(responses.filter(res => res.status === 401).length, 10);
  assert.equal(responses.filter(res => res.status === 429).length, 1);
  assert.equal(sql.prepare('SELECT attempts FROM admin_login_windows').get().attempts, 10);
  sql.exec('UPDATE admin_login_windows SET ends_at = unixepoch()');
  assert.equal((await signIn(env, null)).status, 401);
  assert.equal(sql.prepare('SELECT attempts FROM admin_login_windows').get().attempts, 1);
  console.log('PASS: blocklist, security headers, CSP split, HEAD parity and fail-closed login limiter.');
})().catch(error => { console.error(error); process.exit(1); });
