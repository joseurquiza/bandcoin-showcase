CREATE TABLE IF NOT EXISTS merch_orders (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  collectible_id INTEGER NOT NULL,
  printful_order_id INTEGER,
  external_id TEXT,
  status TEXT DEFAULT 'draft',
  order_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merch_orders_wallet ON merch_orders(wallet_address);
CREATE INDEX IF NOT EXISTS idx_merch_orders_status ON merch_orders(status);
