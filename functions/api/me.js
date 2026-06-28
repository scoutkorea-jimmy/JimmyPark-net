import { json, isAdmin } from "./_lib.js";

// GET /api/me → { ok } when a valid admin session is presented, else 401.
export async function onRequestGet({ request, env }) {
  if (await isAdmin(request, env)) return json({ ok: true });
  return json({ ok: false }, 401);
}
