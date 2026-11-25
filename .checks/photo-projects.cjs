const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = path.join(__dirname, '../functions/api/content.js');
const source = fs.readFileSync(file, 'utf8').replace(/^import .*;\n/m, '').replace(/export async function/g, 'async function');
const api = vm.runInNewContext(source + ';({get:onRequestGet, put:onRequestPut})', {
  URL, TextEncoder, isAdmin: async () => true, json: (data, status = 200) => ({ ...data, status }),
});
const photo = doc => doc.pages.work.sections.photography;
(async () => {
  let stored = null, writes = 0;
  const env = { JP_KV: { get: async () => stored, put: async (_, value) => { stored = value; writes++; } } };
  const read = async () => structuredClone((await api.get({ env })).content);
  const save = content => api.put({ env, request: { text: async () => JSON.stringify({ content }) } });
  const initial = await read();
  const seed = photo(initial).projects;
  assert.equal(seed.length, 6);
  assert(seed.every(project => !Object.hasOwn(project, 'album')));
  assert.equal(photo(initial).portfolio.href, 'https://drive.google.com/drive/folders/1XE1JhGKa6l0uvWVANd-9_h2QIQwmrkY0');
  const [historyWorkshop, ksop, jamboree, colombia, climate, kelty] = seed;
  assert.equal(colombia.name, 'Move to the Rhythm of Colombia');
  assert.equal(colombia.date, '2026-07-11');
  assert.deepEqual(colombia.articles.map(article => article.kind), ['blog', 'blog', 'blog']);
  assert.equal(kelty.date, '2015-10-03');
  assert.equal(kelty.articles[0].date, '2015-10-08');
  assert.equal(kelty.articles[0].href, 'https://blog.naver.com/keltykorea/220503003632');
  assert.deepEqual(jamboree.articles.map(article => article.kind), ['press', 'press', 'press']);
  assert.equal(jamboree.date, '2026-08-04');
  assert.equal(jamboree.endDate, '2026-08-09');
  assert.equal(climate.articles[0].date, '2026-06-30');
  assert.equal(historyWorkshop.articles.length, 0);
  assert.equal(historyWorkshop.date, '2026-11-11');
  assert.equal(ksop.date, '2026-11-05');
  assert.equal(ksop.role, '행사 사진 촬영');
  assert.equal(ksop.articles[0].kind, 'press');
  assert.equal(climate.articles[0].kind, 'organization');
  assert.equal(kelty.articles[0].kind, 'brand');
  assert.equal(ksop.articles[0].date, '2026-11-09');
  assert.equal(ksop.articles[0].href, 'https://www.socialimpactnews.net/news/articleView.html?idxno=7827');
  const v45 = structuredClone(initial);
  v45.version = 45;
  delete v45.global.contact.orcid;
  delete photo(v45).projects;
  stored = JSON.stringify(v45);
  assert.equal((await read()).global.contact.orcid, initial.global.contact.orcid);
  assert.deepEqual(photo(await read()).projects, seed);
  delete photo(initial).projects;
  stored = JSON.stringify(initial);
  assert.deepEqual(photo(await read()).projects, seed);
  assert.equal(writes, 0);

  const edited = await read();
  const article = {title:'One', outlet:'Media', href:'https://example.org/one'};
  photo(edited).projects = [
    {name:'Project B', date:'2026-08-04', endDate:'2026-08-09', articles:[{...article, title:'Two', href:'https://example.org/two', kind:'brand', date:'2024-02-29'}, article]},
    {name:'Project A', role:'Photographer'},
  ];
  assert.equal((await save(edited)).status, 200);
  const expected = [
    {name:'Project B', role:'', date:'2026-08-04', endDate:'2026-08-09', articles:[{...article, title:'Two', href:'https://example.org/two', kind:'brand', date:'2024-02-29'}, {...article,kind:'',date:''}]},
    {name:'Project A', role:'Photographer', date:'', endDate:'', articles:[]},
  ];
  assert.deepEqual(photo(await read()).projects, expected);
  const oldEditor = await read();
  delete photo(oldEditor).projects;
  assert.equal((await save(oldEditor)).status, 200);
  assert.deepEqual(photo(await read()).projects, expected);
  assert.equal((await save(oldEditor)).status, 409);

  const missingKind = await read();
  delete photo(missingKind).projects[0].articles[0].kind;
  assert.equal((await save(missingKind)).status, 200);
  assert.deepEqual(photo(await read()).projects, expected);
  const invalidKind = await read();
  photo(invalidKind).projects[0].articles[0].kind = 'advertising';
  assert.equal((await save(invalidKind)).error, 'invalid_publication_kind');

  for (const value of ['/inside', 'javascript:alert(1)', 'https://user@example.org/']) {
    const bad = await read();
    photo(bad).projects[0].articles[0].href = value;
    assert.equal((await save(bad)).error, 'invalid_url');
  }
  for (const row of ['project','article']) {
    const bad = await read();
    const project = photo(bad).projects[0];
    const target = row === 'project' ? project : project.articles[0];
    target.date = '2026-02-30';
    assert.equal((await save(bad)).error, 'invalid_photo_date');
  }
  for (const [start, end] of [['2026-08-09', '2026-08-04'], ['', '2026-08-09'], ['2026-02-01','2026-02-30']]) {
    const malformedRange = await read();
    Object.assign(photo(malformedRange).projects[0], {date:start, endDate:end});
    assert.equal((await save(malformedRange)).error, 'invalid_photo_date');
  }
  const malformed = await read();
  photo(malformed).projects[0].articles = [{}];
  assert.equal((await save(malformed)).error, 'incomplete_content');
  assert.deepEqual(photo(await read()).projects, expected);
  const empty = await read();
  photo(empty).projects = [];
  assert.equal((await save(empty)).status, 200);
  const emptyLegacy = await read();
  delete photo(emptyLegacy).projects;
  assert.equal((await save(emptyLegacy)).status, 200);
  assert.deepEqual(photo(await read()).projects, []);
  console.log('Photography projects: defaults, older schemas/editors, zero or many articles, order, optional fields, dates, URLs, stale saves and deletion passed.');
})().catch(err => { console.error(err); process.exitCode = 1; });
