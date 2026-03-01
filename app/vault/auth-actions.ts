"use server"

import { getDb } from "@/lib/db"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { validatePasswordStrict } from "@/lib/password-validator"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not set")
  return new TextEncoder().encode(secret)
}

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Invalid email format" }
    }

    const passwordValidation = validatePasswordStrict(password)
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors[0] }
    }

    const sql = getDb()
    const existingUser = await sql`SELECT id FROM vault_users WHERE email = ${email}`
    if (existingUser.length > 0) {
      return { success: false, error: "Email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await sql`
      INSERT INTO vault_users (email, password_hash, display_name, role)
      VALUES (${email}, ${passwordHash}, ${displayName}, ${role})
      RETURNING id, email, display_name, role, wallet_address, wallet_type, stellar_public_key, avatar_url
    `

    const user = result[0] as VaultUser

    if (role === "artist") {
      await sql`
        INSERT INTO vault_artists (user_id, artist_name)
        VALUES (${user.id}, ${displayName})
      `
    }

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecret())
    ;(await cookies()).set("vault_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return { success: true, user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const sql = getDb()
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
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getJwtSecret())
    ;(await cookies()).set("vault_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
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

    if (!token) return null

    const verified = await jwtVerify(token, getJwtSecret())
    const { userId } = verified.payload as { userId: number }

    const sql = getDb()
    const result = await sql`
      SELECT id, email, display_name, role, wallet_address, wallet_type, stellar_public_key, avatar_url
      FROM vault_users
      WHERE id = ${userId}
    `

    if (result.length === 0) return null

    return result[0] as VaultUser
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function updateWalletAddress(walletAddress: string, walletType: "ethereum" | "stellar" = "ethereum") {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const sql = getDb()

    if (walletType === "ethereum") {
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return { success: false, error: "Invalid Ethereum address format" }
      }
      await sql`
        UPDATE vault_users
        SET wallet_address = ${walletAddress}, wallet_type = ${walletType}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    } else {
      if (!/^G[A-Z0-9]{55}$/.test(walletAddress)) {
        return { success: false, error: "Invalid Stellar address format" }
      }
      await sql`
        UPDATE vault_users
        SET stellar_public_key = ${walletAddress}, wallet_type = ${walletType}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Update wallet error:", error)
    return { success: false, error: "Failed to update wallet" }
  }
}
