import { readPosts, publishedPosts, publicationTime } from './api/_posts.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';

export function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function articleBody(value) {
  let sectionIndex = 0;
  let subsectionIndex = 0;
  return value.split(/\n\s*\n/).filter(p => p.trim()).map(paragraph => {
    if (/^### /u.test(paragraph)) {
      subsectionIndex += 1;
      return '<h3 id="section-' + sectionIndex + '-' + subsectionIndex + '">' + escapeHTML(paragraph.slice(4)) + '</h3>';
    }
    if (/^## /u.test(paragraph)) {
      sectionIndex += 1;
      subsectionIndex = 0;
      return '<h2 id="section-' + sectionIndex + '">' + escapeHTML(paragraph.slice(3)) + '</h2>';
    }
    return '<p>' + escapeHTML(paragraph) + '</p>';
  }).join('\n');
}
function hashtags(value) {
  return String(value || '').trim().split(/\s+/u).filter(Boolean).map(tag => '<span class="tag">' + escapeHTML(tag) + '</span>').join('');
}

function articleToc(value) {
  let sectionIndex = 0;
  let subsectionIndex = 0;
  let items = '';
  let subitems = '';
  function closeSection() {
    if (!items) return;
    items += (subitems ? '<ol class="insight-toc-sublist">' + subitems + '</ol>' : '') + '</li>';
    subitems = '';
  }
  for (const paragraph of value.split(/\n\s*\n/).filter(p => p.trim())) {
    if (/^## /u.test(paragraph)) {
      closeSection();
      sectionIndex += 1;
      subsectionIndex = 0;
      items += '<li><a href="#section-' + sectionIndex + '">' + escapeHTML(paragraph.slice(3)) + '</a>';
    } else if (/^### /u.test(paragraph) && items) {
      subsectionIndex += 1;
      subitems += '<li><a href="#section-' + sectionIndex + '-' + subsectionIndex + '">' + escapeHTML(paragraph.slice(4)) + '</a></li>';
    }
  }
  closeSection();
  return items ? '<aside class="insight-toc" aria-label="On this page"><p class="eyebrow">On this page</p><nav><ol>' + items + '</ol></nav></aside>' : '';
}

const SERIES = {
  'ai-is-a-genie-that-only-hears-what-you-say': { name: 'AX Series', part: 1 },
  'how-to-divide-work-between-humans-and-ai': { name: 'AX Series', part: 2 },
  'if-you-send-it-you-own-it': { name: 'AX Series', part: 3 },
  'true-ax-is-not-a-collection-of-ai-tools': { name: 'AX Series', part: 4 },
  'from-speech-to-video': { name: 'Message in Motion', part: 1 },
  'from-long-form-to-short-form': { name: 'Message in Motion', part: 2 },
  'the-cost-of-making-meaning': { name: 'Message in Motion', part: 3 },
  'media-before-message-humans-before-media': { name: 'Message in Motion', part: 4 },
  'expertise-should-not-make-people-feel-small': { name: 'The Work Behind the Work', part: 1 },
  'delivery-is-a-date-not-the-end': { name: 'The Work Behind the Work', part: 2 },
  'when-experts-are-everywhere-we-need-connection': { name: 'The Work Behind the Work', part: 3 },
  'if-people-cannot-understand-it-little-remains': { name: 'The Work Behind the Work', part: 4 },
};
const PAGE_SIZE = 5;
const DEFAULT_IMAGE = 'https://jimmypark.net/assets/img/og/articles.png?v=0.22.1';

function articleImage(post) {
  const value = String(post?.image || '').trim();
  if (/^\/assets\/img\/[A-Za-z0-9._/-]+$/u.test(value)) return 'https://jimmypark.net' + value + (value.startsWith('/assets/img/og/') ? '?v=0.22.1' : '');
  if (/^https:\/\/[^\s]+$/u.test(value)) return value;
  return DEFAULT_IMAGE;
}
function articleImageAlt(post) {
  return String(post?.imageAlt || post?.title || 'Jimmy Park Articles').trim();
}
function articleCover(post) {
  if (!post?.image) return '';
  return '<figure class="insight-cover"><img src="' + escapeHTML(articleImage(post)) + '" alt="' + escapeHTML(articleImageAlt(post)) + '" width="1200" height="630" decoding="async" fetchpriority="high"></figure>';
}
function shareLinks(url, title) {
  const encodedURL = encodeURIComponent(url);
  return '<nav class="insight-share" aria-label="Share this article"><span class="insight-control-label">Share this article</span>' +
    '<a class="btn btn-secondary site-button" href="https://www.facebook.com/sharer/sharer.php?u=' + encodedURL + '" target="_blank" rel="noopener noreferrer" aria-label="Share ' + escapeHTML(title) + ' on Facebook">Facebook<span class="msym" aria-hidden="true">open_in_new</span></a>' +
    '<a class="btn btn-secondary site-button" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodedURL + '" target="_blank" rel="noopener noreferrer" aria-label="Share ' + escapeHTML(title) + ' on LinkedIn">LinkedIn<span class="msym" aria-hidden="true">open_in_new</span></a></nav>';
}

