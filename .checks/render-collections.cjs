// Development-only: evaluate pure renderers, never execute the page or access KV.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/site.js'), 'utf8');
const start = source.indexOf('  var TT = {');
const end = source.indexOf('  function applyText', start);
if (start < 0 || end < 0) throw new Error('Collection template boundary changed');
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const templates = vm.runInNewContext(source.slice(start, end) + '; TT;', { esc });
const api = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8');
const defaults = JSON.parse(api.match(/const DEFAULT = ([\s\S]*?);\n\n\/\/ ── generic validator/)[1]);
const pages = { home: 'index.html', work: 'work.html', scouting: 'scouting.html', contact: 'contact.html' };
const result = {};
for (const [page, file] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const collections = {};
  for (const match of html.matchAll(/<\w+\b[^>]*data-collection="([^"]+)"[^>]*data-template="([^"]+)"[^>]*>/g)) {
    const items = match[1].split('.').reduce((value, key) => value[key], defaults.pages[page].sections);
    const render = templates[match[2]];
    if (!render || !Array.isArray(items)) throw new Error(`Invalid collection ${page}:${match[1]}`);
    collections[match[1]] = items.map((item, i) => render(item, i, items)).join('\n');
  }
  result[file] = { order: defaults.pages[page].order, collections };
}
process.stdout.write(JSON.stringify(result));
