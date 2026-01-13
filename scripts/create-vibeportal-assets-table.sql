-- Updated table name from vibestudio_assets to vibeportal_assets
-- Create table for storing VibePortal generated assets
CREATE TABLE IF NOT EXISTS vibeportal_assets (
  id SERIAL PRIMARY KEY,
  asset_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  vibe TEXT,
  camera TEXT,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated index name to reference vibeportal
CREATE INDEX IF NOT EXISTS idx_vibeportal_created_at ON vibeportal_assets(created_at DESC);
