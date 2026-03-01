import postgres from "postgres"

let _db: ReturnType<typeof postgres> | null = null

/**
 * Lazy-loaded Supabase Postgres connection using the `postgres` package.
 * Works with any standard Postgres URL including Supabase direct connections.
 * Only initializes at runtime, never during build.
 */
export function getDb() {
  if (!_db) {
    const dbUrl = process.env.POSTGRES_URL

    if (!dbUrl) {
      throw new Error("POSTGRES_URL environment variable is not set.")
    }

    _db = postgres(dbUrl, { ssl: "require" })
  }
  return _db
}
