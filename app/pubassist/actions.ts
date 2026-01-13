"use server"

import { generateText } from "ai"
import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

interface WorkData {
  title?: string
  duration?: string
  writers?: string[]
  composers?: string[]
  publishers?: string[]
  iswc?: string
  isrc?: string
  releaseDate?: string
  genre?: string
  hasAI?: boolean
  hasSamples?: boolean
  sampleDetails?: string
  performanceType?: string
}

export async function askPubAssistantAction(userInput: string, currentData: WorkData) {
  try {
    const auth = await checkUserAuthentication()
    if (!auth.isAuthenticated) {
      return {
        message: "Please connect your wallet or sign in to use AI assistance.",
        workData: currentData,
        isComplete: false,
        authRequired: true,
      }
    }

    const usageCheck = await checkAIUsage("pubassist")
    if (!usageCheck.allowed) {
      return {
        message: `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} AI assists today. Try again tomorrow!`,
        workData: currentData,
        isComplete: false,
        limitReached: true,
      }
    }

    const systemPrompt = `You are a helpful Publishing Assistant helping musicians register songs with ASCAP or BMI.

CURRENT WORK DATA (DO NOT ask for information already provided):
${JSON.stringify(currentData, null, 2)}

REQUIRED FIELDS:
1. Song Title ${currentData.title ? "✓ PROVIDED" : "✗ MISSING"}
2. Duration (MM:SS format) ${currentData.duration ? "✓ PROVIDED" : "✗ MISSING"}
3. Writers/Authors (full legal names) ${currentData.writers?.length ? "✓ PROVIDED" : "✗ MISSING"}
4. Release Date ${currentData.releaseDate ? "✓ PROVIDED" : "✗ MISSING"}
5. Genre ${currentData.genre ? "✓ PROVIDED" : "✗ MISSING"}

OPTIONAL FIELDS:
- Composers (if different from writers) ${currentData.composers?.length ? "✓ PROVIDED" : ""}
- Publishers ${currentData.publishers?.length ? "✓ PROVIDED" : ""}
- ISWC code ${currentData.iswc ? "✓ PROVIDED" : ""}
- ISRC code ${currentData.isrc ? "✓ PROVIDED" : ""}
- AI usage ${currentData.hasAI !== undefined ? "✓ PROVIDED" : ""}
- Samples used ${currentData.hasSamples !== undefined ? "✓ PROVIDED" : ""}

INSTRUCTIONS:
1. Extract ALL relevant data from the user's response
2. Update the work data with extracted information
3. NEVER ask for information that's already been provided
4. Ask for the next missing required field
5. If all required fields are complete, say "All required information collected! Would you like to add any optional details, or are you ready to download your CSV?"

Respond in JSON format:
{
  "message": "your conversational response",
  "extractedData": {
    // any data extracted from user input
  },
  "nextQuestion": "next question to ask" or null if complete
}`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `${systemPrompt}\n\nUser input: ${userInput}`,
    })

    console.log("[v0] AI Response:", text)

    await incrementAIUsage("pubassist")

    let parsedResponse: any
    try {
      const cleanJSON = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      parsedResponse = JSON.parse(cleanJSON)
    } catch (e) {
      console.error("[v0] Failed to parse AI response:", e)
      return {
        message: text,
        workData: currentData,
        isComplete: false,
      }
    }

    const updatedData = { ...currentData }

    if (parsedResponse.extractedData) {
      Object.keys(parsedResponse.extractedData).forEach((key) => {
        const value = parsedResponse.extractedData[key]
        if (value !== null && value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            const existing = updatedData[key as keyof WorkData]
            if (Array.isArray(existing)) {
              updatedData[key as keyof WorkData] = [...existing, ...value] as any
            } else {
              updatedData[key as keyof WorkData] = value as any
            }
          } else {
            updatedData[key as keyof WorkData] = value as any
          }
        }
      })
    }

    console.log("[v0] Updated work data:", updatedData)

    const requiredComplete =
      updatedData.title &&
      updatedData.duration &&
      updatedData.writers &&
      updatedData.writers.length > 0 &&
      updatedData.releaseDate &&
      updatedData.genre

    const isComplete = requiredComplete && !parsedResponse.nextQuestion

    return {
      message: parsedResponse.message,
      workData: updatedData,
      isComplete,
    }
  } catch (error) {
    console.error("[v0] Error in askPubAssistantAction:", error)
    throw new Error("Failed to process your request")
  }
}

export async function generateCSVAction(workData: WorkData) {
  const headers = [
    "Title",
    "Duration",
    "Writers",
    "Composers",
    "Publishers",
    "ISWC",
    "ISRC",
    "Release Date",
    "Genre",
    "AI Usage",
    "Samples Used",
    "Sample Details",
    "Performance Type",
  ]

  const values = [
    workData.title || "",
    workData.duration || "",
    workData.writers?.join("; ") || "",
    workData.composers?.join("; ") || "",
    workData.publishers?.join("; ") || "",
    workData.iswc || "",
    workData.isrc || "",
    workData.releaseDate || "",
    workData.genre || "",
    workData.hasAI ? "Yes" : "No",
    workData.hasSamples ? "Yes" : "No",
    workData.sampleDetails || "",
    workData.performanceType || "Original",
  ]

  const escapedValues = values.map((val) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  })

  return `${headers.join(",")}\n${escapedValues.join(",")}`
}
