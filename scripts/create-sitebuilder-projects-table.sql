-- Create table to track Site Builder projects
CREATE TABLE IF NOT EXISTS sitebuilder_projects (
  id SERIAL PRIMARY KEY,
  v0_chat_id VARCHAR(255) UNIQUE NOT NULL,
  v0_project_id VARCHAR(255),
  website_idea TEXT NOT NULL,
  demo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sitebuilder_v0_chat_id ON sitebuilder_projects(v0_chat_id);
CREATE INDEX IF NOT EXISTS idx_sitebuilder_created_at ON sitebuilder_projects(created_at DESC);
