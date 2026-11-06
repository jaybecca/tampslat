PRAGMA foreign_keys = ON;

-- Independent monthly account-save and server-side CSV allowances.
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  feature TEXT NOT NULL CHECK(feature IN ('saved_work','csv_analysis')),
  used INTEGER NOT NULL DEFAULT 0 CHECK(used >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, period_key, feature)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  feature TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_period
  ON usage_events(user_id, period_key, feature);

-- A separate counter for each individual studio and UTC calendar month.
CREATE TABLE IF NOT EXISTS tool_usage_counters (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  tool_key TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0 CHECK(used >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, period_key, tool_key)
);

-- Reserve before an operation; mark completed only after it succeeds.
-- Failed or abandoned operations are released and do not consume the allowance.
CREATE TABLE IF NOT EXISTS tool_usage_reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  tool_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','completed','released')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tool_usage_reservations_pending
  ON tool_usage_reservations(user_id, period_key, tool_key, status, created_at);
