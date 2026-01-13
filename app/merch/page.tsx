export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import MerchClient from "./merch-client"

const sql = neon(process.env.DATABASE_URL!)

async function getCollectibles() {
  try {
    const sessionId = (await cookies()).get("session_id")?.value
    console.log("[v0] Merch - Session ID:", sessionId)

    if (!sessionId) {
      console.log("[v0] Merch - No session ID found")
      return []
    }

    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId} LIMIT 1
    `
    console.log("[v0] Merch - User result:", userResult)

    if (!userResult.length || !userResult[0].stellar_address) {
      console.log("[v0] Merch - No user or stellar address found")
      return []
    }

    const walletAddress = userResult[0].stellar_address
    console.log("[v0] Merch - Wallet address:", walletAddress)

    const collectibles = await sql`
      SELECT id, name, image_url, description as theme
      FROM keepsake_tokens 
      WHERE wallet_address = ${walletAddress}
      AND image_url IS NOT NULL
      ORDER BY created_at DESC
    `
    console.log("[v0] Merch - Found collectibles:", collectibles.length)

    return collectibles
  } catch (error) {
    console.error("[v0] Merch - Error fetching collectibles:", error)
    return []
  }
}

export default async function MerchPage() {
  const collectibles = await getCollectibles()

  return <MerchClient collectibles={collectibles} />
}
