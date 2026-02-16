"use server"

import { getDb } from "@/lib/db"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.VAULT_JWT_SECRET || "your-secret-key"

async function getAdminUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("vault_session")?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== "admin") return null

    const sql = getDb()
    const users = await sql`SELECT * FROM vault_users WHERE id = ${decoded.userId}`
    return users[0] || null
  } catch {
    return null
  }
}

export async function getAllWithdrawalRequests() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { success: false, message: "Unauthorized" }
    }

    const sql = getDb()
    const withdrawals = await sql`
      SELECT 
        rw.*,
        ru.session_id,
        ru.display_name,
        ru.email,
        ru.total_tokens,
        vu.email as processed_by_email
      FROM reward_withdrawals rw
      JOIN reward_users ru ON rw.user_id = ru.id
      LEFT JOIN vault_users vu ON rw.processed_by = vu.id
      ORDER BY 
        CASE rw.status 
          WHEN 'pending' THEN 1 
          WHEN 'processing' THEN 2 
          ELSE 3 
        END,
        rw.created_at DESC
    `

    return {
      success: true,
      withdrawals: withdrawals.map((w) => ({
        ...w,
        amount: Number.parseFloat(w.amount),
        total_tokens: Number.parseFloat(w.total_tokens),
        created_at: new Date(w.created_at).toISOString(),
        processed_at: w.processed_at ? new Date(w.processed_at).toISOString() : null,
      })),
    }
  } catch (error) {
    console.error("[v0] Error getting withdrawal requests:", error)
    return { success: false, message: "Error loading withdrawal requests" }
  }
}

export async function processWithdrawal(
  withdrawalId: number,
  status: "completed" | "rejected",
  transactionHash?: string,
  adminNotes?: string,
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { success: false, message: "Unauthorized" }
    }

    const sql = getDb()
    // Get withdrawal details
    const withdrawals = await sql`
      SELECT * FROM reward_withdrawals WHERE id = ${withdrawalId}
    `

    if (withdrawals.length === 0) {
      return { success: false, message: "Withdrawal not found" }
    }

    const withdrawal = withdrawals[0]

    if (withdrawal.status !== "pending" && withdrawal.status !== "processing") {
      return { success: false, message: "Withdrawal already processed" }
    }

    // Update withdrawal status
    await sql`
      UPDATE reward_withdrawals
      SET 
        status = ${status},
        processed_by = ${admin.id},
        processed_at = NOW(),
        transaction_hash = ${transactionHash || null},
        admin_notes = ${adminNotes || null}
      WHERE id = ${withdrawalId}
    `

    // Update user balances
    if (status === "completed") {
      await sql`
        UPDATE reward_users
        SET 
          withdrawn_tokens = withdrawn_tokens + ${withdrawal.amount},
          pending_withdrawals = pending_withdrawals - ${withdrawal.amount}
        WHERE id = ${withdrawal.user_id}
      `
    } else {
      // Rejected - return to available balance
      await sql`
        UPDATE reward_users
        SET pending_withdrawals = pending_withdrawals - ${withdrawal.amount}
        WHERE id = ${withdrawal.user_id}
      `
    }

    return { success: true, message: `Withdrawal ${status}` }
  } catch (error) {
    console.error("[v0] Error processing withdrawal:", error)
    return { success: false, message: "Error processing withdrawal" }
  }
}

export async function updateWithdrawalStatus(withdrawalId: number, status: "processing") {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { success: false, message: "Unauthorized" }
    }

    const sql = getDb()
    await sql`
      UPDATE reward_withdrawals
      SET status = ${status}
      WHERE id = ${withdrawalId}
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating withdrawal status:", error)
    return { success: false, message: "Error updating status" }
  }
}
