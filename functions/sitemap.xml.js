import { readPosts, publishedPosts } from './api/_posts.js';

const SITE_ORIGIN = 'https://jimmypark.net';
// Date of the last release that changed the public pages. Update it with every
// release that touches page markup or copy; the Articles index also moves forward
// whenever a newer article goes live.
const SITE_UPDATED = '2026-11-12';
const STATIC_PATHS = ['/', '/work', '/dev', '/lecture', '/scouting', '/contact', '/insights', '/sitemap'];

function urlEntry(path, lastmod) {
  return '<url><loc>' + SITE_ORIGIN + path + '</loc><lastmod>' + lastmod + '</lastmod></url>';
}

export async function onRequestGet({ env }) {
  let articles;
  try { articles = publishedPosts(await readPosts(env)); } catch (_) { articles = []; }
  const newestArticle = articles.length ? articles[0].date : '';
  const urls = STATIC_PATHS.map(path => urlEntry(path, (path === '/insights' || path === '/sitemap') && newestArticle > SITE_UPDATED ? newestArticle : SITE_UPDATED));
  articles.forEach(post => {
    const lastmod = new Date(post.updatedAt).toISOString().slice(0, 10);
    urls.push(urlEntry('/insights/' + encodeURIComponent(post.slug), lastmod));
  });
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n', {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
