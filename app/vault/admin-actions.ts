"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth-actions"
import { stellarVault } from "@/lib/stellar-vault"

const sql = neon(process.env.DATABASE_URL!)

export async function getAllArtists() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const artists = await sql`
      SELECT 
        a.id,
        a.artist_name,
        a.bio,
        a.genre,
        a.treasury_balance,
        a.total_earned,
        a.total_distributed,
        u.email,
        u.wallet_address,
        a.created_at
      FROM vault_artists a
      JOIN vault_users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `

    return { success: true, artists }
  } catch (error) {
    console.error("Get all artists error:", error)
    return { success: false, error: "Failed to fetch artists" }
  }
}

export async function getAllSupporters() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const supporters = await sql`
      SELECT 
        u.id,
        u.email,
        u.display_name,
        u.wallet_address,
        u.created_at,
        COUNT(DISTINCT s.id) as active_stakes,
        COALESCE(SUM(s.amount), 0) as total_staked,
        COALESCE(SUM(s.total_rewards), 0) as total_rewards
      FROM vault_users u
      LEFT JOIN vault_stakes s ON u.id = s.supporter_id AND s.status = 'active'
      WHERE u.role = 'supporter'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `

    return { success: true, supporters }
  } catch (error) {
    console.error("Get all supporters error:", error)
    return { success: false, error: "Failed to fetch supporters" }
  }
}

export async function getRecentTransactions(limit = 20) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const transactions = await sql`
      SELECT 
        t.id,
        t.transaction_type,
        t.category,
        t.amount,
        t.description,
        t.created_at,
        a.artist_name,
        u.display_name as created_by_name
      FROM vault_transactions t
      JOIN vault_artists a ON t.artist_id = a.id
      LEFT JOIN vault_users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
      LIMIT ${limit}
    `

    return { success: true, transactions }
  } catch (error) {
    console.error("Get recent transactions error:", error)
    return { success: false, error: "Failed to fetch transactions" }
  }
}

export async function addTransaction(
  artistId: number,
  transactionType: string,
  category: string,
  amount: number,
  description: string,
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    // Insert transaction
    await sql`
      INSERT INTO vault_transactions (artist_id, transaction_type, category, amount, description, created_by)
      VALUES (${artistId}, ${transactionType}, ${category}, ${amount}, ${description}, ${user.id})
    `

    // Update artist treasury balance
    if (transactionType === "inflow") {
      await sql`
        UPDATE vault_artists
        SET 
          treasury_balance = treasury_balance + ${amount},
          total_earned = total_earned + ${amount},
          updated_at = NOW()
        WHERE id = ${artistId}
      `
    } else if (transactionType === "payout" || transactionType === "distribution") {
      await sql`
        UPDATE vault_artists
        SET 
          treasury_balance = treasury_balance - ${amount},
          total_distributed = total_distributed + ${amount},
          updated_at = NOW()
        WHERE id = ${artistId}
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Add transaction error:", error)
    return { success: false, error: "Failed to add transaction" }
  }
}

export async function getVaultStats() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    const [stats] = await sql`
      SELECT
        (SELECT COUNT(*) FROM vault_artists) as total_artists,
        (SELECT COUNT(*) FROM vault_users WHERE role = 'supporter') as total_supporters,
        (SELECT COALESCE(SUM(treasury_balance), 0) FROM vault_artists) as total_treasury,
        (SELECT COALESCE(SUM(amount), 0) FROM vault_stakes WHERE status = 'active') as total_staked
    `

    return { success: true, stats }
  } catch (error) {
    console.error("Get vault stats error:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function distributeVaultRevenue(artistId: number, amount: number) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" }
    }

    if (!user.wallet_address && !user.stellar_public_key) {
      return { success: false, error: "Please connect a wallet to sign the distribution transaction" }
    }

    const publicKey = user.stellar_public_key || user.wallet_address
    const txXDR = await stellarVault.distributeRevenue(publicKey as string, artistId, amount.toString())

    // Record distribution in database
    await sql`
      INSERT INTO vault_transactions (artist_id, transaction_type, category, amount, description, created_by)
      VALUES (${artistId}, 'distribution', 'Vault Revenue Distribution', ${amount}, 'Revenue distributed to vault shareholders', ${user.id})
    `

    // Update artist stats
    await sql`
      UPDATE vault_artists
      SET 
        total_distributed = total_distributed + ${amount},
        updated_at = NOW()
      WHERE id = ${artistId}
    `

    return {
      success: true,
      txXDR,
      message: "Distribution transaction created. Please sign in your wallet to complete.",
    }
  } catch (error) {
    console.error("[v0] Distribute vault revenue error:", error)
    return { success: false, error: "Failed to create distribution transaction" }
  }
}
