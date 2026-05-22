"use server"

// Server actions for VibePortal — uses Vercel AI Gateway

import { generateText } from "ai"
import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

const TEXT_MODEL = "google/gemini-3-flash"
const IMAGE_MODEL = "google/gemini-3.1-flash-image-preview"

export async function randomizePromptAction(prompt: string, remixVariety: number) {
  let instruction = ""
  let content = ""

  if (prompt.trim()) {
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
    const { text } = await generateText({
      model: TEXT_MODEL,
      prompt: `${instruction}\n\n${content}`,
    })
    return text.trim()
  } catch (error) {
    console.error("[v0] Randomize prompt error:", error)
    throw error
  }
}

export async function refinePromptAction(prompt: string) {
  const instruction =
    "You are an expert photographer and prompt engineer. Your task is to enhance the user's prompt to be more descriptive, vivid, and effective for high-quality image generation. Improve the vocabulary, specify lighting and textures, and correct any clarity issues. CRITICAL: Do NOT change the subject matter, the artistic style (if specified), or the core meaning. Just make the existing idea sound professional and 'high fidelity'. Keep it under 50 words."
  const content = prompt.trim()
    ? `Original Prompt: ${prompt}`
    : "Generate a highly detailed, professional photography prompt for a random beautiful scene."

  try {
    const { text } = await generateText({
      model: TEXT_MODEL,
      prompt: `${instruction}\n\n${content}`,
    })
    return text.trim()
  } catch (error) {
    console.error("[v0] Refine prompt error:", error)
    throw error
  }
}

export async function extractStyleFromImageAction(base64Data: string, mimeType: string) {
  try {
    const { text } = await generateText({
      model: TEXT_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image's artistic style, color palette, lighting, texture, and medium in extreme detail. Provide a paragraph describing ONLY the visual style so an AI can replicate this 'vibe' perfectly. Do not describe the subject matter unless it is integral to the style (e.g. 'cyberpunk').",
            },
            {
              type: "file",
              data: `data:${mimeType};base64,${base64Data}`,
              mediaType: mimeType,
            },
          ],
        },
      ],
    })
    return text
  } catch (error) {
    console.error("[v0] Extract style from image error:", error)
    throw error
  }
}

export async function generateImageWithImagenAction(
  promptText: string,
  referenceImage?: { base64Data: string; mimeType: string },
  aspectRatio: string = "1:1",
) {
  const usageCheck = await checkAIUsage("vibeportal")
  if (!usageCheck.allowed) {
    throw new Error(
      `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} AI image generations today. Try again tomorrow!`,
    )
  }

  const aspectRatioMap: Record<string, string> = {
    "1:1": "square (1:1 aspect ratio)",
    "4:3": "landscape (4:3 aspect ratio)",
    "3:4": "portrait (3:4 aspect ratio)",
    "16:9": "widescreen (16:9 aspect ratio)",
    "9:16": "vertical/story (9:16 aspect ratio)",
  }
  const aspectLabel = aspectRatioMap[aspectRatio] ?? aspectRatio
  const fullPrompt = `${promptText}\n\nIMPORTANT: Generate this image in ${aspectLabel} format.`

  try {
    const userContent: any[] = [{ type: "text", text: fullPrompt }]
    if (referenceImage) {
      userContent.push({
        type: "file",
        data: `data:${referenceImage.mimeType};base64,${referenceImage.base64Data}`,
        mediaType: referenceImage.mimeType,
      })
    }

    const result = await generateText({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: userContent }],
    })

    // Extract image from generated files
    const imageFile = result.files?.find((f: any) => f.mediaType?.startsWith("image/"))
    if (!imageFile) {
      throw new Error("No image data in response")
    }

    const mediaType = imageFile.mediaType || "image/png"
    const base64 = imageFile.base64 ?? ""

    await incrementAIUsage("vibeportal")

    return `data:${mediaType};base64,${base64}`
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    throw error
  }
}
