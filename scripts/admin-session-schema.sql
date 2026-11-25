CREATE TABLE IF NOT EXISTS admin_sessions (
  session_hash TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS admin_sessions_activity ON admin_sessions(last_seen);

CREATE TABLE IF NOT EXISTS admin_totp_steps (
  step INTEGER PRIMARY KEY,
  claim_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_windows (
  source_hash TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL,
  ends_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_login_windows_expiry ON admin_login_windows(ends_at);
