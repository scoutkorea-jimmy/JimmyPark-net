/* Read-only regression audit. Uses local source, isolated VM stubs and in-memory stores.
   Usage: node .checks/stability.cjs [repository-root]
   Never calls a network service or writes repository/production data. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ROOT = path.resolve(process.argv[2] || process.env.JIMMY_STABILITY_ROOT || path.join(__dirname, '..'));
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const copy = value => JSON.parse(JSON.stringify(value));
const strip = source => source.replace(/^import .*;\n/gm, '').replace(/\bexport /g, '');
const json = (value, status = 200) => new Response(JSON.stringify(value), {status, headers: {'content-type':'application/json'}});
const base = {Response, Request, Headers, URL, TextEncoder, Uint8Array, ArrayBuffer, json, isAdmin:async()=>true};
const content = vm.runInNewContext(strip(read('functions/api/content.js')) + '; ({get:onRequestGet, put:onRequestPut, defaults:DEFAULT});', base);
const results = [];
async function check(name, run) { try { await run(); results.push({name,ok:true}); console.log('PASS:',name); } catch(error) { results.push({name,ok:false}); console.error('FAIL:',name,'—',error.message); } }
function memoryStore(initial) {
  let stored = initial === undefined ? null : JSON.stringify(initial), writes = 0;
  return {
    env: {JP_KV: {get:async()=>stored, put:async(key,value)=>{assert.equal(key,'content');stored=value;writes++;}}},
    value:()=>stored && JSON.parse(stored), writes:()=>writes,
  };
}
function put(env, raw) { return content.put({env,request:new Request('https://test.invalid/api/content',{method:'PUT',headers:{'content-type':'application/json'},body:raw})}); }
function current() { const doc=copy(content.defaults);doc.updatedAt=100;doc.global.contact.email='owner@example.test';return doc; }
function between(source, start, end) {
  const first=source.indexOf(start),last=source.indexOf(end,first);
  assert.ok(first>=0 && last>first, 'Source extraction boundary changed: '+start);
  return source.slice(first,last);
}
(async()=>{
  await check('Malformed and empty PUT requests reject without writes',async()=>{
    for(const raw of ['', '{broken', '{}', 'null', '[]', '{"content":{}}']) {
      const store=memoryStore(current()), res=await put(store.env,raw);
      assert.equal(res.status,400,'body '+JSON.stringify(raw));
      assert.equal(store.writes(),0);assert.equal(store.value().global.contact.email,'owner@example.test');
    }
  });
  await check('PUT rejects an empty document skeleton without resetting saved fields',async()=>{
    const store=memoryStore(current());
    const skeleton={version:content.defaults.version,updatedAt:100,global:{},pages:Object.fromEntries(['home','work','scouting','contact'].map(p=>[p,{sections:{}}]))};
    const res=await put(store.env,JSON.stringify({content:skeleton}));
    assert.equal(res.status,400);assert.equal(store.writes(),0);
  });
  await check('GET reports KV outages as 503 instead of successful default content',async()=>{
    const res=await content.get({env:{JP_KV:{get:async()=>{throw new Error('isolated read outage');}}}});
    assert.equal(res.status,503);const body=await res.json();assert.equal(body.ok,false);assert.equal(body.content,undefined);
  });
  await check('A genuinely missing KV document still returns usable defaults',async()=>{
    const res=await content.get({env:{JP_KV:{get:async()=>null}}});assert.equal(res.status,200);
    const body=await res.json();assert.equal(body.ok,true);assert.equal(body.content.version,content.defaults.version);assert.equal(body.content.updatedAt,0);
  });
  await check('Sequential stale saves return 409 and preserve the first saved change',async()=>{
    const first=current(),second=copy(first),store=memoryStore(first);
    first.global.contact.email='first@example.test';second.pages.home.sections.hero.title='Stale second tab';
    const accepted=await put(store.env,JSON.stringify({content:first}));assert.equal(accepted.status,200);
    const saved=(await accepted.json()).content;assert.ok(saved.updatedAt>100);
    const stale=await put(store.env,JSON.stringify({content:second}));assert.equal(stale.status,409);
    assert.equal(store.writes(),1);assert.equal(store.value().global.contact.email,'first@example.test');
  });
  await check('Unsafe navigation and asset URLs reject with no persistence',async()=>{
    const setters=[
      d=>{d.pages.home.sections.hero.ctaPrimary.href='javascript:alert(1)';},
      d=>{d.pages.home.sections.activities.items[0].href='data:text/html,test';},
      d=>{d.pages.home.sections.projects.items[0].href='//outside.example/path';},
      d=>{d.global.contact.linkedin='javascript:alert(1)';},
      d=>{d.pages.home.sections.hero.image='data:image/svg+xml,<svg/>';},
    ];
    for(const change of setters){const doc=current(),store=memoryStore(doc);change(doc);const res=await put(store.env,JSON.stringify({content:doc}));assert.equal(res.status,400);assert.equal((await res.json()).error,'invalid_url');assert.equal(store.writes(),0);}
  });
  await check('Supported HTTPS, site paths and anchors still save',async()=>{
    const doc=current(),store=memoryStore(doc);doc.pages.home.sections.hero.ctaPrimary.href='/contact';doc.pages.home.sections.hero.ctaGhost.href='#selected';doc.global.contact.linkedin='https://www.linkedin.com/in/jimmy1420';
    assert.equal((await put(store.env,JSON.stringify({content:doc}))).status,200);assert.equal(store.writes(),1);
  });
  let nextImage=0;
  const images=vm.runInNewContext(strip(read('functions/api/image.js'))+'; ({get:onRequestGet,post:onRequestPost});',{...base,newId:()=> 'isolated-'+(++nextImage)});
  function imageStore(){const data=new Map();let writes=0;return {env:{JP_KV:{get:async key=>data.has(key)?data.get(key):null,put:async(key,value)=>{data.set(key,value);writes++;}}},writes:()=>writes};}
  await check('HTML and SVG uploads reject even when falsely labelled JPEG',async()=>{
    for(const payload of ['<!doctype html><script>test</script>','<svg xmlns="http://www.w3.org/2000/svg"></svg>']){
      const store=imageStore();const res=await images.post({env:store.env,request:new Request('https://test.invalid/api/image',{method:'POST',headers:{'content-type':'image/jpeg'},body:payload})});
      assert.equal(res.status,415);assert.equal(store.writes(),0);
    }
  });
  await check('A real JPEG is sniffed, stored, and served with safe MIME and headers',async()=>{
    const bytes=fs.readFileSync(path.join(ROOT,'assets/img/video/d-hack.jpg')),store=imageStore();
    const uploaded=await images.post({env:store.env,request:new Request('https://test.invalid/api/image',{method:'POST',headers:{'content-type':'text/html','X-Filename':'sample.jpg'},body:bytes})});
    assert.equal(uploaded.status,200);const record=await uploaded.json();assert.equal(store.writes(),2);
    const viewed=await images.get({env:store.env,request:new Request('https://test.invalid'+record.url)});
    assert.equal(viewed.status,200);assert.equal(viewed.headers.get('content-type'),'image/jpeg');assert.equal(viewed.headers.get('x-content-type-options'),'nosniff');assert.match(viewed.headers.get('content-security-policy'),/default-src 'none'/);assert.equal((await viewed.arrayBuffer()).byteLength,bytes.byteLength);
  });
  const admin=read('assets/admin.js');
  const fragments=between(admin,'  function boot()','  function ensureShape()')+between(admin,'  function save()','  // ── media library');
  function adminHarness(fetch){
    const elements={'save':{},'save-msg':{}};let renders=0;
    const scope={content:{updatedAt:100,title:'before'},contentLoaded:false,editRevision:0,savedRevision:0,saving:false,activeTab:'home',$:id=>elements[id],fetch,authHeader:()=>({}),clearSession:()=>{},showGate:()=>{},ensureShape:()=>{},buildTabs:()=>{},selectTab:()=>{},loadMedia:()=>{},postPreview:()=>{},renderEditor:()=>{renders++;}};
    const api=vm.runInNewContext(fragments+';({boot,save});',scope);return {api,scope,elements,renders:()=>renders};
  }
  await check('Admin failed loads keep Save disabled and do not enable default editing',async()=>{
    const failures=[async()=>new Response(JSON.stringify({ok:false,error:'storage_unavailable'}),{status:503}),async()=>new Response(JSON.stringify({ok:true}),{status:200}),async()=>{throw new Error('isolated fetch outage');}];
    for(const failedFetch of failures){let attempts=0;const h=adminHarness(async(...args)=>{attempts++;return failedFetch(...args);});await h.api.boot();assert.equal(h.elements.save.disabled,true);assert.equal(h.scope.contentLoaded,false);assert.match(h.elements['save-msg'].textContent,/disabled/i);await h.api.save();assert.equal(attempts,1,'Save must not send a request while content is unloaded');}
  });
  await check('In-flight edits retain user text and acknowledge the successful server revision',async()=>{
    let complete,requests=[];
    const h=adminHarness((url,options)=>{requests.push(JSON.parse(options.body).content);return new Promise(resolve=>{complete=()=>resolve(new Response(JSON.stringify({ok:true,content:{...requests.at(-1),updatedAt:101}}),{status:200}));});});
    h.scope.contentLoaded=true;h.scope.editRevision=1;h.scope.content.title='first save';
    const pending=h.api.save();assert.equal(requests.length,1);h.scope.content.title='typed while saving';h.scope.editRevision=2;complete();await pending;
    assert.equal(h.scope.content.title,'typed while saving');assert.equal(h.scope.content.updatedAt,101);assert.equal(h.scope.savedRevision,1);assert.equal(h.renders(),0);assert.match(h.elements['save-msg'].textContent,/still need saving/);
    const following=h.api.save();assert.equal(requests[1].updatedAt,101);assert.equal(requests[1].title,'typed while saving');complete();await following;
  });
  const failures=results.filter(r=>!r.ok);console.log(`\n${results.length-failures.length}/${results.length} stability checks passed. Concurrent KV writes are outside this sequential-staleness check.`);if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
