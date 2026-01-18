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
      // Check if Freighter is installed
      const connectionResult = await freighterApi.isConnected()
      
      // isConnected returns { isConnected: boolean }
      // If the extension isn't installed, this call may fail or return false
      if (!connectionResult || !connectionResult.isConnected) {
        throw new Error("Freighter wallet not found. Please install Freighter extension from freighter.app and refresh the page.")
      }

      // Use requestAccess to prompt user and get public key
      const accessResult = await freighterApi.requestAccess()

      // Check for error in response
      if (accessResult.error) {
        throw new Error(typeof accessResult.error === 'string' ? accessResult.error : accessResult.error.message || "Failed to get access")
      }

      // Validate we got an address
      if (!accessResult.address) {
        throw new Error("No address returned from Freighter. Please unlock your wallet and try again.")
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
