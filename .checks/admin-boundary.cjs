const assert = require('node:assert/strict');
const fs = require('node:fs');
const admin = 'https://admin.jimmypark.net';
const site = 'https://jimmypark.net';

(async () => {
  const source = fs.readFileSync('functions/_middleware.js', 'utf8');
  const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const visit = (origin, path, init) => onRequest({
    request: new Request(origin + path, init),
    next: async () => new Response('fixture', { headers: { 'Content-Type': 'text/html' } }),
  });
  for (const origin of [site, 'https://www.jimmypark.net', 'https://preview.jimmypark-net.pages.dev']) {
    const res = await visit(origin, '/admin');
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('Location'), admin + '/admin');
    for (const path of ['/api/me', '/api/posts', '/api/traffic', '/api/image?list=1']) {
      assert.equal((await visit(origin, path)).status, 401);
    }
    assert.equal((await visit(origin, '/api/content', { method: 'PUT' })).status, 401);
    assert.equal((await visit(origin, '/api/content')).status, 200);
    assert.equal((await visit(origin, '/api/image?id=photo')).status, 200);
  }
  const shell = await visit(admin, '/admin', { method: 'HEAD' });
  assert.equal(shell.status, 200);
  assert.equal(await shell.text(), '');
  assert.equal(shell.headers.get('X-Frame-Options'), 'DENY');
  assert.equal(shell.headers.get('Cache-Control'), 'no-store');
  assert.match(shell.headers.get('Content-Security-Policy'), /script-src 'self';/);
  assert.equal((await visit(admin, '/press')).status, 404);
  assert.equal((await visit(admin, '/assets/site.js')).status, 404);
  assert.equal((await visit(admin, '/api/enquiry')).status, 404);
  assert.equal((await visit(admin, '/api/content', { method: 'PUT', headers: { Origin: site } })).status, 401);
  assert.equal((await visit(admin, '/api/content', { method: 'PUT', headers: { Origin: admin } })).status, 200);
  for (const path of ['/', '/press', '/work', '/dev', '/lecture', '/scouting', '/contact']) {
    assert.equal((await visit(site, path)).headers.get('X-Frame-Options'), 'SAMEORIGIN');
    const preview = await visit(site, path + '?preview=1');
    assert.equal(preview.headers.get('X-Frame-Options'), null);
    assert(preview.headers.get('Content-Security-Policy').includes(admin));
  }
  for (const path of ['/saju', '/insights']) {
    assert.equal((await visit(site, path + '?preview=1')).headers.get('X-Frame-Options'), 'SAMEORIGIN');
  }
  console.log('PASS admin, public, deployment and preview route boundaries.');
})().catch(error => { console.error(error); process.exitCode = 1; });
