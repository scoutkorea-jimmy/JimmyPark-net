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
  // Secret templates, deploy scripts and the version stamp are not public content.
  /(?:^|\/)\.env(?:$|[./])/i,
  /^\/?scripts(?:\/|$)/i,
  /^\/?VERSION$/i,
  /^\/?design(?:\/|$)/i,
  /^\/?\.impeccable(?:\/|$)/i,
];

// Baseline headers for every response. Middleware-wrapped static responses
// ignore `_headers`, so this file is authoritative; keep `_headers` in sync.
// The admin previews public pages in a same-origin iframe, so framing is
// limited to this origin rather than denied.
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
// Enforced: directives that cannot break existing pages.
const CSP_ENFORCED = "frame-ancestors 'self'; base-uri 'self'; object-src 'none'";
// Report-only until the browser console shows no violations on every public
// page, Admin, /saju and /kotma after a deployment. Then move it to CSP_ENFORCED.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "form-action 'self'",
].join("; ");

function applySecurityHeaders(res, path) {
  const out = new Response(res.body, res);
  // The admin calls /api/* from this origin with a Bearer token; no other
  // origin needs to read API responses. Static assets keep the platform default.
  if (path.startsWith("/api/")) {
    out.headers.delete("Access-Control-Allow-Origin");
    out.headers.delete("Access-Control-Allow-Credentials");
  }
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) out.headers.set(key, value);
  // Keep a stricter per-route policy (image serving sets default-src 'none').
  if (!out.headers.has("Content-Security-Policy")) {
    out.headers.set("Content-Security-Policy", CSP_ENFORCED);
    out.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  }
  return out;
}

async function route(context, request) {
  const { next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/quotly" || path === "/quotly/") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://github.com/scoutkorea-jimmy/usagebar-releases/releases/latest",
        "Cache-Control": "no-store",
      },
    });
  }
  if (path === "/setukor" || path === "/setukor/") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "https://setukor-learning.jimmy-park.chatgpt.site/" + url.search,
        "Cache-Control": "no-store",
      },
    });
  }
  if (BLOCK.some((re) => re.test(path))) {
    return new Response("Not found", { status: 404 });
  }
  const res = request === context.request ? await next() : await next(request);
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
    return out;
  }
  // Middleware-wrapped static responses ignore _headers, so Pages' default
  // max-age=14400 would delay deploys for hours. Force revalidation instead
  // (ETag -> 304). API routes manage their own caching.
  if (!path.startsWith("/api/")) {
    const out = new Response(res.body, res);
    if (!/no-store/i.test(out.headers.get("Cache-Control") || "")) out.headers.set("Cache-Control", "no-cache");
    return out;
  }
  return res;
}

export async function onRequest(context) {
  const { request } = context;
  const path = new URL(request.url).pathname;
  // Server-rendered routes export GET handlers only, so a HEAD request used to
  // fall through to a 404 while GET returned 200. Link checkers and preview
  // bots rely on HEAD: answer it with the GET status and headers, no body.
  if (request.method === "HEAD" && !path.startsWith("/api/")) {
    const res = await route(context, new Request(request.url, { method: "GET", headers: request.headers }));
    const head = new Response(null, { status: res.status, headers: res.headers });
    return applySecurityHeaders(head, path);
  }
  return applySecurityHeaders(await route(context, request), path);
}
