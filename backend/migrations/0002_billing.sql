PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN plan_expires_at TEXT;
ALTER TABLE users ADD COLUMN billing_provider TEXT;
ALTER TABLE users ADD COLUMN billing_subscription_id TEXT;

CREATE TABLE IF NOT EXISTS billing_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK(provider IN ('flutterwave','paddle')),
  kind TEXT NOT NULL CHECK(kind IN ('plan','credits')),
  plan TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 1),
  currency TEXT NOT NULL,
  amount_minor INTEGER NOT NULL CHECK(amount_minor > 0),
  provider_ref TEXT UNIQUE,
  provider_transaction_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','failed','expired')),
  entitlement_applied INTEGER NOT NULL DEFAULT 0 CHECK(entitlement_applied IN (0,1)),
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_orders_user_created
  ON billing_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_orders_provider_status
  ON billing_orders(provider, status, created_at DESC);

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  provider TEXT NOT NULL CHECK(provider IN ('flutterwave','paddle')),
  event_id TEXT NOT NULL,
  payload_hash TEXT,
  processed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(provider, event_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_provider_ref
  ON credit_ledger(provider_ref) WHERE provider_ref IS NOT NULL;
