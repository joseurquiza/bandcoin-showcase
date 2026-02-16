"use server"

import { getDb } from "@/lib/db"

export async function saveGeneratedProject(data: {
  v0ChatId: string
  v0ProjectId?: string
  websiteIdea: string
  demoUrl?: string
  conversationHistory?: Array<{ role: string; content: string }>
}) {
  try {
    console.log("[v0] Saving generated project:", data)

    const sql = getDb()
    await sql`
      INSERT INTO sitebuilder_projects (v0_chat_id, v0_project_id, website_idea, demo_url, conversation_history, updated_at)
      VALUES (
        ${data.v0ChatId}, 
        ${data.v0ProjectId || null}, 
        ${data.websiteIdea}, 
        ${data.demoUrl || null},
        ${JSON.stringify(data.conversationHistory || [])}::jsonb,
        NOW()
      )
      ON CONFLICT (v0_chat_id) 
      DO UPDATE SET 
        v0_project_id = EXCLUDED.v0_project_id,
        website_idea = EXCLUDED.website_idea,
        demo_url = EXCLUDED.demo_url,
        conversation_history = EXCLUDED.conversation_history,
        updated_at = NOW()
    `

    console.log("[v0] Project saved successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving project:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save project",
    }
  }
}

export async function listSiteBuilderProjects() {
  try {
    console.log("[v0] Fetching Site Builder projects from database")

    const sql = getDb()
    const projects = await sql`
      SELECT 
        id,
        v0_chat_id,
        v0_project_id,
        website_idea,
        demo_url,
        conversation_history,
        created_at,
        updated_at
      FROM sitebuilder_projects
      ORDER BY updated_at DESC
      LIMIT 50
    `

    console.log("[v0] Found Site Builder projects:", projects.length)

    return projects.map((p) => ({
      id: p.id,
      v0ChatId: p.v0_chat_id,
      v0ProjectId: p.v0_project_id,
      websiteIdea: p.website_idea,
      demoUrl: p.demo_url,
      conversationHistory: p.conversation_history || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))
  } catch (error) {
    console.error("[v0] Error listing Site Builder projects:", error)
    return []
  }
}

export async function getProjectByChatId(chatId: string) {
  try {
    const sql = getDb()
    const result = await sql`
      SELECT 
        id,
        v0_chat_id,
        v0_project_id,
        website_idea,
        demo_url,
        conversation_history,
        created_at,
        updated_at
      FROM sitebuilder_projects
      WHERE v0_chat_id = ${chatId}
      LIMIT 1
    `

    if (result.length === 0) return null

    const p = result[0]
    return {
      id: p.id,
      v0ChatId: p.v0_chat_id,
      v0ProjectId: p.v0_project_id,
      websiteIdea: p.website_idea,
      demoUrl: p.demo_url,
      conversationHistory: p.conversation_history || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }
  } catch (error) {
    console.error("[v0] Error getting project by chat ID:", error)
    return null
  }
}
