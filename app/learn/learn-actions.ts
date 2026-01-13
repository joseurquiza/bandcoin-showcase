"use server"

import { generateText, generateObject } from "ai"
import { z } from "zod"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import { checkUserAuthentication } from "@/lib/auth-check"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

const sql = neon(process.env.DATABASE_URL!)

// Schema for course structure
const courseSchema = z.object({
  title: z.string().describe("The course title"),
  description: z.string().describe("A compelling course description"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Course difficulty level"),
  estimatedDuration: z.string().describe("Estimated time to complete, e.g. '2 hours' or '3 weeks'"),
  prerequisites: z.array(z.string()).describe("List of prerequisites or prior knowledge needed"),
  learningOutcomes: z.array(z.string()).describe("What students will learn by the end"),
  modules: z
    .array(
      z.object({
        moduleNumber: z.number().describe("Module number"),
        title: z.string().describe("Module title"),
        description: z.string().describe("Brief module description"),
        lessons: z
          .array(
            z.object({
              lessonNumber: z.number().describe("Lesson number within the module"),
              title: z.string().describe("Lesson title"),
              content: z
                .string()
                .describe(
                  "Full lesson content with explanations, examples, and key concepts. Make this comprehensive and educational.",
                ),
              keyTakeaways: z.array(z.string()).describe("Key points to remember from this lesson"),
              practiceExercise: z.string().optional().describe("A practice exercise or activity for the student"),
            }),
          )
          .describe("Lessons within this module"),
        quiz: z
          .object({
            questions: z.array(
              z.object({
                question: z.string(),
                options: z.array(z.string()),
                correctAnswer: z.number().describe("Index of the correct answer (0-based)"),
                explanation: z.string().describe("Why this answer is correct"),
              }),
            ),
          })
          .optional()
          .describe("Optional quiz for the module"),
      }),
    )
    .describe("Course modules"),
  additionalResources: z
    .array(
      z.object({
        title: z.string(),
        type: z.enum(["Book", "Website", "Video", "Tool", "Article"]),
        description: z.string(),
      }),
    )
    .optional()
    .describe("Recommended additional resources"),
})

export type Course = z.infer<typeof courseSchema>

export async function generateCourse(
  topic: string,
  depth: "quick" | "standard" | "comprehensive",
  targetAudience: string,
): Promise<{ success: boolean; course?: Course; error?: string }> {
  console.log("[v0] Starting course generation...")
  console.log("[v0] Topic:", topic)
  console.log("[v0] Depth:", depth)
  console.log("[v0] Target audience:", targetAudience)

  const auth = await checkUserAuthentication()
  if (!auth.isAuthenticated) {
    return {
      success: false,
      error: "Please connect your wallet or sign in to generate courses.",
    }
  }

  const usageCheck = await checkAIUsage("learn")
  if (!usageCheck.allowed) {
    return {
      success: false,
      error: `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} course generations today. Try again tomorrow!`,
    }
  }

  const moduleCount = depth === "quick" ? 2 : depth === "standard" ? 4 : 6
  const lessonsPerModule = depth === "quick" ? 2 : depth === "standard" ? 3 : 4

  try {
    console.log("[v0] Calling Gemini for course generation...")

    const { object: course } = await generateObject({
      model: "google/gemini-2.5-flash",
      schema: courseSchema,
      prompt: `Create a comprehensive educational course on the topic: "${topic}"
      
Target audience: ${targetAudience}
Course depth: ${depth} (${moduleCount} modules with approximately ${lessonsPerModule} lessons each)

Requirements:
- Make the content educational, engaging, and practical
- Include real-world examples and applications
- Structure lessons to build upon each other progressively
- Include practice exercises where appropriate
- Add quizzes for knowledge retention
- Ensure content is accurate and up-to-date
- Write in a clear, accessible style suitable for the target audience
- Each lesson should be substantial (300-500 words minimum) with actual educational content

Create a well-structured course that would genuinely help someone learn this topic.`,
      maxOutputTokens: 16000,
    })

    console.log("[v0] Course generated successfully")
    console.log("[v0] Course title:", course.title)
    console.log("[v0] Modules:", course.modules.length)

    await incrementAIUsage("learn")

    return {
      success: true,
      course,
    }
  } catch (error: any) {
    console.error("[v0] Course generation error:", error)
    return {
      success: false,
      error: error.message || "Failed to generate course. Please try again.",
    }
  }
}

export async function generateCourseInfographic(
  courseTitle: string,
  modules: { title: string; description: string }[],
  learningOutcomes: string[],
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  console.log("[v0] Starting infographic generation...")
  console.log("[v0] Course title:", courseTitle)

  const auth = await checkUserAuthentication()
  if (!auth.isAuthenticated) {
    return {
      success: false,
      error: "Please connect your wallet or sign in to generate infographics.",
    }
  }

  try {
    // Create a detailed prompt for the infographic
    const moduleList = modules.map((m, i) => `${i + 1}. ${m.title}`).join("\n")
    const outcomeList = learningOutcomes.slice(0, 4).join("\n- ")

    const prompt = `Create a beautiful, professional educational infographic for a course titled "${courseTitle}".

The infographic should visually represent:
- Course title prominently at the top
- ${modules.length} modules shown as a learning path or journey:
${moduleList}

Key learning outcomes:
- ${outcomeList}

Design requirements:
- Modern, clean educational design
- Use icons and visual metaphors for each module
- Show progression/flow between modules
- Professional color scheme suitable for education (blues, teals, or warm colors)
- Include visual elements like lightbulbs, books, graduation caps, arrows showing progression
- Make it look like a high-quality course roadmap or syllabus infographic
- Portrait orientation, suitable for sharing on social media or printing`

    console.log("[v0] Calling Nano Banana for infographic...")

    const result = await generateText({
      model: "google/gemini-3-pro-image-preview",
      prompt,
    })

    // Extract image from result.files
    let imageUrl: string | undefined

    if (result.files && result.files.length > 0) {
      for (const file of result.files) {
        if (file.mediaType.startsWith("image/")) {
          imageUrl = `data:${file.mediaType};base64,${file.base64}`
          break
        }
      }
    }

    if (!imageUrl) {
      console.error("[v0] No image generated in response")
      return {
        success: false,
        error: "Failed to generate infographic image.",
      }
    }

    console.log("[v0] Infographic generated successfully")

    return {
      success: true,
      imageUrl,
    }
  } catch (error: any) {
    console.error("[v0] Infographic generation error:", error)
    return {
      success: false,
      error: error.message || "Failed to generate infographic. Please try again.",
    }
  }
}

export async function saveCourse(
  course: Course,
  infographicUrl?: string,
): Promise<{ success: boolean; courseId?: number; error?: string }> {
  console.log("[v0] Saving course...")

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return {
      success: false,
      error: "Please sign in to save courses.",
    }
  }

  // Get user's wallet address
  const userResult = await sql`
    SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId}
  `

  const walletAddress = userResult[0]?.stellar_address

  if (!walletAddress) {
    return {
      success: false,
      error: "Please connect your wallet to save courses.",
    }
  }

  try {
    const result = await sql`
      INSERT INTO learn_courses (
        wallet_address,
        session_id,
        title,
        description,
        difficulty,
        estimated_duration,
        course_data,
        infographic_url,
        created_at
      ) VALUES (
        ${walletAddress},
        ${sessionId},
        ${course.title},
        ${course.description},
        ${course.difficulty},
        ${course.estimatedDuration},
        ${JSON.stringify(course)},
        ${infographicUrl || null},
        NOW()
      )
      RETURNING id
    `

    console.log("[v0] Course saved with ID:", result[0].id)

    return {
      success: true,
      courseId: result[0].id,
    }
  } catch (error: any) {
    console.error("[v0] Error saving course:", error)
    return {
      success: false,
      error: "Failed to save course. Please try again.",
    }
  }
}

