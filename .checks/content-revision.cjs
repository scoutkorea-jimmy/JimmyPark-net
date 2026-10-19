// Legacy ISO revisions must survive GET -> edit -> PUT without weakening stale-save checks.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../functions/api/content.js'), 'utf8').replace(/^import .*;\n/m, '').replace(/export async function/g, 'async function');
const api = vm.runInNewContext(source + ';({ defaults: DEFAULT, get: onRequestGet, put: onRequestPut });', { URL, TextEncoder, json: (data, status = 200) => ({ ...data, status }), isAdmin: async () => true });
(async () => {
  const legacy = JSON.parse(JSON.stringify(api.defaults));
  legacy.updatedAt = '2026-09-20T09:54:59.274Z';
  let stored = JSON.stringify(legacy), writes = 0;
  const env = { JP_KV: { get: async () => stored, put: async (_, value) => { stored = value; writes++; } } };
  const read = await api.get({ env });
  assert.equal(read.content.updatedAt, Date.parse(legacy.updatedAt));
  const incoming = JSON.parse(JSON.stringify(read.content));
  incoming.pages.home.sections.hero.title = 'Clear content for complex subjects.';
  const request = content => ({ text: async () => JSON.stringify({ content }) });
  const saved = await api.put({ env, request: request(incoming) });
  assert.equal(saved.ok, true);
  assert.equal(writes, 1);
  assert.equal(typeof saved.content.updatedAt, 'number');
  assert.equal(saved.content.pages.home.sections.hero.title, incoming.pages.home.sections.hero.title);
  assert.equal((await api.put({ env, request: request(incoming) })).error, 'conflict');
  assert.equal(writes, 1);
  assert.equal((await api.get({ env })).content.updatedAt, saved.content.updatedAt);
  // A tab opened before deployment still sends its original ISO revision.
  stored = JSON.stringify(legacy);
  const oldClient = { ...read.content, updatedAt: legacy.updatedAt };
  const legacySave = await api.put({ env, request: request(oldClient) });
  assert.equal(legacySave.ok, true, JSON.stringify(legacySave));
  assert.equal((await api.put({ env, request: request(oldClient) })).error, 'conflict');
  const invalid = { ...oldClient, updatedAt: 'invalid-date' };
  assert.equal((await api.put({ env, request: request(invalid) })).error, 'invalid_revision');
  legacy.updatedAt = 'not-a-date'; stored = JSON.stringify(legacy);
  assert.equal((await api.get({ env })).error, 'storage_unavailable');
  // Retired owner numbers migrate on read and save, while custom numbers remain editable.
  for (const phone of ['01054186124', '010-5418-6124', '010.5418.6124', '+82 10.5418.6124', '+82-10-5418-6124', '+821054186124', '010-9999-8888', '']) {
    const contactDoc = JSON.parse(JSON.stringify(api.defaults));
    contactDoc.global.contact.phone = phone;
    contactDoc.updatedAt = 123;
    stored = JSON.stringify(contactDoc);
    const expected = /5418/.test(phone) ? '+82 10.2646.1635' : phone;
    const beforeWrites = writes;
    assert.equal((await api.get({ env })).content.global.contact.phone, expected);
    assert.equal(writes, beforeWrites, 'GET must not persist a migration');
    assert.equal((await api.put({ env, request: request(contactDoc) })).content.global.contact.phone, expected);
  }
  console.log('Content revision: legacy ISO save, numeric readback, stale conflict and invalid storage checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
