// Isolated store and test-only signing secret. Never connects to live KV.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const strip = source => source.replace(/^import .*;\n/gm, '').replace(/\bexport /g, '');
const source = ['functions/api/_lib.js','functions/api/_posts.js','functions/_insights-shell.js','functions/_insights-view.js'].map(file => strip(read(file))).join('\n');
const api = vm.runInNewContext(source + '; ({ managePosts, renderInsights, issueSession });', { Response, Request, TextEncoder, Uint8Array, DataView, ArrayBuffer, crypto: require('node:crypto').webcrypto, btoa });
const copy = value => JSON.parse(JSON.stringify(value));
let saved = null, writes = 0;
const env = { TOTP_SECRET: 'isolated-test-secret', JP_KV: { get: async key => { assert.equal(key, 'insights:v1'); return saved && copy(saved); }, put: async (key,value) => { assert.equal(key,'insights:v1'); writes++; saved = JSON.parse(value); } } };
let token;
async function manage(method, data, authorized = true) {
  return api.managePosts({ env, request: new Request('https://example.test/api/posts', { method, headers: authorized ? { Authorization: 'Bearer ' + token } : {}, body: data === undefined ? undefined : typeof data === 'string' ? data : JSON.stringify(data) }) });
}
async function page(slug) { const res = await api.renderInsights({env},slug); return { status:res.status, html:await res.text(), cache:res.headers.get('cache-control') }; }
(async () => {
  token = (await api.issueSession(env)).token;
  for (const method of ['GET','POST','DELETE']) assert.equal((await manage(method, method === 'GET' ? undefined : {}, false)).status,401);
  assert.equal((await manage('PUT',{})).status,405);
  const post = { id:'',title:'A <script> & "title"',slug:'test-note',category:'<img src=x>',summary:'<script>alert(1)</script>',body:'First paragraph.\n\n## A heading\n\n<script>alert(1)</script>',date:'2026-09-10',status:'draft' };
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
  assert.match(detail.html,/<h2>A heading<\/h2>/); assert.ok(!detail.html.includes('<script>alert(1)'));
  assert.match(detail.html,/https:\/\/jimmypark.net\/insights\/test-note/);
  assert.ok((await page()).html.includes('/insights/test-note'));
  const before = writes;
  assert.equal((await manage('POST',{revision:store.revision,post:{...post,status:'published'}})).status,409);
  for (const invalid of [{slug:'../bad'},{date:'2026-02-30'},{title:''},{body:''},{title:'x'.repeat(161)},{status:'unknown'}]) {
    assert.equal((await manage('POST',{revision:store.revision,post:{...store.posts[0],...invalid}})).status,400);
  }
  assert.equal(writes,before);
  res = await manage('POST',{revision:store.revision,post:{...store.posts[0],status:'draft'}}); store=await res.json();
  assert.equal((await page('test-note')).status,404);
  assert.ok(!(await page()).html.includes('/insights/test-note'));
  assert.equal((await manage('DELETE',{revision:store.revision,post:store.posts[0]})).status,200);
  assert.equal(saved.posts.length,0);
  assert.ok(!read('assets/site.js').includes('var meta = pd.meta || g.seo'));
  const publicHTML = ['index.html','work.html','scouting.html','contact.html','insights.html','404.html'];
  for (const file of publicHTML) {
    const html=read(file); assert.match(html,/href="\/insights"/); assert.match(html,/id="main-content"/);
    assert.equal((html.match(/<main\b/g)||[]).length,1);
  }
  console.log('PASS: real session auth, draft privacy, server-rendered list/detail, publish/unpublish/delete, validation, slug conflicts, stale revisions, escaping, no-store and navigation.');
})().catch(error=>{ console.error(error); process.exitCode=1; });
