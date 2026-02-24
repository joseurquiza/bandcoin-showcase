import { neon } from "@neondatabase/serverless"

let _db: ReturnType<typeof neon> | null = null

/**
 * Get lazy-loaded database connection using Supabase Postgres
 * Only initializes when first called at runtime, not during build
 */
export function getDb() {
  if (!_db) {
    // Try multiple Supabase/Postgres connection URLs in order of preference
    // POSTGRES_URL_NON_POOLING is best for raw SQL queries
    let dbUrl = process.env.POSTGRES_URL_NON_POOLING || 
                process.env.POSTGRES_URL || 
                process.env.DATABASE_URL
    
    if (!dbUrl) {
      throw new Error('Database connection URL not found. Please set POSTGRES_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL environment variable.')
    }
    
    // Ensure URL starts with postgresql:// (not postgres://)
    if (dbUrl.startsWith('postgres://')) {
      dbUrl = dbUrl.replace('postgres://', 'postgresql://')
    }
    
    // Validate URL format
    if (!dbUrl.match(/^postgresql:\/\/.+@.+\/.+/)) {
      console.error('[v0] Invalid database URL format. Expected: postgresql://user:password@host/database')
      console.error('[v0] Received URL starts with:', dbUrl.substring(0, 20) + '...')
      throw new Error('Invalid database connection string format. Please check your POSTGRES_URL environment variable.')
    }
    
    _db = neon(dbUrl)
  }
  return _db
}
