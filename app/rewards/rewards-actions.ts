"use server"

import { getDb } from "@/lib/db"
import { cookies } from "next/headers"
import { getStellarBandCoinBalance } from "@/lib/stellar-balance"

export async function getOrCreateRewardUser(sessionId: string) {
  const sql = getDb()
  // Use UPSERT to handle concurrent requests atomically
  const users = await sql`
    INSERT INTO reward_users (session_id, total_tokens, level, last_active)
    VALUES (${sessionId}, 0, 1, NOW())
    ON CONFLICT (session_id) 
    DO UPDATE SET last_active = NOW()
    RETURNING *
  `
  return users[0]
}

export async function trackActivity(activityType: string, appName: string | null, metadata: any = {}) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value || `session_${Date.now()}_${Math.random()}`

    if (!cookieStore.get("session_id")) {
      cookieStore.set("session_id", sessionId, { maxAge: 365 * 24 * 60 * 60 })
    }

    const user = await getOrCreateRewardUser(sessionId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayEarnings = await sql`
      SELECT COALESCE(SUM(tokens_earned), 0) as total_today
      FROM reward_activities 
      WHERE user_id = ${user.id} 
      AND created_at >= ${today.toISOString()}
    `

    const dailyTotal = Number.parseFloat(todayEarnings[0].total_today)

    if (dailyTotal >= 1000) {
      return {
        success: false,
        message: "Daily earning limit of 1000 BC reached. Come back tomorrow!",
        tokensEarned: 0,
      }
    }

    // Check if activity is eligible for rewards
    const rules = await sql`
      SELECT * FROM reward_rules 
      WHERE activity_type = ${activityType} 
      AND (app_name = ${appName} OR app_name IS NULL)
      AND is_active = true
    `

    if (rules.length === 0) return { success: false, message: "No reward rule found" }

    const rule = rules[0]

    // Check daily limit for specific activity
    if (rule.max_per_day) {
      const todayActivities = await sql`
        SELECT COUNT(*) as count 
        FROM reward_activities 
        WHERE user_id = ${user.id} 
        AND activity_type = ${activityType}
        AND app_name = ${appName}
        AND created_at >= ${today.toISOString()}
      `

      if (Number.parseInt(todayActivities[0].count) >= rule.max_per_day) {
        return { success: false, message: "Daily limit reached", tokensEarned: 0 }
      }
    }

    let tokensToAward = Number.parseFloat(rule.tokens_awarded)
    const remainingDaily = 1000 - dailyTotal

    if (tokensToAward > remainingDaily) {
      tokensToAward = remainingDaily
    }

    // Award tokens
    await sql`
      INSERT INTO reward_activities (user_id, activity_type, app_name, tokens_earned, metadata)
      VALUES (${user.id}, ${activityType}, ${appName}, ${tokensToAward}, ${JSON.stringify(metadata)})
    `

    const newTotal = Number.parseFloat(user.total_tokens) + tokensToAward
    const newLevel = Math.floor(newTotal / 1000) + 1

    await sql`
      UPDATE reward_users 
      SET total_tokens = ${newTotal}, level = ${newLevel}
      WHERE id = ${user.id}
    `

    return {
      success: true,
      tokensEarned: tokensToAward,
      totalTokens: newTotal,
      level: newLevel,
      description: rule.description,
    }
  } catch (error) {
    console.error("[v0] Error tracking activity:", error)
    return { success: false, message: "Error tracking activity" }
  }
}

export async function getUserRewards() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return {
        totalTokens: 0,
        level: 1,
        activities: [],
        leaderboard: [],
        user: null,
        onChainBalance: 0,
        databaseBalance: 0,
      }
    }

    const user = await getOrCreateRewardUser(sessionId)

    let onChainBalance = 0
    if (user.stellar_address) {
      onChainBalance = await getStellarBandCoinBalance(user.stellar_address)
    }

    const activities = await sql`
      SELECT ra.*, rr.description 
      FROM reward_activities ra
      LEFT JOIN reward_rules rr ON ra.activity_type = rr.activity_type 
        AND (ra.app_name = rr.app_name OR rr.app_name IS NULL)
      WHERE ra.user_id = ${user.id}
      ORDER BY ra.created_at DESC
      LIMIT 50
    `

    const leaderboard = await sql`
      SELECT session_id, display_name, total_tokens, level
      FROM reward_users
      ORDER BY total_tokens DESC
      LIMIT 10
    `

    return {
      totalTokens: onChainBalance > 0 ? onChainBalance : Number.parseFloat(user.total_tokens),
      onChainBalance, // Include both for transparency
      databaseBalance: Number.parseFloat(user.total_tokens),
      level: user.level,
      activities: activities.map((a) => ({
        ...a,
        tokens_earned: Number.parseFloat(a.tokens_earned),
        created_at: new Date(a.created_at).toISOString(),
      })),
      leaderboard: leaderboard.map((u) => ({
        ...u,
        total_tokens: Number.parseFloat(u.total_tokens),
      })),
      user: {
        stellar_address: user.stellar_address,
        eth_address: user.eth_address,
        email: user.email,
        wallet_type: user.wallet_type,
      },
    }
  } catch (error) {
    console.error("[v0] Error getting user rewards:", error)
    return {
      totalTokens: 0,
      level: 1,
      activities: [],
      leaderboard: [],
      user: null,
      onChainBalance: 0,
      databaseBalance: 0,
    }
  }
}

