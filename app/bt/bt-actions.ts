"use server"

import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  console.log("[v0] Checking authentication with session_id:", !!sessionId)

  if (!sessionId) {
    console.log("[v0] No session_id cookie found")
    return null
  }

  try {
    // Query reward_users table to get user's wallet address
    const userResult = await sql`
      SELECT stellar_address, email FROM reward_users WHERE session_id = ${sessionId}
    `

    if (userResult.length === 0) {
      console.log("[v0] No user found for session_id")
      return null
    }

    const user = userResult[0]
    console.log("[v0] User found:", {
      hasWallet: !!user.stellar_address,
      hasEmail: !!user.email,
    })

    return {
      sessionId,
      walletAddress: user.stellar_address,
      email: user.email,
    }
  } catch (error) {
    console.error("[v0] Authentication error:", error)
    return null
  }
}

export async function createProfile(formData: {
  musicianName: string
  bio?: string
  instruments: string[]
  genres: string[]
  experienceLevel: string
  location?: string
  spotifyUrl?: string
  soundcloudUrl?: string
  instagramUrl?: string
  lookingFor: string[]
}) {
  try {
    console.log("[v0] createProfile action started")
    const auth = await getAuthenticatedUser()
    console.log("[v0] Authentication result:", auth ? "authenticated" : "not authenticated")

    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] Checking for existing profile...")
    const existing = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    console.log("[v0] Existing profiles found:", existing.length)

    if (existing.length > 0) {
      return { success: false, error: "Profile already exists" }
    }

    console.log("[v0] Creating new profile with data:", formData)
    const profile = await sql`
      INSERT INTO bt_profiles (
        session_id,
        wallet_address,
        musician_name,
        bio,
        instruments,
        genres,
        experience_level,
        location,
        spotify_url,
        soundcloud_url,
        instagram_url,
        looking_for
      ) VALUES (
        ${auth.sessionId},
        ${auth.walletAddress || null},
        ${formData.musicianName},
        ${formData.bio || null},
        ${formData.instruments},
        ${formData.genres},
        ${formData.experienceLevel},
        ${formData.location || null},
        ${formData.spotifyUrl || null},
        ${formData.soundcloudUrl || null},
        ${formData.instagramUrl || null},
        ${formData.lookingFor}
      )
      RETURNING *
    `

    console.log("[v0] Profile created successfully:", profile[0].id)
    return { success: true, profile: profile[0] }
  } catch (error) {
    console.error("[v0] Create profile error:", error)
    return { success: false, error: "Failed to create profile" }
  }
}

