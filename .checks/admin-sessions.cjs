// Normal sign-in and session lifecycle, using SQLite in memory and an RFC sample key.
const assert = require('node:assert/strict');
const { fixture, codeFor, signIn, signInCookie, schema } = require('./admin-session-fixture.cjs');

(async () => {
  const { onRequestGet: me } = await import('../functions/api/me.js');
  const { onRequestPost: logout } = await import('../functions/api/logout.js');
  const { isAdmin } = await import('../functions/api/_lib.js');
  const origin = 'https://admin.jimmypark.net';
  const { env, sql } = fixture();
  sql.exec(schema); // Re-applying the add-only schema is a no-op.
  const request = (path, cookie, method = 'GET', headers = {}) => new Request(origin + '/api/' + path, {
    method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...headers },
  });
  const get = (cookie, useEnv = env) => me({ env: useEnv, request: request('me', cookie) });
  const signOut = (cookie, useEnv = env) => logout({ env: useEnv, request: request('logout', cookie, 'POST', { Origin: origin }) });
  const now = Math.floor(Date.now() / 1000);
  for (const other of ['https://jimmypark.net', 'https://preview.example.test', 'http://admin.jimmypark.net']) {
    assert.equal((await signIn(env, codeFor(), other)).status, 403);
  }
  const code = codeFor();
  const responses = await Promise.all([signIn(env, code), signIn(env, code)]);
  assert.deepEqual(responses.map(r => r.status).sort(), [200, 401]);
  const granted = responses.find(r => r.ok);
  assert.equal(responses.find(r => !r.ok).headers.get('Set-Cookie'), null);
  const body = await granted.json();
  assert.deepEqual(Object.keys(body).sort(), ['exp', 'ok']);
  assert.ok(body.exp >= (now + 43200) * 1000 && body.exp <= (Math.floor(Date.now() / 1000) + 43200) * 1000);
  const header = granted.headers.get('Set-Cookie');
  for (const flag of ['Path=/', 'Secure', 'HttpOnly', 'SameSite=Strict', 'Max-Age=43200']) assert.ok(header.split('; ').includes(flag));
  assert.doesNotMatch(header, /Domain=/i);
  assert.equal(granted.headers.get('Cache-Control'), 'no-store');
  const cookie = header.split(';')[0];
  assert.match(cookie, /^__Host-jp_admin=[A-Za-z0-9_-]{43}$/);
  const row = sql.prepare('SELECT * FROM admin_sessions').get();
  assert.notEqual(row.session_hash, cookie.split('=')[1]);
  assert.equal(row.session_hash.length, 43);
  assert.equal(sql.prepare('SELECT count(*) n FROM admin_sessions').get().n, 1);
  assert.deepEqual(await (await get(cookie)).json(), body);
  assert.equal((await get()).status, 401);
  assert.equal(await isAdmin(request('posts', '', 'GET', { Authorization: 'Bearer test-only' }), env), false);
  assert.equal(await isAdmin(request('posts', cookie, 'POST', { Origin: origin }), env), true);
  assert.equal(await isAdmin(request('posts', cookie, 'POST'), env), false);
  assert.equal(await isAdmin(request('posts', cookie, 'POST', { Origin: 'https://example.test' }), env), false);
  assert.equal(await isAdmin(request('posts', cookie, 'GET', { 'Sec-Fetch-Site': 'cross-site' }), env), false);
  assert.equal((await get(cookie, { ...env, TOTP_SECRET: 'another-test-key' })).status, 401);

  const update = field => sql.prepare('UPDATE admin_sessions SET ' + field + ' = ? WHERE session_hash = ?');
  update('last_seen').run(now - 1700, row.session_hash);
  assert.equal((await get(cookie)).status, 200);
  assert.ok(sql.prepare('SELECT last_seen FROM admin_sessions').get().last_seen >= now);
  update('last_seen').run(now - 1800, row.session_hash);
  assert.equal((await get(cookie)).status, 401);
  update('last_seen').run(now, row.session_hash); // Isolate the absolute deadline from the idle deadline.
  update('expires_at').run(now, row.session_hash);
  assert.equal((await get(cookie)).status, 401);
  update('expires_at').run(now + 43200, row.session_hash);
  const unavailable = { ...env, JP_TRAFFIC: {} };
  assert.equal((await get(cookie, unavailable)).status, 503);
  assert.equal(await isAdmin(request('posts', cookie), unavailable), false);
  const failedLogout = await signOut(cookie, unavailable);
  assert.equal(failedLogout.status, 503);
  assert.equal(failedLogout.headers.get('Set-Cookie'), null);
  assert.equal((await get(cookie)).status, 200);

  // Issue a second device's independent session with an unused accepted clock step.
  const step = Math.floor(Date.now() / 30000);
  const anotherCode = [codeFor(step + 1), codeFor(step - 1)].find(value => value !== code);
  const second = await signIn(env, anotherCode);
  assert.equal(second.status, 200);
  const secondCookie = second.headers.get('Set-Cookie').split(';')[0];
  assert.notEqual(cookie, secondCookie);
  const wrongOrigin = await logout({ env, request: request('logout', cookie, 'POST', { Origin: 'https://example.test' }) });
  assert.equal(wrongOrigin.status, 403);
  assert.equal((await get(cookie)).status, 200);
  const revoked = await signOut(cookie);
  assert.equal(revoked.status, 200);
  assert.match(revoked.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal((await get(cookie)).status, 401);
  assert.equal((await get(secondCookie)).status, 200);
  assert.equal((await signOut(cookie)).status, 200);

  const local = fixture();
  local.sql.exec("INSERT INTO admin_sessions VALUES('outdated',unixepoch()-1,unixepoch()); INSERT INTO admin_totp_steps VALUES(0,'old'); INSERT INTO admin_login_windows VALUES('old',1,0)");
  const localCookie = await signInCookie(local.env, 'https://localhost:8443');
  assert.match(localCookie, /^__Host-jp_admin=/);
  assert.equal(local.sql.prepare("SELECT count(*) n FROM admin_sessions WHERE session_hash='outdated'").get().n, 0);
  assert.equal(local.sql.prepare('SELECT count(*) n FROM admin_totp_steps WHERE step=0').get().n, 0);
  assert.equal(local.sql.prepare("SELECT count(*) n FROM admin_login_windows WHERE source_hash='old'").get().n, 0);
  console.log('PASS admin sessions: atomic single-use login, host cookie, origin, lifetimes, individual revocation, storage failures, cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
