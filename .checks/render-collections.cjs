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
const helperStart = source.indexOf('  function timelineStartYear');
const { templates, renderTimelineByYear } = vm.runInNewContext(source.slice(helperStart, end) + '; ({ templates: TT, renderTimelineByYear });', { esc });
const api = fs.readFileSync(path.join(root, 'functions/api/content.js'), 'utf8');
const defaults = JSON.parse(api.match(/const DEFAULT = ([\s\S]*?);\n\n\/\/ ── generic validator/)[1]);
const pages = { home: 'index.html', work: 'work.html', dev: 'dev.html', lecture: 'lecture.html', scouting: 'scouting.html', contact: 'contact.html' };
const result = {};
for (const [page, file] of Object.entries(pages)) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const collections = {};
  for (const match of html.matchAll(/<\w+\b[^>]*data-collection="([^"]+)"[^>]*data-template="([^"]+)"[^>]*>/g)) {
    const items = match[1].split('.').reduce((value, key) => value[key], defaults.pages[page].sections);
    const render = templates[match[2]];
    if (!render || !Array.isArray(items)) throw new Error(`Invalid collection ${page}:${match[1]}`);
    if (page === 'work' && match[1] === 'video.cases') {
      // Static SEO fallback uses the four pinned cases then all other cases in stored order.
      const pins = ['samsung-keynote','ai2re','kb-life','seocho-culture-2020'];
      const ordered = pins.map(id => items.find(row => row.id === id)).filter(Boolean).concat(items.filter(row => !pins.includes(row.id)));
      collections[match[1]] = ordered.map(item => render(item).replace('<article ', pins.includes(item.id) ? '<article ' : '<article hidden ')).join('\n');
    } else if (match[2] === 'lectureTalks') collections[match[1]] = items.slice().sort((a, b) => String(b.year || '').localeCompare(String(a.year || ''))).map((item, i, all) => render(item, i, all)).join('\n'); // mirrors site.js newest-first
    else if (match[2] === 'timeline') collections[match[1]] = renderTimelineByYear(items); // mirrors site.js year grouping
    else collections[match[1]] = items.map((item, i) => render(item, i, items, (match[0].match(/data-heading="(h[34])"/) || [])[1])).join('\n');
  }
  result[file] = { order: defaults.pages[page].order, collections };
}
result.travelCount = new Set(defaults.pages.scouting.sections.travel.items.map(item => item.name.trim().toLowerCase()).filter(Boolean)).size;
process.stdout.write(JSON.stringify(result));
