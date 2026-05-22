CREATE TABLE IF NOT EXISTS showcase_analytics_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  page_views INTEGER DEFAULT 1,
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_showcase_analytics_sessions_session_id ON showcase_analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_showcase_analytics_sessions_last_seen ON showcase_analytics_sessions(last_seen);
