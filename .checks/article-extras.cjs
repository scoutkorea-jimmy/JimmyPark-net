// Series list, per-series closing invitation, copy link, RSS feed and sitemap dates.
// Isolated store; never connects to live KV.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const strip = source => source.replace(/^import .*;\n/gm, '').replace(/\bexport /g, '');
const read = file => strip(fs.readFileSync(file, 'utf8'));
const sandbox = () => ({ Response, Request, URL, TextEncoder, Uint8Array, DataView, ArrayBuffer, Intl, Date, crypto: require('node:crypto').webcrypto, btoa });
const view = vm.runInNewContext(['functions/api/_lib.js', 'functions/api/_posts.js', 'functions/_insights-shell.js', 'functions/_insights-view.js'].map(read).join('\n') + '; ({ renderInsights });', sandbox());
const feed = vm.runInNewContext(['functions/api/_lib.js', 'functions/api/_posts.js', 'functions/insights/feed.xml.js'].map(read).join('\n') + '; ({ onRequestGet });', sandbox());
const sitemap = vm.runInNewContext(['functions/api/_lib.js', 'functions/api/_posts.js', 'functions/sitemap.xml.js'].map(read).join('\n') + '; ({ onRequestGet });', sandbox());
const post = (slug, title, date, extra = {}) => ({ id: slug, slug, title, date, category: 'Series', summary: 'Summary of ' + title + ' & more', body: 'Body.\n\n## Heading\n\nText.', hashtags: '', image: '', imageAlt: '', status: 'published', updatedAt: 1, ...extra });
const posts = [
  post('more-answers-but-is-learning-easier', 'More Answers', '2026-10-16'),
  post('mistaking-what-ai-knows-for-what-i-understand', 'Mistaking <AI>', '2026-10-18'),
  post('how-shall-we-learn-and-live-with-ai', 'Learn and Live', '2099-01-01'),
  post('from-speech-to-video', 'Speech to Video', '2026-09-20'),
  post('standalone-note', 'Standalone', '2026-09-01'),
  post('private-draft', 'Private Draft', '2026-09-02', { status: 'draft' }),
];
const env = { JP_KV: { get: async () => ({ revision: 'r', posts: JSON.parse(JSON.stringify(posts)) }) } };
const page = async slug => { const res = await view.renderInsights({ env, request: new Request('https://example.test/insights' + (slug ? '/' + slug : '')) }, slug); return { status: res.status, html: await res.text() }; };
(async () => {
  const part2 = await page('mistaking-what-ai-knows-for-what-i-understand');
  assert.equal(part2.status, 200);
  const series = part2.html.match(/<nav class="insight-series"[\s\S]*?<\/nav>/)[0];
  assert.match(series, /<h2 id="insight-series-heading">Learning in an Age of Easy Answers<\/h2>/);
  assert.match(series, /<a class="lnk insight-series-title" href="\/insights\/more-answers-but-is-learning-easier">More Answers<\/a>/);
  assert.match(series, /<li class="is-current" aria-current="page"><span class="insight-series-part">Part 2<\/span><span class="insight-series-title">Mistaking &lt;AI&gt;<\/span>/);
  assert.ok(!series.includes('href="/insights/mistaking-what-ai-knows-for-what-i-understand"'), 'current part is not a link');
  assert.match(series, /Part 5<\/span><a class="lnk insight-series-title" href="\/insights\/how-shall-we-learn-and-live-with-ai">Learn and Live<\/a><span class="insight-series-note">January 1, 2099 at 9:00 AM<\/span>/);
  assert.ok(series.indexOf('Part 1') < series.indexOf('Part 2') && series.indexOf('Part 2') < series.indexOf('Part 5'));
  assert.ok(!part2.html.includes('Private Draft'));
  assert.match(part2.html, /a different experience of learning with AI\./);
  assert.match(part2.html, /<button type="button" class="btn btn-secondary site-button" data-copy="https:\/\/jimmypark.net\/insights\/mistaking-what-ai-knows-for-what-i-understand"/);
  assert.match(part2.html, /<div class="copy-toast">/);
  assert.match(part2.html, /<link rel="alternate" type="application\/rss\+xml"[^>]+href="https:\/\/jimmypark.net\/insights\/feed.xml">/);
  // A series with one available part and an article outside any series show no list.
  const single = await page('from-speech-to-video');
  assert.ok(!single.html.includes('class="insight-series"'));
  assert.match(single.html, /a different experience of media and video\./);
  const alone = await page('standalone-note');
  assert.ok(!alone.html.includes('class="insight-series"'));
  assert.match(alone.html, /a different experience of this topic\./);
  // Scheduled pages keep their body, share controls and series list withheld.
  const scheduled = await page('how-shall-we-learn-and-live-with-ai');
  assert.ok(!scheduled.html.includes('class="insight-series"') && !scheduled.html.includes('data-copy='));
  assert.match((await page()).html, /href="\/insights\/feed.xml" type="application\/rss\+xml">Follow by RSS/);

  const rss = await feed.onRequestGet({ env });
  assert.equal(rss.status, 200); assert.match(rss.headers.get('content-type'), /application\/rss\+xml/);
  const xml = await rss.text();
  assert.equal((xml.match(/<item>/g) || []).length, 4);
  assert.ok(!xml.includes('Private Draft') && !xml.includes('Learn and Live') && !xml.includes('Body.'));
  assert.match(xml, /<title>Mistaking &lt;AI&gt;<\/title><link>https:\/\/jimmypark.net\/insights\/mistaking-what-ai-knows-for-what-i-understand<\/link>/);
  assert.match(xml, /<pubDate>Sun, 18 Oct 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<description>Summary of Mistaking &lt;AI&gt; &amp; more<\/description>/);
  assert.ok(xml.indexOf('Mistaking') < xml.indexOf('More Answers'), 'newest first');
  assert.equal((await feed.onRequestGet({ env: { JP_KV: { get: async () => { throw new Error('kv'); } } } })).status, 503);

  const map = await (await sitemap.onRequestGet({ env })).text();
  assert.ok(!map.includes('2026-09-20'), 'retired fixed date');
  assert.match(map, /<loc>https:\/\/jimmypark.net\/<\/loc><lastmod>2026-11-12<\/lastmod>/);
  assert.equal((map.match(/\/insights\//g) || []).length, 4);
  const later = { JP_KV: { get: async () => ({ revision: 'r', posts: [post('new-one', 'New', '2026-12-01')] }) } };
  const realNow = Date.now; Date.now = () => new Date('2026-12-02T00:00:00Z').getTime();
  const sitemapLater = vm.runInNewContext(['functions/api/_lib.js', 'functions/api/_posts.js', 'functions/sitemap.xml.js'].map(read).join('\n') + '; ({ onRequestGet });', { ...sandbox(), Date });
  const mapLater = await (await sitemapLater.onRequestGet({ env: later })).text(); Date.now = realNow;
  assert.match(mapLater, /<loc>https:\/\/jimmypark.net\/insights<\/loc><lastmod>2026-12-01<\/lastmod>/);
  assert.match(mapLater, /<loc>https:\/\/jimmypark.net\/work<\/loc><lastmod>2026-11-12<\/lastmod>/);
  console.log('PASS: series list, per-series invitation, copy link, RSS privacy/order and sitemap dates.');
})().catch(error => { console.error(error); process.exit(1); });
