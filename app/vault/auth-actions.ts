"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = new TextEncoder().encode(process.env.VAULT_JWT_SECRET || "vault-secret-key-change-in-production")

export type VaultUser = {
  id: number
  email: string
  display_name: string | null
  role: "admin" | "artist" | "supporter"
  wallet_address: string | null
  wallet_type: "ethereum" | "stellar" | null
  stellar_public_key: string | null
  avatar_url: string | null
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: "artist" | "supporter" = "supporter",
) {
  try {
    const existingUser = await sql`SELECT id FROM vault_users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return { success: false, error: "Email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await sql`
      INSERT INTO vault_users (email, password_hash, display_name, role)
      VALUES (${email}, ${passwordHash}, ${displayName}, ${role})
      RETURNING id, email, display_name, role, wallet_address, wallet_type, stellar_public_key, avatar_url
    `

    const user = result[0] as VaultUser

    // Create artist profile if role is artist
    if (role === "artist") {
      await sql`
        INSERT INTO vault_artists (user_id, artist_name)
        VALUES (${user.id}, ${displayName})
      `
    }

    // Create session
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)
    ;(await cookies()).set("vault_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const result = await sql`
      SELECT id, email, password_hash, display_name, role, wallet_address, wallet_type, stellar_public_key, avatar_url
      FROM vault_users
      WHERE email = ${email}
    `

    if (result.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = result[0] as VaultUser & { password_hash: string }
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password" }
    }

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)
    ;(await cookies()).set("vault_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        wallet_address: user.wallet_address,
        wallet_type: user.wallet_type,
        stellar_public_key: user.stellar_public_key,
        avatar_url: user.avatar_url,
      },
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  ;(await cookies()).delete("vault_session")
  return { success: true }
}

export async function getCurrentUser(): Promise<VaultUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("vault_session")?.value

    if (!token) {
      return null
    }

    const verified = await jwtVerify(token, JWT_SECRET)
    const { userId } = verified.payload as { userId: number }

    const result = await sql`
      SELECT id, email, display_name, role, wallet_address, wallet_type, stellar_public_key, avatar_url
      FROM vault_users
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as VaultUser
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function updateWalletAddress(walletAddress: string, walletType: "ethereum" | "stellar" = "ethereum") {
  try {
    console.log("[v0] updateWalletAddress called with:", { walletAddress, walletType })
    const user = await getCurrentUser()
    console.log("[v0] Current user:", user ? `ID: ${user.id}, Email: ${user.email}` : "null")

    if (!user) {
      console.log("[v0] updateWalletAddress failed: Not authenticated")
      return { success: false, error: "Not authenticated" }
    }

    if (walletType === "ethereum") {
      console.log("[v0] Updating ethereum wallet_address for user", user.id)
      await sql`
        UPDATE vault_users
        SET wallet_address = ${walletAddress}, wallet_type = ${walletType}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    } else {
      console.log("[v0] Updating stellar_public_key for user", user.id)
      await sql`
        UPDATE vault_users
        SET stellar_public_key = ${walletAddress}, wallet_type = ${walletType}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    }

    console.log("[v0] Wallet address updated successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Update wallet error:", error)
    return { success: false, error: "Failed to update wallet" }
  }
}
