// Focused regression checks for the three owner-supplied video credits and v42 migration.
// All storage is in-memory: this never reads or writes the live KV namespace.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8')
  .replace(/^import .*;\n/m, '')
  .replace(/export async function/g, 'async function');
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet, put: onRequestPut });', {
  URL, TextEncoder, isAdmin: async () => true,
  json: (body, status = 200) => ({ body, status })
});
const copy = value => JSON.parse(JSON.stringify(value));
const rows = doc => doc.pages.work.sections.video.cases;
const ids = ['yugadang-heungbu', 'yugadang-sugungga', 'seocho-culture-2020'];
const defaults = copy(api.defaults);
const additions = rows(defaults).filter(row => ids.includes(row.id));

function asV41() {
  const doc = copy(defaults);
  doc.version = 41;
  doc.updatedAt = 123;
  doc.pages.work.sections.video.cases = rows(doc).filter(row => !ids.includes(row.id));
  return doc;
}
function store(doc) {
  let raw = doc === null ? null : JSON.stringify(doc);
  const writes = [];
  return {
    writes,
    env: { JP_KV: {
      get: async key => { assert.equal(key, 'content'); return raw; },
      put: async (key, value) => { assert.equal(key, 'content'); writes.push(value); raw = value; }
    } }
  };
}
async function get(doc) {
  const storage = store(doc);
  const result = await api.get({ env: storage.env });
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(storage.writes.length, 0, 'Public GET must never write to KV');
  return copy(result.body.content);
}
function collectionHtml(html) {
  const opening = /<div\b[^>]*data-collection="video\.cases"[^>]*>/.exec(html);
  assert.ok(opening, 'Static Media Work video collection must exist');
  const start = opening.index + opening[0].length;
  const tags = /<\/?div\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 1;
  for (let tag; (tag = tags.exec(html));) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, tag.index);
  }
  throw new Error('Static Media Work video collection is not closed');
}

