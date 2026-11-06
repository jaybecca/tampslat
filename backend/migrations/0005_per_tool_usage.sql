PRAGMA foreign_keys = ON;

-- Per-user, per-tool UTC calendar-month limits. A reservation is created before
-- a tool operation and completed or released by the browser after the result.
CREATE TABLE IF NOT EXISTS tool_usage_counters (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL CHECK(length(period_key) = 7),
  tool_key TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0 CHECK(used >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, period_key, tool_key)
);

CREATE TABLE IF NOT EXISTS tool_usage_reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL CHECK(length(period_key) = 7),
  tool_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','released')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tool_usage_reservations_user_period
  ON tool_usage_reservations(user_id, period_key, tool_key, status);
CREATE INDEX IF NOT EXISTS idx_tool_usage_counters_period
  ON tool_usage_counters(period_key, tool_key);
