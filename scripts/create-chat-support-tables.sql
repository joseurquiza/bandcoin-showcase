-- Create chat support tables for AI assistant with human escalation

CREATE TABLE IF NOT EXISTS support_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, escalated, resolved
  escalated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL REFERENCES support_sessions(session_id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL, -- user, ai, admin
  sender_name VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_sessions_session_id ON support_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_status ON support_sessions(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_session_id ON support_messages(session_id);

-- Insert initial data
INSERT INTO support_sessions (session_id, status) VALUES ('test-session-001', 'active') ON CONFLICT DO NOTHING;
