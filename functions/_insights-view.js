import { readPosts, publishedPosts } from './api/_posts.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';

export function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function articleBody(value) {
  return value.split(/\n\s*\n/).filter(p => p.trim()).map(paragraph => {
    if (/^## /u.test(paragraph)) return '<h2>' + escapeHTML(paragraph.slice(3)) + '</h2>';
    return '<p>' + escapeHTML(paragraph) + '</p>';
  }).join('\n');
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
    content = '<article class="site-section"><div class="site-container insight-reading"><a class="card-link" href="/insights">All Insights</a><div class="insight-meta"><span class="eyebrow">' + e(post.category || 'Notes') + '</span><time datetime="' + e(post.date) + '">' + e(post.date) + '</time><a class="lnk" rel="author" href="/#snapshot">By Jimmy Park</a></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + '<div class="insight-body">' + articleBody(post.body) + '</div></div></article>';
  } else {
    const cards = posts.map(p => '<article class="card insight-card"><div class="insight-meta"><span class="eyebrow">' + e(p.category || 'Notes') + '</span><time datetime="' + e(p.date) + '">' + e(p.date) + '</time></div><h2><a class="lnk" href="/insights/' + e(p.slug) + '">' + e(p.title) + '</a></h2><p>' + e(p.summary || p.body.slice(0, 180)) + '</p><a class="card-link" href="/insights/' + e(p.slug) + '" aria-label="' + e('Read ' + p.title) + '">Read article<span class="msym" aria-hidden="true">arrow_forward</span></a></article>').join('');
    content = '<section class="site-section"><div class="site-container"><p class="eyebrow">Notes from practice</p><h1 class="heading page-heading">Insights</h1><p class="hero-lead">Notes by Jimmy Park on content strategy, video production, applied AI and international Scouting.</p>' + (cards ? '<div class="collection-grid insights-grid">' + cards + '</div>' : '<p class="insights-empty">New writing will appear here.</p>') + '</div></section>';
  }
  if (post) {
    const structured = { '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': url + '#article', mainEntityOfPage: url, headline: post.title, description: desc, datePublished: post.date, dateModified: new Date(post.updatedAt).toISOString(), author: { '@type': 'Person', '@id': 'https://jimmypark.net/#person', name: 'Jimmy Park', url: 'https://jimmypark.net/#snapshot' } };
    content += '<script type="application/ld+json">' + JSON.stringify(structured).replace(/</g, '\\u003c') + '</script>';
  }
  const values = { TITLE: e(title), DESC: e(desc), URL: e(url), TYPE: post ? 'article' : 'website', ROBOTS: missing ? '<meta name="robots" content="noindex">' : '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: missing ? 404 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
