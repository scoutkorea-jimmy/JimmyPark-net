const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const images = [
  'home.png', 'media-work.png', 'dev-work.png', 'lecture.png', 'scouting.png', 'contact.png', 'articles.png',
  'ax-1.png', 'ax-2.png', 'ax-3.png', 'ax-4.png',
  'message-1.png', 'message-2.png', 'message-3.png', 'message-4.png',
  'work-behind-1.png', 'work-behind-2.png', 'work-behind-3.png', 'work-behind-4.png',
];

for (const name of images) {
  const file = path.join(root, 'assets/img/og', name);
  const data = fs.readFileSync(file);
  assert.equal(data.subarray(1, 4).toString(), 'PNG', name + ' must be a PNG');
  assert.equal(data.readUInt32BE(16), 1200, name + ' must be 1200px wide');
  assert.equal(data.readUInt32BE(20), 630, name + ' must be 630px high');
}

const pages = new Map([
  ['index.html', 'home.png'], ['work.html', 'media-work.png'], ['dev.html', 'dev-work.png'],
  ['lecture.html', 'lecture.png'], ['scouting.html', 'scouting.png'], ['contact.html', 'contact.png'],
  ['insights.html', 'articles.png'],
]);
for (const [file, image] of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(html, new RegExp('og:image" content="https://jimmypark\\.net/assets/img/og/' + image.replace('.', '\\.') + '\\?v=0\\.22\\.1"'));
  assert.match(html, /property="og:image:alt" content="[^"]+"/);
  assert.match(html, /name="twitter:image:alt" content="[^"]+"/);
}

assert.equal(new Set(pages.values()).size, pages.size, 'Each main page must have a distinct share image');
const generator = fs.readFileSync(path.join(root, 'scripts/generate-og-images.mjs'), 'utf8');
assert.match(generator, /Google Sans Flex/);
assert.match(generator, /Material Symbols Outlined/);
assert.match(generator, /Jimmy Park\.<\/strong>.*jimmypark\.net/s);
assert.doesNotMatch(generator, /x:\s*1036|y:\s*590/);
assert.doesNotMatch(generator, /Arial|Helvetica/);
console.log('PASS: 19 social images are 1200x630 PNGs and every main page has distinct, accessible metadata.');
