import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (!_sql) {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    _sql = neon(dbUrl)
  }
  return _sql
}

// For backward compatibility with existing code
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_, prop) {
    return getSql()[prop as keyof ReturnType<typeof neon>]
  },
  apply(_, __, args) {
    return getSql()(...args)
  }
})