export async function updateProfile(formData: {
  musicianName: string
  bio?: string
  instruments: string[]
  genres: string[]
  experienceLevel: string
  location?: string
  spotifyUrl?: string
  soundcloudUrl?: string
  instagramUrl?: string
  lookingFor: string[]
  isAvailable: boolean
}) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await sql`
      UPDATE bt_profiles SET
        musician_name = ${formData.musicianName},
        bio = ${formData.bio || null},
        instruments = ${formData.instruments},
        genres = ${formData.genres},
        experience_level = ${formData.experienceLevel},
        location = ${formData.location || null},
        spotify_url = ${formData.spotifyUrl || null},
        soundcloud_url = ${formData.soundcloudUrl || null},
        instagram_url = ${formData.instagramUrl || null},
        looking_for = ${formData.lookingFor},
        is_available = ${formData.isAvailable},
        updated_at = NOW()
      WHERE session_id = ${auth.sessionId}
      RETURNING *
    `

    return { success: true, profile: result[0] }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getMyProfile() {
  try {
    console.log("[v0] getMyProfile: Starting profile lookup")
    const auth = await getAuthenticatedUser()

    if (!auth) {
      console.log("[v0] getMyProfile: Not authenticated")
      return null
    }

    console.log("[v0] getMyProfile: Auth details", {
      hasSessionId: !!auth.sessionId,
      hasWallet: !!auth.walletAddress,
      walletAddress: auth.walletAddress, // Log full wallet address for debugging
      hasEmail: !!auth.email,
    })

    let profile

    if (auth.walletAddress) {
      console.log("[v0] getMyProfile: Looking up by wallet address:", auth.walletAddress)
      profile = await sql`
        SELECT * FROM bt_profiles WHERE wallet_address = ${auth.walletAddress}
      `

      console.log("[v0] getMyProfile: Wallet lookup returned", profile.length, "profiles")

      if (profile.length > 0) {
        console.log(
          "[v0] getMyProfile: Found profile by wallet address:",
          profile[0].id,
          "with wallet:",
          profile[0].wallet_address,
        )

        // Update session_id for this device
        await sql`
          UPDATE bt_profiles 
          SET session_id = ${auth.sessionId}, updated_at = NOW()
          WHERE wallet_address = ${auth.walletAddress}
        `
        console.log("[v0] getMyProfile: Updated session_id for profile")

        return profile[0]
      }
      console.log("[v0] getMyProfile: No profile found by wallet address")
    }

    // Fallback to session_id lookup (for email-based auth)
    console.log("[v0] getMyProfile: Looking up by session_id:", auth.sessionId)
    profile = await sql`
      SELECT * FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    console.log("[v0] getMyProfile: Session lookup returned", profile.length, "profiles")

    if (profile.length > 0) {
      console.log("[v0] getMyProfile: Found profile by session_id:", profile[0].id)
    } else {
      console.log("[v0] getMyProfile: No profile found")
      const allProfiles = await sql`SELECT id, wallet_address, session_id, musician_name FROM bt_profiles LIMIT 10`
      console.log("[v0] getMyProfile: Sample of existing profiles:", allProfiles)
    }

    return profile[0] || null
  } catch (error) {
    console.error("[v0] getMyProfile error:", error)
    return null
  }
}

export async function getAllProfiles(filters?: {
  instruments?: string[]
  genres?: string[]
  experienceLevel?: string
  availableOnly?: boolean
  limit?: number
}) {
  try {
    // Build the query dynamically with tagged templates
    if (filters?.availableOnly && filters?.instruments && filters.instruments.length > 0) {
      const profiles = await sql`
        SELECT * FROM bt_profiles 
        WHERE is_available = true 
        AND instruments && ${filters.instruments}
        ORDER BY created_at DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `
      return profiles
    }

    if (filters?.availableOnly) {
      const profiles = await sql`
        SELECT * FROM bt_profiles 
        WHERE is_available = true 
        ORDER BY created_at DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `
      return profiles
    }

    if (filters?.instruments && filters.instruments.length > 0) {
      const profiles = await sql`
        SELECT * FROM bt_profiles 
        WHERE instruments && ${filters.instruments}
        ORDER BY created_at DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `
      return profiles
    }

    if (filters?.genres && filters.genres.length > 0) {
      const profiles = await sql`
        SELECT * FROM bt_profiles 
        WHERE genres && ${filters.genres}
        ORDER BY created_at DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `
      return profiles
    }

    if (filters?.experienceLevel) {
      const profiles = await sql`
        SELECT * FROM bt_profiles 
        WHERE experience_level = ${filters.experienceLevel}
        ORDER BY created_at DESC
        ${filters.limit ? sql`LIMIT ${filters.limit}` : sql``}
      `
      return profiles
    }

    // Default: get all profiles
    const profiles = await sql`
      SELECT * FROM bt_profiles 
      ORDER BY created_at DESC
      ${filters?.limit ? sql`LIMIT ${filters.limit}` : sql``}
    `
    return profiles
  } catch (error) {
    console.error("Get all profiles error:", error)
    return []
  }
}

export async function getProfileById(id: number) {
  try {
    const profile = await sql`
      SELECT * FROM bt_profiles WHERE id = ${id}
    `
    return profile[0] || null
  } catch (error) {
    console.error("Get profile by id error:", error)
    return null
  }
}

export async function toggleAvailability() {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await sql`
      UPDATE bt_profiles 
      SET is_available = NOT is_available,
          updated_at = NOW()
      WHERE session_id = ${auth.sessionId}
      RETURNING is_available
    `

    if (result.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    return { success: true, isAvailable: result[0].is_available }
  } catch (error) {
    console.error("Toggle availability error:", error)
    return { success: false, error: "Failed to toggle availability" }
  }
}

export async function createBand(formData: {
  bandName: string
  bio?: string
  genres: string[]
  location?: string
  spotifyUrl?: string
  soundcloudUrl?: string
  instagramUrl?: string
  lookingForMembers: string[]
  avatarUrl?: string
}) {
  try {
    console.log("[v0] createBand action started with data:", formData)

    const auth = await getAuthenticatedUser()
    console.log("[v0] Authentication result:", auth ? "authenticated" : "not authenticated")

    if (!auth) {
      console.log("[v0] createBand failed: Not authenticated")
      return { success: false, error: "Not authenticated" }
    }

    console.log("[v0] Looking up profile for session_id:", auth.sessionId)
    const profile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    console.log(
      "[v0] Profile lookup result:",
      profile.length > 0 ? `Found profile ID ${profile[0].id}` : "No profile found",
    )

    if (profile.length === 0) {
      console.log("[v0] createBand failed: Profile not found")
      return { success: false, error: "Profile not found. Create a profile first." }
    }

    console.log("[v0] Inserting band into database...")
    const band = await sql`
      INSERT INTO bt_bands (
        band_name,
        bio,
        genres,
        location,
        spotify_url,
        soundcloud_url,
        instagram_url,
        looking_for_members,
        avatar_url,
        created_by,
        is_active
      ) VALUES (
        ${formData.bandName},
        ${formData.bio || null},
        ${formData.genres},
        ${formData.location || null},
        ${formData.spotifyUrl || null},
        ${formData.soundcloudUrl || null},
        ${formData.instagramUrl || null},
        ${formData.lookingForMembers},
        ${formData.avatarUrl || null},
        ${profile[0].id},
        true
      )
      RETURNING *
    `

    console.log("[v0] Band created with ID:", band[0].id)

    console.log("[v0] Adding creator as band leader...")
    await sql`
      INSERT INTO bt_band_members (
        band_id,
        profile_id,
        role,
        status
      ) VALUES (
        ${band[0].id},
        ${profile[0].id},
        'Leader',
        'active'
      )
    `

    console.log("[v0] Band creation completed successfully")
    return { success: true, band: band[0] }
  } catch (error) {
    console.error("[v0] Create band error:", error)
    return { success: false, error: `Failed to create band: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export async function getMyBands() {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return []
    }

    const profile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    if (profile.length === 0) {
      return []
    }

    const bands = await sql`
      SELECT DISTINCT b.*, bm.role, bm.status
      FROM bt_bands b
      JOIN bt_band_members bm ON b.id = bm.band_id
      WHERE bm.profile_id = ${profile[0].id}
      ORDER BY b.created_at DESC
    `

    return bands
  } catch (error) {
    console.error("Get my bands error:", error)
    return []
  }
}

