import { readPosts, publishedPosts } from './api/_posts.js';

const SITE_ORIGIN = 'https://jimmypark.net';
const STATIC_PAGES = [
  { path: '/', lastmod: '2026-09-20' },
  { path: '/work', lastmod: '2026-09-20' },
  { path: '/dev', lastmod: '2026-09-20' },
  { path: '/lecture', lastmod: '2026-09-20' },
  { path: '/scouting', lastmod: '2026-09-20' },
  { path: '/contact', lastmod: '2026-09-20' },
  { path: '/insights', lastmod: '2026-09-20' },
  { path: '/sitemap', lastmod: '2026-09-20' },
];

function urlEntry(path, lastmod) {
  return '<url><loc>' + SITE_ORIGIN + path + '</loc><lastmod>' + lastmod + '</lastmod></url>';
}

export async function onRequestGet({ env }) {
  let articles;
  try { articles = publishedPosts(await readPosts(env)); } catch (_) { articles = []; }
  const urls = STATIC_PAGES.map(page => urlEntry(page.path, page.lastmod));
  articles.forEach(post => {
    const lastmod = new Date(post.updatedAt).toISOString().slice(0, 10);
    urls.push(urlEntry('/insights/' + encodeURIComponent(post.slug), lastmod));
  });
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n', {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
  });
}
