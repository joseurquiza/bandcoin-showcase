"use server"

import { v0 } from "v0-sdk"

export async function loadV0ChatByUrl(chatUrl: string) {
  try {
    // Extract chat ID from URL
    // Format: https://v0.app/chat/animal-army-website-kdVVAiKmEUt
    const chatIdMatch = chatUrl.match(/\/chat\/([^/?]+)/)
    if (!chatIdMatch) {
      throw new Error("Invalid v0 chat URL format")
    }

    const chatId = chatIdMatch[1]

    console.log("[v0] Loading chat with ID:", chatId)

    // Fetch chat data from v0 API
    const chat = await v0.chats.getById({
      chatId,
    })

    console.log("[v0] Chat loaded successfully:", chat.id)

    let demoUrl = ""

    // Check if latestVersion exists and has a demoUrl
    if (chat.latestVersion?.demoUrl) {
      demoUrl = chat.latestVersion.demoUrl
      console.log("[v0] Using latestVersion.demoUrl:", demoUrl)
    } else {
      console.warn("[v0] No demoUrl found in latestVersion")
    }

    return {
      success: true,
      chatId: chat.id,
      content: chat.messages?.[chat.messages.length - 1]?.content || "",
      demo: demoUrl,
      websiteIdea: chat.messages?.[0]?.content || "",
    }
  } catch (error: any) {
    console.error("[v0] Error loading chat:", error)

    let errorMessage = "Failed to load chat"

    if (error?.message?.includes("404") || error?.message?.includes("not_found")) {
      errorMessage =
        "Chat not found. You can only load chats created with this Site Builder. External v0.app chats cannot be accessed."
    } else if (error?.message?.includes("unauthorized") || error?.message?.includes("403")) {
      errorMessage = "Unauthorized. This chat belongs to a different account."
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
