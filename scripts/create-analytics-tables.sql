-- Analytics events table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'app_launch', 'feature_use', 'click'
  page_path VARCHAR(255) NOT NULL,
  app_name VARCHAR(100),
  user_session_id VARCHAR(100) NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics sessions table for tracking unique visitors
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  page_views INTEGER DEFAULT 1,
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50), -- 'desktop', 'tablet', 'mobile'
  browser VARCHAR(50),
  os VARCHAR(50)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_app_name ON analytics_events(app_name);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON analytics_sessions(last_seen);
