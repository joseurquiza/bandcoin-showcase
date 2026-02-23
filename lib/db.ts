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
    
    console.log('[v0] Database connection - POSTGRES_URL exists:', !!process.env.POSTGRES_URL)
    console.log('[v0] Database connection - DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    if (!dbUrl) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required at runtime. Please set one of these environment variables.')
    }
    
    _db = neon(dbUrl)
    console.log('[v0] Database connection initialized successfully')
  }
  return _db
}
