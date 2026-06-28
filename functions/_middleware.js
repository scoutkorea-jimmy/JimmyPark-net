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
  return next();
}
