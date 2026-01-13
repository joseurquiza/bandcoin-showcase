"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth-actions"

const sql = neon(process.env.DATABASE_URL!)

export async function getArtistProfile() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    const [artist] = await sql`
      SELECT * FROM vault_artists
      WHERE user_id = ${user.id}
    `

    if (!artist) {
      return { success: false, error: "Artist profile not found" }
    }

    return { success: true, artist }
  } catch (error) {
    console.error("Get artist profile error:", error)
    return { success: false, error: "Failed to fetch artist profile" }
  }
}

export async function updateArtistProfile(bio: string, genre: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    await sql`
      UPDATE vault_artists
      SET bio = ${bio}, genre = ${genre}, updated_at = NOW()
      WHERE user_id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("Update artist profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getArtistTransactions() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    const transactions = await sql`
      SELECT t.*
      FROM vault_transactions t
      JOIN vault_artists a ON t.artist_id = a.id
      WHERE a.user_id = ${user.id}
      ORDER BY t.created_at DESC
      LIMIT 50
    `

    return { success: true, transactions }
  } catch (error) {
    console.error("Get artist transactions error:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

export async function getArtistStakes() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    const stakes = await sql`
      SELECT 
        s.*,
        u.display_name,
        u.email
      FROM vault_stakes s
      JOIN vault_users u ON s.supporter_id = u.id
      JOIN vault_artists a ON s.artist_id = a.id
      WHERE a.user_id = ${user.id} AND s.status = 'active'
      ORDER BY s.staked_at DESC
    `

    return { success: true, stakes }
  } catch (error) {
    console.error("Get artist stakes error:", error)
    return { success: false, error: "Failed to fetch stakes" }
  }
}

export async function getReinvestmentRules() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    const rules = await sql`
      SELECT r.*
      FROM vault_reinvestment_rules r
      JOIN vault_artists a ON r.artist_id = a.id
      WHERE a.user_id = ${user.id}
      ORDER BY r.percentage DESC
    `

    return { success: true, rules }
  } catch (error) {
    console.error("Get reinvestment rules error:", error)
    return { success: false, error: "Failed to fetch rules" }
  }
}

export async function updateReinvestmentRule(ruleId: number, percentage: number, isActive: boolean) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "artist") {
      return { success: false, error: "Unauthorized" }
    }

    await sql`
      UPDATE vault_reinvestment_rules r
      SET percentage = ${percentage}, is_active = ${isActive}
      FROM vault_artists a
      WHERE r.id = ${ruleId} AND r.artist_id = a.id AND a.user_id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("Update reinvestment rule error:", error)
    return { success: false, error: "Failed to update rule" }
  }
}
