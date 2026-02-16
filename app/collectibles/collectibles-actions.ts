"use server"

import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { checkAIUsageWithBandCoin, incrementUsage } from "@/lib/ai-usage-limiter"
import { checkUserAuthentication } from "@/lib/auth-check"
import { verifyPaymentByBalance } from "@/lib/stellar-payment"
import { getRequiredEnv } from "@/lib/env-validator"

const sql = neon(getRequiredEnv('DATABASE_URL'))

export async function getOrCreateSession() {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  return sessionId
}

export async function checkCollectiblesUsage() {
  return await checkAIUsageWithBandCoin("collectibles")
}

export async function generateCollectiblesPrompt(
  name: string,
  theme: string,
  material: string,
  shape: string,
  style: string,
  referencePhoto?: string | null,
): Promise<{ success: boolean; prompt?: string; error?: string; remaining?: number; requiresPayment?: boolean }> {
  const auth = await checkUserAuthentication()
  if (!auth.isAuthenticated) {
    return {
      success: false,
      error: "Please connect your wallet or sign in to generate collectibles.",
      remaining: 0,
    }
  }

  const usage = await checkAIUsageWithBandCoin("collectibles")

  if (!usage.allowed) {
    return {
      success: false,
      error: `You've reached your free daily limit. You need 15 BC to continue.`,
      remaining: 0,
    }
  }

  let requiresPayment = false
  if (usage.usedFreeLimit && usage.canAfford) {
    requiresPayment = true
  } else if (!usage.usedFreeLimit) {
    // Increment free usage
    await incrementUsage(await getOrCreateSession(), "collectibles")
  }

  try {
    const referenceContext = referencePhoto
      ? `\n\nThe user has provided a reference image. Incorporate visual elements, colors, patterns, or themes from the reference into the token design while maintaining the specified material and style.`
      : ""

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Create a detailed image generation prompt for a collectible token/coin with these specifications:
      - Name: ${name}
      - Theme: ${theme}
      - Material: ${material}
      - Shape: ${shape}
      - Art Style: ${style}${referenceContext}
      
      Create a prompt that will generate a beautiful, detailed collectible token image. The prompt should describe:
      - The token's appearance from a 3/4 angle view
      - Intricate details, engravings, and embossing
      - Lighting that emphasizes the material (metallic sheen, gem sparkle, etc.)
      - A dark gradient background that makes the token stand out
      - Professional product photography style
      ${referencePhoto ? "- Elements inspired by the user's reference image" : ""}
      
      Return ONLY the image prompt, nothing else. Make it around 100-150 words.`,
    })

    return {
      success: true,
      prompt: text,
      remaining: requiresPayment ? usage.remaining : usage.remaining - 1,
      requiresPayment,
    }
  } catch (error: any) {
    console.error("Error generating collectibles prompt:", error)
    return {
      success: false,
      error: "Failed to generate collectible design. Please try again.",
    }
  }
}

export async function saveCollectible(data: {
  name: string
  description: string
  prompt: string
  material: string
  shape: string
  colorPalette: string
  rarity: string
  imageUrl?: string
  walletAddress?: string
}): Promise<{ success: boolean; collectible?: any; error?: string }> {
  const sessionId = await getOrCreateSession()

  try {
    // Get user's wallet address from rewards system
    const cookieStore = await cookies()
    const rewardSessionId = cookieStore.get("session_id")?.value

    if (!rewardSessionId) {
      return {
        success: false,
        error: "Please connect your wallet to save collectibles.",
      }
    }

    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${rewardSessionId}
    `

    const walletAddress = userResult[0]?.stellar_address

    if (!walletAddress) {
      return {
        success: false,
        error: "Please connect your Stellar wallet to save collectibles.",
      }
    }

    // Increment usage when saving
    await incrementUsage(sessionId, "collectibles")

    // Determine rarity based on randomness
    const rarityRoll = Math.random()
    let rarity = "common"
    if (rarityRoll > 0.95) rarity = "legendary"
    else if (rarityRoll > 0.85) rarity = "epic"
    else if (rarityRoll > 0.7) rarity = "rare"
    else if (rarityRoll > 0.5) rarity = "uncommon"

    const result = await sql`
      INSERT INTO keepsake_tokens (
        session_id, wallet_address, name, description, prompt, 
        material, shape, color_palette, rarity, image_url, metadata
      ) VALUES (
        ${sessionId}, ${walletAddress}, ${data.name}, 
        ${data.description}, ${data.prompt}, ${data.material}, 
        ${data.shape}, ${data.colorPalette}, ${rarity}, 
        ${data.imageUrl || null}, ${JSON.stringify({ style: data.colorPalette })}
      )
      RETURNING *
    `

    return {
      success: true,
      collectible: result[0],
    }
  } catch (error: any) {
    console.error("Error saving collectible:", error)
    return {
      success: false,
      error: "Failed to save collectible. Please try again.",
    }
  }
}

