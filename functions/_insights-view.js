import { readPosts, publishedPosts } from './api/_posts.js';
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
};

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
function todayKST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
}
function seriesChips(posts, selected) {
  const names = [...new Set(posts.map(post => seriesInfo(post)?.name).filter(Boolean))];
  return '<nav class="insight-series-chips" aria-label="Filter articles by series">' +
    '<a class="insight-chip' + (!selected ? ' is-selected' : '') + '" href="/insights">All articles</a>' +
    names.map(name => '<a class="insight-chip' + (selected === name ? ' is-selected' : '') + '" href="/insights?series=' + encodeURIComponent(name) + '">' + escapeHTML(name) + '</a>').join('') +
    '</nav>';
}
function requestedSeries(request) {
  const raw = request && request.url ? request.url.split('?')[1] || '' : '';
  const match = raw.split('&').find(pair => pair.startsWith('series='));
  return match ? decodeURIComponent(match.slice(7).replace(/\+/g, ' ')) : '';
}
export async function renderInsights({ env, request }, slug) {
  let store;
  try { store = await readPosts(env); } catch (_) {
    const values = { TITLE: 'Articles temporarily unavailable | Jimmy Park', DESC: 'Please try again shortly.', URL: 'https://jimmypark.net/insights', TYPE: 'website', ROBOTS: '<meta name="robots" content="noindex">', CONTENT: '<section class="site-section"><div class="site-container"><h1 class="heading page-heading">Articles will be back shortly.</h1><p class="body-copy">The writing could not be loaded. Please try again in a moment.</p><a class="card-link" href="/">Return home</a></div></section>' };
    return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' } });
  }
  const livePosts = publishedPosts(store);
  const visiblePosts = store.posts.filter(p => p.status === 'published' && p.date >= todayKST())
    .sort((a, b) => a.date.localeCompare(b.date) || (a.updatedAt || 0) - (b.updatedAt || 0));
  const posts = livePosts.concat(visiblePosts.filter(p => !livePosts.some(live => live.id === p.id)));
  const seriesFilter = requestedSeries(request);
  const post = slug ? posts.find(p => p.slug === slug) : null;
  const scheduled = !!post && post.date > todayKST();
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
    content = '<article class="site-section"><div class="site-container insight-reading-layout insight-reading-layout--scheduled"><div class="insight-reading"><a class="card-link" href="/insights">All Articles</a><div class="insight-meta"><span class="eyebrow">' + e(seriesLabel) + '</span><time datetime="' + e(post.date + 'T09:00:00+09:00') + '">' + e(displayDate(post)) + '</time></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (info ? seriesChips(posts, info.name) : '') + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + '<div class="insight-scheduled"><p class="eyebrow">Scheduled article</p><h2>This article will be published on ' + e(displayDate(post)) + '.</h2><p>The full text will be available here when the article goes live.</p></div></div></div></article>';
  } else if (post) {
    const part = seriesPart(post);
    const info = seriesInfo(post);
    const seriesLabel = info ? info.name + ' · Part ' + part + ' of 4' : e(post.category || 'Notes');
    content = '<article class="site-section"><div class="site-container insight-reading-layout">' + articleToc(post.body) + '<div class="insight-reading"><a class="card-link" href="/insights">All Articles</a><div class="insight-meta"><span class="eyebrow">' + e(seriesLabel) + '</span><time datetime="' + e(post.date + 'T09:00:00+09:00') + '">' + e(displayDate(post)) + '</time><a class="lnk" rel="author" href="/#snapshot">By Jimmy Park</a></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (info ? seriesChips(posts, info.name) : '') + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + '<div class="insight-body">' + articleBody(post.body) + '</div>' + (post.hashtags ? '<div class="insight-tags" aria-label="Tags">' + hashtags(post.hashtags) + '</div>' : '') + '<aside class="insight-cta"><p class="eyebrow">Keep the conversation going</p><h2>What do you think?</h2><p>Share your perspective, questions, or a different experience of media and video.</p><a class="btn btn-primary site-button" href="/contact?subject=Message%20in%20Motion%20article">Share your thoughts<span class="msym" aria-hidden="true">arrow_forward</span></a></aside></div></div></article>';
  } else {
    const ordered = posts.slice().sort((a, b) => {
      const ai = seriesInfo(a), bi = seriesInfo(b);
      if (ai && bi && ai.name === bi.name) return ai.part - bi.part;
      return b.date.localeCompare(a.date) || (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    const list = (seriesFilter ? ordered.filter(post => seriesInfo(post)?.name === seriesFilter) : ordered).map(p => {
      const part = seriesPart(p);
      const info = seriesInfo(p);
      const label = info ? info.name + ' · Part ' + part + ' of 4' : (p.category || 'Notes');
      return '<article class="insight-list-item"><div class="insight-list-meta"><span class="eyebrow">' + e(label) + '</span><time datetime="' + e(p.date + 'T09:00:00+09:00') + '">' + e(displayDate(p)) + '</time></div><div class="insight-list-content"><h2><a class="lnk" href="/insights/' + e(p.slug) + '">' + e(p.title) + '</a></h2><p>' + e(p.summary || p.body.slice(0, 180)) + '</p><a class="card-link" href="/insights/' + e(p.slug) + '" aria-label="' + e('Read ' + p.title) + '">Read ' + (info ? 'Part ' + part : 'article') + '<span class="msym" aria-hidden="true">arrow_forward</span></a></div></article>';
    }).join('');
     content = '<section class="site-section"><div class="site-container insight-index"><p class="eyebrow">Notes from practice</p><h1 class="heading page-heading">Articles</h1><p class="hero-lead">Practical articles on media, web development, applied AI, and Scouting communication.</p>' + seriesChips(posts, seriesFilter) + (list ? '<div class="insights-list">' + list + '</div>' : '<p class="insights-empty">' + (seriesFilter ? 'No articles in this series yet.' : 'New writing will appear here.') + '</p>') + '</div></section>';
  }
  if (post && !scheduled) {
    const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', mainEntityOfPage: url, headline: post.title, description: desc, datePublished: post.date + 'T09:00:00+09:00', dateModified: new Date(post.updatedAt).toISOString(), author: { '@type': 'Person', '@id': 'https://jimmypark.net/#person', name: 'Jimmy Park', url: 'https://jimmypark.net/#snapshot' } };
    content += '<script type="application/ld+json">' + JSON.stringify(structured).replace(/</g, '\\u003c') + '</script>';
  }
  const values = { TITLE: e(title), DESC: e(desc), URL: e(url), TYPE: post ? 'article' : 'website', ROBOTS: missing ? '<meta name="robots" content="noindex">' : '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: missing ? 404 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
