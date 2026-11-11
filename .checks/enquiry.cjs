// Contact form endpoint: configuration gate, validation, honeypot, rate limit and the
// outgoing mail request. Isolated: the mail provider and KV are mocked.
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const lib = readFileSync('functions/api/_lib.js', 'utf8').replace(/\bexport /g, '');
  const src = readFileSync('functions/api/enquiry.js', 'utf8').replace(/^import .*;\n/m, '').replace(/\bexport /g, '');
  const api = await import('data:text/javascript;base64,' + Buffer.from(lib + '\n' + src + '\nexport { onRequestGet, onRequestPost };').toString('base64'));
  const store = new Map();
  const kv = { get: async k => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } };
  const env = { RESEND_API_KEY: 'test-key', JP_KV: kv };
  const calls = []; let providerOk = true;
  globalThis.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return new Response('{}', { status: providerOk ? 200 : 500 }); };
  const good = { name: 'Dana Lee', email: 'dana@example.org', organization: 'Example NGO', message: 'We need a short film for our campaign.', website: '' };
  const post = (data, e = env, ip = '198.51.100.7') => api.onRequestPost({ env: e, request: new Request('https://jimmypark.net/api/enquiry', { method: 'POST', body: typeof data === 'string' ? data : JSON.stringify(data), headers: { 'CF-Connecting-IP': ip } }) });
  const code = async (...a) => { const r = await post(...a); return [r.status, (await r.json()).error]; };

  assert.equal((await (await api.onRequestGet({ env: {} })).json()).enabled, false);
  assert.equal((await (await api.onRequestGet({ env })).json()).enabled, true);
  assert.deepEqual(await code(good, {}), [503, 'not_configured']);
  assert.deepEqual(await code('{broken'), [400, 'invalid_json']);
  assert.deepEqual(await code({ ...good, name: '' }), [400, 'invalid_name']);
  assert.deepEqual(await code({ ...good, email: 'dana@example' }), [400, 'invalid_email']);
  assert.deepEqual(await code({ ...good, email: 'a@b.co, c@d.co' }), [400, 'invalid_email']);
  assert.deepEqual(await code({ ...good, message: 'short' }), [400, 'invalid_message']);
  assert.deepEqual(await code({ ...good, message: 'x'.repeat(4001) }), [400, 'invalid_message']);
  assert.deepEqual(await code('x'.repeat(12001)), [413, 'too_large']);
  assert.equal(calls.length, 0, 'nothing is sent for rejected input');
  // Honeypot: reports success, sends nothing, does not consume the limit.
  assert.equal((await post({ ...good, website: 'http://spam.example' })).status, 200);
  assert.equal(calls.length, 0); assert.equal(store.size, 0);

  const ok = await post({ ...good, name: 'Dana\r\nBcc: x@y.z Lee' });
  assert.equal(ok.status, 200); assert.equal(calls.length, 1);
  const sent = calls[0];
  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.equal(sent.init.headers.Authorization, 'Bearer test-key');
  assert.deepEqual(sent.body.to, ['hello@jimmypark.net']);
  assert.equal(sent.body.from, 'Jimmy Park website <enquiries@jimmypark.net>');
  assert.equal(sent.body.reply_to, 'dana@example.org');
  assert.ok(!/[\r\n]/.test(sent.body.subject), 'subject is one line');
  assert.match(sent.body.subject, /^Website enquiry: Dana Bcc: x@y\.z Lee \(Example NGO\)$/);
  assert.match(sent.body.text, /We need a short film for our campaign\./);
  assert.equal(sent.body.html, undefined);
  const [key] = store.keys(); assert.match(key, /^rl:enquiry:[0-9a-f]{24}$/); assert.ok(!key.includes('198.51'), 'address is hashed');
  await post(good, { ...env, ENQUIRY_TO: 'other@example.com', ENQUIRY_FROM: 'Site <x@jimmypark.net>' });
  assert.deepEqual(calls[1].body.to, ['other@example.com']); assert.equal(calls[1].body.from, 'Site <x@jimmypark.net>');

  for (let i = 0; i < 3; i++) assert.equal((await post(good)).status, 200);
  assert.deepEqual(await code(good), [429, 'rate_limited']);
  assert.equal((await post(good, env, '203.0.113.50')).status, 200, 'another address is unaffected');
  const before = calls.length;
  assert.deepEqual(await code(good, { RESEND_API_KEY: 'k', JP_KV: { get: async () => { throw new Error('kv'); } } }, '203.0.113.60'), [503, 'storage_unavailable']);
  assert.deepEqual(await code(good, { RESEND_API_KEY: 'k', JP_KV: { get: async () => null, put: async () => { throw new Error('kv'); } } }, '203.0.113.61'), [503, 'storage_unavailable']);
  assert.equal(calls.length, before, 'no mail when the limiter storage fails');
  providerOk = false;
  assert.deepEqual(await code(good, env, '203.0.113.70'), [502, 'send_failed']);
  globalThis.fetch = async () => { throw new Error('network'); };
  assert.deepEqual(await code(good, env, '203.0.113.71'), [502, 'send_failed']);

  const html = readFileSync('contact.html', 'utf8');
  assert.match(html, /<div class="card card--compact enquiry-card" id="message" data-enquiry hidden>/, 'form ships hidden');
  assert.match(html, /href="mailto:hello@jimmypark\.net/, 'email link remains');
  console.log('PASS: enquiry gate, validation, honeypot, hashed rate limit, fail-closed storage and mail request shape.');
})().catch(error => { console.error(error); process.exit(1); });
