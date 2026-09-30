// v43 regression: the Soulter social-contribution site is added once on GET, without KV writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8')
  .replace(/^import .*;\n/m, '')
  .replace(/export async function/g, 'async function');
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet });', {
  URL, TextEncoder, isAdmin: async () => true, json: (body, status = 200) => ({ body, status })
});
const copy = value => JSON.parse(JSON.stringify(value));
const OLD_DESC = 'Each site began with what its users and team needed to do, and each runs on its own admin console and back end. Every one is live and in use.';
const sites = doc => doc.pages.dev.sections.sites;
async function get(doc) {
  const result = await api.get({ env: { JP_KV: {
    get: async () => JSON.stringify(doc),
    put: async () => { throw new Error('Public GET must never write to KV'); }
  } } });
  assert.equal(result.status, 200);
  return copy(result.body.content);
}
function asV42(edit) {
  const doc = copy(api.defaults);
  doc.version = 42;
  sites(doc).items = sites(doc).items.filter(row => row.id !== 'soulland');
  sites(doc).desc = OLD_DESC;
  if (edit) edit(doc);
  return doc;
}

(async () => {
  const added = await get(asV42());
  assert.equal(added.version, 43);
  assert.deepEqual(sites(added).items.map(row => row.id).slice(-2), ['banginoja', 'soulland']);
  assert.equal(sites(added).desc, sites(api.defaults).desc);

  const custom = await get(asV42(doc => { sites(doc).items[0].href = 'https://www.soulland4567.com/'; sites(doc).desc = 'Mine.'; }));
  assert.equal(sites(custom).items.filter(row => /soulland4567/.test(row.href)).length, 1);
  assert.equal(sites(custom).desc, 'Mine.');

  const empty = await get(asV42(doc => { sites(doc).items = []; }));
  assert.equal(sites(empty).items.length, 0);

  assert.match(fs.readFileSync(path.join(root, 'dev.html'), 'utf8'), /browser-url">soulland4567\.com</);
  console.log('site additions: ok');
})().catch(error => { console.error(error); process.exit(1); });
