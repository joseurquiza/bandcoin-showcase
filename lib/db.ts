import { neon } from "@neondatabase/serverless"

let _db: ReturnType<typeof neon> | null = null

/**
 * Lazy-loaded Supabase Postgres connection via Neon serverless driver.
 * Only initializes at runtime, never during build.
 */
export function getDb() {
  if (!_db) {
    const dbUrl = process.env.POSTGRES_URL

    if (!dbUrl) {
      throw new Error("POSTGRES_URL environment variable is not set.")
    }

    // Neon driver requires postgresql:// not postgres://
    const normalized = dbUrl.startsWith("postgres://")
      ? dbUrl.replace("postgres://", "postgresql://")
      : dbUrl

    _db = neon(normalized)
  }
  return _db
}
