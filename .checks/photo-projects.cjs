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
// Published v46 wording, keyed by stable dates and source links rather than display order.
const legacyWording = {
  "2026-11-11": ["성동광진 초등 역사교육 연수 「역사 속으로 걷다」", "행사 사진 촬영"],
  "2026-11-05": ["2026 KSoP 필란트로피포럼", "행사 사진 촬영"],
  "2026-08-04": ["제16회 한국잼버리", "한국스카우트연맹 홍보부 부장 · 사진 촬영 및 보도자료 작성"],
  "2026-07-11": ["Move to the Rhythm of Colombia", "프로콜롬비아 주관 · 한문화외교사절단 요청으로 행사 사진 촬영"],
  "2026-06-25": ["기후대응센터 6월 라운드테이블", "행사 사진 촬영"],
  "2015-10-03": ["한화와 함께하는 2015 서울세계불꽃축제", "KELTY 브랜드 콘셉트 촬영"],
};
const legacyArticles = {
  "https://www.socialimpactnews.net/news/articleView.html?idxno=7827": ["AI 시대 필란트로피, 중심은 ‘인간을 향한 공감과 진정성’", "소셜임팩트뉴스"],
  "https://www.lawleader.co.kr/news/articleView.html?idxno=19649": ["제16회 한국잼버리 개막…16개국 스카우트, 고성서 우정 나눈다", "로리더"],
  "https://www.ngonews.kr/news/articleView.html?idxno=234966": ["“국경도 언어도 잊었다”…함께 뛰고 웃으며 하나 된 제16회 '한국잼버리'", "한국NGO신문"],
  "https://www.kwnews.co.kr/article/20260806500334": ["[포토뉴스]제16회 한국잼버리 리셉션 및 개영식", "강원일보"],
  "https://blog.naver.com/whitelight_-/224364047111": ["[한문화외교사절단] 2026 콜롬비아 문화 교류 행사🇨🇴", "whitelight_-"],
  "https://blog.naver.com/ynii_3311/224348606876": ["[한문화외교사절단] 2026 콜롬비아 국경일 기념 행사", "ynii_3311님의 블로그"],
  "https://blog.naver.com/going_joyride/224347360167": ["[한문화외교사절단 32기] 콜롬비아 문화교류 행사", "sparks"],
  "https://www.cackorea.org/post/기후대응센터-6월-라운드테이블에서-미래도시-생존전략-제시": ["제7차 기후대응 라운드테이블...'기후변화에 따른 도시의 생로병사' 20260625", "기후대응센터"],
  "https://blog.naver.com/keltykorea/220503003632": ["2015 서울세계불꽃축제, 카약 위에서 즐긴 골든티켓보다 값진 시간!", "KELTY KOREA OFFICIAL BLOG"],
};
function previousEdition(defaults) {
  const doc = structuredClone(defaults);
  doc.version = 46;
  const section = photo(doc);
  section.projects = section.projects.filter(project => legacyWording[project.date]);
  for (const project of section.projects) {
    [project.name, project.role] = legacyWording[project.date];
    for (const article of project.articles) {
      [article.title, article.outlet] = legacyArticles[article.href];
    }
  }
  return doc;
}
const onDate = (rows, date) => {
  const row = rows.find(item => item.date === date);
  assert.ok(row, 'Missing project dated ' + date);
  return row;
};
(async () => {
  let stored = null, writes = 0;
  const env = { JP_KV: { get: async () => stored, put: async (_, value) => { stored = value; writes++; } } };
  const read = async () => structuredClone((await api.get({ env })).content);
  const save = content => api.put({ env, request: { text: async () => JSON.stringify({ content }) } });
  const initial = await read();
  const seed = photo(initial).projects;
  assert.equal(initial.version, 48);
  assert.equal(seed.length, 10);
  assert.equal(seed.flatMap(project => project.articles).length, 14);
  assert.ok(seed.every(project => !/[가-힣]/u.test([project.name, project.role,
    ...project.articles.flatMap(article => [article.title, article.outlet])].join(' '))));
  const additions = seed.filter(project => !legacyWording[project.date]);
  assert.equal(additions.length, 4);
  const muju = additions.find(project => /muju/i.test(project.name));
  assert.ok(muju, 'Muju photography project');
  assert.match(muju.role, /photograph.*Muju/i);
  assert.doesNotMatch(muju.role, /Jeonju/i);
  assert.equal(muju.articles.length, 1);
  assert.match(muju.articles[0].title, /Muju.*Jeonju/i);
  const seoulTour = onDate(additions, '2026-10-02');
  assert.match(seoulTour.name, /Hyochang Park/i);
  assert.equal(seoulTour.articles.length, 1);
  const nepal = seed.find(project => project.name === 'Nepal Flood Response: Field Media');
  assert.ok(nepal);
  assert.equal(nepal.date, '2026-08-29');
  assert.equal(nepal.endDate, '2026-09-05');
  assert.deepEqual(nepal.articles, []);
  assert.match(nepal.role, /photographed flood damage and relief work in Nepal.*Good Neighbors International.*filmed interviews.*fundraising/i);
  const { renderPressProjects } = await import('../assets/press-view.mjs');
  const renderedAssignment = renderPressProjects([nepal]);
  assert.match(renderedAssignment, /Other photography assignments/);
  assert.ok(renderedAssignment.includes(nepal.name));
  assert.match(renderedAssignment, /<time datetime="2026-08-29"/);
  assert.match(renderedAssignment, /<time datetime="2026-09-05"/);
  assert.doesNotMatch(renderedAssignment, /<img|<a\s/i);
  const aprConference = onDate(seed, '2025-10-12');
  assert.equal(aprConference.name, '28th Asia-Pacific Regional Scout Conference');
  assert.equal(aprConference.endDate, '2025-10-17');
  assert.match(aprConference.role, /official photographer for the Korean delegation/i);
  assert.deepEqual(aprConference.articles.map(article => article.href), [
    'https://www.etnews.com/20251014000143',
    'https://news.sbs.co.kr/news/endPage.do?news_id=N1008291322',
    'https://www.breaknews.com/1153501',
  ]);
  assert.ok(aprConference.articles.every(article => article.date === '2025-10-14'));
  assert.ok(aprConference.articles.every(article => article.kind === 'press'));
  assert(seed.every(project => !Object.hasOwn(project, 'album')));
  assert.equal(photo(initial).portfolio.href, 'https://drive.google.com/drive/folders/1XE1JhGKa6l0uvWVANd-9_h2QIQwmrkY0');
  const historyWorkshop = onDate(seed, '2026-11-11');
  const ksop = onDate(seed, '2026-11-05');
  const jamboree = onDate(seed, '2026-08-04');
  const colombia = onDate(seed, '2026-07-11');
  const climate = onDate(seed, '2026-06-25');
  const kelty = onDate(seed, '2015-10-03');
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
  assert.match(ksop.role, /photo/i);
  assert.equal(ksop.articles[0].kind, 'press');
  assert.equal(climate.articles[0].kind, 'organization');
  assert.equal(kelty.articles[0].kind, 'brand');
  assert.equal(ksop.articles[0].date, '2026-11-09');
  assert.equal(ksop.articles[0].href, 'https://www.socialimpactnews.net/news/articleView.html?idxno=7827');
  // The v47 document may already contain unrelated edits, a custom order or a manually created Nepal entry.
  const v47 = structuredClone(initial);
  v47.version = 47;
  photo(v47).projects = seed.filter(row => row.name !== nepal.name).map(row => structuredClone(row));
  stored = JSON.stringify(v47);
  assert.deepEqual(photo(await read()).projects, seed);
  assert.equal((await save(v47)).error, 'schema_changed');
  const manual = { ...nepal, name: 'Nepal field photographs', role: 'Custom credit' };
  photo(v47).projects = [manual, historyWorkshop];
  stored = JSON.stringify(v47);
  assert.deepEqual(photo(await read()).projects, [manual, historyWorkshop]);
  photo(v47).projects = [kelty, historyWorkshop];
  stored = JSON.stringify(v47);
  assert.deepEqual(photo(await read()).projects, [kelty, historyWorkshop, nepal]);
  photo(v47).projects = Array.from({ length: 60 }, (_, i) => ({ ...kelty, name: 'Owner assignment ' + i }));
  stored = JSON.stringify(v47);
  assert.deepEqual(photo(await read()).projects, photo(v47).projects);
  photo(v47).projects = [];
  stored = JSON.stringify(v47);
  assert.deepEqual(photo(await read()).projects, []);
  const v46 = previousEdition(initial);
  stored = JSON.stringify(v46);
  const v46Raw = stored;
  const upgradedProjects = photo(await read()).projects;
  assert.equal(upgradedProjects.length, seed.length);
  for (const project of seed) assert.deepEqual(onDate(upgradedProjects, project.date), project);
  const stale = await save(v46);
  assert.equal(stale.status, 409);
  assert.equal(stale.error, 'schema_changed');
  assert.equal(stored, v46Raw);
  assert.equal(writes, 0);

  const custom46 = structuredClone(v46);
  const oldProjects = photo(custom46).projects;
  const customProject = onDate(oldProjects, '2026-11-05');
  customProject.name = 'My forum title';
  customProject.role = 'Portrait photographer';
  Object.assign(customProject.articles[0], {title:'My headline', outlet:'My outlet', href:'https://example.org/my-story'});
  const partial = onDate(oldProjects, '2026-08-04');
  const removedHref = partial.articles.pop().href;
  partial.articles[0].outlet = 'My publication';
  const removedProjectDate = '2026-11-11';
  photo(custom46).projects = oldProjects.filter(project => project.date !== removedProjectDate);
  stored = JSON.stringify(custom46);
  const migrated = await read();
  const migratedProjects = photo(migrated).projects;
  assert.deepEqual(onDate(migratedProjects, customProject.date), customProject);
  assert.equal(migratedProjects.some(project => project.date === removedProjectDate), false);
  assert.equal(onDate(migratedProjects, partial.date).articles.some(article => article.href === removedHref), false);
  const partialArticle = onDate(migratedProjects, partial.date).articles.find(article => article.href === partial.articles[0].href);
  assert.equal(partialArticle.outlet, 'My publication');
  assert.equal(writes, 0);

  // Explicitly retain a hand-edited title (even the old seed wording) once the document is current.
  onDate(migratedProjects, partial.date).name = '제16회 한국잼버리';
  const saved = await save(migrated);
  assert.equal(saved.status, 200);
  assert.deepEqual(photo(await read()).projects, migratedProjects);
  const withoutConference = await read();
  photo(withoutConference).projects = photo(withoutConference).projects.filter(project => project.name !== aprConference.name);
  assert.equal((await save(withoutConference)).status, 200);
  assert.deepEqual(photo(await read()).projects, photo(withoutConference).projects);
  const editNepal = await read();
  const editableNepal = photo(editNepal).projects.find(project => project.name === nepal.name);
  editableNepal.name = 'Field photography in Nepal';
  editableNepal.role = 'Owner-edited credit';
  assert.equal((await save(editNepal)).status, 200);
  assert.deepEqual(photo(await read()).projects, photo(editNepal).projects);
  const removeNepal = await read();
  photo(removeNepal).projects = photo(removeNepal).projects.filter(project => project.name !== editableNepal.name);
  assert.equal((await save(removeNepal)).status, 200);
  assert.deepEqual(photo(await read()).projects, photo(removeNepal).projects);
  const noProjects46 = structuredClone(v46);
  photo(noProjects46).projects = [];
  stored = JSON.stringify(noProjects46);
  const writesBeforeGet = writes;
  assert.deepEqual(photo(await read()).projects, []);
  assert.equal(writes, writesBeforeGet);
  stored = null;
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
  assert.equal(writes, writesBeforeGet);

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
