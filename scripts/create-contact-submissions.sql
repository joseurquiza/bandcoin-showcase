CREATE TABLE IF NOT EXISTS showcase_contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  band_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_showcase_contact_submissions_status ON showcase_contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_showcase_contact_submissions_created ON showcase_contact_submissions(created_at DESC);
