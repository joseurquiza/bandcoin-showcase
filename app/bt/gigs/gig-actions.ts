"use server"

import { getDb } from "@/lib/db"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"

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

export async function postGig(formData: {
  title: string
  description: string
  location: string
  date: string
  compensation: string
  required_instruments: string[]
  genres: string[]
}) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const result = await sql`
      INSERT INTO bt_gigs (
        posted_by, title, description, location, date,
        compensation, required_instruments, genres
      ) VALUES (
        ${profile.id},
        ${formData.title},
        ${formData.description},
        ${formData.location},
        ${formData.date},
        ${formData.compensation},
        ${formData.required_instruments},
        ${formData.genres}
      )
      RETURNING id
    `
    return { success: true, gigId: result[0].id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function browseGigs(filters?: { instruments?: string[]; genres?: string[]; location?: string }) {
  const query = `
    SELECT g.*, p.musician_name as posted_by_name
    FROM bt_gigs g
    JOIN bt_profiles p ON g.posted_by = p.id
    WHERE g.status = 'open' AND g.date > NOW()
  `

  const gigs = await sql.unsafe(query + ` ORDER BY g.date ASC`)
  return gigs
}

export async function getMyGigs() {
  const profile = await getCurrentProfile()
  if (!profile) return []

  const gigs = await sql`
    SELECT * FROM bt_gigs 
    WHERE posted_by = ${profile.id}
    ORDER BY created_at DESC
  `

  return gigs
}
