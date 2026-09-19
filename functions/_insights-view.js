import { readPosts, publishedPosts } from './api/_posts.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';

export function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function articleBody(value) {
  return value.split(/\n\s*\n/).filter(p => p.trim()).map(paragraph => {
    if (/^### /u.test(paragraph)) return '<h3>' + escapeHTML(paragraph.slice(4)) + '</h3>';
    if (/^## /u.test(paragraph)) return '<h2>' + escapeHTML(paragraph.slice(3)) + '</h2>';
    return '<p>' + escapeHTML(paragraph) + '</p>';
  }).join('\n');
}

const AX_SERIES = {
  'ai-is-a-genie-that-only-hears-what-you-say': 1,
  'how-to-divide-work-between-humans-and-ai': 2,
  'if-you-send-it-you-own-it': 3,
  'true-ax-is-not-a-collection-of-ai-tools': 4,
};

function seriesPart(post) {
  return AX_SERIES[post.slug] || 0;
}

function displayDate(post) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric', year: 'numeric' })
    .format(new Date(post.date + 'T09:00:00+09:00')) + ' at 9:00 AM';
}
export async function renderInsights({ env }, slug) {
  let posts;
  try { posts = publishedPosts(await readPosts(env)); } catch (_) {
    const values = { TITLE: 'Insights temporarily unavailable | Jimmy Park', DESC: 'Please try again shortly.', URL: 'https://jimmypark.net/insights', TYPE: 'website', ROBOTS: '<meta name="robots" content="noindex">', CONTENT: '<section class="site-section"><div class="site-container"><h1 class="heading page-heading">Insights will be back shortly.</h1><p class="body-copy">The writing could not be loaded. Please try again in a moment.</p><a class="card-link" href="/">Return home</a></div></section>' };
    return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' } });
  }
  const post = slug ? posts.find(p => p.slug === slug) : null;
  const missing = !!slug && !post;
  const title = post ? post.title + ' | Jimmy Park' : missing ? 'Article not found | Jimmy Park' : 'Insights | Jimmy Park';
  const desc = post ? post.summary || post.body.slice(0, 160) : 'Notes by Jimmy Park on content strategy, video production, applied AI and international Scouting.';
  const url = 'https://jimmypark.net/insights' + (post ? '/' + post.slug : '');
  const e = escapeHTML;
  let content;
  if (missing) {
    content = '<section class="site-section"><div class="site-container"><p class="eyebrow">404</p><h1 class="heading page-heading">This article isn’t available.</h1><a class="card-link" href="/insights">Back to Insights</a></div></section>';
  } else if (post) {
    const part = seriesPart(post);
    const seriesLabel = part ? 'AX Series · Part ' + part + ' of 4' : e(post.category || 'Notes');
    content = '<article class="site-section"><div class="site-container insight-reading"><a class="card-link" href="/insights">All Insights</a><div class="insight-meta"><span class="eyebrow">' + e(seriesLabel) + '</span><time datetime="' + e(post.date + 'T09:00:00+09:00') + '">' + e(displayDate(post)) + '</time><a class="lnk" rel="author" href="/#snapshot">By Jimmy Park</a></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + '<div class="insight-body">' + articleBody(post.body) + '</div></div></article>';
  } else {
    const ordered = posts.slice().sort((a, b) => seriesPart(a) && seriesPart(b) ? seriesPart(a) - seriesPart(b) : b.date.localeCompare(a.date));
    const list = ordered.map(p => {
      const part = seriesPart(p);
      const label = part ? 'AX Series · Part ' + part + ' of 4' : (p.category || 'Notes');
      return '<article class="insight-list-item"><div class="insight-list-meta"><span class="eyebrow">' + e(label) + '</span><time datetime="' + e(p.date + 'T09:00:00+09:00') + '">' + e(displayDate(p)) + '</time></div><div class="insight-list-content"><h2><a class="lnk" href="/insights/' + e(p.slug) + '">' + e(p.title) + '</a></h2><p>' + e(p.summary || p.body.slice(0, 180)) + '</p><a class="card-link" href="/insights/' + e(p.slug) + '" aria-label="' + e('Read ' + p.title) + '">Read Part ' + (part || '') + '<span class="msym" aria-hidden="true">arrow_forward</span></a></div></article>';
    }).join('');
    content = '<section class="site-section"><div class="site-container insight-index"><p class="eyebrow">Notes from practice</p><h1 class="heading page-heading">Insights</h1><p class="hero-lead">Notes by Jimmy Park on content strategy, video production, applied AI and international Scouting.</p>' + (list ? '<div class="insights-list">' + list + '</div>' : '<p class="insights-empty">New writing will appear here.</p>') + '</div></section>';
  }
  if (post) {
    const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', mainEntityOfPage: url, headline: post.title, description: desc, datePublished: post.date + 'T09:00:00+09:00', dateModified: new Date(post.updatedAt).toISOString(), author: { '@type': 'Person', '@id': 'https://jimmypark.net/#person', name: 'Jimmy Park', url: 'https://jimmypark.net/#snapshot' } };
    content += '<script type="application/ld+json">' + JSON.stringify(structured).replace(/</g, '\\u003c') + '</script>';
  }
  const values = { TITLE: e(title), DESC: e(desc), URL: e(url), TYPE: post ? 'article' : 'website', ROBOTS: missing ? '<meta name="robots" content="noindex">' : '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: missing ? 404 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
