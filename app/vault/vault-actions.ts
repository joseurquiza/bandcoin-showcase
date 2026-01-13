"use server"

import { neon } from "@neondatabase/serverless"
import { stellarVault } from "@/lib/stellar-vault"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)

async function getUserFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get("vault_token")

  if (!token) {
    throw new Error("Not authenticated")
  }

  const secret = new TextEncoder().encode(process.env.VAULT_JWT_SECRET!)
  const { payload } = await jwtVerify(token.value, secret)

  return payload
}

export async function getVaultStats(artistId: number) {
  try {
    // Get on-chain vault info
    const vaultInfo = await stellarVault.getVaultInfo(artistId)

    // Get database transaction history
    const transactions = await sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN transaction_type = 'distribution' THEN amount ELSE 0 END) as total_distributed
      FROM vault_transactions
      WHERE artist_id = ${artistId}
    `

    return {
      success: true,
      vaultInfo,
      stats: transactions[0],
    }
  } catch (error) {
    console.error("[v0] Error getting vault stats:", error)
    return { success: false, error: "Failed to fetch vault statistics" }
  }
}

export async function getUserVaultPosition(artistId: number) {
  try {
    const user = await getUserFromToken()

    if (!user.stellar_public_key && !user.wallet_address) {
      return {
        success: false,
        error: "Please connect a wallet first",
        position: { shares: "0", assets: "0", percentageOfVault: "0.00" },
      }
    }

    const publicKey = user.stellar_public_key || user.wallet_address
    const position = await stellarVault.getUserPosition(publicKey as string, artistId)

    return {
      success: true,
      position,
    }
  } catch (error) {
    console.error("[v0] Error getting user position:", error)
    return {
      success: false,
      error: "Failed to fetch vault position",
      position: { shares: "0", assets: "0", percentageOfVault: "0.00" },
    }
  }
}

export async function depositToVault(artistId: number, amount: string) {
  try {
    const user = await getUserFromToken()

    if (!user.stellar_public_key && !user.wallet_address) {
      return { success: false, error: "Please connect a wallet first" }
    }

    const publicKey = user.stellar_public_key || user.wallet_address

    // Generate transaction XDR
    const txXDR = await stellarVault.deposit(publicKey as string, artistId, amount)

    // Record intent in database (actual stake recorded after blockchain confirmation)
    await sql`
      INSERT INTO vault_stakes (supporter_id, artist_id, amount, status)
      VALUES (${user.id}, ${artistId}, ${amount}, 'pending')
    `

    return {
      success: true,
      txXDR, // Client will sign and submit this
      message: "Please sign the transaction in your wallet",
    }
  } catch (error) {
    console.error("[v0] Error depositing to vault:", error)
    return { success: false, error: "Failed to create deposit transaction" }
  }
}

export async function withdrawFromVault(artistId: number, shares: string) {
  try {
    const user = await getUserFromToken()

    if (!user.stellar_public_key && !user.wallet_address) {
      return { success: false, error: "Please connect a wallet first" }
    }

    const publicKey = user.stellar_public_key || user.wallet_address

    // Generate transaction XDR
    const txXDR = await stellarVault.withdraw(publicKey as string, artistId, shares)

    // Update stake status in database
    await sql`
      UPDATE vault_stakes
      SET status = 'unstaking'
      WHERE supporter_id = ${user.id} 
      AND artist_id = ${artistId}
      AND status = 'active'
    `

    return {
      success: true,
      txXDR,
      message: "Please sign the transaction in your wallet",
    }
  } catch (error) {
    console.error("[v0] Error withdrawing from vault:", error)
    return { success: false, error: "Failed to create withdrawal transaction" }
  }
}

export async function previewDepositShares(artistId: number, amount: string) {
  try {
    const shares = await stellarVault.previewDeposit(artistId, amount)
    return { success: true, shares }
  } catch (error) {
    return { success: false, error: "Failed to preview deposit" }
  }
}

export async function previewWithdrawAssets(artistId: number, shares: string) {
  try {
    const assets = await stellarVault.previewWithdraw(artistId, shares)
    return { success: true, assets }
  } catch (error) {
    return { success: false, error: "Failed to preview withdrawal" }
  }
}
