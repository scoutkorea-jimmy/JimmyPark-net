// Isolated store and test-only signing secret. Never connects to live KV.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = source => source.replace(/^import .*;\n/gm, '').replace(/\bexport /g, '');
const source = ['functions/api/_lib.js','functions/api/_posts.js','functions/_insights-shell.js','functions/_insights-view.js'].map(file => strip(read(file))).join('\n');
const api = vm.runInNewContext(source + '; ({ managePosts, renderInsights, issueSession, publicationTime });', { Response, Request, URL, TextEncoder, Uint8Array, DataView, ArrayBuffer, crypto: require('node:crypto').webcrypto, btoa });
const copy = value => JSON.parse(JSON.stringify(value));
let saved = null, writes = 0;
const env = { TOTP_SECRET: 'isolated-test-secret', JP_KV: { get: async key => { assert.equal(key, 'insights:v1'); return saved && copy(saved); }, put: async (key,value) => { assert.equal(key,'insights:v1'); writes++; saved = JSON.parse(value); } } };
let token;
async function manage(method, data, authorized = true) {
  return api.managePosts({ env, request: new Request('https://example.test/api/posts', { method, headers: authorized ? { Authorization: 'Bearer ' + token } : {}, body: data === undefined ? undefined : typeof data === 'string' ? data : JSON.stringify(data) }) });
}
async function page(slug, query = '') { const res = await api.renderInsights({env,request:new Request('https://example.test/insights' + query)},slug); return { status:res.status, html:await res.text(), cache:res.headers.get('cache-control') }; }
(async () => {
  token = (await api.issueSession(env)).token;
  for (const method of ['GET','POST','DELETE']) assert.equal((await manage(method, method === 'GET' ? undefined : {}, false)).status,401);
  assert.equal((await manage('PUT',{})).status,405);
  const post = { id:'',title:'A <script> & "title"',slug:'test-note',category:'<img src=x>',summary:'<script>alert(1)</script>',body:'First paragraph.\n\n## A heading\n\n<script>alert(1)</script>',hashtags:'',image:'/assets/img/og/ax-1.png',imageAlt:'AX article cover',date:'2026-09-10',status:'draft' };
  assert.equal((await page()).status,200);
  assert.match((await page()).html,/New writing will appear here/);
  let res = await manage('POST',{revision:'',post}); assert.equal(res.status,200); let store = await res.json();
  assert.equal(writes,1);
  assert.equal((await page('test-note')).status,404);
  assert.ok(!(await page()).html.includes('test-note'));
  assert.equal((await manage('POST','{broken')).status,400);
  assert.equal((await manage('POST',{revision:'stale',post})).status,409);
  assert.equal(writes,1);
  let current = store.posts[0];
  res = await manage('POST',{revision:store.revision,post:{...current,status:'published'}}); assert.equal(res.status,200); store=await res.json();
  const detail=await page('test-note'); assert.equal(detail.status,200); assert.equal(detail.cache,'no-store');
  assert.match(detail.html,/<title>A &lt;script&gt; &amp; &quot;title&quot; \| Jimmy Park<\/title>/);
  assert.match(detail.html,/<h2 id="section-1">A heading<\/h2>/); assert.match(detail.html,/href="#section-1">A heading/); assert.ok(!detail.html.includes('<script>alert(1)'));
  assert.match(detail.html,/https:\/\/jimmypark.net\/insights\/test-note/);
  assert.match(detail.html, /rel="author" href="\/#snapshot">By Jimmy Park/);
  const structured = JSON.parse(detail.html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(structured['@type'], 'BlogPosting');
  assert.equal(structured.author['@id'], 'https://jimmypark.net/#person');
  assert.equal(structured.headline, current.title);
  assert.deepEqual(Array.from(structured.image), ['https://jimmypark.net/assets/img/og/ax-1.png']);
  assert.match(detail.html, /<meta property="og:image" content="https:\/\/jimmypark.net\/assets\/img\/og\/ax-1.png">/);
  assert.match(detail.html, /<meta property="og:image:alt" content="AX article cover">/);
  assert.match(detail.html, /class="insight-cover"/);
  assert.match(detail.html, /facebook\.com\/sharer\/sharer\.php\?u=https%3A%2F%2Fjimmypark\.net%2Finsights%2Ftest-note/);
  assert.match(detail.html, /linkedin\.com\/sharing\/share-offsite\/\?url=https%3A%2F%2Fjimmypark\.net%2Finsights%2Ftest-note/);
  assert.match(detail.html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(detail.html, /What do you think\?/);
  assert.ok((await page()).html.includes('/insights/test-note'));
  const controls = (await page(undefined, '?sort=asc')).html;
  assert.match(controls, /aria-label="Sort articles"/);
  assert.match(controls, /Newest first/);
  assert.match(controls, /Oldest first/);
  assert.match(controls, /sort=asc/);
  const filteredOldest = (await page(undefined, '?series=AX%20Series&sort=asc')).html;
  assert.match(filteredOldest, /href="\/insights\?sort=asc"/);
  assert.match(filteredOldest, /href="\/insights\?series=AX%20Series&amp;sort=asc"/);
  const before = writes;
  assert.equal((await manage('POST',{revision:store.revision,post:{...post,status:'published'}})).status,409);
  for (const invalid of [{slug:'../bad'},{date:'2026-02-30'},{title:''},{body:''},{title:'x'.repeat(161)},{status:'unknown'},{image:'javascript:alert(1)'}]) {
    assert.equal((await manage('POST',{revision:store.revision,post:{...store.posts[0],...invalid}})).status,400);
  }
  assert.equal(writes,before);
  res = await manage('POST',{revision:store.revision,post:{...store.posts[0],status:'draft'}}); store=await res.json();
  assert.equal((await page('test-note')).status,404);
  assert.ok(!(await page()).html.includes('/insights/test-note'));
  assert.equal((await manage('DELETE',{revision:store.revision,post:store.posts[0]})).status,200);
  assert.equal(saved.posts.length,0);
  assert.equal(api.publicationTime({ date: '2026-09-28' }), Date.UTC(2026, 8, 28, 0, 0, 0));
  const sample = (id, title, slug, date, status = 'published') => ({ id, title, slug, date, status, category: 'Practice', summary: title + ' summary', hashtags: '', image: slug === 'expertise-should-not-make-people-feel-small' ? '/assets/img/og/work-behind-1.png' : '', imageAlt: title + ' article cover', body: title + ' private body', updatedAt: Number(id.replace(/\D/g, '')) || 1 });
  saved = { revision: 'paging', posts: [
    ...Array.from({length:6}, (_,i) => sample('p' + (i + 1), 'Past ' + (i + 1), 'past-' + (i + 1), '2026-01-0' + (i + 1))),
    ...Array.from({length:6}, (_,i) => sample('u' + (i + 1), 'Upcoming ' + (i + 1), i === 0 ? 'expertise-should-not-make-people-feel-small' : 'upcoming-' + (i + 1), '2099-01-0' + (i + 1))),
    sample('d1', 'Private draft', 'private-draft', '2099-02-01', 'draft'),
  ] };
  const firstPage = (await page()).html;
  assert.match(firstPage, /Published Articles/); assert.match(firstPage, /Upcoming Articles/);
  assert.match(firstPage, /Past 6/); assert.ok(!firstPage.includes('Past 1 summary'));
  assert.match(firstPage, /Upcoming 1/); assert.ok(!firstPage.includes('Upcoming 6 summary'));
  assert.match(firstPage, /Published article pages/); assert.match(firstPage, /Upcoming article pages/);
  assert.ok(!firstPage.includes('Private draft'));
  const secondPage = (await page(undefined, '?page=2&upcomingPage=2')).html;
  assert.match(secondPage, /Past 1/); assert.match(secondPage, /Upcoming 6/);
  const oldestFirst = (await page(undefined, '?sort=asc')).html;
  assert.match(oldestFirst, /Past 1/); assert.ok(!oldestFirst.includes('Past 6 summary'));
  const futureDetail = await page('expertise-should-not-make-people-feel-small');
  assert.match(futureDetail.html, /The Work Behind the Work · Part 1 of 4/);
  assert.match(futureDetail.html, /Scheduled article/);
  assert.match(futureDetail.html, /assets\/img\/og\/work-behind-1.png/);
  assert.ok(!futureDetail.html.includes('facebook.com/sharer'));
  assert.ok(!futureDetail.html.includes('Upcoming 1 private body'));
  assert.equal((await page('private-draft')).status, 404);
  assert.ok(!read('assets/site.js').includes('var meta = pd.meta || g.seo'));
  const publicHTML = ['index.html','work.html','dev.html','scouting.html','contact.html','insights.html','404.html'];
  for (const file of publicHTML) {
    const html=read(file); assert.match(html,/data-nav="insights"/,'Insights is visible in navigation after publication'); assert.match(html,/id="main-content"/);
    assert.equal((html.match(/<main\b/g)||[]).length,1);
  }
  const offline = { ...env, JP_KV: { get: async () => { throw new Error('offline'); } } };
  const unavailable = await api.renderInsights({env:offline});
  assert.equal(unavailable.status,503); assert.match(await unavailable.text(), /will be back shortly/);
  console.log('PASS: auth, draft privacy, exact 9 AM scheduling, published/upcoming grouping, ascending/descending order, five-item pagination, detail rendering, validation and navigation.');
})().catch(error=>{ console.error(error); process.exitCode=1; });
