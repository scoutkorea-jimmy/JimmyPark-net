import { json, isAdmin } from './_lib.js';

export const POSTS_KEY = 'insights:v1';
export async function readPosts(env) {
  const saved = await env.JP_KV.get(POSTS_KEY, 'json');
  if (saved === null || saved === undefined) return { revision: '', posts: [] };
  if (typeof saved.revision !== 'string' || !Array.isArray(saved.posts)) throw new Error('invalid_post_store');
  return saved;
}
export function publishedPosts(store) {
  return store.posts.filter(p => p.status === 'published')
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
}
export async function managePosts({ request, env }) {
  if (!(await isAdmin(request, env))) return json({ ok: false, error: 'unauthorized' }, 401);
  let store;
  try { store = await readPosts(env); } catch (_) { return json({ ok: false, error: "storage_unavailable" }, 503); }
  if (request.method === 'GET') return json({ ok: true, ...store });
  if (!['POST', 'DELETE'].includes(request.method)) return json({ ok: false, error: 'method_not_allowed' }, 405);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 220000) return json({ ok: false, error: 'post_too_large' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch (_) { return json({ ok: false, error: 'invalid_json' }, 400); }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'invalid_post' }, 400);
  if (body.revision !== store.revision) return json({ ok: false, error: 'conflict' }, 409);
  const incoming = body.post;
  if (!incoming || typeof incoming !== 'object') return json({ ok: false, error: 'invalid_post' }, 400);
  const index = store.posts.findIndex(p => p.id === incoming.id);
  if (request.method === 'DELETE') {
    if (index < 0) return json({ ok: false, error: 'not_found' }, 404);
    store.posts.splice(index, 1);
  } else {
    const limits = { title: 160, slug: 100, category: 60, summary: 500, body: 50000, date: 10 };
    const post = {};
    for (const [key, max] of Object.entries(limits)) {
      if (typeof incoming[key] !== 'string' || incoming[key].length > max) return json({ ok: false, error: 'invalid_' + key }, 400);
      post[key] = incoming[key].trim();
    }
    if (!post.title) return json({ ok: false, error: 'title_required' }, 400);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) return json({ ok: false, error: 'invalid_slug' }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date)) || new Date(post.date).toISOString().slice(0, 10) !== post.date) return json({ ok: false, error: 'invalid_date' }, 400);
    if (!['draft', 'published'].includes(incoming.status)) return json({ ok: false, error: 'invalid_status' }, 400);
    if (incoming.status === 'published' && !post.body) return json({ ok: false, error: 'body_required' }, 400);
    if (store.posts.some(p => p.slug === post.slug && p.id !== incoming.id)) return json({ ok: false, error: 'slug_taken' }, 409);
    if (index < 0 && incoming.id) return json({ ok: false, error: 'not_found' }, 404);
    if (index < 0 && store.posts.length >= 200) return json({ ok: false, error: 'post_limit' }, 400);
    post.id = index < 0 ? crypto.randomUUID() : store.posts[index].id;
    post.status = incoming.status;
    post.updatedAt = Date.now();
    if (index < 0) store.posts.push(post); else store.posts[index] = post;
  }
  store.revision = crypto.randomUUID();
  try { await env.JP_KV.put(POSTS_KEY, JSON.stringify(store)); } catch (_) { return json({ ok: false, error: "storage_unavailable" }, 503); }
  return json({ ok: true, ...store });
}
