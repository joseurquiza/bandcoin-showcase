-- Add conversation_history column to track the full chat history
ALTER TABLE sitebuilder_projects 
ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sitebuilder_conversation ON sitebuilder_projects USING gin(conversation_history);