export async function checkDailyBonus() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) return { awarded: false }

    const user = await getOrCreateRewardUser(sessionId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayBonus = await sql`
      SELECT * FROM reward_activities
      WHERE user_id = ${user.id}
      AND activity_type = 'daily_login'
      AND created_at >= ${today.toISOString()}
    `

    if (todayBonus.length > 0) {
      return { awarded: false }
    }

    return await trackActivity("daily_login", null, { date: today.toISOString() })
  } catch (error) {
    console.error("[v0] Error checking daily bonus:", error)
    return { awarded: false }
  }
}

export async function requestWithdrawal(stellarAddress: string, amount: number) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return { success: false, message: "Not authenticated" }
    }

    const user = await getOrCreateRewardUser(sessionId)
    const availableBalance =
      Number.parseFloat(user.total_tokens) -
      Number.parseFloat(user.withdrawn_tokens || "0") -
      Number.parseFloat(user.pending_withdrawals || "0")

    if (amount > availableBalance) {
      return { success: false, message: "Insufficient balance" }
    }

    if (amount < 100) {
      return { success: false, message: "Minimum withdrawal is 100 BC" }
    }

    // Validate Stellar address format (basic check)
    if (!stellarAddress.match(/^G[A-Z0-9]{55}$/)) {
      return { success: false, message: "Invalid Stellar address format" }
    }

    // Create withdrawal request
    await sql`
      INSERT INTO reward_withdrawals (user_id, stellar_address, amount, status)
      VALUES (${user.id}, ${stellarAddress}, ${amount}, 'pending')
    `

    // Update pending withdrawals
    await sql`
      UPDATE reward_users 
      SET pending_withdrawals = pending_withdrawals + ${amount}
      WHERE id = ${user.id}
    `

    return { success: true, message: "Withdrawal request submitted" }
  } catch (error) {
    console.error("[v0] Error requesting withdrawal:", error)
    return { success: false, message: "Error submitting withdrawal request" }
  }
}

export async function getUserWithdrawals() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return []
    }

    const user = await getOrCreateRewardUser(sessionId)

    const withdrawals = await sql`
      SELECT * FROM reward_withdrawals
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return withdrawals.map((w) => ({
      ...w,
      amount: Number.parseFloat(w.amount),
      created_at: new Date(w.created_at).toISOString(),
      processed_at: w.processed_at ? new Date(w.processed_at).toISOString() : null,
    }))
  } catch (error) {
    console.error("[v0] Error getting user withdrawals:", error)
    return []
  }
}

export async function getAvailableBalance() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return 0
    }

    const user = await getOrCreateRewardUser(sessionId)

    if (user.stellar_address) {
      const onChainBalance = await getStellarBandCoinBalance(user.stellar_address)
      if (onChainBalance > 0) {
        return onChainBalance
      }
    }

    // Fallback to database balance
    const availableBalance =
      Number.parseFloat(user.total_tokens) -
      Number.parseFloat(user.withdrawn_tokens || "0") -
      Number.parseFloat(user.pending_withdrawals || "0")

    return availableBalance
  } catch (error) {
    console.error("[v0] Error getting available balance:", error)
    return 0
  }
}

export async function getRewardRules() {
  try {
    const rules = await sql`
      SELECT * FROM reward_rules
      WHERE is_active = true
      ORDER BY tokens_awarded DESC
    `

    return rules.map((rule) => ({
      ...rule,
      tokens_awarded: Number.parseFloat(rule.tokens_awarded),
    }))
  } catch (error) {
    console.error("[v0] Error getting reward rules:", error)
    return []
  }
}

export async function saveWalletAddress(walletAddress: string, walletType: "ethereum" | "stellar" = "stellar") {
  try {
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()}`
      cookieStore.set("session_id", sessionId, { maxAge: 365 * 24 * 60 * 60 })
      console.log("[v0] Created new session_id:", sessionId)
    }

    const user = await getOrCreateRewardUser(sessionId)
    console.log("[v0] saveWalletAddress: user_id:", user.id, "wallet:", walletAddress, "type:", walletType)

    // Update reward user with wallet info
    if (walletType === "stellar") {
      await sql`
        UPDATE reward_users 
        SET stellar_address = ${walletAddress}, wallet_type = ${walletType}
        WHERE id = ${user.id}
      `
    } else {
      await sql`
        UPDATE reward_users 
        SET eth_address = ${walletAddress}, wallet_type = ${walletType}
        WHERE id = ${user.id}
      `
    }

    console.log("[v0] Wallet address saved successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving wallet address:", error)
    return { success: false, error: "Failed to save wallet address" }
  }
}

export async function clearWalletAddress() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return { success: false, error: "Session not found" }
    }

    const user = await getOrCreateRewardUser(sessionId)

    await sql`
      UPDATE reward_users 
      SET stellar_address = NULL, eth_address = NULL, wallet_type = NULL
      WHERE id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Error clearing wallet address:", error)
    return { success: false, error: "Failed to clear wallet address" }
  }
}

export async function getWalletConnection() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return null
    }

    const user = await getOrCreateRewardUser(sessionId)

    if (user.stellar_address || user.eth_address) {
      return {
        address: user.stellar_address || user.eth_address,
        walletType: user.wallet_type,
        chainType: user.stellar_address ? "stellar" : "ethereum",
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error getting wallet connection:", error)
    return null
  }
}