export async function inviteMemberToBand(bandId: number, profileId: number, role: string, instrument?: string) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    const myProfile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    if (myProfile.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    // Check if user is band leader
    const membership = await sql`
      SELECT role FROM bt_band_members 
      WHERE band_id = ${bandId} AND profile_id = ${myProfile[0].id}
    `

    if (membership.length === 0 || membership[0].role !== "Leader") {
      return { success: false, error: "Only band leaders can invite members" }
    }

    // Check if member is already invited or in band
    const existing = await sql`
      SELECT id FROM bt_band_members 
      WHERE band_id = ${bandId} AND profile_id = ${profileId}
    `

    if (existing.length > 0) {
      return { success: false, error: "Member already invited or in band" }
    }

    await sql`
      INSERT INTO bt_band_members (
        band_id,
        profile_id,
        role,
        instrument,
        status
      ) VALUES (
        ${bandId},
        ${profileId},
        ${role},
        ${instrument || null},
        'pending'
      )
    `

    return { success: true }
  } catch (error) {
    console.error("Invite member error:", error)
    return { success: false, error: "Failed to invite member" }
  }
}

export async function respondToInvitation(bandId: number, accept: boolean) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    const profile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    if (profile.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    if (accept) {
      await sql`
        UPDATE bt_band_members 
        SET status = 'accepted', joined_at = NOW()
        WHERE band_id = ${bandId} AND profile_id = ${profile[0].id}
      `
    } else {
      await sql`
        DELETE FROM bt_band_members 
        WHERE band_id = ${bandId} AND profile_id = ${profile[0].id}
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Respond to invitation error:", error)
    return { success: false, error: "Failed to respond to invitation" }
  }
}

export async function getPendingInvitations() {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return []
    }

    const profile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    if (profile.length === 0) {
      return []
    }

    const invitations = await sql`
      SELECT b.*, bm.role, bm.instrument
      FROM bt_bands b
      JOIN bt_band_members bm ON b.id = bm.band_id
      WHERE bm.profile_id = ${profile[0].id} AND bm.status = 'pending'
      ORDER BY b.created_at DESC
    `

    return invitations
  } catch (error) {
    console.error("Get pending invitations error:", error)
    return []
  }
}

export async function getBandMembers(bandId: number) {
  try {
    const members = await sql`
      SELECT p.*, bm.role, bm.instrument, bm.status, bm.joined_at
      FROM bt_profiles p
      JOIN bt_band_members bm ON p.id = bm.profile_id
      WHERE bm.band_id = ${bandId}
      ORDER BY 
        CASE bm.role 
          WHEN 'Leader' THEN 1 
          ELSE 2 
        END,
        bm.joined_at
    `

    return members
  } catch (error) {
    console.error("Get band members error:", error)
    return []
  }
}

export async function getAllBands(filters?: {
  genres?: string[]
  location?: string
  lookingForMembers?: string[]
}) {
  try {
    if (filters?.genres && filters.genres.length > 0) {
      const bands = await sql`
        SELECT b.*, COUNT(bm.id) as member_count
        FROM bt_bands b
        LEFT JOIN bt_band_members bm ON b.id = bm.band_id AND bm.status = 'accepted'
        WHERE b.is_active = true AND b.genres && ${filters.genres}
        GROUP BY b.id
        ORDER BY b.created_at DESC
      `
      return bands
    }

    const bands = await sql`
      SELECT b.*, COUNT(bm.id) as member_count
      FROM bt_bands b
      LEFT JOIN bt_band_members bm ON b.id = bm.band_id AND bm.status = 'accepted'
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `
    return bands
  } catch (error) {
    console.error("Get all bands error:", error)
    return []
  }
}

export async function updateBand(
  bandId: number,
  formData: {
    bandName: string
    bio?: string
    genres: string[]
    location?: string
    spotifyUrl?: string
    soundcloudUrl?: string
    instagramUrl?: string
    lookingForMembers: string[]
    avatarUrl?: string
  },
) {
  try {
    console.log("[v0] updateBand action started for band ID:", bandId)

    const auth = await getAuthenticatedUser()
    if (!auth) {
      return { success: false, error: "Not authenticated" }
    }

    const profile = await sql`
      SELECT id FROM bt_profiles WHERE session_id = ${auth.sessionId}
    `

    if (profile.length === 0) {
      return { success: false, error: "Profile not found" }
    }

    // Check if user is band leader
    const membership = await sql`
      SELECT role FROM bt_band_members 
      WHERE band_id = ${bandId} AND profile_id = ${profile[0].id}
    `

    if (membership.length === 0 || membership[0].role !== "Leader") {
      return { success: false, error: "Only band leaders can edit band details" }
    }

    console.log("[v0] Updating band in database...")
    const result = await sql`
      UPDATE bt_bands SET
        band_name = ${formData.bandName},
        bio = ${formData.bio || null},
        genres = ${formData.genres},
        location = ${formData.location || null},
        spotify_url = ${formData.spotifyUrl || null},
        soundcloud_url = ${formData.soundcloudUrl || null},
        instagram_url = ${formData.instagramUrl || null},
        looking_for_members = ${formData.lookingForMembers},
        avatar_url = ${formData.avatarUrl || null},
        updated_at = NOW()
      WHERE id = ${bandId}
      RETURNING *
    `

    console.log("[v0] Band updated successfully")
    return { success: true, band: result[0] }
  } catch (error) {
    console.error("[v0] Update band error:", error)
    return { success: false, error: `Failed to update band: ${error instanceof Error ? error.message : String(error)}` }
  }
}
