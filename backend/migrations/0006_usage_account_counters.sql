PRAGMA foreign_keys = ON;

-- Separate monthly account-save and server-side CSV allowances.
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL CHECK(length(period_key) = 7),
  feature TEXT NOT NULL CHECK(feature IN ('saved_work','csv_analysis')),
  used INTEGER NOT NULL DEFAULT 0 CHECK(used >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, period_key, feature)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL CHECK(length(period_key) = 7),
  feature TEXT NOT NULL CHECK(feature IN ('saved_work','csv_analysis')),
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_period
  ON usage_events(user_id, period_key, feature);
