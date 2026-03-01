"use server"

import { getDb } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

async function getCurrentProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("bt-session")?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, getJwtSecret())
    const { profileId } = verified.payload as { profileId: number }
    const sql = getDb()
    const profiles = await sql`SELECT * FROM bt_profiles WHERE id = ${profileId}`
    return profiles[0] || null
  } catch {
    return null
  }
}

export async function sendMessage(toProfileId: number, subject: string, message: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  if (!subject || subject.trim().length === 0) return { success: false, error: "Subject is required" }
  if (subject.length > 200) return { success: false, error: "Subject must be 200 characters or less" }
  if (!message || message.trim().length === 0) return { success: false, error: "Message is required" }
  if (message.length > 5000) return { success: false, error: "Message must be 5000 characters or less" }

  try {
    const sql = getDb()
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

  const sql = getDb()
  return sql`
    SELECT m.*, p.musician_name as from_name, p.avatar_url as from_avatar
    FROM bt_messages m
    JOIN bt_profiles p ON m.from_profile_id = p.id
    WHERE m.to_profile_id = ${profile.id}
    ORDER BY m.created_at DESC
  `
}

export async function getSentMessages() {
  const profile = await getCurrentProfile()
  if (!profile) return []

  const sql = getDb()
  return sql`
    SELECT m.*, p.musician_name as to_name
    FROM bt_messages m
    JOIN bt_profiles p ON m.to_profile_id = p.id
    WHERE m.from_profile_id = ${profile.id}
    ORDER BY m.created_at DESC
  `
}

export async function markAsRead(messageId: number) {
  const profile = await getCurrentProfile()
  if (!profile) return { success: false, error: "Not authenticated" }

  const sql = getDb()
  await sql`
    UPDATE bt_messages 
    SET is_read = true 
    WHERE id = ${messageId} AND to_profile_id = ${profile.id}
  `
  return { success: true }
}
