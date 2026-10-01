CREATE TABLE IF NOT EXISTS traffic_visitors (
  day TEXT NOT NULL, visitor TEXT NOT NULL, source TEXT NOT NULL, landing TEXT NOT NULL,
  PRIMARY KEY (day, visitor)
);
CREATE TABLE IF NOT EXISTS traffic_views (
  event TEXT PRIMARY KEY, day TEXT NOT NULL, path TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS traffic_views_day ON traffic_views(day);
CREATE TABLE IF NOT EXISTS traffic_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
