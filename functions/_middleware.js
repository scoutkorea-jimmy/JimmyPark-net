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
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://drive.google.com/embeddedfolderview",
  "form-action 'self'",
].join("; ");

const ADMIN_ORIGIN = "https://admin.jimmypark.net";
const PUBLIC_ORIGIN = "https://jimmypark.net";
const PREVIEW_PATHS = new Set(["/", "/work", "/press", "/dev", "/scouting", "/lecture", "/contact"]);
const ADMIN_SHELL = new Set(["/admin", "/admin/", "/admin.html"]);
const ADMIN_ASSETS = new Set(["/assets/admin.js", "/assets/insights-admin.js", "/assets/site.css", "/assets/img/logo.svg", "/assets/img/favicon.svg"]);
const ADMIN_METHODS = new Map([
  ["/api/login", ["POST"]], ["/api/logout", ["POST"]], ["/api/me", ["GET"]],
  ["/api/content", ["GET", "PUT"]], ["/api/posts", ["GET", "POST", "DELETE"]],
  ["/api/image", ["GET", "POST", "DELETE"]], ["/api/traffic", ["GET"]],
]);
const isLocal = url => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
const readMethod = method => method === "GET" || method === "HEAD";

function applySecurityHeaders(res, url) {
  const path = url.pathname;
  const out = new Response(res.body, res);
  if (path.startsWith("/api/")) {
    out.headers.delete("Access-Control-Allow-Origin");
    out.headers.delete("Access-Control-Allow-Credentials");
  }
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) out.headers.set(key, value);
  if (url.origin === ADMIN_ORIGIN || (isLocal(url) && ADMIN_SHELL.has(path))) {
    const frameSource = isLocal(url) ? "'self'" : PUBLIC_ORIGIN;
    out.headers.delete("Access-Control-Allow-Origin");
    out.headers.delete("Access-Control-Allow-Credentials");
    out.headers.set("Content-Security-Policy", [
      "default-src 'none'", "script-src 'self'", "style-src 'self' 'unsafe-inline'",
      "font-src 'self'", "img-src 'self' data: blob: https:", "connect-src 'self'",
      "frame-src " + frameSource, "frame-ancestors 'none'", "base-uri 'none'", "object-src 'none'", "form-action 'self'",
    ].join("; "));
    out.headers.delete("Content-Security-Policy-Report-Only");
    out.headers.set("X-Frame-Options", "DENY");
    out.headers.set("Cache-Control", "no-store");
    out.headers.set("Referrer-Policy", "no-referrer");
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  }
  if (url.origin === PUBLIC_ORIGIN && PREVIEW_PATHS.has(path) && url.searchParams.get("preview") === "1") {
    out.headers.delete("X-Frame-Options");
    out.headers.set("Content-Security-Policy", "frame-ancestors 'self' " + ADMIN_ORIGIN + "; base-uri 'self'; object-src 'none'");
    out.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
    out.headers.set("Cache-Control", "no-store");
    return out;
  }
  // Keep a stricter per-route policy (image serving sets default-src 'none').
  if (!out.headers.has("Content-Security-Policy")) {
    out.headers.set("Content-Security-Policy", CSP_ENFORCED);
    out.headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);
  }
  return out;
}

function adminBoundary(url, request) {
  const path = url.pathname;
  const method = request.method;
  const admin = url.origin === ADMIN_ORIGIN;
  const local = isLocal(url);
  const read = readMethod(method);
  const apiMethods = ADMIN_METHODS.get(path.replace(/\/$/, ""));
  const denied = () => Response.json({ ok: false, error: "unauthorized" }, {status: 401, headers: {"Cache-Control": "no-store"}});
  if (admin) {
    if (read && path === "/") return Response.redirect(ADMIN_ORIGIN + "/admin", 302);
    if (read && path === "/robots.txt") return new Response("User-agent: *\nDisallow: /\n", {headers: {"Content-Type": "text/plain; charset=utf-8"}});
    if (read && (ADMIN_SHELL.has(path) || ADMIN_ASSETS.has(path))) return null;
    if (!apiMethods || !ADMIN_METHODS.has(path)) return new Response("Not found", {status: 404});
    if (!apiMethods.includes(method)) return new Response(null, {status: 405, headers: {Allow: apiMethods.join(", ")}});
    if (!read && request.headers.get("Origin") !== ADMIN_ORIGIN) return denied();
  } else if (!local) {
    if (read && ADMIN_SHELL.has(path)) return new Response(null, {status: 302, headers: {Location: ADMIN_ORIGIN + "/admin", "Cache-Control": "no-store"}});
    if (apiMethods) {
      const publicApi = (path === "/api/content" && read) ||
        (path === "/api/image" && read && !url.searchParams.has("list")) ||
        (path === "/api/traffic" && method === "POST");
      if (!publicApi) return denied();
    }
  }
  return null;
}

async function route(context, request) {
  const { next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const boundary = adminBoundary(url, request);
  if (boundary) return boundary;
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
  const url = new URL(request.url);
  const path = url.pathname;
  // Server-rendered routes export GET handlers only, so a HEAD request used to
  // fall through to a 404 while GET returned 200. Link checkers and preview
  // bots rely on HEAD: answer it with the GET status and headers, no body.
  if (request.method === "HEAD" && !path.startsWith("/api/")) {
    const res = await route(context, new Request(request.url, { method: "GET", headers: request.headers }));
    const head = new Response(null, { status: res.status, headers: res.headers });
    return applySecurityHeaders(head, url);
  }
  return applySecurityHeaders(await route(context, request), url);
}
