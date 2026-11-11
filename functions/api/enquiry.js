import { json, clientIp } from "./_lib.js";

// Contact form → one email to the owner through Resend (https://resend.com).
//   GET  /api/enquiry → { ok, enabled }   the page shows the form only when enabled
//   POST /api/enquiry { name, email, organization, message, website }
// Nothing is stored except a short-lived per-address counter for rate limiting.
// Secrets/vars (Pages → Settings → Environment variables):
//   RESEND_API_KEY  required; without it the form stays hidden and POST returns 503
//   ENQUIRY_TO      optional, default hello@jimmypark.net
//   ENQUIRY_FROM    optional, default "Jimmy Park website <enquiries@jimmypark.net>"
//                   (the domain must be verified in Resend)
const DEFAULT_TO = "hello@jimmypark.net";
const DEFAULT_FROM = "Jimmy Park website <enquiries@jimmypark.net>";
const LIMIT = 5;          // accepted messages per address
const WINDOW = 3600;      // seconds
const MAX = { name: 100, email: 200, organization: 150, message: 4000 };

const clean = value => String(value == null ? "" : value).replace(/\r\n?/g, "\n").trim();
const oneLine = value => clean(value).replace(/[\u0000-\u001f\u007f]+/g, " ");

async function addressKey(request) {
  const bytes = new TextEncoder().encode("enquiry:" + clientIp(request));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return "rl:enquiry:" + Array.from(digest.slice(0, 12), b => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ env }) {
  return json({ ok: true, enabled: !!(env.RESEND_API_KEY && env.JP_KV) });
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.JP_KV) return json({ ok: false, error: "not_configured" }, 503);
  const raw = await request.text();
  if (raw.length > 12000) return json({ ok: false, error: "too_large" }, 413);
  let body;
  try { body = JSON.parse(raw); } catch (_) { return json({ ok: false, error: "invalid_json" }, 400); }
  if (!body || typeof body !== "object") return json({ ok: false, error: "invalid_json" }, 400);
  // Hidden field real visitors never fill in. Answer as if accepted; send nothing.
  if (clean(body.website)) return json({ ok: true });

  const name = oneLine(body.name), email = oneLine(body.email), organization = oneLine(body.organization), message = clean(body.message);
  if (!name || name.length > MAX.name) return json({ ok: false, error: "invalid_name" }, 400);
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/.test(email) || email.length > MAX.email) return json({ ok: false, error: "invalid_email" }, 400);
  if (organization.length > MAX.organization) return json({ ok: false, error: "invalid_organization" }, 400);
  if (message.length < 10 || message.length > MAX.message) return json({ ok: false, error: "invalid_message" }, 400);

  // Fails closed: if the counter cannot be read or written, nothing is sent.
  const key = await addressKey(request);
  let count;
  try { count = parseInt((await env.JP_KV.get(key)) || "0", 10) || 0; } catch (_) { return json({ ok: false, error: "storage_unavailable" }, 503); }
  if (count >= LIMIT) return json({ ok: false, error: "rate_limited" }, 429);
  try { await env.JP_KV.put(key, String(count + 1), { expirationTtl: WINDOW }); } catch (_) { return json({ ok: false, error: "storage_unavailable" }, 503); }

  const text = [
    "New enquiry from jimmypark.net/contact",
    "",
    "Name: " + name,
    "Email: " + email,
    "Organization: " + (organization || "-"),
    "",
    message,
    "",
    "Reply to this email to answer " + name + " directly.",
  ].join("\n");
  let sent;
  try {
    sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM || DEFAULT_FROM,
        to: [env.ENQUIRY_TO || DEFAULT_TO],
        reply_to: email,
        subject: "Website enquiry: " + name + (organization ? " (" + organization + ")" : ""),
        text,
      }),
    });
  } catch (_) { return json({ ok: false, error: "send_failed" }, 502); }
  if (!sent.ok) return json({ ok: false, error: "send_failed" }, 502);
  return json({ ok: true });
}