export async function getMyCollectibles(): Promise<{ success: boolean; collectibles?: any[]; error?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return {
        success: true,
        collectibles: [],
      }
    }

    // Get wallet address from rewards system
    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId}
    `

    const walletAddress = userResult[0]?.stellar_address

    if (!walletAddress) {
      // No wallet connected = no collectibles shown
      return {
        success: true,
        collectibles: [],
      }
    }

    const collectibles = await sql`
      SELECT * FROM keepsake_tokens 
      WHERE wallet_address = ${walletAddress}
      ORDER BY created_at DESC
    `

    return {
      success: true,
      collectibles: collectibles as any[],
    }
  } catch (error: any) {
    console.error("Error fetching collectibles:", error)
    return {
      success: false,
      collectibles: [],
      error: "Failed to load collectibles.",
    }
  }
}

export async function getPublicCollectibles(): Promise<{ success: boolean; collectibles?: any[]; error?: string }> {
  try {
    const collectibles = await sql`
      SELECT id, name, description, material, shape, color_palette, rarity, image_url, created_at
      FROM keepsake_tokens 
      WHERE image_url IS NOT NULL
      ORDER BY 
        CASE rarity 
          WHEN 'legendary' THEN 1 
          WHEN 'epic' THEN 2 
          WHEN 'rare' THEN 3 
          WHEN 'uncommon' THEN 4 
          ELSE 5 
        END,
        created_at DESC
      LIMIT 50
    `

    return {
      success: true,
      collectibles: collectibles as any[],
    }
  } catch (error: any) {
    console.error("Error fetching public collectibles:", error)
    return {
      success: false,
      error: "Failed to load gallery.",
    }
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`)
    }
    throw error
  }
}

export async function generateCollectibleImage(
  promptText: string,
  referenceImage?: { base64Data: string; mimeType: string },
): Promise<{ success: boolean; imageUrls?: string[]; error?: string; remaining?: number }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY not configured",
    }
  }

  console.log("[v0] Starting Gemini collectible image generation (1 image)...")
  console.log("[v0] Prompt:", promptText.substring(0, 100))
  console.log("[v0] Has reference image:", !!referenceImage)

  const parts: any[] = [{ text: promptText }]

  if (referenceImage) {
    console.log("[v0] Reference image type:", referenceImage.mimeType)
    console.log("[v0] Reference image size:", referenceImage.base64Data.length, "bytes")
    parts.push({
      inlineData: {
        mimeType: referenceImage.mimeType,
        data: referenceImage.base64Data,
      },
    })
  }

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                ...(referenceImage
                  ? [
                      {
                        inlineData: {
                          mimeType: referenceImage.mimeType,
                          data: referenceImage.base64Data,
                        },
                      },
                    ]
                  : []),
              ],
            },
          ],
        }),
      },
      60000,
    )

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error response:", errorText)
      return {
        success: false,
        error: "Failed to generate image",
      }
    }

    const data = await response.json()

    if (data.error) {
      console.error("[v0] API error:", data.error)
      return {
        success: false,
        error: data.error.message || "Failed to generate image",
      }
    }

    const imagePart = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)

    if (!imagePart?.inlineData?.data) {
      return {
        success: false,
        error: "No image data in response",
      }
    }

    const imageUrl = `data:image/png;base64,${imagePart.inlineData.data}`
    console.log("[v0] Image generated successfully")

    return {
      success: true,
      imageUrls: [imageUrl],
    }
  } catch (error: any) {
    console.error("[v0] Image generation error:", error)
    return {
      success: false,
      error: error.message || "Failed to generate image",
    }
  }
}

