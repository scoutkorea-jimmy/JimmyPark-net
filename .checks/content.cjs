// Exercise migration and preservation without network requests or actual KV writes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8').replace(/^import .*;\n/m, '').replace(/export async function/g, 'async function');
const sandbox = { json: value => value, isAdmin: async () => true };
const api = vm.runInNewContext(source + '; ({ defaults: DEFAULT, get: onRequestGet, put: onRequestPut });', sandbox);
const copy = value => JSON.parse(JSON.stringify(value));
async function get(value) {
  let writes = 0;
  const result = await api.get({ env: { JP_KV: { get: async () => JSON.stringify(value), put: async () => { writes++; } } } });
  assert.equal(writes, 0, 'GET must never write KV');
  return copy(result.content);
}
(async () => {
  const defaults = copy(api.defaults);
  const oldestOrder = copy(defaults);
  oldestOrder.version = 2;
  oldestOrder.pages.scouting.order = ['hero','why','stats','roles','international','mediaprojects','timeline','gallery','cta'];
  oldestOrder.pages.scouting.sections.timeline.items.forEach(item => { delete item.track; });
  assert.deepEqual((await get(oldestOrder)).pages.scouting.order, defaults.pages.scouting.order, 'Original v2 seed order must migrate without resetting custom orders');
  for (const version of [2, 5]) {
    const legacy = copy(defaults); legacy.version = version;
    const home = legacy.pages.home.sections, work = legacy.pages.work.sections, sc = legacy.pages.scouting.sections;
    delete sc.travel; legacy.pages.scouting.order = ['cta', ...legacy.pages.scouting.order.filter(id => id !== 'cta' && id !== 'travel')];
    delete work.video.cases; delete work.video.casesTitle; delete work.photography.portfolio; delete work.photography.portfolioNote;
    home.projects.items[2] = { title: 'Jamboree D-count', desc: 'An old campaign', tag: 'Campaign', href: '/scouting', image: '' };
    work.vibecoding.items[1] = { slug: 'jamboree-dcount', title: 'Jamboree D-count', desc: 'Campaign participation page', status: 'Live', accent: 'burgundy', image: '' };
    sc.mediaprojects.items.push({ title: 'Jamboree D-count', desc: 'Old countdown' });
    if (version === 2) sc.timeline.items.forEach(item => { delete item.track; });
    sc.timeline.items.push({ year: '2026–', track: version === 2 ? '' : 'Leader', title: 'Scout Tour Assistant · Jamboree D-count experiments', context: 'Jamboree D-count', accent: 'green' });
    legacy.global.contact.email = 'custom@example.test'; home.hero.image = '/custom-portrait.jpg'; home.hero.title = 'Custom headline';
    work.vibecoding.items[2].desc = 'Custom beta description'; sc.roles.items[0].title = 'Custom role'; legacy.pages.scouting.hidden = ['gallery'];
    const result = await get(legacy);
    assert.equal(result.version, 6);
    assert.equal(result.pages.work.sections.video.cases.length, 6);
    assert.equal(result.pages.scouting.sections.travel.items.length, 19);
    assert.match(result.pages.work.sections.photography.portfolio.href, /^https:\/\/drive\.google\.com\/drive\/folders\//);
    assert.ok(!/Jamboree D-count|jamboree-dcount/.test(JSON.stringify(result)));
    assert.equal(result.pages.work.sections.vibecoding.items[1].title, 'K-TrainRadar24');
    assert.equal(result.pages.work.sections.vibecoding.items[2].desc, 'Custom beta description');
    assert.deepEqual(result.global.contact, legacy.global.contact);
    assert.deepEqual(result.pages.home.sections.hero, home.hero);
    assert.deepEqual(result.pages.scouting.sections.roles, sc.roles);
    assert.deepEqual(result.pages.scouting.hidden, ['gallery']);
    assert.equal(result.pages.scouting.order[0], 'cta');
    assert.deepEqual(await get(result), result, 'v6 normalization must be idempotent');
  }
  const edited = copy(defaults); edited.pages.scouting.sections.travel.items = []; edited.pages.work.sections.video.cases = []; edited.pages.work.sections.photography.portfolio.href = '';
  assert.deepEqual(await get(edited), edited, 'Explicit v6 empty values must remain editable');
  console.log('PASS: v2/v5 to v6 migrations, retired project removal, additive evidence, custom values/order/visibility, empty edits, idempotence and no GET writes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
