import postgres from "postgres"
import { readFileSync } from "fs"
import { resolve } from "path"

const dbUrl = process.env.SUPABASE_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!dbUrl) {
  console.error("No database URL found. Set SUPABASE_POSTGRES_PRISMA_URL or POSTGRES_URL.")
  process.exit(1)
}

const sql = postgres(dbUrl, { ssl: "require", max: 1 })

const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql-file>")
  process.exit(1)
}

const query = readFileSync(resolve(sqlFile), "utf-8")

try {
  await sql.unsafe(query)
  console.log("Migration completed successfully.")
} catch (err) {
  console.error("Migration failed:", err.message)
  process.exit(1)
} finally {
  await sql.end()
}
