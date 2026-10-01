const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const client = fs.readFileSync('assets/site.js','utf8');
const code = client.slice(client.indexOf('  // Site search stays'),client.indexOf('  // M3 top app bar:'));
const events={}, requests=[], field={focus(){this.focused=true;}}, label={}, status={focus(){this.focused=true;}}, panel={innerHTML:'',setAttribute(){},removeAttribute(){},querySelector(selector){return selector==='label'?label:selector.includes('input')?field:status;}}, closeButton={};
const body={style:{overflow:''},appendChild(){}};
const filters={scrollWidth:700,clientWidth:250,scrollLeft:0,querySelector(){return {offsetLeft:400};}};
const originalQuery=panel.querySelector;panel.querySelector=function(selector){return selector==='.insight-series-chips'?filters:originalQuery(selector);};
const dialog={open:false,handlers:{},setAttribute(){},querySelector(s){return s==='[data-search-panel]'?panel:closeButton;},addEventListener(k,f){this.handlers[k]=f;},showModal(){this.open=true;},close(){this.open=false;this.handlers.close();},contains(link){return link.inside||false;}};
const link={href:'https://example.test/search',getClientRects(){return [1];},focus(){this.focused=true;}};
const api=vm.runInNewContext(code+';({dialog:()=>searchDialog});',{document:{body,addEventListener(k,f){events[k]=f;},createElement(){return dialog;},querySelector(){return link;}},window:{HTMLDialogElement:function(){},location:{href:'https://example.test/work',origin:'https://example.test'}},URL,URLSearchParams,AbortController,FormData:function(){return [['q','삼성']];},fetch:async(url,opts)=>{requests.push({url,signal:opts.signal});return {ok:true,status:200,text:async()=>'<form>search results</form>'};}});
const click=(target=link,extra={})=>{const event={target:{closest(){return target;}},button:0,preventDefault(){this.prevented=true;},...extra};events.click(event);return event;};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  assert.equal(click(link,{ctrlKey:true}).prevented,undefined);assert.equal(api.dialog(),undefined);
  assert.ok(click().prevented);await settle();assert.equal(dialog.open,true);assert.equal(body.style.overflow,'hidden');assert.ok(requests[0].url.includes('fragment=1'));assert.equal(field.id,'modal-search-q');assert.equal(label.htmlFor,field.id);assert.ok(field.focused);assert.equal(filters.scrollLeft,384);
  dialog.handlers.submit({target:{matches(){return true;}},preventDefault(){}});await settle();assert.ok(requests[0].signal.aborted);assert.ok(requests[1].url.includes('q=%EC%82%BC%EC%84%B1'));assert.ok(status.focused);
  closeButton.onclick();assert.equal(dialog.open,false);assert.equal(body.style.overflow,'');assert.ok(link.focused);assert.ok(requests[1].signal.aborted);
  console.log('PASS: modal click enhancement, modifier fallback, partial fetch, search submission, abort, scroll lock and focus restoration.');
})().catch(error=>{console.error(error);process.exitCode=1;});