function seriesPart(post) {
  return SERIES[post.slug] ? SERIES[post.slug].part : 0;
}
function seriesInfo(post) {
  return SERIES[post.slug] || null;
}

function displayDate(post) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', year: 'numeric' })
    .format(new Date(post.date + 'T09:00:00+09:00')) + ' at 9:00 AM';
}
function isScheduled(post) {
  return publicationTime(post) > Date.now();
}
function seriesChips(posts, selected, sort = 'desc') {
  const names = [...new Set(posts.map(post => seriesInfo(post)?.name).filter(Boolean))];
  return '<nav class="insight-series-chips" aria-label="Filter articles by series">' +
    '<a class="insight-chip' + (!selected ? ' is-selected' : '') + '" href="' + escapeHTML(articleURL({ sort })) + '">All articles</a>' +
    names.map(name => '<a class="insight-chip' + (selected === name ? ' is-selected' : '') + '" href="' + escapeHTML(articleURL({ series: name, sort })) + '">' + escapeHTML(name) + '</a>').join('') +
    '</nav>';
}
function requestedParam(request, name) {
  if (!request || !request.url) return '';
  try { return new URL(request.url).searchParams.get(name) || ''; } catch (_) { return ''; }
}
function requestedSeries(request) {
  return requestedParam(request, 'series');
}
function requestedSort(request) {
  return requestedParam(request, 'sort') === 'asc' ? 'asc' : 'desc';
}
function requestedPage(request, name) {
  const value = Number.parseInt(requestedParam(request, name), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}
function articleURL({ series, sort, page, upcomingPage }) {
  const pairs = [];
  if (series) pairs.push('series=' + encodeURIComponent(series));
  if (sort === 'asc') pairs.push('sort=asc');
  if (page && page > 1) pairs.push('page=' + page);
  if (upcomingPage && upcomingPage > 1) pairs.push('upcomingPage=' + upcomingPage);
  const query = pairs.join('&');
  return '/insights' + (query ? '?' + query : '');
}
function articleControls(posts, { series, sort }) {
  return '<div class="insight-controls">' +
    seriesChips(posts, series, sort) +
    '<nav class="insight-sort-chips" aria-label="Sort articles">' +
      '<span class="insight-control-label">Order</span>' +
      '<a class="insight-chip' + (sort === 'desc' ? ' is-selected' : '') + '" href="' + escapeHTML(articleURL({ series, sort: 'desc' })) + '"' + (sort === 'desc' ? ' aria-current="true"' : '') + '>Newest first</a>' +
      '<a class="insight-chip' + (sort === 'asc' ? ' is-selected' : '') + '" href="' + escapeHTML(articleURL({ series, sort: 'asc' })) + '"' + (sort === 'asc' ? ' aria-current="true"' : '') + '>Oldest first</a>' +
    '</nav>' +
  '</div>';
}
function paged(items, requested) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(requested, pages);
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page, pages };
}
function pagination(label, page, pages, key, params) {
  if (pages <= 1) return '';
  const link = target => escapeHTML(articleURL({ ...params, [key]: target }));
  return '<nav class="insight-pagination" aria-label="' + escapeHTML(label) + '">' +
    (page > 1 ? '<a class="insight-chip" href="' + link(page - 1) + '">Previous</a>' : '<span class="insight-chip is-disabled" aria-disabled="true">Previous</span>') +
    '<span class="insight-page-status">Page ' + page + ' of ' + pages + '</span>' +
    (page < pages ? '<a class="insight-chip" href="' + link(page + 1) + '">Next</a>' : '<span class="insight-chip is-disabled" aria-disabled="true">Next</span>') +
  '</nav>';
}
function postList(items, scheduled = false) {
  return items.map(p => {
    const part = seriesPart(p);
    const info = seriesInfo(p);
    const label = info ? info.name + ' · Part ' + part + ' of 4' : (p.category || 'Notes');
    const action = scheduled ? 'View schedule' : (info ? 'Read Part ' + part : 'Read article');
    return '<article class="insight-list-item"><div class="insight-list-meta"><span class="eyebrow">' + escapeHTML(label) + '</span><time datetime="' + escapeHTML(p.date + 'T09:00:00+09:00') + '">' + escapeHTML(displayDate(p)) + '</time></div><div class="insight-list-content"><h2><a class="lnk" href="/insights/' + escapeHTML(p.slug) + '">' + escapeHTML(p.title) + '</a></h2><p>' + escapeHTML(p.summary || p.body.slice(0, 180)) + '</p><a class="card-link" href="/insights/' + escapeHTML(p.slug) + '" aria-label="' + escapeHTML(action + ': ' + p.title) + '">' + action + '<span class="msym" aria-hidden="true">arrow_forward</span></a></div></article>';
  }).join('');
}
export async function renderInsights({ env, request }, slug) {
  let store;
  try { store = await readPosts(env); } catch (_) {
    const values = { TITLE: 'Articles temporarily unavailable | Jimmy Park', DESC: 'Please try again shortly.', URL: 'https://jimmypark.net/insights', TYPE: 'website', IMAGE: DEFAULT_IMAGE, IMAGE_ALT: 'Jimmy Park Articles — notes from practice', ROBOTS: '<meta name="robots" content="noindex">', CONTENT: '<section class="site-section"><div class="site-container"><h1 class="heading page-heading">Articles will be back shortly.</h1><p class="body-copy">The writing could not be loaded. Please try again in a moment.</p><a class="card-link" href="/">Return home</a></div></section>' };
    return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|IMAGE|IMAGE_ALT|ROBOTS|CONTENT)__/g, (_, key) => values[key]), { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' } });
  }
  const livePosts = publishedPosts(store);
  const upcomingPosts = store.posts.filter(p => p.status === 'published' && isScheduled(p))
    .sort((a, b) => publicationTime(a) - publicationTime(b) || (a.updatedAt || 0) - (b.updatedAt || 0));
  const posts = livePosts.concat(upcomingPosts);
  const seriesFilter = requestedSeries(request);
  const sort = requestedSort(request);
  const post = slug ? posts.find(p => p.slug === slug) : null;
  const scheduled = !!post && isScheduled(post);
  const missing = !!slug && !post;
  const title = post ? post.title + ' | Jimmy Park' : missing ? 'Article not found | Jimmy Park' : 'Articles | Jimmy Park';
  const desc = post ? post.summary || post.body.slice(0, 160) : 'Practical articles on media, web development, applied AI, and Scouting communication.';
  const url = 'https://jimmypark.net/insights' + (post ? '/' + post.slug : '');
  const e = escapeHTML;
  let content;
  if (missing) {
    content = '<section class="site-section"><div class="site-container"><p class="eyebrow">404</p><h1 class="heading page-heading">This article isn’t available.</h1><a class="card-link" href="/insights">Back to Articles</a></div></section>';
  } else if (post && scheduled) {
    const part = seriesPart(post);
    const info = seriesInfo(post);
    const seriesLabel = info ? info.name + ' · Part ' + part + ' of 4' : e(post.category || 'Notes');
    content = '<article class="site-section"><div class="site-container insight-reading-layout insight-reading-layout--scheduled"><div class="insight-reading"><a class="card-link" href="/insights">All Articles</a><div class="insight-meta"><span class="eyebrow">' + e(seriesLabel) + '</span><time datetime="' + e(post.date + 'T09:00:00+09:00') + '">' + e(displayDate(post)) + '</time></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (info ? seriesChips(posts, info.name) : '') + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + articleCover(post) + '<div class="insight-scheduled"><p class="eyebrow">Scheduled article</p><h2>This article will be published on ' + e(displayDate(post)) + '.</h2><p>The full text will be available here when the article goes live.</p></div></div></div></article>';
  } else if (post) {
    const part = seriesPart(post);
    const info = seriesInfo(post);
    const seriesLabel = info ? info.name + ' · Part ' + part + ' of 4' : e(post.category || 'Notes');
    content = '<article class="site-section"><div class="site-container insight-reading-layout">' + articleToc(post.body) + '<div class="insight-reading"><a class="card-link" href="/insights">All Articles</a><div class="insight-meta"><span class="eyebrow">' + e(seriesLabel) + '</span><time datetime="' + e(post.date + 'T09:00:00+09:00') + '">' + e(displayDate(post)) + '</time><a class="lnk" rel="author" href="/#snapshot">By Jimmy Park</a></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (info ? seriesChips(posts, info.name) : '') + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + articleCover(post) + '<div class="insight-body">' + articleBody(post.body) + '</div>' + (post.hashtags ? '<div class="insight-tags" aria-label="Tags">' + hashtags(post.hashtags) + '</div>' : '') + shareLinks(url, post.title) + '<aside class="insight-cta"><p class="eyebrow">Keep the conversation going</p><h2>What do you think?</h2><p>Share your perspective, questions, or a different experience of media and video.</p><a class="btn btn-primary site-button" href="/contact?subject=Article%20response">Share your thoughts<span class="msym" aria-hidden="true">arrow_forward</span></a></aside></div></div></article>';
  } else {
    const matchesSeries = p => !seriesFilter || seriesInfo(p)?.name === seriesFilter;
    const orderedLive = livePosts.filter(matchesSeries).sort((a, b) => {
      const order = publicationTime(a) - publicationTime(b) || (a.updatedAt || 0) - (b.updatedAt || 0);
      return sort === 'asc' ? order : -order;
    });
    const orderedUpcoming = upcomingPosts.filter(matchesSeries);
    const livePage = paged(orderedLive, requestedPage(request, 'page'));
    const upcomingPage = paged(orderedUpcoming, requestedPage(request, 'upcomingPage'));
    const pageParams = { series: seriesFilter, sort, upcomingPage: upcomingPage.page };
    const upcomingParams = { series: seriesFilter, sort, page: livePage.page };
    const publishedBlock = orderedLive.length
      ? '<section class="insight-collection" aria-labelledby="published-articles"><h2 id="published-articles" class="insight-collection-title">Published Articles</h2><div class="insights-list">' + postList(livePage.items) + '</div>' + pagination('Published article pages', livePage.page, livePage.pages, 'page', pageParams) + '</section>'
      : '<p class="insights-empty">' + (seriesFilter ? 'No published articles in this series yet.' : 'New writing will appear here.') + '</p>';
    const upcomingBlock = orderedUpcoming.length
      ? '<section class="insight-collection insight-collection--upcoming" aria-labelledby="upcoming-articles"><p class="eyebrow">Scheduled writing</p><h2 id="upcoming-articles" class="insight-collection-title">Upcoming Articles</h2><p class="insight-collection-intro">Titles and summaries are available now. Full articles open at 9:00 AM KST on the date shown.</p><div class="insights-list">' + postList(upcomingPage.items, true) + '</div>' + pagination('Upcoming article pages', upcomingPage.page, upcomingPage.pages, 'upcomingPage', upcomingParams) + '</section>'
      : '';
    content = '<section class="site-section"><div class="site-container insight-index"><p class="eyebrow">Notes from practice</p><h1 class="heading page-heading">Articles</h1><p class="hero-lead">Practical articles on media, web development, applied AI, and Scouting communication.</p>' + articleControls(posts, { series: seriesFilter, sort }) + publishedBlock + upcomingBlock + '</div></section>';
  }
  if (post && !scheduled) {
    const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', mainEntityOfPage: url, headline: post.title, description: desc, datePublished: post.date + 'T09:00:00+09:00', dateModified: new Date(post.updatedAt).toISOString(), author: { '@type': 'Person', '@id': 'https://jimmypark.net/#person', name: 'Jimmy Park', url: 'https://jimmypark.net/#snapshot' } };
    if (post.image) structured.image = [articleImage(post)];
    content += '<script type="application/ld+json">' + JSON.stringify(structured).replace(/</g, '\\u003c') + '</script>';
  }
  const values = { TITLE: e(title), DESC: e(desc), URL: e(url), TYPE: post ? 'article' : 'website', IMAGE: e(articleImage(post)), IMAGE_ALT: e(articleImageAlt(post)), ROBOTS: missing ? '<meta name="robots" content="noindex">' : '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|IMAGE|IMAGE_ALT|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: missing ? 404 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
