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
      // Check if Freighter is installed by calling isConnected
      // The freighter-api package handles the extension detection
      const connectionResult = await freighterApi.isConnected()

      if (!connectionResult.isConnected) {
        // Could mean not installed or not unlocked - try requestAccess anyway
        // as it will prompt the user to install/unlock
      }

      // Use requestAccess to prompt user and get public key in one step
      const accessResult = await freighterApi.requestAccess()

      if (accessResult.error) {
        throw new Error(accessResult.error)
      }

      setPublicKey(accessResult.address)
      return accessResult.address
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to connect to Freighter"
      // Provide a more helpful error message
      if (errorMessage.includes("extension") || errorMessage.includes("install")) {
        setError("Freighter wallet extension not found. Please install it from freighter.app")
      } else {
        setError(errorMessage)
      }
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
