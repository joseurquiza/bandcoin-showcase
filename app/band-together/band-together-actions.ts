"use server"

import { getDb } from "@/lib/db"
import { cookies } from "next/headers"

export async function getMyProfile() {
  try {
    const sql = getDb()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return { success: false, error: "Not authenticated" }
    }

    const [profile] = await sql`
      SELECT * FROM bt_profiles 
      WHERE session_id = ${sessionId}
      LIMIT 1
    `

    return { success: true, profile: profile || null }
  } catch (error) {
    console.error("Error fetching profile:", error)
    return { success: false, error: "Failed to fetch profile" }
  }
}

export async function toggleGreenRoom(inGreenRoom: boolean) {
  try {
    const sql = getDb()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
      return { success: false, error: "Not authenticated" }
    }

    await sql`
      UPDATE bt_profiles 
      SET is_available = ${inGreenRoom}, updated_at = NOW()
      WHERE session_id = ${sessionId}
    `

    return { success: true }
  } catch (error) {
    console.error("Error toggling green room:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function getGreenRoomMusicians() {
  try {
    const sql = getDb()
    const musicians = await sql`
      SELECT 
        id,
        musician_name,
        avatar_url,
        instruments,
        genres,
        location,
        bio,
        experience_level,
        spotify_url,
        instagram_url,
        soundcloud_url,
        updated_at
      FROM bt_profiles 
      WHERE is_available = true
      ORDER BY updated_at DESC
      LIMIT 50
    `

    return { success: true, musicians }
  } catch (error) {
    console.error("Error fetching green room musicians:", error)
    return { success: false, error: "Failed to fetch musicians", musicians: [] }
  }
}

export async function createOrUpdateProfile(data: {
  musician_name: string
  instruments: string[]
  genres: string[]
  location: string
  bio: string
  experience_level: string
  avatar_url?: string
  spotify_url?: string
  instagram_url?: string
  soundcloud_url?: string
}) {
  try {
    const sql = getDb()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session_id")?.value
    const walletAddress = cookieStore.get("wallet_address")?.value

    if (!sessionId) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if profile exists
    const [existing] = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${sessionId}
    `

    if (existing) {
      // Update existing profile
      await sql`
        UPDATE bt_profiles 
        SET 
          musician_name = ${data.musician_name},
          instruments = ${data.instruments},
          genres = ${data.genres},
          location = ${data.location},
          bio = ${data.bio},
          experience_level = ${data.experience_level},
          avatar_url = ${data.avatar_url || null},
          spotify_url = ${data.spotify_url || null},
          instagram_url = ${data.instagram_url || null},
          soundcloud_url = ${data.soundcloud_url || null},
          updated_at = NOW()
        WHERE session_id = ${sessionId}
      `
    } else {
      // Create new profile
      await sql`
        INSERT INTO bt_profiles (
          session_id,
          wallet_address,
          musician_name,
          instruments,
          genres,
          location,
          bio,
          experience_level,
          avatar_url,
          spotify_url,
          instagram_url,
          soundcloud_url,
          is_available,
          created_at,
          updated_at
        ) VALUES (
          ${sessionId},
          ${walletAddress || null},
          ${data.musician_name},
          ${data.instruments},
          ${data.genres},
          ${data.location},
          ${data.bio},
          ${data.experience_level},
          ${data.avatar_url || null},
          ${data.spotify_url || null},
          ${data.instagram_url || null},
          ${data.soundcloud_url || null},
          false,
          NOW(),
          NOW()
        )
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving profile:", error)
    return { success: false, error: "Failed to save profile" }
  }
}
