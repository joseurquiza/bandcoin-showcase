"use server"
import { cookies } from "next/headers"
import { AI_DAILY_LIMITS, BANDCOIN_COSTS } from "./ai-limits-config"
import { getDb } from "./db"
import { getStellarBandCoinBalance } from "./stellar-balance"

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })
  }

  return sessionId
}

export async function checkAIUsage(feature: string): Promise<{
  allowed: boolean
  currentUsage: number
  dailyLimit: number
  remaining: number
}> {
  const sql = getDb()
  const sessionId = await getSessionId()
  const dailyLimit = AI_DAILY_LIMITS[feature] || 10

  const result = await sql`
    SELECT usage_count 
    FROM showcase_ai_usage 
    WHERE session_id = ${sessionId} 
      AND feature = ${feature} 
      AND usage_date = CURRENT_DATE
  `

  const currentUsage = result[0]?.usage_count || 0
  const remaining = Math.max(0, dailyLimit - currentUsage)

  return {
    allowed: currentUsage < dailyLimit,
    currentUsage,
    dailyLimit,
    remaining,
  }
}

export async function incrementAIUsage(feature: string): Promise<void> {
  const sql = getDb()
  const sessionId = await getSessionId()

  await sql`
    INSERT INTO showcase_ai_usage (session_id, feature, usage_date, usage_count)
    VALUES (${sessionId}, ${feature}, CURRENT_DATE, 1)
    ON CONFLICT (session_id, feature, usage_date)
    DO UPDATE SET 
      usage_count = showcase_ai_usage.usage_count + 1
  `
}

export async function getAIUsageStatus(): Promise<
  Record<string, { currentUsage: number; dailyLimit: number; remaining: number }>
> {
  const sql = getDb()
  const sessionId = await getSessionId()

  const result = await sql`
    SELECT feature, usage_count 
    FROM showcase_ai_usage 
    WHERE session_id = ${sessionId} 
      AND usage_date = CURRENT_DATE
  `

  const status: Record<string, { currentUsage: number; dailyLimit: number; remaining: number }> = {}

  for (const feature of Object.keys(AI_DAILY_LIMITS)) {
    const usage = result.find((r: any) => r.feature === feature)
    const currentUsage = usage?.usage_count || 0
    const dailyLimit = AI_DAILY_LIMITS[feature]
    status[feature] = {
      currentUsage,
      dailyLimit,
      remaining: Math.max(0, dailyLimit - currentUsage),
    }
  }

  return status
}

export async function checkUsage(
  sessionId: string,
  feature: string,
  dailyLimit: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const sql = getDb()
  const result = await sql`
    SELECT usage_count 
    FROM showcase_ai_usage 
    WHERE session_id = ${sessionId} 
      AND feature = ${feature} 
      AND usage_date = CURRENT_DATE
  `

  const currentUsage = result[0]?.usage_count || 0
  const remaining = Math.max(0, dailyLimit - currentUsage)

  return {
    allowed: currentUsage < dailyLimit,
    remaining,
  }
}

export async function incrementUsage(sessionId: string, feature: string): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO showcase_ai_usage (session_id, feature, usage_date, usage_count)
    VALUES (${sessionId}, ${feature}, CURRENT_DATE, 1)
    ON CONFLICT (session_id, feature, usage_date)
    DO UPDATE SET 
      usage_count = showcase_ai_usage.usage_count + 1
  `
}

export async function checkAIUsageWithBandCoin(feature: string): Promise<{
  allowed: boolean
  usedFreeLimit: boolean
  currentUsage: number
  dailyLimit: number
  remaining: number
  bandcoinBalance: number
  onChainBalance: number
  bandcoinCost: number
  canAfford: boolean
  stellarAddress?: string
}> {
  const sql = getDb()
  const sessionId = await getSessionId()
  const dailyLimit = AI_DAILY_LIMITS[feature] || 10
  const bandcoinCost = BANDCOIN_COSTS[feature] || 5

  const usageResult = await sql`
    SELECT usage_count 
    FROM showcase_ai_usage 
    WHERE session_id = ${sessionId} 
      AND feature = ${feature} 
      AND usage_date = CURRENT_DATE
  `

  const currentUsage = usageResult[0]?.usage_count || 0
  const remaining = Math.max(0, dailyLimit - currentUsage)
  const usedFreeLimit = currentUsage >= dailyLimit

  const userResult = await sql`
    SELECT stellar_address, total_tokens, withdrawn_tokens, pending_withdrawals
    FROM showcase_reward_users
    WHERE session_id = ${sessionId}
  `

  const user = userResult[0]
  let onChainBalance = 0
  let bandcoinBalance = 0

  if (user?.stellar_address) {
    onChainBalance = await getStellarBandCoinBalance(user.stellar_address)
    bandcoinBalance = onChainBalance
  }

  if (bandcoinBalance === 0 && user) {
    bandcoinBalance =
      Number.parseFloat(user.total_tokens || "0") -
      Number.parseFloat(user.withdrawn_tokens || "0") -
      Number.parseFloat(user.pending_withdrawals || "0")
  }

  const canAfford = bandcoinBalance >= bandcoinCost

  return {
    allowed: !usedFreeLimit || canAfford,
    usedFreeLimit,
    currentUsage,
    dailyLimit,
    remaining,
    bandcoinBalance,
    onChainBalance,
    bandcoinCost,
    canAfford,
    stellarAddress: user?.stellar_address || undefined,
  }
}

export async function spendBandCoin(feature: string): Promise<{ success: boolean; newBalance: number }> {
  const sql = getDb()
  const sessionId = await getSessionId()
  const bandcoinCost = BANDCOIN_COSTS[feature] || 5

  const userResult = await sql`
    SELECT id, total_tokens, withdrawn_tokens, pending_withdrawals
    FROM showcase_reward_users
    WHERE session_id = ${sessionId}
  `

  if (!userResult[0]) {
    return { success: false, newBalance: 0 }
  }

  const user = userResult[0]
  const currentBalance =
    Number.parseFloat(user.total_tokens) -
    Number.parseFloat(user.withdrawn_tokens || "0") -
    Number.parseFloat(user.pending_withdrawals || "0")

  if (currentBalance < bandcoinCost) {
    return { success: false, newBalance: currentBalance }
  }

  await sql`
    UPDATE showcase_reward_users
    SET withdrawn_tokens = withdrawn_tokens + ${bandcoinCost}
    WHERE id = ${user.id}
  `

  await sql`
    INSERT INTO showcase_reward_activities (user_id, activity_type, app_name, tokens_earned, metadata)
    VALUES (${user.id}, 'bandcoin_spent', ${feature}, ${-bandcoinCost}, ${JSON.stringify({ cost: bandcoinCost })})
  `

  return { success: true, newBalance: currentBalance - bandcoinCost }
}

export async function addBandCoin(sessionId: string, amount: number, source = "purchase"): Promise<boolean> {
  try {
    const sql = getDb()
    const userResult = await sql`
      INSERT INTO showcase_reward_users (session_id, total_tokens, level, last_active)
      VALUES (${sessionId}, ${amount}, 1, NOW())
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        total_tokens = showcase_reward_users.total_tokens + ${amount},
        last_active = NOW()
      RETURNING id
    `

    const userId = userResult[0].id

    await sql`
      INSERT INTO showcase_reward_activities (user_id, activity_type, app_name, tokens_earned, metadata)
      VALUES (${userId}, 'bandcoin_purchased', NULL, ${amount}, ${JSON.stringify({ source, amount })})
    `

    return true
  } catch (error) {
    console.error("Error adding BandCoin:", error)
    return false
  }
}