(async () => {
  assert.equal(defaults.version, 42);
  assert.deepEqual(additions.map(row => row.id), ids);
  assert.deepEqual(additions.map(row => row.href), [
    'https://www.youtube.com/watch?v=LGLSqTFWIRk',
    'https://www.youtube.com/watch?v=VPvDYQCul9M',
    'https://www.youtube.com/watch?v=ZwaZT02tZnQ'
  ]);
  assert.deepEqual(additions.map(row => row.role), [
    'On-set Assistant Director & Audio Director',
    'On-set Assistant Director & Editor',
    'Planning & Editing Lead'
  ]);
  assert.deepEqual(additions.map(row => row.year), ['', '', '2020'], 'Upload dates must not be presented as unverified production years');
  assert.match(additions[2].desc, /planning and editing/i);
  assert.match(additions[2].desc, /2020/);
  assert.match(additions[2].desc, /existing source footage/i);
  assert.match(additions[2].desc, /new film|updated edition/i);
  for (const row of additions) {
    assert.equal(row.images.length, 3, 'Every added video has three additional previews');
    assert.equal(new Set([row.image, ...row.images]).size, 4, 'Representative and preview paths must be distinct');
    for (const asset of [row.image, ...row.images]) {
      assert.match(asset, /^\/assets\/img\/video\/[^/]+\.jpg$/);
    }
  }

  const old = asV41();
  const originalRows = copy(rows(old));
  const upgraded = await get(old);
  assert.equal(upgraded.version, 42);
  assert.equal(rows(upgraded).length, originalRows.length + 3);
  assert.deepEqual(rows(upgraded), [...originalRows, ...additions], 'v41 appends exactly the three new rows in supplied order');
  assert.equal(upgraded.updatedAt, old.updatedAt);
  assert.deepEqual(await get(upgraded), upgraded, 'The current schema must remain idempotent');
  assert.deepEqual((await get(null)).pages.work.sections.video.cases, rows(defaults), 'A new site includes all three videos');

  const custom = asV41();
  custom.pages.work.order.reverse();
  custom.pages.work.hidden = ['video'];
  rows(custom).reverse();
  Object.assign(rows(custom)[0], { title: 'Owner title', role: 'Owner role', desc: '', image: '', images: [] });
  rows(custom).splice(2, 1);
  const expectedCustom = copy(custom);
  expectedCustom.version = 42;
  rows(expectedCustom).push(...copy(additions));
  assert.deepEqual(await get(custom), expectedCustom, 'Custom rows, row/page order, deletions, hidden sections and intentionally empty values survive');

  const empty = asV41();
  empty.pages.work.sections.video.cases = [];
  assert.deepEqual(rows(await get(empty)), [], 'An intentionally empty collection is not repopulated');

  const deduped = asV41();
  const idMatch = { ...copy(additions[0]), href: 'https://example.test/owner-video', role: 'Owner-managed credit' };
  const urlMatch = { ...copy(additions[1]), id: 'owner-short-link', href: 'https://youtu.be/VPvDYQCul9M?t=12', title: 'Owner-managed title' };
  const longUrlMatch = { ...copy(additions[2]), id: 'owner-long-link', href: 'https://youtube.com/watch?v=ZwaZT02tZnQ&feature=shared', desc: 'Owner-managed description' };
  rows(deduped).splice(1, 0, idMatch, urlMatch, longUrlMatch);
  const dedupedExpected = copy(deduped);
  dedupedExpected.version = 42;
  assert.deepEqual(await get(deduped), dedupedExpected, 'ID or equivalent YouTube URL matches must preserve owner rows without duplicates');

  const deleted = copy(upgraded);
  deleted.pages.work.sections.video.cases = rows(deleted).filter(row => row.id !== ids[1]);
  assert.deepEqual(await get(deleted), deleted, 'A deletion saved under v42 must not be restored');

  const storage = store(old);
  const editorDoc = copy(upgraded);
  editorDoc.pages.work.hidden = ['video'];
  editorDoc.pages.work.sections.video.cases = rows(editorDoc).filter(row => row.id !== ids[1]);
  Object.assign(rows(editorDoc).find(row => row.id === ids[0]), {
    image: '/assets/img/video/yugadang-heungbu-03.jpg',
    images: ['/assets/img/video/yugadang-heungbu.jpg', '/assets/img/video/yugadang-heungbu-04.jpg']
  });
  const saved = await api.put({ env: storage.env, request: { text: async () => JSON.stringify({ content: editorDoc }) } });
  assert.equal(saved.status, 200, 'The current schema must be accepted by the administrator save');
  assert.equal(saved.body.ok, true);
  assert.equal(storage.writes.length, 1);
  assert.equal(saved.body.content.version, 42);
  assert.ok(saved.body.content.updatedAt > old.updatedAt);
  assert.deepEqual(copy(rows(saved.body.content)), rows(editorDoc), 'Administrator image changes, reordering and deletion must round-trip');
  const reloaded = await api.get({ env: storage.env });
  assert.deepEqual(copy(reloaded.body.content), copy(saved.body.content));
  assert.equal(storage.writes.length, 1, 'Reload must not add a storage write');
  const stale = await api.put({ env: storage.env, request: { text: async () => JSON.stringify({ content: old }) } });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.error, 'schema_changed', 'An old v41 editor must refresh before saving');
  assert.equal(storage.writes.length, 1, 'Rejected stale edits must not overwrite the new document');

  const runtime = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');
  const start = runtime.indexOf('  var TIMELINE_KIND_LABELS');
  const end = runtime.indexOf('  function applyText', start);
  assert.ok(start >= 0 && end > start, 'Pure renderer boundaries must be available');
  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const templates = vm.runInNewContext(runtime.slice(start, end) + '; TT;', { esc });
  const expectedHtml = rows(defaults).map(row => templates.videoCases(row)).join('\n');
  const staticHtml = collectionHtml(fs.readFileSync(path.join(root, 'work.html'), 'utf8'));
  const normalize = value => value.trim().replace(/>\s+</g, '><');
  assert.equal(normalize(staticHtml), normalize(expectedHtml), 'Static/no-JS video cards must match the current runtime collection exactly');
  for (const row of additions) {
    for (const asset of [row.image, ...row.images]) assert.ok(fs.existsSync(path.join(root, asset)), `Missing video preview: ${asset}`);
  }
  console.log('PASS: v42 video credits, migration preservation/deduplication, read-only GET, administrator round-trip, stale-schema rejection and static/runtime parity.');
})().catch(error => { console.error(error); process.exitCode = 1; });
