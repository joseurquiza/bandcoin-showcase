import { neon } from "@neondatabase/serverless"

/**
 * Lazy-loaded database connection
 * This prevents build-time errors by only initializing the connection at runtime
 */
let _sql: ReturnType<typeof neon> | null = null

export function getDb() {
  if (!_sql) {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    _sql = neon(dbUrl)
  }
  return _sql
}
