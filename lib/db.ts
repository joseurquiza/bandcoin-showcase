import { neon } from "@neondatabase/serverless"

let _db: ReturnType<typeof neon> | null = null

/**
 * Get lazy-loaded database connection using Supabase Postgres
 * Only initializes when first called at runtime, not during build
 */
export function getDb() {
  if (!_db) {
    // Use POSTGRES_URL from Supabase integration
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required at runtime')
    }
    _db = neon(dbUrl)
  }
  return _db
}
