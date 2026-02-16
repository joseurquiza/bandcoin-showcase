import { neon } from "@neondatabase/serverless"

let _db: ReturnType<typeof neon> | null = null

/**
 * Get lazy-loaded database connection
 * Only initializes when first called at runtime, not during build
 */
export function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required at runtime')
    }
    _db = neon(dbUrl)
  }
  return _db
}
    _sql = neon(dbUrl)
  }
  return _sql
}
