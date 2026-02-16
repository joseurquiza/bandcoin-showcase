"use server"

import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getRequiredEnv } from "@/lib/env-validator"

const sql = neon(getRequiredEnv('DATABASE_URL'))
const JWT_SECRET = new TextEncoder().encode(getRequiredEnv('JWT_SECRET'))

async function getCurrentProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("bt-session")?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const { profileId } = verified.payload as { profileId: number }
    const profiles = await sql`SELECT * FROM bt_profiles WHERE id = ${profileId}`
    return profiles[0] || null
  } catch {
    return null
  }
}

export async function sendMessage(toProfileId: number, subject: string, message: string) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { success: false, error: "Not authenticated" }
  }

  // Input validation
  if (!subject || subject.trim().length === 0) {
    return { success: false, error: "Subject is required" }
  }
  if (subject.length > 200) {
    return { success: false, error: "Subject must be 200 characters or less" }
  }
  if (!message || message.trim().length === 0) {
    return { success: false, error: "Message is required" }
  }
  if (message.length > 5000) {
    return { success: false, error: "Message must be 5000 characters or less" }
  }

  try {
    await sql`
      INSERT INTO bt_messages (from_profile_id, to_profile_id, subject, message)
      VALUES (${profile.id}, ${toProfileId}, ${subject.trim()}, ${message.trim()})
    `
    return { success: true }
  } catch (error) {
    console.error("Send message error:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getInbox() {
  const profile = await getCurrentProfile()
  if (!profile) return []

  const messages = await sql`
    SELECT m.*, p.musician_name as from_name, p.avatar_url as from_avatar
    FROM bt_messages m
    JOIN bt_profiles p ON m.from_profile_id = p.id
    WHERE m.to_profile_id = ${profile.id}
    ORDER BY m.created_at DESC
  `

  return messages
}

export async function getSentMessages() {
  const profile = await getCurrentProfile()
  if (!profile) return []

  const messages = await sql`
    SELECT m.*, p.musician_name as to_name
    FROM bt_messages m
    JOIN bt_profiles p ON m.to_profile_id = p.id
    WHERE m.from_profile_id = ${profile.id}
    ORDER BY m.created_at DESC
  `

  return messages
}

export async function markAsRead(messageId: number) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { success: false, error: "Not authenticated" }
  }

  await sql`
    UPDATE bt_messages 
    SET is_read = true 
    WHERE id = ${messageId} AND to_profile_id = ${profile.id}
  `

  return { success: true }
}
