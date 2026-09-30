const {readFileSync}=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('functions/_middleware.js','utf8')).toString('base64'));
 for(const path of ['/quotly','/quotly/','/quotly?ref=blog']){
  const r=await onRequest({request:new Request('https://jimmypark.net'+path),next:()=>{throw Error('unexpected fallthrough')}});
  assert.equal(r.status,302);assert.equal(r.headers.get('Cache-Control'),'no-store');
  assert.equal(r.headers.get('Location'),'https://github.com/scoutkorea-jimmy/usagebar-releases/releases/latest');
 }
 const r=await onRequest({request:new Request('https://jimmypark.net/quotly-other'),next:async()=>new Response('pass')});
 assert.equal(await r.text(),'pass');console.log('Quotly redirect checks passed');
})();
