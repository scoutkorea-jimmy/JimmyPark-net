import { readPosts, publishedPosts } from '../api/_posts.js';

// RSS 2.0 for published articles: title, link, summary and date only.
// Drafts and future-dated articles never appear; bodies stay on the site.
const SITE_ORIGIN = 'https://jimmypark.net';
const LIMIT = 30;

function xml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}
function published(post) {
  return new Date(post.date + 'T09:00:00+09:00');
}

export async function onRequestGet({ env }) {
  let posts;
  try { posts = publishedPosts(await readPosts(env)); } catch (_) {
    return new Response('Feed temporarily unavailable.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '60' } });
  }
  const items = posts.slice(0, LIMIT).map(post => {
    const link = SITE_ORIGIN + '/insights/' + encodeURIComponent(post.slug);
    return '<item><title>' + xml(post.title) + '</title><link>' + link + '</link><guid isPermaLink="true">' + link + '</guid>' +
      '<pubDate>' + published(post).toUTCString() + '</pubDate>' +
      (post.category ? '<category>' + xml(post.category) + '</category>' : '') +
      '<description>' + xml(post.summary || post.body.slice(0, 180)) + '</description></item>';
  }).join('\n');
  const updated = posts.length ? '<lastBuildDate>' + published(posts[0]).toUTCString() + '</lastBuildDate>' : '';
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    '<title>Jimmy Park — Articles</title><link>' + SITE_ORIGIN + '/insights</link>' +
    '<description>Practical articles on media, web development, applied AI, and Scouting communication.</description>' +
    '<language>en</language><atom:link href="' + SITE_ORIGIN + '/insights/feed.xml" rel="self" type="application/rss+xml"/>' + updated + '\n' +
    items + '\n</channel></rss>\n';
  return new Response(body, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
