import postgres from "postgres"

let _db: ReturnType<typeof postgres> | null = null

/**
 * Lazy-loaded Supabase Postgres connection using the `postgres` package.
 * Uses the Supabase connection pooler (Prisma URL, port 6543) which is
 * required for Vercel serverless environments to avoid TCP connection timeouts.
 */
export function getDb() {
  if (!_db) {
    // SUPABASE_POSTGRES_PRISMA_URL uses the pooler (port 6543) - required for serverless
    // Fall back to POSTGRES_URL if not available
    const dbUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

    if (!dbUrl) {
      throw new Error("No database URL found. Please set SUPABASE_POSTGRES_PRISMA_URL or POSTGRES_URL.")
    }

    _db = postgres(dbUrl, {
      ssl: "require",
      max: 1, // Limit connections for serverless
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }
  return _db
}
