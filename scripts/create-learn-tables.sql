-- Create learn_courses table for storing generated courses
CREATE TABLE IF NOT EXISTS learn_courses (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(56) NOT NULL,
  session_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  estimated_duration VARCHAR(100),
  course_data JSONB NOT NULL,
  infographic_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_learn_courses_wallet ON learn_courses(wallet_address);
CREATE INDEX IF NOT EXISTS idx_learn_courses_created ON learn_courses(created_at DESC);
