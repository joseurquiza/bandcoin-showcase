import postgres from "postgres"

const dbUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!dbUrl) {
  console.error("No database URL found. Set SUPABASE_POSTGRES_PRISMA_URL or POSTGRES_URL.")
  process.exit(1)
}

const sql = postgres(dbUrl, { ssl: "require", max: 1 })

const query = `
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
`

try {
  await sql.unsafe(query)
  console.log("Migration completed: showcase_analytics_sessions table created.")
} catch (err) {
  console.error("Migration failed:", err.message)
  process.exit(1)
} finally {
  await sql.end()
}
