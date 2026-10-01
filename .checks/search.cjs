const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('functions/search.js', 'utf8').replace(/^import .*;\n/gm, '').replace(/export (async )?function/g, '$1function');
const escapeHTML = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const shell = fs.readFileSync('functions/_insights-shell.js','utf8').match(/`([\s\S]*)`;/)[1];
const api = vm.runInNewContext(source + ';({normalize,articleEntries,collectionEntries,findResults,onRequestGet});', { URL, URLSearchParams, Response, escapeHTML, INSIGHTS_SHELL: shell, publicationTime: post => Date.parse(post.date+'T09:00:00+09:00'), readContent:async()=>{throw Error('offline');}, readPosts:async()=>{throw Error('offline');} });
const store = { posts: [
  {title:'Draft secret',summary:'DRAFT-SENTINEL',body:'DRAFT-BODY',slug:'draft',status:'draft',date:'2026-01-01'},
  {title:'Upcoming planning',summary:'Public summary',body:'FUTURE-SENTINEL',hashtags:'#PRIVATE',slug:'future',status:'published',date:'2026-10-06'},
  {title:'Delivery',summary:'Useful work',body:'Published collaboration',slug:'live',status:'published',date:'2026-09-28'}
] };
const now=Date.parse('2026-10-01T12:00:00+09:00'), before=JSON.stringify(store);
const entries=api.articleEntries(store,now);
assert.equal(entries.length,2);
assert.ok(!JSON.stringify(entries).includes('SENTINEL'));
assert.ok(!JSON.stringify(entries).includes('PRIVATE'));
assert.equal(api.findResults(entries,'FUTURE-SENTINEL').length,0);
assert.equal(api.findResults(entries,'협업')[0].title,'Delivery');
assert.equal(api.articleEntries(store,Date.parse('2026-10-06T08:59:59+09:00'))[0].group,'upcoming');
assert.equal(api.articleEntries(store,Date.parse('2026-10-06T09:00:00+09:00'))[0].group,'articles');
assert.ok(api.articleEntries(store,Date.parse('2026-10-06T09:00:00+09:00'))[0].text.includes('FUTURE-SENTINEL'));
assert.equal(JSON.stringify(store),before);
const projects=[{title:'Samsung film',text:'Samsung planning editing',group:'work'},{title:'Website',text:'Samsung planning',group:'dev'}];
assert.equal(api.findResults(projects,'삼성 편집')[0].title,'Samsung film');
assert.equal(api.findResults(projects,'삼성','dev').length,1);
assert.equal(api.findResults(projects,'no-match').length,0);
assert.equal(api.findResults(projects,'  ').length,0);
assert.equal(api.normalize('ＡＩ － 영상'),'ai video');
assert.equal(api.findResults([{title:'Chair',text:'Planning a chair',group:'pages'}],'AI').length,0);
assert.equal(api.findResults([{title:'AI2RE',text:'Technology film',group:'work'}],'AI').length,1);
const doc={pages:{work:{hidden:[],sections:{video:{cases:[{id:'film',title:'CUSTOM-COPY',role:'Editing',image:'/assets/img/private-file.jpg',images:['/assets/img/preview-secret.jpg']}]}}}}};
const visible=api.collectionEntries(doc,'work','video.cases');assert.equal(visible[0].href,'/work#case-film');
assert.equal(api.findResults(visible,'CUSTOM-COPY').length,1);assert.equal(api.findResults(visible,'preview-secret').length,0);
doc.pages.work.hidden=['video'];assert.equal(api.collectionEntries(doc,'work','video.cases').length,0);
doc.pages.work.hidden=[];doc.pages.work.sections.video.cases=[];assert.equal(api.collectionEntries(doc,'work','video.cases').length,0);
(async()=>{
  const response=await api.onRequestGet({env:{},request:new Request('https://example.test/search?q=%22%3E%3Cscript%3E')});
  assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');
  const html=await response.text();assert.ok(html.includes('&quot;&gt;&lt;script&gt;'));assert.ok(!html.includes('"><script>'));
  assert.ok(html.includes('role="search"'));assert.ok(html.includes('noindex,follow'));
  const empty=await api.onRequestGet({env:{},request:new Request('https://example.test/search')});assert.equal(empty.status,200);
  for(const file of ['index.html','work.html','dev.html','lecture.html','scouting.html','contact.html','insights.html','404.html']) assert.ok(fs.readFileSync(file,'utf8').includes('aria-label="Search website"'),file);
  console.log('PASS: search ranking, Korean aliases, filters, publication boundary, no draft/future leakage, escaping and offline state.');
})().catch(error=>{console.error(error);process.exitCode=1;});
