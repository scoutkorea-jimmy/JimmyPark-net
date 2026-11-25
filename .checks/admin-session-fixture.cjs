// In-memory SQLite and the public RFC 4226 sample key. No remote bindings.
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { createHmac } = require('node:crypto');
const path = require('node:path');
const sampleKey = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const schema = readFileSync(path.join(__dirname, '../scripts/admin-session-schema.sql'), 'utf8');
function fixture(sql = new DatabaseSync(':memory:')) {
  sql.exec(schema);
  const db = {
    prepare(query) {
      const stmt = sql.prepare(query);
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        first() { return stmt.get(...args) || null; },
        run() {
          if (stmt.columns().length) return { results: stmt.all(...args) };
          stmt.run(...args);
          return { results: [] };
        },
      };
    },
    async batch(statements) {
      sql.exec('BEGIN');
      try {
        const results = statements.map(statement => statement.run());
        sql.exec('COMMIT');
        return results;
      } catch (error) { sql.exec('ROLLBACK'); throw error; }
    },
  };
  return { sql, env: { JP_TRAFFIC: db, TOTP_SECRET: sampleKey } };
}
function codeFor(step = Math.floor(Date.now() / 30000)) {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', '12345678901234567890').update(bytes).digest();
  return String((digest.readUInt32BE(digest[19] & 15) & 0x7fffffff) % 1000000).padStart(6, '0');
}
async function signIn(env, code = codeFor(), origin = 'https://admin.jimmypark.net') {
  const { onRequestPost } = await import('../functions/api/login.js');
  return onRequestPost({ env, request: new Request(origin + '/api/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }) });
}
async function signInCookie(env, origin) {
  const response = await signIn(env, codeFor(), origin);
  if (!response.ok) throw new Error('Fixture sign-in failed with status ' + response.status);
  return response.headers.get('Set-Cookie').split(';')[0];
}
module.exports = { fixture, codeFor, signIn, signInCookie, schema };
