// Block internal files from being served publicly. Everything else (pages,
// /api/*, static assets) passes through to the normal Pages handler.
const BLOCK = [
  /\.md$/i,
  /^\/?wrangler\.toml$/i,
  /^\/?package(-lock)?\.json$/i,
  /^\/?\.gitignore$/i,
  /^\/?\.assetsignore$/i,
  /^\/?CNAME$/i,
  /^\/?\.claude\//i,
];

export async function onRequest(context) {
  const { request, next } = context;
  const path = new URL(request.url).pathname;
  if (BLOCK.some((re) => re.test(path))) {
    return new Response("Not found", { status: 404 });
  }
  const res = await next();
  // Middleware-wrapped static responses ignore _headers, so Pages' default
  // max-age=14400 would delay deploys for hours. Force revalidation instead
  // (ETag -> 304). API routes manage their own caching.
  if (!path.startsWith("/api/")) {
    const out = new Response(res.body, res);
    out.headers.set("Cache-Control", "no-cache");
    return out;
  }
  return res;
}
