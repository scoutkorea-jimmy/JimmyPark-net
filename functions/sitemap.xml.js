import { readPosts, publishedPosts } from './api/_posts.js';
export async function onRequestGet({ env }) {
  const paths = ['', '/work', '/scouting', '/contact', '/insights'];
  let articles;
  try { articles = publishedPosts(await readPosts(env)); } catch (_) { return new Response("Temporarily unavailable", { status: 503, headers: { "cache-control": "no-store", "retry-after": "60" } }); }
  const urls = paths.map(path => '<url><loc>https://jimmypark.net' + (path || '/') + '</loc></url>');
  articles.forEach(post => { urls.push('<url><loc>https://jimmypark.net/insights/' + encodeURIComponent(post.slug) + '</loc><lastmod>' + new Date(post.updatedAt).toISOString() + '</lastmod></url>'); });
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.join('') + '</urlset>', { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store' } });
}
