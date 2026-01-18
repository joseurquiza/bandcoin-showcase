"use client"

import { useState } from "react"
import freighterApi from "@stellar/freighter-api"

export function useFreighter() {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use requestAccess to prompt user and get public key in one step
      // This will also handle extension not installed errors from Freighter
      const accessResult = await freighterApi.requestAccess()
      console.log("[v0] Freighter requestAccess result:", accessResult)

      if (accessResult.error) {
        throw new Error(accessResult.error)
      }

      // The response might be just the address string directly
      const address = typeof accessResult === 'string' ? accessResult : accessResult.address
      
      if (!address) {
        console.log("[v0] No address found in response. Full response:", JSON.stringify(accessResult))
        throw new Error("No address returned from Freighter. Please unlock your wallet and try again.")
      }

      setPublicKey(address)
      return address
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to connect to Freighter"
      console.error("[v0] Freighter connection error details:", err)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setPublicKey(null)
    setError(null)
  }

  return {
    publicKey,
    isLoading,
    error,
    connect,
    disconnect,
    isConnected: !!publicKey,
  }
}
