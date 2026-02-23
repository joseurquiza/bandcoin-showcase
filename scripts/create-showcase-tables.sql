-- BandCoin Showcase Tables Migration
-- Creates all tables with showcase_ prefix to avoid conflicts with existing database

-- Rewards System Tables
CREATE TABLE IF NOT EXISTS showcase_reward_users (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  stellar_address TEXT,
  ethereum_address TEXT,
  email TEXT,
  total_tokens DECIMAL(10, 2) DEFAULT 0,
  withdrawn_tokens DECIMAL(10, 2) DEFAULT 0,
  pending_withdrawals DECIMAL(10, 2) DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_reward_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES showcase_reward_users(id),
  activity_type TEXT NOT NULL,
  app_name TEXT,
  tokens_earned DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_reward_rules (
  id SERIAL PRIMARY KEY,
  activity_type TEXT UNIQUE NOT NULL,
  tokens_per_action DECIMAL(10, 2) NOT NULL,
  daily_limit INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_reward_withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES showcase_reward_users(id),
  stellar_address TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Vault System Tables
CREATE TABLE IF NOT EXISTS showcase_vault_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('artist', 'supporter', 'admin')),
  wallet_address TEXT,
  stellar_public_key TEXT,
  wallet_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_vault_artists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES showcase_vault_users(id),
  artist_name TEXT NOT NULL,
  bio TEXT,
  genre TEXT,
  treasury_balance DECIMAL(10, 2) DEFAULT 0,
  vault_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_vault_stakes (
  id SERIAL PRIMARY KEY,
  supporter_id INTEGER REFERENCES showcase_vault_users(id),
  artist_id INTEGER REFERENCES showcase_vault_artists(id),
  amount DECIMAL(10, 2) NOT NULL,
  shares DECIMAL(10, 6),
  status TEXT DEFAULT 'active',
  staked_at TIMESTAMP DEFAULT NOW(),
  unstaked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS showcase_vault_transactions (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES showcase_vault_artists(id),
  transaction_type TEXT NOT NULL,
  category TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  tx_hash TEXT,
  created_by INTEGER REFERENCES showcase_vault_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_vault_reinvestment_rules (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES showcase_vault_artists(id),
  category TEXT NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Band Together Tables
CREATE TABLE IF NOT EXISTS showcase_bt_profiles (
  id SERIAL PRIMARY KEY,
  session_id TEXT,
  wallet_address TEXT,
  email TEXT,
  musician_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  instruments TEXT[],
  genres TEXT[],
  experience_level TEXT,
  looking_for TEXT[],
  availability TEXT,
  profile_image_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_bt_messages (
  id SERIAL PRIMARY KEY,
  from_profile_id INTEGER REFERENCES showcase_bt_profiles(id),
  to_profile_id INTEGER REFERENCES showcase_bt_profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_bt_gigs (
  id SERIAL PRIMARY KEY,
  posted_by INTEGER REFERENCES showcase_bt_profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  date TIMESTAMP,
  pay TEXT,
  requirements TEXT[],
  contact_info TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_bt_bands (
  id SERIAL PRIMARY KEY,
  created_by INTEGER REFERENCES showcase_bt_profiles(id),
  band_name TEXT NOT NULL,
  description TEXT,
  genres TEXT[],
  location TEXT,
  members JSONB,
  looking_for TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collectibles Tables
CREATE TABLE IF NOT EXISTS showcase_keepsake_tokens (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT,
  material TEXT,
  style TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_ai_payment_transactions (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vibe Portal Tables
CREATE TABLE IF NOT EXISTS showcase_vibeportal_assets (
  id SERIAL PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  prompt TEXT,
  vibe TEXT,
  camera TEXT,
  timestamp TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Merch Tables
CREATE TABLE IF NOT EXISTS showcase_merch_orders (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  printful_order_id TEXT,
  collectible_id INTEGER,
  product_variant_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_code TEXT,
  country_code TEXT NOT NULL,
  zip TEXT NOT NULL,
  total_cost DECIMAL(10, 2),
  stellar_payment_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Usage Tracking Tables
CREATE TABLE IF NOT EXISTS showcase_ai_usage (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(session_id, feature, usage_date)
);

-- Support/Analytics Tables
CREATE TABLE IF NOT EXISTS showcase_analytics_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  page_path TEXT,
  app_name TEXT,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_showcase_reward_users_session ON showcase_reward_users(session_id);
CREATE INDEX IF NOT EXISTS idx_showcase_reward_users_stellar ON showcase_reward_users(stellar_address);
CREATE INDEX IF NOT EXISTS idx_showcase_reward_activities_user ON showcase_reward_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_vault_users_email ON showcase_vault_users(email);
CREATE INDEX IF NOT EXISTS idx_showcase_vault_stakes_artist ON showcase_vault_stakes(artist_id);
CREATE INDEX IF NOT EXISTS idx_showcase_bt_profiles_wallet ON showcase_bt_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_showcase_keepsake_tokens_wallet ON showcase_keepsake_tokens(wallet_address);
CREATE INDEX IF NOT EXISTS idx_showcase_vibeportal_assets_id ON showcase_vibeportal_assets(asset_id);

-- Insert default reward rules
INSERT INTO showcase_reward_rules (activity_type, tokens_per_action, daily_limit, description) VALUES
  ('page_view', 1, 100, 'View a page'),
  ('collectible_create', 10, 10, 'Create a collectible'),
  ('profile_create', 50, 1, 'Create a profile'),
  ('daily_bonus', 25, 1, 'Daily login bonus')
ON CONFLICT (activity_type) DO NOTHING;
