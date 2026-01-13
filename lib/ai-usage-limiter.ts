"use server"
import { cookies } from "next/headers"
import { AI_DAILY_LIMITS, BANDCOIN_COSTS } from "./ai-limits-config"
import { neon } from "@neondatabase/serverless"
import { getStellarBandCoinBalance } from "./stellar-balance"

const sql = neon(process.env.DATABASE_URL!)

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
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
  const sessionId = await getSessionId()
  const dailyLimit = AI_DAILY_LIMITS[feature] || 10

  const result = await sql`
    SELECT usage_count 
    FROM ai_usage 
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
  const sessionId = await getSessionId()

  await sql`
    INSERT INTO ai_usage (session_id, feature, usage_date, usage_count)
    VALUES (${sessionId}, ${feature}, CURRENT_DATE, 1)
    ON CONFLICT (session_id, feature, usage_date)
    DO UPDATE SET 
      usage_count = ai_usage.usage_count + 1,
      updated_at = NOW()
  `
}

export async function getAIUsageStatus(): Promise<
  Record<
    string,
    {
      currentUsage: number
      dailyLimit: number
      remaining: number
    }
  >
> {
  const sessionId = await getSessionId()

  const result = await sql`
    SELECT feature, usage_count 
    FROM ai_usage 
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
  const result = await sql`
    SELECT usage_count 
    FROM ai_usage 
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
  await sql`
    INSERT INTO ai_usage (session_id, feature, usage_date, usage_count)
    VALUES (${sessionId}, ${feature}, CURRENT_DATE, 1)
    ON CONFLICT (session_id, feature, usage_date)
    DO UPDATE SET 
      usage_count = ai_usage.usage_count + 1,
      updated_at = NOW()
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
  const sessionId = await getSessionId()
  const dailyLimit = AI_DAILY_LIMITS[feature] || 10
  const bandcoinCost = BANDCOIN_COSTS[feature] || 5

  console.log("[v0] ========== CHECK AI USAGE ==========")
  console.log("[v0] Feature:", feature)
  console.log("[v0] Session ID:", sessionId)
  console.log("[v0] Daily limit:", dailyLimit, "Cost:", bandcoinCost)

  // Check daily free usage
  const usageResult = await sql`
    SELECT usage_count 
    FROM ai_usage 
    WHERE session_id = ${sessionId} 
      AND feature = ${feature} 
      AND usage_date = CURRENT_DATE
  `

  const currentUsage = usageResult[0]?.usage_count || 0
  const remaining = Math.max(0, dailyLimit - currentUsage)
  const usedFreeLimit = currentUsage >= dailyLimit

  console.log("[v0] Free usage - Current:", currentUsage, "Remaining:", remaining, "Used limit:", usedFreeLimit)

  const userResult = await sql`
    SELECT stellar_address, total_tokens, withdrawn_tokens, pending_withdrawals
    FROM reward_users
    WHERE session_id = ${sessionId}
  `

  console.log("[v0] User query result:", userResult.length > 0 ? "Found" : "Not found")

  const user = userResult[0]
  let onChainBalance = 0
  let bandcoinBalance = 0

  if (user?.stellar_address) {
    console.log("[v0] User found with stellar_address:", user.stellar_address)
    console.log("[v0] Fetching on-chain balance...")
    onChainBalance = await getStellarBandCoinBalance(user.stellar_address)
    bandcoinBalance = onChainBalance
    console.log("[v0] On-chain BANDCOIN balance:", onChainBalance)
  } else {
    console.log("[v0] ⚠️ No user with stellar_address found - user needs to connect wallet")
  }

  // Fallback to database balance if no on-chain balance
  if (bandcoinBalance === 0 && user) {
    bandcoinBalance =
      Number.parseFloat(user.total_tokens || "0") -
      Number.parseFloat(user.withdrawn_tokens || "0") -
      Number.parseFloat(user.pending_withdrawals || "0")
    console.log("[v0] Using database balance:", bandcoinBalance)
  }

  const canAfford = bandcoinBalance >= bandcoinCost

  console.log("[v0] Final check - Can afford:", canAfford, "(", bandcoinBalance, "BC >=", bandcoinCost, "BC )")
  console.log("[v0] Result - Allowed:", !usedFreeLimit || canAfford)
  console.log("[v0] ======================================")

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
  const sessionId = await getSessionId()
  const bandcoinCost = BANDCOIN_COSTS[feature] || 5

  // Get user
  const userResult = await sql`
    SELECT id, total_tokens, withdrawn_tokens, pending_withdrawals
    FROM reward_users
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

  // Deduct BandCoins by increasing withdrawn_tokens
  await sql`
    UPDATE reward_users
    SET withdrawn_tokens = withdrawn_tokens + ${bandcoinCost}
    WHERE id = ${user.id}
  `

  // Log the spending
  await sql`
    INSERT INTO reward_activities (user_id, activity_type, app_name, tokens_earned, metadata)
    VALUES (${user.id}, 'bandcoin_spent', ${feature}, ${-bandcoinCost}, ${JSON.stringify({ cost: bandcoinCost })})
  `

  return { success: true, newBalance: currentBalance - bandcoinCost }
}

export async function addBandCoin(sessionId: string, amount: number, source = "purchase"): Promise<boolean> {
  try {
    // Get or create user
    const userResult = await sql`
      INSERT INTO reward_users (session_id, total_tokens, level, last_active)
      VALUES (${sessionId}, ${amount}, 1, NOW())
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        total_tokens = reward_users.total_tokens + ${amount},
        last_active = NOW()
      RETURNING id
    `

    const userId = userResult[0].id

    // Log the addition
    await sql`
      INSERT INTO reward_activities (user_id, activity_type, app_name, tokens_earned, metadata)
      VALUES (${userId}, 'bandcoin_purchased', NULL, ${amount}, ${JSON.stringify({ source, amount })})
    `

    return true
  } catch (error) {
    console.error("[v0] Error adding BandCoin:", error)
    return false
  }
}
