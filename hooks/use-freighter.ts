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
      const connectionResult = await freighterApi.isConnected()

      if (!connectionResult.isConnected) {
        throw new Error("Freighter wallet is not installed. Please install Freighter extension.")
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
