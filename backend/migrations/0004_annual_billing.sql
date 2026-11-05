PRAGMA foreign_keys = ON;

-- Persist the selected subscription term for server-side pricing,
-- renewal windows and payment-provider event reconciliation.
ALTER TABLE billing_orders
  ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'monthly'
  CHECK (billing_cycle IN ('monthly', 'annual'));
