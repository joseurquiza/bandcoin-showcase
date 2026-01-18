-- Add user tracking to vibeportal_assets table
ALTER TABLE vibeportal_assets 
ADD COLUMN IF NOT EXISTS user_identifier TEXT;

-- Create index for faster filtering by user
CREATE INDEX IF NOT EXISTS idx_vibeportal_user_created_at 
ON vibeportal_assets(user_identifier, created_at DESC);
