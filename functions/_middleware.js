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
  /^\/?\.checks(?:\/|$)/i,
  // H1: secrets templates, deploy scripts, and version stamp must not be public.
  /\.env(?:$|[./])/i,
  /^\/?scripts(?:\/|$)/i,
  /^\/?VERSION$/i,
];

// Applied to every response (middleware-wrapped assets ignore some _headers
// edge cases; API responses also need the same baseline).
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // Vanilla portfolio: external fonts/CSS CDNs + lots of inline style="" attrs.
  // Scripts are all external (/assets/*.js); JSON-LD is type=application/ld+json
  // (not executed). style-src needs 'unsafe-inline' for existing HTML style attrs
  // and admin.html's <style> block — honest tradeoff until styles are externalized.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
};

function applySecurityHeaders(res) {
  const out = new Response(res.body, res);
  // Narrow/remove overly permissive CORS (CF Transform may set *); same-origin
  // admin uses Bearer + fetch to /api/* so ACAO is unnecessary.
  out.headers.delete("Access-Control-Allow-Origin");
  out.headers.delete("Access-Control-Allow-Credentials");
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    // Keep stricter per-route CSP (e.g. image serve: default-src 'none').
    if (k === "Content-Security-Policy" && out.headers.has("Content-Security-Policy")) continue;
    out.headers.set(k, v);
  }
  return out;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/setukor" || path === "/setukor/") {
    return applySecurityHeaders(new Response(null, {
      status: 302,
      headers: {
        Location: "https://setukor-learning.jimmy-park.chatgpt.site/" + url.search,
        "Cache-Control": "no-store",
      },
    }));
  }
  if (BLOCK.some((re) => re.test(path))) {
    return applySecurityHeaders(new Response("Not found", { status: 404 }));
  }
  const res = await next();
  // KOTMA is a static export mounted under this Pages project. Its unknown
  // content routes should show KOTMA's temporary page, never this portfolio's
  // 404 page. Leave static asset and Next.js chunk failures as real 404s.
  if (
    res.status === 404 &&
    path.startsWith("/kotma/") &&
    !path.startsWith("/kotma/_next/") &&
    !/\.[a-z0-9]+$/i.test(path)
  ) {
    const fallback = await fetch(new URL("/kotma/coming-soon/", url.origin));
    const out = new Response(fallback.body, fallback);
    out.headers.set("Cache-Control", "no-cache");
    return applySecurityHeaders(out);
  }
  // Middleware-wrapped static responses ignore _headers, so Pages' default
  // max-age=14400 would delay deploys for hours. Force revalidation instead
  // (ETag -> 304). API routes manage their own caching.
  if (!path.startsWith("/api/")) {
    const out = new Response(res.body, res);
    if (!/no-store/i.test(out.headers.get("Cache-Control") || "")) out.headers.set("Cache-Control", "no-cache");
    return applySecurityHeaders(out);
  }
  return applySecurityHeaders(res);
}
