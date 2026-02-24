import { sql as vercelSql } from "@vercel/postgres"

/**
 * Get database connection for Supabase Postgres
 * Uses @vercel/postgres which works with any Postgres database including Supabase
 * Connection is configured via POSTGRES_URL environment variable
 */
export function getDb() {
  // @vercel/postgres automatically reads from POSTGRES_URL env var
  // and handles connection pooling
  return vercelSql
}
