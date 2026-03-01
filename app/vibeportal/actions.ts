"use server"

// Server actions for VibePortal to keep API keys secure

import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

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

export async function randomizePromptAction(prompt: string, remixVariety: number) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  let instruction = ""
  let content = ""

  if (prompt.trim()) {
    // Dynamic instruction based on Remix Variety slider
    if (remixVariety < 33) {
      instruction =
        "You are a precision prompt editor. Your task is to take the provided image prompt and change ONLY 1 specific detail (such as a material, a location, or a color) while keeping the rest of the text, sentence structure, artistic style, and camera settings EXACTLY the same. Do not summarize or shorten the prompt. Return the full modified prompt."
    } else if (remixVariety < 66) {
      instruction =
        "You are a creative prompt editor. Take the provided prompt and create a variation of the scene. Keep the core subject and artistic style, but change details like the background, lighting, time of day, or camera angle. Keep the same length and format."
    } else {
      instruction =
        "You are a radical creative director. Reimagining the scene. Keep the same artistic 'vibe', medium (e.g. film stock), and genre, but create a totally different subject or composition based on the original concept. Be bold and creative."
    }
    content = `Original Prompt: ${prompt}`
  } else {
    instruction =
      "Write a creative, highly visual image generation prompt for a cinematic scene. Keep it interesting but concise (under 30 words)."
    content = "Generate a prompt."
  }

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${instruction}\n\n${content}` }],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    return data.candidates[0].content.parts[0].text.trim()
  } catch (error) {
    console.error("[v0] Randomize prompt error:", error)
    throw error
  }
}

export async function refinePromptAction(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const instruction =
    "You are an expert photographer and prompt engineer. Your task is to enhance the user's prompt to be more descriptive, vivid, and effective for high-quality image generation. Improve the vocabulary, specify lighting and textures, and correct any clarity issues. CRITICAL: Do NOT change the subject matter, the artistic style (if specified), or the core meaning. Just make the existing idea sound professional and 'high fidelity'. Keep it under 50 words."
  const content = prompt.trim()
    ? `Original Prompt: ${prompt}`
    : "Generate a highly detailed, professional photography prompt for a random beautiful scene."

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${instruction}\n\n${content}` }],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    return data.candidates[0].content.parts[0].text.trim()
  } catch (error) {
    console.error("[v0] Refine prompt error:", error)
    throw error
  }
}

export async function extractStyleFromImageAction(base64Data: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Analyze this image's artistic style, color palette, lighting, texture, and medium in extreme detail. Provide a paragraph describing ONLY the visual style so an AI can replicate this 'vibe' perfectly. Do not describe the subject matter unless it is integral to the style (e.g. 'cyberpunk').",
                },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("[v0] Extract style from image error:", error)
    throw error
  }
}

export async function generateImageWithImagenAction(
  promptText: string,
  referenceImage?: { base64Data: string; mimeType: string },
) {
  const usageCheck = await checkAIUsage("vibeportal")
  if (!usageCheck.allowed) {
    throw new Error(
      `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} AI image generations today. Try again tomorrow!`,
    )
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  console.log("[v0] Starting Gemini image generation...")
  console.log("[v0] Prompt:", promptText.substring(0, 100))
  console.log("[v0] Has reference image:", !!referenceImage)

  // Build the request parts
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      },
      60000, // 60 second timeout for image generation
    )

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error response:", errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Response data keys:", Object.keys(data))

    if (data.error) {
      console.error("[v0] API error:", data.error)
      throw new Error(data.error.message)
    }

    // Extract the base64 image from the response
    const imagePart = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)

    if (!imagePart?.inlineData?.data) {
      console.error(
        "[v0] No image data in response. Response structure:",
        JSON.stringify(data, null, 2).substring(0, 500),
      )
      throw new Error("No image data in response")
    }

    await incrementAIUsage("vibeportal")

    console.log("[v0] Image generated successfully, size:", imagePart.inlineData.data.length, "bytes")
    return `data:image/png;base64,${imagePart.inlineData.data}`
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    throw error
  }
}
