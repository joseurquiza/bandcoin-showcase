"use server"

import { neon } from "@neondatabase/serverless"
import { generateText } from "ai"
import { checkAIUsage, incrementAIUsage } from "@/lib/ai-usage-limiter"

const sql = neon(process.env.DATABASE_URL!)

interface Message {
  sender_type: string
  sender_name: string | null
  message: string
  created_at: string
}

export async function createSupportSession() {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  try {
    await sql`
      INSERT INTO support_sessions (session_id, status)
      VALUES (${sessionId}, 'active')
    `

    await sql`
      INSERT INTO support_messages (session_id, sender_type, sender_name, message)
      VALUES (${sessionId}, 'ai', 'BandCoin Assistant', 'Hi! I''m your BandCoin support assistant. How can I help you today?')
    `

    return { success: true, sessionId }
  } catch (error) {
    console.error("[v0] Error creating support session:", error)
    return { success: false, error: "Failed to create session" }
  }
}

export async function sendSupportMessage(sessionId: string, message: string, userEmail?: string, userName?: string) {
  try {
    const usageCheck = await checkAIUsage("support")

    await sql`
      INSERT INTO support_messages (session_id, sender_type, sender_name, message)
      VALUES (${sessionId}, 'user', ${userName || "Guest"}, ${message})
    `

    if (userEmail || userName) {
      await sql`
        UPDATE support_sessions 
        SET user_email = COALESCE(${userEmail}, user_email),
            user_name = COALESCE(${userName}, user_name),
            updated_at = CURRENT_TIMESTAMP
        WHERE session_id = ${sessionId}
      `
    }

    const [session] = await sql`
      SELECT status FROM support_sessions WHERE session_id = ${sessionId}
    `

    if (session?.status === "escalated") {
      return {
        success: true,
        response: "Your message has been sent to our support team. They'll respond shortly.",
        isEscalated: true,
      }
    }

    if (!usageCheck.allowed) {
      return {
        success: true,
        response: `You've reached your daily AI support limit (${usageCheck.currentUsage}/${usageCheck.dailyLimit} messages). You can escalate to a human agent for further assistance, or try again tomorrow.`,
        isEscalated: false,
        limitReached: true,
      }
    }

    const history = await sql`
      SELECT sender_type, message 
      FROM support_messages 
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    const conversationContext = history
      .map((msg: Message) => `${msg.sender_type === "user" ? "User" : "Assistant"}: ${msg.message}`)
      .join("\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a helpful support assistant for BandCoin ShowCase, a platform that provides digital services for musicians including EPKs, websites, VibePortal (AI image generation), Site Builder, and PubAssist (publishing registration helper).

Conversation history:
${conversationContext}

Provide a helpful, concise response. If the user needs specific technical help or custom requests that require human intervention, suggest they can escalate to a human agent.`,
    })

    await incrementAIUsage("support")

    await sql`
      INSERT INTO support_messages (session_id, sender_type, sender_name, message)
      VALUES (${sessionId}, 'ai', 'BandCoin Assistant', ${text})
    `

    return { success: true, response: text, isEscalated: false }
  } catch (error) {
    console.error("[v0] Error sending support message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function escalateToHuman(sessionId: string) {
  try {
    await sql`
      UPDATE support_sessions 
      SET status = 'escalated', 
          escalated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `

    await sql`
      INSERT INTO support_messages (session_id, sender_type, sender_name, message)
      VALUES (${sessionId}, 'ai', 'BandCoin Assistant', 'This conversation has been escalated to our support team. A human agent will respond shortly.')
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Error escalating session:", error)
    return { success: false, error: "Failed to escalate" }
  }
}

export async function getChatHistory(sessionId: string) {
  try {
    const messages = await sql`
      SELECT sender_type, sender_name, message, created_at
      FROM support_messages
      WHERE session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    return { success: true, messages }
  } catch (error) {
    console.error("[v0] Error getting chat history:", error)
    return { success: false, error: "Failed to get history", messages: [] }
  }
}

export async function getEscalatedSessions() {
  try {
    const sessions = await sql`
      SELECT 
        s.session_id,
        s.user_email,
        s.user_name,
        s.status,
        s.escalated_at,
        s.created_at,
        s.updated_at,
        (SELECT message FROM support_messages WHERE session_id = s.session_id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM support_sessions s
      WHERE s.status = 'escalated'
      ORDER BY s.updated_at DESC
    `

    return { success: true, sessions }
  } catch (error) {
    console.error("[v0] Error getting escalated sessions:", error)
    return { success: false, error: "Failed to get sessions", sessions: [] }
  }
}

export async function sendAdminMessage(sessionId: string, message: string, adminName: string) {
  try {
    await sql`
      INSERT INTO support_messages (session_id, sender_type, sender_name, message)
      VALUES (${sessionId}, 'admin', ${adminName}, ${message})
    `

    await sql`
      UPDATE support_sessions 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending admin message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function resolveSession(sessionId: string) {
  try {
    await sql`
      UPDATE support_sessions 
      SET status = 'resolved',
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
    `

    return { success: true }
  } catch (error) {
    console.error("[v0] Error resolving session:", error)
    return { success: false, error: "Failed to resolve" }
  }
}
