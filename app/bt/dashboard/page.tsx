"use client"

import { useEffect, useState } from "react"
import { getMyProfile, getAllProfiles } from "../bt-actions"
import { UnifiedDashboard } from "./unified-dashboard"

export default function BandTogetherDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedOnce, setCheckedOnce] = useState(false)

  useEffect(() => {
    console.log("[v0] BT Dashboard page mounted")
    // Initial profile check
    checkProfile()

    // Listen for wallet connection events
    const handleWalletConnect = () => {
      console.log("[v0] Wallet connected event received, checking profile...")
      // Wait a bit for the session cookie to be set
      setTimeout(() => {
        checkProfile()
      }, 1000)
    }

    window.addEventListener("walletConnected", handleWalletConnect)

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnect)
    }
  }, [])

  const checkProfile = async () => {
    console.log("[v0] Checking for profile...")
    setLoading(true)

    try {
      const foundProfile = await getMyProfile()
      console.log("[v0] Profile lookup result:", foundProfile)

      if (foundProfile) {
        console.log("[v0] Profile found! ID:", foundProfile.id, "Name:", foundProfile.musician_name)
        setProfile(foundProfile)

        // Load available profiles for Green Room
        const profiles = await getAllProfiles({ availableOnly: true, limit: 6 })
        setAvailableProfiles(profiles)
      } else {
        console.log("[v0] No profile found")
        setProfile(null)
      }
    } catch (error) {
      console.error("[v0] Error checking profile:", error)
      setProfile(null)
    } finally {
      setLoading(false)
      setCheckedOnce(true)
    }
  }

  // Show loading state on first check
  if (!checkedOnce) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <UnifiedDashboard profile={profile} initialAvailableProfiles={availableProfiles} onProfileCreated={checkProfile} />
  )
}
