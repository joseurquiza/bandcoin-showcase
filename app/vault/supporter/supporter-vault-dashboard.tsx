"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, LogOut, Plus, Award, Music, ArrowUpCircle } from "lucide-react"
import { getAllArtistsForStaking, getMyStakes, getSupporterStats } from "../supporter-actions"
import { getVaultStats, getUserVaultPosition, depositToVault, previewDepositShares } from "../vault-actions"
import { signOut } from "../auth-actions"
import WalletConnect from "@/components/wallet-connect"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { VaultUser } from "../auth-actions"
import { formatDistance } from "date-fns"

function SupporterVaultDashboard({ user }: { user: VaultUser }) {
  const router = useRouter()
  const [stats, setStats] = useState<any>({ artists_supported: 0, total_staked: 0, total_rewards_earned: 0 })
  const [artists, setArtists] = useState<any[]>([])
  const [myStakes, setMyStakes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [stakeAmount, setStakeAmount] = useState("")
  const [vaultInfo, setVaultInfo] = useState<any>(null)
  const [userPosition, setUserPosition] = useState<any>(null)
  const [expectedShares, setExpectedShares] = useState<string>("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log("[v0] Starting to load supporter data")
    setLoading(true)
    setError(null)

    try {
      const results = await Promise.allSettled([getSupporterStats(), getAllArtistsForStaking(), getMyStakes()])

      // Handle stats
      if (results[0].status === "fulfilled" && results[0].value.success) {
        setStats(results[0].value.stats)
      } else {
        console.error("[v0] Stats failed:", results[0])
        setStats({ artists_supported: 0, total_staked: 0, total_rewards_earned: 0 })
      }

      // Handle artists
      if (results[1].status === "fulfilled" && results[1].value.success) {
        setArtists(results[1].value.artists || [])
      } else {
        console.error("[v0] Artists failed:", results[1])
        setArtists([])
      }

      // Handle stakes
      if (results[2].status === "fulfilled" && results[2].value.success) {
        setMyStakes(results[2].value.stakes || [])
      } else {
        console.error("[v0] Stakes failed:", results[2])
        setMyStakes([])
      }

      console.log("[v0] Finished loading supporter data successfully")
    } catch (err) {
      console.error("[v0] Error loading supporter data:", err)
      setError("An error occurred while loading data. Please try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }

  const loadVaultData = async (artistId: number) => {
    const [vaultRes, positionRes] = await Promise.all([getVaultStats(artistId), getUserVaultPosition(artistId)])

    if (vaultRes.success) {
      setVaultInfo(vaultRes.vaultInfo)
    }

    if (positionRes.success) {
      setUserPosition(positionRes.position)
    }
  }

  const handleAmountChange = async (value: string) => {
    setStakeAmount(value)

    if (value && selectedArtist && Number.parseFloat(value) > 0) {
      const preview = await previewDepositShares(selectedArtist.id, value)
      if (preview.success) {
        setExpectedShares(preview.shares)
      }
    } else {
      setExpectedShares("")
    }
  }

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedArtist || !stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!user.wallet_address && !user.stellar_public_key) {
      toast.error("Please connect a wallet first")
      return
    }

    setIsDepositing(true)

    try {
      const result = await depositToVault(selectedArtist.id, stakeAmount)

      if (result.success) {
        toast.success(result.message || "Deposit initiated. Please sign the transaction in your wallet.")

        setStakeDialogOpen(false)
        setStakeAmount("")
        setSelectedArtist(null)
        setExpectedShares("")
        loadData()
      } else {
        toast.error(result.error || "Failed to create deposit transaction")
      }
    } catch (error) {
      toast.error("An error occurred while depositing")
    } finally {
      setIsDepositing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/vault")
    router.refresh()
  }

  const openStakeDialog = async (artist: any) => {
    setSelectedArtist(artist)
    setStakeDialogOpen(true)
    // await loadVaultData(artist.id)
  }

  const openCheckout = (packageId: string) => {
    setSelectedPackage(packageId)
    setCheckoutOpen(true)
  }

  const handleCheckoutSuccess = () => {
    toast.success("BandCoin credited to your account!")
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Loading supporter dashboard...</div>
          <div className="text-white/50 text-sm">This should only take a moment</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border-red-500/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-400 text-lg mb-2">Error Loading Dashboard</div>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={loadData} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Supporter Dashboard</h1>
            <p className="text-white/60">Stake on artists and earn rewards when they succeed</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-white/60">Signed in as</p>
              <p className="text-white font-medium">{user.display_name || user.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Artists Supported</CardTitle>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.artists_supported || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Total Staked</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Number.parseFloat(stats?.total_staked || 0).toFixed(2)}{" "}
                <span className="text-amber-400 text-lg">BC</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/90">Total Rewards</CardTitle>
                <Award className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Number.parseFloat(stats?.total_rewards_earned || 0).toFixed(2)}{" "}
                <span className="text-green-400 text-lg">BC</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Wallet Connection</CardTitle>
            <CardDescription className="text-white/60">Connect your Web3 wallet to stake BandCoin</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect
              initialAddress={user.wallet_type === "stellar" ? user.stellar_public_key : user.wallet_address}
              initialChain={user.wallet_type || "ethereum"}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="discover" className="data-[state=active]:bg-zinc-800 text-white">
              Discover Artists
            </TabsTrigger>
            <TabsTrigger value="my-stakes" className="data-[state=active]:bg-zinc-800 text-white">
              My Stakes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artists.map((artist) => (
                <Card key={artist.id} className="bg-zinc-900 border-white/10 hover:border-white/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Music className="w-5 h-5 text-amber-400" />
                          {artist.artist_name}
                        </CardTitle>
                        {artist.genre && (
                          <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-400">
                            {artist.genre}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {Number.parseFloat(artist.treasury_balance).toFixed(0)}{" "}
                          <span className="text-amber-400 text-sm">BC</span>
                        </div>
                        <p className="text-xs text-white/50">Treasury</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {artist.bio && <p className="text-white/70 text-sm line-clamp-2">{artist.bio}</p>}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white/50">Supporters</p>
                        <p className="text-white font-medium">{artist.supporter_count}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Total Staked</p>
                        <p className="text-purple-400 font-medium">
                          {Number.parseFloat(artist.total_staked).toFixed(2)} BC
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => openStakeDialog(artist)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Stake on {artist.artist_name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-stakes" className="space-y-4 mt-4">
            {myStakes.length === 0 ? (
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No active stakes</p>
                  <p className="text-white/30 text-sm mt-1">Start supporting artists to earn rewards</p>
                </CardContent>
              </Card>
            ) : (
              myStakes.map((stake) => (
                <Card
                  key={stake.id}
                  className={`border-white/10 ${
                    stake.status === "active" ? "bg-zinc-900" : "bg-zinc-900/50 opacity-60"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-white font-medium text-lg">{stake.artist_name}</p>
                          {stake.genre && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                              {stake.genre}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-white/50">Staked Amount</p>
                            <p className="text-purple-400 font-medium">
                              {Number.parseFloat(stake.amount).toFixed(2)} BC
                            </p>
                          </div>
                          <div>
                            <p className="text-white/50">Rewards Earned</p>
                            <p className="text-green-400 font-medium">
                              {Number.parseFloat(stake.total_rewards).toFixed(2)} BC
                            </p>
                          </div>
                        </div>
                        <p className="text-white/40 text-xs mt-2">
                          Staked {formatDistance(new Date(stake.staked_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="ml-4">
                        {stake.status === "active" ? (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-500">
                            {stake.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={stakeDialogOpen} onOpenChange={setStakeDialogOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-purple-400" />
                Stake on {selectedArtist?.artist_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="text-5xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">Smart Contract Staking Coming Soon</h3>
                <p className="text-white/70 text-sm">
                  We're deploying SEP-56 Token Vault contracts to enable on-chain staking with BandCoin. This will allow
                  you to stake tokens and automatically earn rewards from artist treasury revenue.
                </p>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                <h4 className="text-white font-medium text-sm mb-2">What's Coming:</h4>
                <ul className="space-y-1 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Deposit BandCoin to receive vault shares</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Automatic reward distribution from artist earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Withdraw anytime with accumulated rewards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>On-chain verification via Stellar blockchain</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => setStakeDialogOpen(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default SupporterVaultDashboard
