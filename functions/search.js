import { onRequestGet as readContent } from './api/content.js';
import { readPosts, publicationTime } from './api/_posts.js';
import { escapeHTML } from './_insights-view.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';

const PAGES = { home: ['Home', '/'], work: ['Media Work', '/work'], dev: ['Dev Work', '/dev'], lecture: ['Lectures', '/lecture'], scouting: ['Global & Scouting', '/scouting'], contact: ['Contact', '/contact'] };
const GROUPS = { all: 'All', articles: 'Articles', work: 'Media Work', dev: 'Dev Work', lecture: 'Lectures', pages: 'Pages & copy', upcoming: 'Upcoming Articles' };
const ALIASES = { '삼성': 'samsung', '서초문화재단': 'seocho cultural foundation', '서초': 'seocho', '케이비': 'kb', '대교': 'daekyo', '소울터': 'soulter', '방기노자': 'banginoja', '영상': 'video', '편집': 'editing', '기획': 'planning', '연출': 'direction', '협업': 'collaboration', '강의': 'lecture', '스카우트': 'scout', '인공지능': 'ai', '웹사이트': 'website', '유가당': 'yugadang' };
const OMIT = /^(id|href|image|images|mobileImage|adminImage|imagePosition|linkLabel|icon|color|order|hidden)$/;
const at = (obj, path) => path.split('.').reduce((value, key) => value?.[key], obj);
export function normalize(value) {
  let text = String(value || '').normalize('NFKC').toLowerCase();
  for (const [ko, en] of Object.entries(ALIASES)) text = text.split(ko).join(en);
  return text.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
function textFields(value) {
  if (typeof value === 'string') return /^(https?:|\/assets\/|\/api\/)/.test(value) ? '' : value;
  if (!value || typeof value !== 'object') return '';
  return Object.entries(value).filter(([key]) => !OMIT.test(key)).map(([, val]) => textFields(val)).filter(Boolean).join(' · ');
}
export function articleEntries(store, now = Date.now()) {
  return store.posts.filter(post => post.status === 'published').map(post => {
    const upcoming = publicationTime(post) > now;
    return { title: post.title, text: [post.title, post.summary, post.category, upcoming ? '' : post.body, upcoming ? '' : post.hashtags].filter(Boolean).join(' '), href: '/insights/' + encodeURIComponent(post.slug), group: upcoming ? 'upcoming' : 'articles', label: upcoming ? 'Upcoming · ' + post.date + ' · 9:00 AM KST' : 'Article · ' + post.date, image: post.image };
  });
}
function plainText(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(Math.min(0x10ffff, n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n))))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity]).replace(/\s+/g, ' ').trim();
}
export function collectionEntries(doc, page, key) {
  const [label, path] = PAGES[page], pd = doc.pages[page], section = key.split('.')[0], rows = at(pd.sections, key);
  if (pd.hidden.includes(section) || !Array.isArray(rows) || (page === 'home' && section === 'selected')) return [];
  return rows.filter(row => section !== 'gallery' || row.image).map(row => {
    const title = row.title || row.name || row.label || row.text || row.role || row.caption;
    const project = (page === 'work' && key === 'video.cases') || (page === 'dev' && key === 'sites.items');
    const anchor = project && /^[a-z0-9-]+$/.test(row.id || '') ? 'case-' + row.id : section;
    return { title, text: textFields(row), href: path + '#' + anchor, group: ['work', 'dev', 'lecture'].includes(page) ? page : 'pages', label, image: row.image };
  }).filter(row => row.title);
}
async function portfolioEntries(env, request, doc) {
  return (await Promise.all(Object.entries(PAGES).map(async ([page, [label, path]]) => {
    const pd = doc.pages[page], entries = [];
    const source = await env.ASSETS.fetch(new URL(path, request.url));
    if (!source.ok) throw new Error('portfolio_unavailable');
    const rewrite = new HTMLRewriter()
      .on('[data-section]', { element(el) { if (pd.hidden.includes(el.getAttribute('data-section'))) el.remove(); } })
      .on('[data-bind]', { element(el) { const value = at(pd.sections, el.getAttribute('data-bind')); if (typeof value === 'string') el.setInnerContent(escapeHTML(value), { html: true }); } })
      .on('[data-gbind]', { element(el) { const value = at(doc.global, el.getAttribute('data-gbind')); if (typeof value === 'string') el.setInnerContent(escapeHTML(value), { html: true }); } })
      .on('[data-collection]', { element(el) {
        entries.push(...collectionEntries(doc, page, el.getAttribute('data-collection')));
        el.remove();
      } })
      .on('main .msym, main script, main style, main noscript', { element(el) { el.remove(); } });
    const html = await rewrite.transform(source).text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    const copy = [plainText(main), page === 'home' ? textFields(doc.global.brand) + ' ' + textFields(doc.global.footer) : '', page === 'contact' ? textFields(doc.global.contact) : ''].filter(Boolean).join(' ');
    if (copy) entries.push({ title: label + ' — page & copy', text: copy, href: path, group: 'pages', label: 'Pages & copy' });
    return entries;
  }))).flat();
}
export function findResults(entries, query, group = 'all') {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  // ponytail: linear scan suits the bounded portfolio/200-post store; use a search index if that limit grows.
  return entries.map(entry => {
    const title = normalize(entry.title), text = normalize(entry.text);
    return { ...entry, score: terms.every(term => text.includes(term) || title.includes(term)) ? terms.reduce((score, term) => score + (title.includes(term) ? 5 : 1), 0) : 0 };
  }).filter(entry => entry.score && (group === 'all' || entry.group === group))
    .sort((a, b) => (a.group === 'upcoming') - (b.group === 'upcoming') || b.score - a.score || a.title.localeCompare(b.title));
}
function snippet(entry, query) {
  const text = entry.text.replace(/\s+/g, ' ').trim();
  const term = normalize(query).split(' ')[0];
  const match = text.toLowerCase().indexOf(term);
  const start = Math.max(0, match - 70);
  return (start ? '…' : '') + text.slice(start, start + 240) + (text.length > start + 240 ? '…' : '');
}
function resultCard(entry, query) {
  const image = /^(?:\/assets\/img\/[A-Za-z0-9._/-]+|\/api\/image\?id=[A-Za-z0-9-]+|https:\/\/[^\s]+)$/.test(entry.image || '') ? '<img src="' + escapeHTML(entry.image) + '" alt="" width="160" height="90" loading="lazy" decoding="async">' : '';
  return '<li class="search-result">' + image + '<div><p class="eyebrow">' + escapeHTML(entry.label) + '</p><h2><a class="lnk" href="' + escapeHTML(entry.href) + '">' + escapeHTML(entry.title) + '</a></h2><p>' + escapeHTML(snippet(entry, query)) + '</p></div></li>';
}
export async function onRequestGet({ env, request }) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('q') || '').trim().slice(0, 120);
  const group = Object.hasOwn(GROUPS, params.get('type')) ? params.get('type') : 'all';
  let results = [], unavailable = false;
  if (normalize(query)) {
    try {
      const [contentResponse, store] = await Promise.all([readContent({ env }), readPosts(env)]);
      if (!contentResponse.ok) throw new Error('content_unavailable');
      const { content } = await contentResponse.json();
      results = findResults((await portfolioEntries(env, request, content)).concat(articleEntries(store)), query, group);
    } catch (_) { unavailable = true; }
  }
  const pages = Math.max(1, Math.ceil(results.length / 10));
  const page = Math.min(pages, Math.max(1, parseInt(params.get('page'), 10) || 1));
  const url = (type, number = 1) => '/search?' + new URLSearchParams({ q: query, type, ...(number > 1 ? { page: String(number) } : {}) });
  const filters = '<nav class="insight-series-chips" aria-label="Filter search results">' + Object.entries(GROUPS).map(([key, label]) => '<a class="insight-chip' + (key === group ? ' is-selected' : '') + '" href="' + escapeHTML(url(key)) + '"' + (key === group ? ' aria-current="true"' : '') + '>' + label + '</a>').join('') + '</nav>';
  const status = unavailable ? 'Search is temporarily unavailable. Please try again shortly.' : query ? results.length + (results.length === 1 ? ' result' : ' results') + ' for “' + escapeHTML(query) + '”' : 'Find a project, a perspective, or a few words that stayed with you.';
  const body = '<section class="site-section"><div class="site-container search-page"><p class="eyebrow">Explore the work</p><h1 class="heading page-heading">Search</h1><p class="hero-lead">Projects, articles, lectures, and the words behind them.</p>' +
    '<form class="site-search-form" action="/search" method="get" role="search"><label for="site-search-q">Search Jimmy Park’s website</label><div class="site-search-controls"><input id="site-search-q" type="search" name="q" value="' + escapeHTML(query) + '" maxlength="120" placeholder="Try Samsung, collaboration, or editing"><button class="btn btn-primary site-button" type="submit">Search<span class="msym" aria-hidden="true">search</span></button></div></form>' +
    filters + '<p class="search-status" role="status">' + status + '</p>' +
    (results.length ? '<ul class="search-results">' + results.slice((page - 1) * 10, page * 10).map(entry => resultCard(entry, query)).join('') + '</ul>' : !unavailable && query ? '<p class="body-copy">Try a project name, a shorter phrase, or a related English keyword. Selected Korean project names and role keywords work too.</p>' : '') +
    (pages > 1 ? '<nav class="insight-pagination" aria-label="Search result pages">' + (page > 1 ? '<a class="insight-chip" href="' + escapeHTML(url(group, page - 1)) + '">Previous</a>' : '') + '<span>Page ' + page + ' of ' + pages + '</span>' + (page < pages ? '<a class="insight-chip" href="' + escapeHTML(url(group, page + 1)) + '">Next</a>' : '') + '</nav>' : '') +
    '<p class="contact-note">Upcoming articles are searchable by their public title and summary only. Unpublished text and drafts stay private.</p></div></section>';
  const values = { TITLE: 'Search | Jimmy Park', DESC: 'Search Jimmy Park’s projects, articles, lectures and website copy.', URL: 'https://jimmypark.net/search', TYPE: 'website', IMAGE: 'https://jimmypark.net/assets/img/og/home.png?v=0.22.1', IMAGE_ALT: 'Jimmy Park', ROBOTS: '<meta name="robots" content="noindex,follow">', CONTENT: body };
  const html = INSIGHTS_SHELL.replace('data-page="insights"', 'data-page="search"').replace(/__(TITLE|DESC|URL|TYPE|IMAGE|IMAGE_ALT|ROBOTS|CONTENT)__/g, (_, key) => values[key]);
  return new Response(html, { status: unavailable ? 503 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
