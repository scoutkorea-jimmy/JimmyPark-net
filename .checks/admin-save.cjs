const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/admin.js'),'utf8');
function between(start,end) { return source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))); }
const elements={'save':{},'save-msg':{}};
let resolveFetch,requests=[],input;
const scope={
  content:{title:'initial',updatedAt:0},editRevision:0,saving:false,contentLoaded:true,savedRevision:0,
  $:id=>elements[id],authHeader:()=>({}),ensureShape:()=>{},postPreview:()=>{},showGate:()=>{},clearSession:()=>{},
  fetch:(url,opts)=>{requests.push(JSON.parse(opts.body).content);return new Promise(resolve=>{resolveFetch=()=>resolve({status:200,json:async()=>({ok:true,content:{...JSON.parse(opts.body).content,updatedAt:requests.length}})});});},
  wrapField:(label,control)=>control,
  el:(tag,props)=>({ ...props, value:'',style:{} }),
  schedulePreview:()=>scope.editRevision++,
  renderEditor:()=>{ input=api.fieldEl(scope.content,{k:'title'}); }
};
const api=vm.runInNewContext(between('  function fieldEl','  function wrapField')+between('  function save()','  // ── media library')+';({save,fieldEl});',scope);
(async()=>{
  scope.renderEditor(); input.value='first'; input.oninput();
  const first=api.save(); assert.equal(scope.saving,true); api.save(); assert.equal(requests.length,1);
  resolveFetch();await first; assert.equal(scope.saving,false);
  input.value='second';input.oninput(); const second=api.save();resolveFetch();await second;
  assert.deepEqual(requests.map(r=>r.title),['first','second']);
  input.value='third';input.oninput();const third=api.save();
  input.value='typed while saving';input.oninput();resolveFetch();await third;
  assert.equal(scope.content.title,'typed while saving');assert.equal(scope.content.updatedAt,3);assert.match(elements['save-msg'].textContent,/still need saving/);
  const fourth=api.save();resolveFetch();await fourth;assert.equal(requests[3].title,'typed while saving');
  scope.contentLoaded=false; await api.save(); assert.equal(requests.length,4,'Failed content load must disable saving');
  console.log('PASS: repeated saves rebind editor, in-flight edits survive, duplicate requests prevented and later changes save.');
})().catch(e=>{console.error(e);process.exitCode=1;});
