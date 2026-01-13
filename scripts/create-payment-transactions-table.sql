-- Create table to track AI feature payments via Stellar
CREATE TABLE IF NOT EXISTS ai_payment_transactions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  transaction_hash VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_session ON ai_payment_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_hash ON ai_payment_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_feature ON ai_payment_transactions(feature);
