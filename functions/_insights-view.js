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
  const posts = publishedPosts(await readPosts(env));
  const post = slug ? posts.find(p => p.slug === slug) : null;
  const missing = !!slug && !post;
  const title = post ? post.title + ' | Jimmy Park' : missing ? 'Article not found | Jimmy Park' : 'Insights | Jimmy Park';
  const desc = post ? post.summary || post.body.slice(0, 160) : 'Notes on content, AI, and working across cultures.';
  const url = 'https://jimmypark.net/insights' + (post ? '/' + post.slug : '');
  const e = escapeHTML;
  let content;
  if (missing) {
    content = '<section class="site-section"><div class="site-container"><p class="eyebrow">404</p><h1 class="heading page-heading">This article isn’t available.</h1><a class="card-link" href="/insights">Back to Insights</a></div></section>';
  } else if (post) {
    content = '<article class="site-section"><div class="site-container insight-reading"><a class="card-link" href="/insights">All Insights</a><div class="insight-meta"><span class="eyebrow">' + e(post.category || 'Notes') + '</span><time datetime="' + e(post.date) + '">' + e(post.date) + '</time></div><h1 class="heading page-heading">' + e(post.title) + '</h1>' + (post.summary ? '<p class="hero-lead">' + e(post.summary) + '</p>' : '') + '<div class="insight-body">' + articleBody(post.body) + '</div></div></article>';
  } else {
    const cards = posts.map(p => '<article class="card insight-card"><div class="insight-meta"><span class="eyebrow">' + e(p.category || 'Notes') + '</span><time datetime="' + e(p.date) + '">' + e(p.date) + '</time></div><h2><a class="lnk" href="/insights/' + e(p.slug) + '">' + e(p.title) + '</a></h2><p>' + e(p.summary || p.body.slice(0, 180)) + '</p><a class="card-link" href="/insights/' + e(p.slug) + '" aria-label="' + e('Read ' + p.title) + '">Read article<span class="msym" aria-hidden="true">arrow_forward</span></a></article>').join('');
    content = '<section class="site-section"><div class="site-container"><p class="eyebrow">Notes from practice</p><h1 class="heading page-heading">Insights</h1><p class="hero-lead">Notes on content, AI, and working across cultures.</p>' + (cards ? '<div class="collection-grid insights-grid">' + cards + '</div>' : '<p class="insights-empty">New writing will appear here.</p>') + '</div></section>';
  }
  const values = { TITLE: e(title), DESC: e(desc), URL: e(url), TYPE: post ? 'article' : 'website', ROBOTS: missing ? '<meta name="robots" content="noindex">' : '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), {
    status: missing ? 404 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
