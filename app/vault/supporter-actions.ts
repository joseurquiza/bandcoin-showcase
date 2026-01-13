"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth-actions"

const sql = neon(process.env.DATABASE_URL!)

export async function getAllArtistsForStaking() {
  try {
    console.log("[v0] Fetching all artists for staking")
    const artists = await sql`
      SELECT 
        a.id,
        a.artist_name,
        a.bio,
        a.genre,
        a.treasury_balance,
        a.image_url,
        COUNT(DISTINCT s.id) as supporter_count,
        COALESCE(SUM(s.amount), 0) as total_staked
      FROM vault_artists a
      LEFT JOIN vault_stakes s ON a.id = s.artist_id AND s.status = 'active'
      GROUP BY a.id
      ORDER BY a.treasury_balance DESC
    `

    console.log("[v0] Found", artists.length, "artists")
    return { success: true, artists }
  } catch (error) {
    console.error("[v0] Get artists for staking error:", error)
    return { success: false, error: "Failed to fetch artists", artists: [] }
  }
}

export async function getMyStakes() {
  try {
    console.log("[v0] Fetching user stakes")
    const user = await getCurrentUser()
    if (!user || user.role !== "supporter") {
      console.log("[v0] User not authorized or not a supporter")
      return { success: false, error: "Unauthorized", stakes: [] }
    }

    const stakes = await sql`
      SELECT 
        s.*,
        a.artist_name,
        a.genre,
        a.treasury_balance
      FROM vault_stakes s
      JOIN vault_artists a ON s.artist_id = a.id
      WHERE s.supporter_id = ${user.id}
      ORDER BY s.staked_at DESC
    `

    console.log("[v0] Found", stakes.length, "stakes for user")
    return { success: true, stakes }
  } catch (error) {
    console.error("[v0] Get my stakes error:", error)
    return { success: false, error: "Failed to fetch stakes", stakes: [] }
  }
}

export async function stakeOnArtist(artistId: number, amount: number) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "supporter") {
      return { success: false, error: "Unauthorized" }
    }

    if (amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" }
    }

    await sql`
      INSERT INTO vault_stakes (supporter_id, artist_id, amount, staked_at, status)
      VALUES (${user.id}, ${artistId}, ${amount}, NOW(), 'active')
    `

    return { success: true }
  } catch (error) {
    console.error("Stake on artist error:", error)
    return { success: false, error: "Failed to stake" }
  }
}

export async function unstakeFromArtist(stakeId: number) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "supporter") {
      return { success: false, error: "Unauthorized" }
    }

    await sql`
      UPDATE vault_stakes
      SET status = 'unstaked'
      WHERE id = ${stakeId} AND supporter_id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("Unstake error:", error)
    return { success: false, error: "Failed to unstake" }
  }
}

export async function getSupporterStats() {
  try {
    console.log("[v0] Fetching supporter stats")
    const user = await getCurrentUser()
    if (!user || user.role !== "supporter") {
      console.log("[v0] User not authorized or not a supporter")
      return { success: false, error: "Unauthorized" }
    }

    const [stats] = await sql`
      SELECT
        COUNT(DISTINCT artist_id) as artists_supported,
        COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) as total_staked,
        COALESCE(SUM(total_rewards), 0) as total_rewards_earned
      FROM vault_stakes
      WHERE supporter_id = ${user.id}
    `

    console.log("[v0] Supporter stats:", stats)
    return { success: true, stats: stats || { artists_supported: 0, total_staked: 0, total_rewards_earned: 0 } }
  } catch (error) {
    console.error("[v0] Get supporter stats error:", error)
    return {
      success: false,
      error: "Failed to fetch stats",
      stats: { artists_supported: 0, total_staked: 0, total_rewards_earned: 0 },
    }
  }
}
