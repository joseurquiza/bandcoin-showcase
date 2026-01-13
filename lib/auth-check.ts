"use server"
import { getWalletConnection } from "@/app/rewards/rewards-actions"
import { getCurrentUser } from "@/app/vault/auth-actions"

export async function checkUserAuthentication() {
  try {
    // Check for email authentication
    const emailUser = await getCurrentUser()
    if (emailUser) {
      return {
        isAuthenticated: true,
        authMethod: "email" as const,
        user: emailUser,
      }
    }

    // Check for wallet connection
    const walletConnection = await getWalletConnection()
    if (walletConnection) {
      return {
        isAuthenticated: true,
        authMethod: "wallet" as const,
        wallet: walletConnection,
      }
    }

    return {
      isAuthenticated: false,
      authMethod: null,
    }
  } catch (error) {
    console.error("[v0] Error checking authentication:", error)
    return {
      isAuthenticated: false,
      authMethod: null,
    }
  }
}
