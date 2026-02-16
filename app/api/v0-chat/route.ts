import { v0 } from "v0-sdk"
import type { NextRequest } from "next/server"
import { saveGeneratedProject } from "./track-project"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limiter"

const V0_API_BASE = "https://api.v0.dev/v1"

async function fetchV0API(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.V0_API_KEY || process.env.VERCEL_V0_API_KEY
  if (!apiKey) {
    throw new Error("V0 API key not configured")
  }

  const response = await fetch(`${V0_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`v0 API error: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.ai.check(clientId)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.reset)
    }

    const usageCheck = await checkAIUsage("v0-chat")
    if (!usageCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Daily limit reached. You've used ${usageCheck.currentUsage}/${usageCheck.dailyLimit} site generations today. Try again tomorrow!`,
          limitReached: true,
          usage: usageCheck,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      )
    }

    const { messages, chatId } = await request.json()
    const userMessage = messages?.find((msg: any) => msg.role === "user")
    const message = userMessage?.content
    const images = userMessage?.images || []

    const apiKey = process.env.V0_API_KEY || process.env.VERCEL_V0_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "V0 API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const attachments = images
      .map((image: any, index: number) => ({
        url: image.url || image.src,
        name: image.name || `image-${index + 1}`,
      }))
      .filter((attachment: any) => attachment.url)

    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    ;(async () => {
      try {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              stage: "💭 Thinking...",
              icon: "brain",
            })}\n\n`,
          ),
        )

        let initialAssistantCount = 0
        if (chatId) {
          try {
            const chatData = await fetchV0API(`/chats/${chatId}`)
            const allMessages = chatData.messages || []
            initialAssistantCount = allMessages.filter((msg: any) => msg.role === "assistant").length
            console.log("[v0] Initial assistant message count:", initialAssistantCount)
          } catch (e: any) {
            console.log("[v0] Could not get initial message count:", e.message)
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 500))

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              stage: "✨ Generating design brief",
              icon: "sparkles",
            })}\n\n`,
          ),
        )

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              stage: "🔍 Analyzing requirements",
              icon: "search",
            })}\n\n`,
          ),
        )

        let result
        if (chatId) {
          result = await fetchV0API(`/chats/${chatId}/messages`, {
            method: "POST",
            body: JSON.stringify({
              message,
              ...(attachments.length > 0 && { attachments }),
            }),
          })
        } else {
          const requestPayload = { message, ...(attachments.length > 0 && { attachments }) }
          result = await v0.chats.create(requestPayload)
        }

        const chatIdResult = result.chatId || result.id || chatId
        const files = result.files || []
        const demoUrl = result.demo || result.demoUrl || ""

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              stage: "🎨 Creating your website",
              icon: "palette",
            })}\n\n`,
          ),
        )

        let assistantContent = ""
        let thinkingContent = ""
        let foundNewMessage = false

        for (let attempt = 1; attempt <= 15; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, attempt === 1 ? 3000 : 2000))

          try {
            const chatData = await fetchV0API(`/chats/${chatIdResult}`)
            const allMessages = chatData.messages || []
            const assistantMessages = allMessages.filter((msg: any) => msg.role === "assistant")

            if (assistantMessages.length > initialAssistantCount) {
              const lastMessage = assistantMessages[assistantMessages.length - 1]

              if (lastMessage?.content) {
                const parsedContent =
                  typeof lastMessage.content === "string" ? JSON.parse(lastMessage.content) : lastMessage.content

                if (parsedContent.version && Array.isArray(parsedContent.parts)) {
                  for (const part of parsedContent.parts) {
                    if (part.type === "mdx" && typeof part.content === "string") {
                      const thinkingRegex = /<Thinking>([\s\S]*?)<\/Thinking>/gi
                      const thinkingMatches = part.content.match(thinkingRegex)

                      if (thinkingMatches) {
                        thinkingMatches.forEach((match: string) => {
                          const thinkingText = match.replace(/<\/?Thinking>/gi, "").trim()
                          thinkingContent += thinkingText + "\n\n"
                        })
                      }

                      const contentWithoutThinking = part.content.replace(thinkingRegex, "").trim()

                      if (contentWithoutThinking) {
                        let cleanedContent = contentWithoutThinking
                        cleanedContent = cleanedContent.replace(/<CodeProject[^>]*>[\s\S]*?<\/CodeProject>/gi, "")
                        cleanedContent = cleanedContent.replace(/<CodeProject[^>]*\/>/gi, "")
                        cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, "")
                        cleanedContent = cleanedContent.replace(/\*?Calls?\s+[^*\n]+\*?\.{0,3}/gi, "")
                        cleanedContent = cleanedContent.replace(/^\s*[▸►]\s+.+$/gm, "")
                        cleanedContent = cleanedContent.replace(/^\s*\*\s*$/gm, "")
                        cleanedContent = cleanedContent.replace(/\n{3,}/g, "\n\n").trim()

                        if (cleanedContent) {
                          assistantContent += cleanedContent + "\n\n"
                        }
                      }
                    }
                  }

                  foundNewMessage = true
                  break
                }
              }
            }

            if (attempt <= 2) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    stage: "📦 Building components",
                    icon: "package",
                  })}\n\n`,
                ),
              )
            }
          } catch (e: any) {
            console.log(`[v0] Error fetching messages on attempt ${attempt}:`, e.message)
          }
        }

        if (thinkingContent) {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "thinking",
                content: thinkingContent,
              })}\n\n`,
            ),
          )
        }

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              stage: "✅ Website ready!",
              icon: "check",
            })}\n\n`,
          ),
        )

        const formattedFiles = []
        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const content = file.content || ""

            let fileName = `file-${i + 1}`
            if (file.meta && file.meta.file) {
              fileName = file.meta.file
            } else if (file.name) {
              fileName = file.name
            }

            formattedFiles.push({
              name: fileName,
              content: content,
            })
          }
        }

        await incrementAIUsage("v0-chat")

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              chatId: chatIdResult,
              content: assistantContent || "Generated project successfully!",
              files: formattedFiles,
              demo: demoUrl,
            })}\n\n`,
          ),
        )

        if (!chatId) {
          const savedMessage = messages?.find((msg: any) => msg.role === "user")?.content || ""
          await saveGeneratedProject({
            v0ChatId: chatIdResult,
            v0ProjectId: result.projectId || undefined,
            websiteIdea: savedMessage,
            demoUrl: demoUrl || undefined,
          })
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"))
        await writer.close()
      } catch (error: any) {
        console.error("[v0] Error:", error.message)
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error.message || "Failed to generate code",
            })}\n\n`,
          ),
        )
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate code" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
