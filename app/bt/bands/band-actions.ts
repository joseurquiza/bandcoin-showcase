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

export async function createBand(formData: {
  band_name: string
  bio: string
  genres: string[]
  location: string
  looking_for_members: string[]
  spotify_url?: string
  soundcloud_url?: string
  instagram_url?: string
}) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const result = await sql`
      INSERT INTO bt_bands (
        band_name, bio, genres, location, looking_for_members,
        spotify_url, soundcloud_url, instagram_url, created_by
      ) VALUES (
        ${formData.band_name},
        ${formData.bio},
        ${formData.genres},
        ${formData.location},
        ${formData.looking_for_members},
        ${formData.spotify_url || null},
        ${formData.soundcloud_url || null},
        ${formData.instagram_url || null},
        ${profile.id}
      )
      RETURNING id
    `

    // Add creator as first member
    await sql`
      INSERT INTO bt_band_members (band_id, profile_id, role, status)
      VALUES (${result[0].id}, ${profile.id}, 'Founder', 'active')
    `

    return { success: true, bandId: result[0].id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getMyBands() {
  const profile = await getCurrentProfile()
  if (!profile) return []

  const bands = await sql`
    SELECT b.*, 
           COUNT(DISTINCT bm.id) as member_count
    FROM bt_bands b
    LEFT JOIN bt_band_members bm ON b.id = bm.band_id AND bm.status = 'active'
    WHERE b.id IN (
      SELECT band_id FROM bt_band_members 
      WHERE profile_id = ${profile.id} AND status = 'active'
    )
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `

  return bands
}

export async function getBandDetails(bandId: number) {
  const band = await sql`
    SELECT * FROM bt_bands WHERE id = ${bandId}
  `

  if (band.length === 0) return null

  const members = await sql`
    SELECT bm.*, p.musician_name, p.avatar_url, p.instruments
    FROM bt_band_members bm
    JOIN bt_profiles p ON bm.profile_id = p.id
    WHERE bm.band_id = ${bandId} AND bm.status = 'active'
    ORDER BY bm.joined_at ASC
  `

  return { ...band[0], members }
}

export async function inviteToBand(bandId: number, profileId: number, role: string, instrument: string) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user is band creator
  const band = await sql`SELECT created_by FROM bt_bands WHERE id = ${bandId}`
  if (band[0].created_by !== profile.id) {
    return { success: false, error: "Only band creator can invite members" }
  }

  try {
    await sql`
      INSERT INTO bt_band_members (band_id, profile_id, role, instrument, status)
      VALUES (${bandId}, ${profileId}, ${role}, ${instrument}, 'invited')
    `
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