export async function verifyCollectiblePayment(
  transactionHash: string,
  userWallet: string,
  previousBalance: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Verifying payment by balance change...")
    console.log("[v0] Transaction hash:", transactionHash)
    console.log("[v0] User wallet:", userWallet)
    console.log("[v0] Previous balance:", previousBalance)

    // Wait a moment for the transaction to settle
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const isValid = await verifyPaymentByBalance(userWallet, previousBalance, 15)

    if (!isValid) {
      console.error("[v0] Payment verification failed - balance did not decrease by 15 BC")
      return {
        success: false,
        error: "Payment verification failed. Balance did not decrease by expected amount.",
      }
    }

    console.log("[v0] Payment verified successfully by balance check")

    const sessionId = await getOrCreateSession()

    // Record the paid usage
    await incrementUsage(sessionId, "collectibles")

    // Store transaction hash for audit trail
    await sql`
      INSERT INTO ai_payment_transactions (session_id, feature, amount, transaction_hash, created_at)
      VALUES (${sessionId}, 'collectibles', 15, ${transactionHash}, NOW())
      ON CONFLICT (transaction_hash) DO NOTHING
    `

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error verifying payment:", error)
    return {
      success: false,
      error: error.message || "Failed to verify payment",
    }
  }
}

export async function deleteCollectible(collectibleId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return {
        success: false,
        error: "Please connect your wallet to delete collectibles.",
      }
    }

    // Get wallet address from rewards system
    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId}
    `

    const walletAddress = userResult[0]?.stellar_address

    if (!walletAddress) {
      return {
        success: false,
        error: "Please connect your Stellar wallet to delete collectibles.",
      }
    }

    const result = await sql`
      DELETE FROM keepsake_tokens 
      WHERE id = ${collectibleId} AND wallet_address = ${walletAddress}
      RETURNING id
    `

    if (result.length === 0) {
      return {
        success: false,
        error: "Collectible not found or you don't have permission to delete it.",
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error deleting collectible:", error)
    return {
      success: false,
      error: "Failed to delete collectible. Please try again.",
    }
  }
}

export async function sendCollectible(
  collectibleId: number,
  recipientWalletAddress: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return {
        success: false,
        error: "Please connect your wallet to send collectibles.",
      }
    }

    // Get sender's wallet address
    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId}
    `

    const senderWallet = userResult[0]?.stellar_address

    if (!senderWallet) {
      return {
        success: false,
        error: "Please connect your Stellar wallet to send collectibles.",
      }
    }

    // Validate recipient wallet address format (basic Stellar address validation)
    if (!recipientWalletAddress.match(/^G[A-Z0-9]{55}$/)) {
      return {
        success: false,
        error: "Invalid recipient wallet address format.",
      }
    }

    // Check if recipient exists in the system (they must have connected at least once)
    const recipientCheck = await sql`
      SELECT stellar_address FROM reward_users WHERE stellar_address = ${recipientWalletAddress}
    `

    if (recipientCheck.length === 0) {
      return {
        success: false,
        error: "Recipient wallet not found. They must connect their wallet to the platform first.",
      }
    }

    // Transfer ownership by updating wallet_address
    const result = await sql`
      UPDATE keepsake_tokens 
      SET wallet_address = ${recipientWalletAddress},
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{transfer_history}',
            COALESCE(metadata->'transfer_history', '[]'::jsonb) || 
            jsonb_build_array(jsonb_build_object(
              'from', ${senderWallet},
              'to', ${recipientWalletAddress},
              'timestamp', NOW()
            ))
          )
      WHERE id = ${collectibleId} AND wallet_address = ${senderWallet}
      RETURNING id, name
    `

    if (result.length === 0) {
      return {
        success: false,
        error: "Collectible not found or you don't have permission to send it.",
      }
    }

    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error sending collectible:", error)
    return {
      success: false,
      error: "Failed to send collectible. Please try again.",
    }
  }
}
