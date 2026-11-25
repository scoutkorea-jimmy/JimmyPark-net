// Public portfolio shells and both sitemap representations expose the same Press route.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const shell = read('functions/_insights-shell.js').match(/`([\s\S]*)`;/)[1];
for (const filename of ['index.html','work.html','dev.html','lecture.html','scouting.html','contact.html','insights.html','404.html','functions/_insights-shell.js']) {
  const html = read(filename);
  for (const name of ['Primary navigation', 'Mobile navigation', 'Footer navigation']) {
    const nav = html.match(new RegExp('<nav[^>]*aria-label="' + name + '"[^>]*>([\\s\\S]*?)</nav>'));
    assert.ok(nav,filename+' '+name);
    const urls = [...nav[1].matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    assert.equal(urls.filter(route => route === '/press').length, 1, filename+' '+name);
    assert.equal(urls[urls.indexOf('/work') + 1], '/press', filename+' '+name);
  }
}
function handler(file) {
  const script = read(file).replace(/^import .*;\n/gm, '').replace('export async function', 'async function');
  return vm.runInNewContext(script+';onRequestGet', {Response, INSIGHTS_SHELL:shell, readPosts:async()=>({}), publishedPosts:()=>[]});
}
(async()=>{
  const xml = await (await handler('functions/sitemap.xml.js')({env:{}})).text();
  for(const data of [xml,read('sitemap.xml')]) {
    assert.equal(data.match(/<loc>https:\/\/jimmypark\.net\/press<\/loc>/g)?.length, 1);
  }
  const html = await (await handler('functions/sitemap.js')({env:{}})).text();
  assert.match(html, /<main[^>]*>[\s\S]*<li><a class="lnk" href="\/press">Press<\/a>/);
  console.log('Press navigation and HTML/XML sitemaps passed');
})().catch(e=>{console.error(e);process.exitCode=1});
