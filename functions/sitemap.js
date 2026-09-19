import { readPosts, publishedPosts } from './api/_posts.js';
import { INSIGHTS_SHELL } from './_insights-shell.js';

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export async function onRequestGet({ env }) {
  let posts = [];
  try { posts = publishedPosts(await readPosts(env)); } catch (_) { /* Stable portfolio links remain useful without article storage. */ }
  const portfolio = [
    ['Home', '/', 'An overview of video, web development, applied AI, and global Scouting work.'],
    ['Media Work', '/work', 'Video production and field photography with credited roles.'],
    ['Dev Work', '/dev', 'Websites, practical tools, and AI-supported workflows.'],
    ['Lectures & Workshops', '/lecture', 'Teaching and workshop formats for media, AI, and Scouting communication.'],
    ['Global & Scouting', '/scouting', 'International Scouting roles, communication work, and collaboration.'],
    ['Contact', '/contact', 'A direct way to share a project brief or role enquiry.'],
    ['Articles', '/insights', 'Practical articles on media, web development, applied AI, and Scouting communication.'],
  ].map(([label, href, description]) => '<li><a class="lnk" href="' + href + '">' + label + '</a><p>' + description + '</p></li>').join('');
  const articleItems = posts.map(post => '<li><a class="lnk" href="/insights/' + encodeURIComponent(post.slug) + '">' + escapeHTML(post.title) + '</a><p>' + escapeHTML(post.summary) + '</p></li>').join('');
  const content = '<section class="site-section"><div class="site-container sitemap-page"><p class="eyebrow">Site guide</p><h1 class="heading page-heading">Site map</h1><p class="hero-lead">A guide to Jimmy Park’s portfolio and published articles.</p><section><h2 class="heading section-title">Portfolio</h2><ul class="sitemap-list">' + portfolio + '</ul></section>' + (articleItems ? '<section><h2 class="heading section-title">Articles</h2><ul class="sitemap-list">' + articleItems + '</ul></section>' : '') + '</div></section>';
  const values = { TITLE: 'Site Map | Jimmy Park', DESC: 'A guide to Jimmy Park’s portfolio and published articles.', URL: 'https://jimmypark.net/sitemap', TYPE: 'website', ROBOTS: '', CONTENT: content };
  return new Response(INSIGHTS_SHELL.replace(/__(TITLE|DESC|URL|TYPE|ROBOTS|CONTENT)__/g, (_, key) => values[key]), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
