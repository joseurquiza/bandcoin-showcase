"use server"

import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

async function getCurrentProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("bt-session")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = verify(token, process.env.VAULT_JWT_SECRET!) as { profileId: number }
    const profiles = await sql`SELECT * FROM bt_profiles WHERE id = ${decoded.profileId}`
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

  try {
    await sql`
      INSERT INTO bt_messages (from_profile_id, to_profile_id, subject, message)
      VALUES (${profile.id}, ${toProfileId}, ${subject}, ${message})
    `
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
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
