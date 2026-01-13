"use client"

import { useEffect, useState } from "react"
import { getUserRewards } from "@/app/rewards/rewards-actions"
import { Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function RewardsDisplay() {
  const [rewards, setRewards] = useState({ totalTokens: 0, level: 1 })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [hasConnection, setHasConnection] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    loadRewards()

    const handleWalletConnected = () => {
      loadRewards()
    }
    window.addEventListener("walletConnected", handleWalletConnected)

    // Refresh every 30 seconds
    const interval = setInterval(loadRewards, 30000)

    return () => {
      clearInterval(interval)
      window.removeEventListener("walletConnected", handleWalletConnected)
    }
  }, [])

  async function loadRewards() {
    const data = await getUserRewards()
    setRewards(data)

    const connected = !!(data.user?.stellar_address || data.user?.eth_address || data.user?.email)
    setHasConnection(connected)
    setLoading(false)
  }

  if (!mounted || loading || rewards.totalTokens === 0 || !hasConnection) return null

  return (
    <Button
      variant="ghost"
      onClick={() => router.push("/rewards")}
      className="gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-950/20"
    >
      <Coins className="h-4 w-4" />
      <span className="font-semibold">{rewards.totalTokens.toFixed(0)} BC</span>
      <span className="text-xs text-zinc-400">Lv.{rewards.level}</span>
    </Button>
  )
}