export async function getMyCourses(): Promise<{ success: boolean; courses?: any[]; error?: string }> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) {
    return {
      success: true,
      courses: [],
    }
  }

  // Get user's wallet address
  const userResult = await sql`
    SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId}
  `

  const walletAddress = userResult[0]?.stellar_address

  if (!walletAddress) {
    return {
      success: true,
      courses: [],
    }
  }

  try {
    const courses = await sql`
      SELECT id, title, description, difficulty, estimated_duration, infographic_url, created_at
      FROM learn_courses
      WHERE wallet_address = ${walletAddress}
      ORDER BY created_at DESC
    `

    return {
      success: true,
      courses: courses as any[],
    }
  } catch (error: any) {
    console.error("[v0] Error fetching courses:", error)
    return {
      success: false,
      error: "Failed to load courses.",
    }
  }
}

export async function getCourseById(courseId: number): Promise<{ success: boolean; course?: any; error?: string }> {
  try {
    const result = await sql`
      SELECT * FROM learn_courses WHERE id = ${courseId}
    `

    if (result.length === 0) {
      return {
        success: false,
        error: "Course not found.",
      }
    }

    return {
      success: true,
      course: result[0],
    }
  } catch (error: any) {
    console.error("[v0] Error fetching course:", error)
    return {
      success: false,
      error: "Failed to load course.",
    }
  }
}
