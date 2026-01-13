"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Vault, TrendingUp, Users, ArrowUpRight, ArrowDownRight, LogOut, Edit, DollarSign } from "lucide-react"
import {
  getArtistProfile,
  updateArtistProfile,
  getArtistTransactions,
  getArtistStakes,
  getReinvestmentRules,
  updateReinvestmentRule,
} from "../artist-actions"
import { signOut } from "../auth-actions"
import WalletConnect from "@/components/wallet-connect"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { VaultUser } from "../auth-actions"
import { formatDistance } from "date-fns"

export default function ArtistVaultDashboard({ user }: { user: VaultUser }) {
  const router = useRouter()
  const [artist, setArtist] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stakes, setStakes] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Profile form state
  const [bio, setBio] = useState("")
  const [genre, setGenre] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [profileRes, transactionsRes, stakesRes, rulesRes] = await Promise.all([
      getArtistProfile(),
      getArtistTransactions(),
      getArtistStakes(),
      getReinvestmentRules(),
    ])

    if (profileRes.success) {
      setArtist(profileRes.artist)
      setBio(profileRes.artist.bio || "")
      setGenre(profileRes.artist.genre || "")
    }
    if (transactionsRes.success) setTransactions(transactionsRes.transactions)
    if (stakesRes.success) setStakes(stakesRes.stakes)
    if (rulesRes.success) setRules(rulesRes.rules)

    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await updateArtistProfile(bio, genre)

    if (result.success) {
      toast.success("Profile updated successfully")
      setEditDialogOpen(false)
      loadData()
    } else {
      toast.error(result.error || "Failed to update profile")
    }
  }

  const handleUpdateRule = async (ruleId: number, percentage: number, isActive: boolean) => {
    const result = await updateReinvestmentRule(ruleId, percentage, isActive)

    if (result.success) {
      toast.success("Rule updated successfully")
      loadData()
    } else {
      toast.error(result.error || "Failed to update rule")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/vault")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const totalStaked = stakes.reduce((sum, stake) => sum + Number.parseFloat(stake.amount), 0)
  const inflowTotal = transactions
    .filter((t) => t.transaction_type === "inflow")
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0)

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{artist?.artist_name}'s Vault</h1>
            <p className="text-white/60">Manage your artist treasury and reinvestment rules</p>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Treasury Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/90">Treasury Balance</CardTitle>
                <Vault className="w-5 h-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-1">
                {Number.parseFloat(artist?.treasury_balance || 0).toFixed(2)}
                <span className="text-amber-400 text-xl ml-2">BC</span>
              </div>
              <p className="text-white/60 text-sm">Your active treasury funds</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Total Earned</CardTitle>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Number.parseFloat(artist?.total_earned || 0).toFixed(2)}
                <span className="text-amber-400 text-lg ml-2">BC</span>
              </div>
              <p className="text-white/60 text-sm">All-time revenue</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Supporters</CardTitle>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stakes.length}</div>
              <p className="text-white/60 text-sm">{totalStaked.toFixed(2)} BC total staked</p>
            </CardContent>
          </Card>
        </div>

        {/* Artist Profile Card */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white text-xl">{artist?.artist_name}</CardTitle>
                {artist?.genre && (
                  <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-400">
                    {artist.genre}
                  </Badge>
                )}
              </div>
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Edit Artist Profile</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-white">
                        Genre
                      </Label>
                      <Input
                        id="genre"
                        placeholder="e.g., Rock, Hip Hop, Electronic"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-white">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell your supporters about your music..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                      Save Changes
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {artist?.bio && <p className="text-white/70">{artist.bio}</p>}
            <div>
              <Label className="text-white/70 text-sm mb-2 block">Wallet Connection</Label>
              <WalletConnect
                initialAddress={user.wallet_type === "stellar" ? user.stellar_public_key : user.wallet_address}
                initialChain={user.wallet_type || "ethereum"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-800 text-white">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="supporters" className="data-[state=active]:bg-zinc-800 text-white">
              Supporters
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-zinc-800 text-white">
              Auto-Reinvest Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-2 mt-4">
            {transactions.length === 0 ? (
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="py-12 text-center">
                  <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No transactions yet</p>
                  <p className="text-white/30 text-sm mt-1">Your treasury activity will appear here</p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="bg-zinc-900 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.transaction_type === "inflow"
                              ? "bg-green-500/20"
                              : tx.transaction_type === "distribution"
                                ? "bg-purple-500/20"
                                : "bg-amber-500/20"
                          }`}
                        >
                          {tx.transaction_type === "inflow" ? (
                            <ArrowDownRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{tx.category}</p>
                          <p className="text-white/60 text-sm">{tx.description}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            tx.transaction_type === "inflow" ? "text-green-400" : "text-white"
                          }`}
                        >
                          {tx.transaction_type === "inflow" ? "+" : "-"}
                          {Number.parseFloat(tx.amount).toFixed(2)} BC
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            tx.transaction_type === "inflow"
                              ? "border-green-500/30 text-green-400"
                              : tx.transaction_type === "distribution"
                                ? "border-purple-500/30 text-purple-400"
                                : "border-amber-500/30 text-amber-400"
                          }`}
                        >
                          {tx.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="supporters" className="space-y-4 mt-4">
            {stakes.length === 0 ? (
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No supporters yet</p>
                  <p className="text-white/30 text-sm mt-1">When fans stake on you, they'll appear here</p>
                </CardContent>
              </Card>
            ) : (
              stakes.map((stake) => (
                <Card key={stake.id} className="bg-zinc-900 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">{stake.display_name || stake.email}</p>
                        <p className="text-white/60 text-sm">{stake.email}</p>
                        <p className="text-white/40 text-xs mt-1">
                          Staked {formatDistance(new Date(stake.staked_at), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-400">
                          {Number.parseFloat(stake.amount).toFixed(2)} BC
                        </div>
                        <p className="text-green-400 text-sm mt-1">
                          {Number.parseFloat(stake.total_rewards).toFixed(2)} BC earned
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Auto-Reinvestment Rules</CardTitle>
                <CardDescription className="text-white/60">
                  Configure how your treasury automatically allocates funds for growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {rules.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No reinvestment rules configured</p>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="space-y-3 p-4 bg-zinc-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{rule.rule_name}</p>
                          <p className="text-white/60 text-sm">{rule.category}</p>
                        </div>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => handleUpdateRule(rule.id, rule.percentage, checked)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Label className="text-white/70">Allocation</Label>
                          <span className="text-amber-400 font-medium">{rule.percentage}%</span>
                        </div>
                        <Slider
                          value={[rule.percentage]}
                          onValueChange={([value]) => handleUpdateRule(rule.id, value, rule.is_active)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
