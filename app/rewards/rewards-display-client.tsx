"use client"

import { useEffect, useState } from "react"
import { getUserRewards, requestWithdrawal } from "./rewards-actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Coins, Wallet, TrendingUp, Zap, ArrowDownToLine, Calendar, Trophy, Gift, Sparkles, Target } from "lucide-react"
import { toast } from "sonner"

interface RewardsData {
  totalTokens: number
  level: number
  activities: any[]
  leaderboard: any[]
  rewardRules: any[]
  user?: any
  pendingWithdrawals: number
  withdrawals: any[]
}

export function RewardsDisplayClient({ initialData }: { initialData: RewardsData }) {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<RewardsData>({
    totalTokens: initialData.totalTokens || 0,
    level: initialData.level || 1,
    activities: initialData.activities || [],
    leaderboard: initialData.leaderboard || [],
    rewardRules: initialData.rewardRules || [],
    user: initialData.user || null,
    pendingWithdrawals: initialData.pendingWithdrawals || 0,
    withdrawals: initialData.withdrawals || [],
  })
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [stellarAddress, setStellarAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    setMounted(true)

    const loadData = async () => {
      const newData = await getUserRewards()
      setData((prevData) => ({
        ...prevData,
        totalTokens: newData.totalTokens ?? prevData.totalTokens,
        pendingWithdrawals: newData.pendingWithdrawals ?? prevData.pendingWithdrawals,
        level: newData.level ?? prevData.level,
        activities: newData.activities ?? prevData.activities ?? [],
        leaderboard: newData.leaderboard ?? prevData.leaderboard ?? [],
        rewardRules: newData.rewardRules ?? prevData.rewardRules ?? [],
        user: newData.user ?? prevData.user,
        withdrawals: newData.withdrawals ?? prevData.withdrawals ?? [],
      }))
    }

    loadData()
    const interval = setInterval(loadData, 10000)

    const handleWalletConnected = () => {
      loadData()
    }

    window.addEventListener("walletConnected", handleWalletConnected)

    return () => {
      clearInterval(interval)
      window.removeEventListener("walletConnected", handleWalletConnected)
    }
  }, [])

  if (!mounted) {
    return null
  }

  const hasConnection = data.user?.stellar_address || data.user?.eth_address || data.user?.email

  if (!hasConnection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <Card className="bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl p-12 max-w-md text-center">
          <div className="p-4 bg-amber-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Wallet className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Connect to Start Earning</h2>
          <p className="text-zinc-400 mb-6">
            Connect your wallet or sign in with email to start earning BandCoin rewards
          </p>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  const availableBalance = data.totalTokens - data.pendingWithdrawals
  const nextLevelTokens = data.level * 1000
  const progressPercent = ((data.totalTokens % 1000) / 1000) * 100

  const isFreighterUser = data.user?.wallet_type === "stellar" && data.user?.stellar_address
  const needsWithdrawal = !isFreighterUser

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (!stellarAddress.trim() || isNaN(amount) || amount < 100) {
      toast.error("Invalid withdrawal request", {
        description: "Please enter a valid Stellar address and amount (minimum 100 BC)",
      })
      return
    }

    if (amount > availableBalance) {
      toast.error("Insufficient balance", {
        description: `You only have ${availableBalance.toFixed(2)} BC available`,
      })
      return
    }

    setIsWithdrawing(true)

    try {
      const result = await requestWithdrawal(stellarAddress, amount)

      if (result.success) {
        toast.success("Withdrawal requested", {
          description: "Your withdrawal will be processed within 24-48 hours",
        })
        setShowWithdrawDialog(false)
        setStellarAddress("")
        setWithdrawAmount("")

        const newData = await getUserRewards()
        setData((prevData) => ({
          ...prevData,
          totalTokens: newData.totalTokens ?? prevData.totalTokens,
          pendingWithdrawals: newData.pendingWithdrawals ?? prevData.pendingWithdrawals,
          level: newData.level ?? prevData.level,
          activities: newData.activities ?? prevData.activities ?? [],
          leaderboard: newData.leaderboard ?? prevData.leaderboard ?? [],
          rewardRules: newData.rewardRules ?? prevData.rewardRules ?? [],
          user: newData.user ?? prevData.user,
          withdrawals: newData.withdrawals ?? prevData.withdrawals ?? [],
        }))
      } else {
        toast.error("Withdrawal failed", {
          description: result.error || "Please try again later",
        })
      }
    } catch (error: any) {
      toast.error("Withdrawal error", {
        description: error.message,
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gradient-to-b from-zinc-950 via-zinc-950/50 to-black border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-8 py-16 text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            BandCoin Rewards
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
            Earn tokens by exploring apps, creating content, and engaging with the platform
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-amber-950/20 border-amber-900/30 backdrop-blur-xl p-6 group hover:border-amber-700/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  <Coins className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-medium text-amber-200">Total Earned</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{data.totalTokens.toFixed(2)}</p>
              <p className="text-sm text-amber-300">BandCoin</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 via-green-950/30 to-emerald-950/20 border-emerald-900/30 backdrop-blur-xl p-6 group hover:border-emerald-700/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-medium text-emerald-200">Available</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{availableBalance.toFixed(2)}</p>
              <p className="text-sm text-emerald-300">Can Withdraw</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-fuchsia-950/30 to-purple-950/20 border-purple-900/30 backdrop-blur-xl p-6 group hover:border-purple-700/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-purple-200">Level</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{data.level}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-purple-300 mb-1.5">
                  <span>{data.totalTokens.toFixed(0)} BC</span>
                  <span>{nextLevelTokens} BC</span>
                </div>
                <div className="w-full h-1.5 bg-purple-950/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-cyan-950/30 to-blue-950/20 border-blue-900/30 backdrop-blur-xl p-6 group hover:border-blue-700/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-blue-200">Activities</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{data.activities.length}</p>
              <p className="text-sm text-blue-300">Tracked Actions</p>
            </div>
          </Card>
        </div>

        <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl p-8">
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative">
            {needsWithdrawal ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                      <ArrowDownToLine className="h-6 w-6 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Withdraw to Stellar Wallet</h2>
                  </div>
                  <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-900/50">
                        <Wallet className="h-4 w-4 mr-2" />
                        Request Withdrawal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="text-white text-2xl">Withdraw BandCoin</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl">
                          <label className="text-xs text-amber-400/70 mb-1 block">Available Balance</label>
                          <p className="text-3xl font-bold text-amber-400">{availableBalance.toFixed(2)} BC</p>
                        </div>

                        <div>
                          <label className="text-sm text-zinc-400 mb-2 block">Stellar Address</label>
                          <Input
                            type="text"
                            placeholder="G..."
                            value={stellarAddress}
                            onChange={(e) => setStellarAddress(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 text-white font-mono h-12"
                          />
                          <p className="text-xs text-zinc-500 mt-2">
                            Enter your Stellar wallet address (starts with G)
                          </p>
                        </div>

                        <div>
                          <label className="text-sm text-zinc-400 mb-2 block">Amount (BC)</label>
                          <Input
                            type="number"
                            placeholder="Minimum 100 BC"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 text-white h-12"
                            min="100"
                            max={availableBalance}
                          />
                          <p className="text-xs text-zinc-500 mt-2">Minimum withdrawal: 100 BC</p>
                        </div>

                        <Button
                          onClick={handleWithdraw}
                          disabled={isWithdrawing || !stellarAddress || !withdrawAmount}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-12 text-base"
                        >
                          {isWithdrawing ? "Submitting..." : "Submit Withdrawal Request"}
                        </Button>

                        <p className="text-xs text-zinc-500 text-center">
                          Withdrawals are processed manually within 24-48 hours
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Withdrawal History</h3>
                  {data.withdrawals && data.withdrawals.length > 0 ? (
                    <div className="space-y-3">
                      {data.withdrawals.map((withdrawal: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800"
                        >
                          <div>
                            <p className="font-medium text-white">{withdrawal.amount} BC</p>
                            <p className="text-sm text-zinc-500">
                              {new Date(withdrawal.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            className={
                              withdrawal.status === "completed"
                                ? "bg-green-950/30 text-green-400 border-green-800"
                                : withdrawal.status === "pending"
                                  ? "bg-amber-950/30 text-amber-400 border-amber-800"
                                  : "bg-red-950/30 text-red-400 border-red-800"
                            }
                          >
                            {withdrawal.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-zinc-500 py-8">No withdrawal requests yet</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-green-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Wallet className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">BandCoin in Your Wallet</h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-6">
                  Your BandCoin rewards are already in your connected Stellar wallet. No withdrawal needed!
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 text-sm">Wallet:</span>
                  <span className="text-white font-mono text-sm">
                    {data.user?.stellar_address?.slice(0, 8)}...{data.user?.stellar_address?.slice(-8)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Recent Activities</h2>
          </div>

          <div className="space-y-2">
            {data.activities.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">Start exploring apps to earn BandCoin rewards!</p>
            ) : (
              data.activities.slice(0, 20).map((activity: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{activity.description}</p>
                      <p className="text-sm text-zinc-500">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-950/30 text-amber-400 border-amber-800/50">
                    +{activity.tokens_earned} BC
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-zinc-950/50 border-zinc-800/50 backdrop-blur-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          </div>

          <div className="space-y-2">
            {data.leaderboard.map((user: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                    ${i === 0 ? "bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30" : ""}
                    ${i === 1 ? "bg-gradient-to-br from-zinc-300/20 to-zinc-500/20 text-zinc-300 border border-zinc-400/30" : ""}
                    ${i === 2 ? "bg-gradient-to-br from-orange-500/20 to-orange-700/20 text-orange-400 border border-orange-500/30" : ""}
                    ${i > 2 ? "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50" : ""}
                  `}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {user.display_name || `User ${user.session_id.slice(-6)}`}
                    </p>
                    <p className="text-sm text-zinc-500">Level {user.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-950/30 text-amber-400 border-amber-800/50 px-4 py-1.5">
                    {user.total_tokens.toFixed(0)} BC
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-950/20 via-orange-950/10 to-amber-950/20 border-amber-900/30 backdrop-blur-xl p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                <Gift className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ways to Earn BandCoin</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-amber-400 text-lg">App Exploration</h3>
                </div>
                <div className="space-y-2">
                  {data.rewardRules
                    .filter((rule: any) => rule.activity_type === "app_visit")
                    .map((rule: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{rule.description}</p>
                          {rule.max_per_day && (
                            <p className="text-xs text-zinc-500 mt-1">{rule.max_per_day}x per day</p>
                          )}
                        </div>
                        <Badge className="bg-amber-950/30 text-amber-400 border-amber-800/50 ml-3">
                          +{rule.tokens_awarded}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/30">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-400 text-lg">Active Participation</h3>
                </div>
                <div className="space-y-2">
                  {data.rewardRules
                    .filter((rule: any) => rule.activity_type === "feature_use")
                    .map((rule: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{rule.description}</p>
                          {rule.max_per_day && (
                            <p className="text-xs text-zinc-500 mt-1">{rule.max_per_day}x per day</p>
                          )}
                        </div>
                        <Badge className="bg-purple-950/30 text-purple-400 border-purple-800/50 ml-3">
                          +{rule.tokens_awarded}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-400 text-lg">Daily Bonuses</h3>
                </div>
                <div className="space-y-2">
                  {data.rewardRules
                    .filter(
                      (rule: any) => rule.activity_type === "daily_login" || rule.activity_type.includes("streak"),
                    )
                    .map((rule: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{rule.description}</p>
                          {rule.max_per_day && (
                            <p className="text-xs text-zinc-500 mt-1">{rule.max_per_day}x per day</p>
                          )}
                        </div>
                        <Badge className="bg-blue-950/30 text-blue-400 border-blue-800/50 ml-3">
                          +{rule.tokens_awarded}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-gradient-to-r from-orange-950/30 via-amber-950/30 to-orange-950/30 border border-orange-900/50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-400 mb-1 text-lg">Daily Earning Cap</h4>
                  <p className="text-zinc-300 text-sm">
                    Earn up to <span className="font-bold text-orange-400">1,000 BC per day</span> through platform
                    activities. Return tomorrow to continue earning!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
