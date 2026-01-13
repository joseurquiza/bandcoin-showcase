import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

export async function POST(request: NextRequest) {
  try {
    const auth = await checkUserAuthentication()
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Please connect your wallet or sign in to generate beats.",
          authRequired: true,
        },
        { status: 401 },
      )
    }

    const usageCheck = await checkAIUsage("beat-builder")
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} AI beat generations today. Try again tomorrow!`,
          limitReached: true,
          usage: usageCheck,
        },
        { status: 429 },
      )
    }

    const { prompt, genre, steps } = await request.json()
    const stepsCount = Math.max(1, Number(steps) || 16)

    const systemPrompt = `You are an AI drum pattern generator. Create drum patterns for a step sequencer.

Return ONLY a JSON object with this exact structure:
{
  "pattern": {
    "kick": [array of ${stepsCount} numbers, 0 or 1],
    "snare": [array of ${stepsCount} numbers, 0 or 1],
    "ch": [array of ${stepsCount} numbers, 0 or 1],
    "oh": [array of ${stepsCount} numbers, 0 or 1],
    "tom1": [array of ${stepsCount} numbers, 0 or 1],
    "tom2": [array of ${stepsCount} numbers, 0 or 1],
    "crash": [array of ${stepsCount} numbers, 0 or 1],
    "china": [array of ${stepsCount} numbers, 0 or 1]
  }
}

Rules:
- Arrays MUST have exactly ${stepsCount} elements.
- Values are 0 (no hit) or 1 (hit).
- Make musical, genre-appropriate patterns.

Guidelines by genre:
- House: Four-on-the-floor kick (steps 1,5,9,13,...), snare/clap backbeats, steady hats, crash on bar starts.
- Trap: Syncopated kicks, snares on 5,13,..., dense hats with occasional rolls, sparing crash/china.
- Rock: Kick on 1,9..., snare on 5,13..., steady closed hats, tom fills near bar ends (e.g., last 2–4 steps).
- Techno: Driving kick, minimal snare, evolving hats, occasional crash.
- Funk: Syncopated kick, ghost-like snares (use sparse 1s), complex hat grooves, tasteful tom fills.

Toms and cymbals:
- "tom1" and "tom2" are for fills; prefer hits near bar transitions (last 2–4 steps of each 16-step bar).
- "crash" usually hits at bar starts (step 1 of each 16-step bar).
- "china" is a transition or accent; use rarely, often at the end of a bar.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Create a ${genre || "custom"} drum pattern with ${stepsCount} steps. ${prompt || ""}`,
      temperature: 0.8,
    })

    // Parse the AI response
    let aiPattern
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim()
      aiPattern = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      throw new Error("Invalid AI response format")
    }

    // Validate the pattern structure
    const p = aiPattern?.pattern
    const keys = ["kick", "snare", "ch", "oh", "tom1", "tom2", "crash", "china"] as const
    for (const k of keys) {
      if (!Array.isArray(p?.[k]) || p[k].length !== stepsCount) {
        throw new Error(`Invalid or missing "${k}" array`)
      }
    }

    // Ensure all values are 0 or 1
    const toBin = (v: any) => (Number(v) > 0 ? 1 : 0)
    const sanitizedPattern = Object.fromEntries(keys.map((k) => [k, p[k].map(toBin)])) as Record<
      (typeof keys)[number],
      number[]
    >

    await incrementAIUsage("beat-builder")

    return NextResponse.json({
      success: true,
      pattern: sanitizedPattern,
      usage: {
        remaining: usageCheck.remaining - 1,
        dailyLimit: usageCheck.dailyLimit,
      },
    })
  } catch (error) {
    console.error("AI beat generation error:", error)
    const { prompt, genre, steps } = await request.json().catch(() => ({}))
    const stepsCount = Math.max(1, Number(steps) || 16)
    const fallbackPattern = generateFallbackPattern(genre || "house", stepsCount)
    return NextResponse.json({
      success: true,
      pattern: fallbackPattern,
      fallback: true,
    })
  }
}

function generateFallbackPattern(genre: string, steps: number) {
  const zeros = () => new Array(steps).fill(0)
  const pattern = {
    kick: zeros(),
    snare: zeros(),
    ch: zeros(),
    oh: zeros(),
    tom1: zeros(),
    tom2: zeros(),
    crash: zeros(),
    china: zeros(),
  }

  const isBackbeat = (i: number) => i % 8 === 4
  const isEighth = (i: number) => i % 2 === 0
  const isBarStart = (i: number) => i % 16 === 0
  const barPos = (i: number) => i % 16

  switch (genre.toLowerCase()) {
    case "house": {
      for (let i = 0; i < steps; i++) {
        if (i % 4 === 0) pattern.kick[i] = 1
        if (isBackbeat(i)) pattern.snare[i] = 1
        if (isEighth(i)) pattern.ch[i] = Math.random() > 0.25 ? 1 : 0
        if (i % 4 === 2 && Math.random() > 0.7) pattern.oh[i] = 1
        if (isBarStart(i) && Math.random() > 0.4) pattern.crash[i] = 1
        if (barPos(i) >= 12 && Math.random() > 0.85) pattern.tom1[i] = 1
        if (barPos(i) >= 14 && Math.random() > 0.8) pattern.tom2[i] = 1
        if (barPos(i) === 15 && Math.random() > 0.9) pattern.china[i] = 1
      }
      break
    }
    case "trap": {
      for (let i = 0; i < steps; i++) {
        if (i % 16 === 0 || i % 16 === 6 || i % 16 === 12) pattern.kick[i] = 1
        if (isBackbeat(i)) pattern.snare[i] = 1
        if (i % 1 === 0 && Math.random() > 0.5) pattern.ch[i] = 1
        if (i % 4 === 3 && Math.random() > 0.7) pattern.oh[i] = 1
        if (isBarStart(i) && Math.random() > 0.2) pattern.crash[i] = 1
        if (barPos(i) >= 12 && Math.random() > 0.9) pattern.tom1[i] = 1
        if (barPos(i) >= 14 && Math.random() > 0.9) pattern.tom2[i] = 1
        if (barPos(i) === 15 && Math.random() > 0.85) pattern.china[i] = 1
      }
      break
    }
    case "rock": {
      for (let i = 0; i < steps; i++) {
        if (i % 16 === 0 || i % 16 === 8) pattern.kick[i] = 1
        if (isBackbeat(i)) pattern.snare[i] = 1
        if (isEighth(i)) pattern.ch[i] = 1
        if (isBarStart(i) && Math.random() > 0.5) pattern.crash[i] = 1
        if (barPos(i) >= 12 && Math.random() > 0.7) pattern.tom1[i] = 1
        if (barPos(i) >= 14 && Math.random() > 0.6) pattern.tom2[i] = 1
        if (barPos(i) === 15 && Math.random() > 0.9) pattern.china[i] = 1
      }
      break
    }
    default: {
      for (let i = 0; i < steps; i++) {
        if (Math.random() > 0.7) pattern.kick[i] = 1
        if (Math.random() > 0.8) pattern.snare[i] = 1
        if (Math.random() > 0.6) pattern.ch[i] = 1
        if (Math.random() > 0.9) pattern.oh[i] = 1
        if (barPos(i) >= 12 && Math.random() > 0.8) pattern.tom1[i] = 1
        if (barPos(i) >= 14 && Math.random() > 0.75) pattern.tom2[i] = 1
        if (isBarStart(i) && Math.random() > 0.5) pattern.crash[i] = 1
        if (barPos(i) === 15 && Math.random() > 0.85) pattern.china[i] = 1
      }
    }
  }

  return pattern
}
