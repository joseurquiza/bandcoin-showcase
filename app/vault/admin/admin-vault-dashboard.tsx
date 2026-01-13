"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Vault,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Wallet,
  Share2,
} from "lucide-react"
import {
  getAllArtists,
  getAllSupporters,
  getRecentTransactions,
  addTransaction,
  getVaultStats,
  distributeVaultRevenue,
} from "../admin-actions"
import { signOut } from "../auth-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { VaultUser } from "../auth-actions"
import { formatDistance } from "date-fns"

export default function AdminVaultDashboard({ user }: { user: VaultUser }) {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [artists, setArtists] = useState<any[]>([])
  const [supporters, setSupporters] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false)
  const [distributionArtistId, setDistributionArtistId] = useState<number | null>(null)
  const [distributionAmount, setDistributionAmount] = useState("")
  const [isDistributing, setIsDistributing] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [transactionType, setTransactionType] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [statsRes, artistsRes, supportersRes, transactionsRes] = await Promise.all([
      getVaultStats(),
      getAllArtists(),
      getAllSupporters(),
      getRecentTransactions(20),
    ])

    if (statsRes.success) setStats(statsRes.stats)
    if (artistsRes.success) setArtists(artistsRes.artists)
    if (supportersRes.success) setSupporters(supportersRes.supporters)
    if (transactionsRes.success) setTransactions(transactionsRes.transactions)

    setLoading(false)
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedArtist || !amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please fill all required fields")
      return
    }

    const result = await addTransaction(
      Number.parseInt(selectedArtist),
      transactionType,
      category,
      Number.parseFloat(amount),
      description,
    )

    if (result.success) {
      toast.success("Transaction added successfully")
      setDialogOpen(false)
      setSelectedArtist("")
      setAmount("")
      setDescription("")
      setCategory("")
      loadData()
    } else {
      toast.error(result.error || "Failed to add transaction")
    }
  }

  const handleDistributeRevenue = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!distributionArtistId || !distributionAmount || Number.parseFloat(distributionAmount) <= 0) {
      toast.error("Please enter a valid distribution amount")
      return
    }

    setIsDistributing(true)

    try {
      const result = await distributeVaultRevenue(distributionArtistId, Number.parseFloat(distributionAmount))

      if (result.success) {
        toast.success(result.message || "Distribution initiated. Sign the transaction in your wallet.")
        setDistributionDialogOpen(false)
        setDistributionAmount("")
        setDistributionArtistId(null)
        loadData()
      } else {
        toast.error(result.error || "Failed to create distribution")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsDistributing(false)
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

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Vault Dashboard</h1>
            <p className="text-white/60">Manage the entire BandCoin treasury ecosystem</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-white/60">Signed in as</p>
              <p className="text-white font-medium">{user.email}</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Total Artists</CardTitle>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.total_artists || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Total Supporters</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats?.total_supporters || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-white/70">Total Treasury</CardTitle>
                <Vault className="w-4 h-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {Number.parseFloat(stats?.total_treasury || 0).toFixed(2)}{" "}
                <span className="text-amber-400 text-lg">BC</span>
              </div>
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
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="artists" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="bg-zinc-900 border border-white/10">
              <TabsTrigger value="artists" className="data-[state=active]:bg-zinc-800 text-white">
                Artists
              </TabsTrigger>
              <TabsTrigger value="supporters" className="data-[state=active]:bg-zinc-800 text-white">
                Supporters
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-800 text-white">
                Transactions
              </TabsTrigger>
            </TabsList>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Transaction</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Manually add revenue or payout to an artist's treasury
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="artist" className="text-white">
                      Artist
                    </Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select artist" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id.toString()} className="text-white">
                            {artist.artist_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">
                      Transaction Type
                    </Label>
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="inflow" className="text-white">
                          Inflow (Add Funds)
                        </SelectItem>
                        <SelectItem value="payout" className="text-white">
                          Payout (Remove Funds)
                        </SelectItem>
                        <SelectItem value="distribution" className="text-white">
                          Distribution (To Supporters)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <Input
                      id="category"
                      placeholder="e.g., Merch Sales, Streaming, Tour Advance"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">
                      Amount (BC)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Optional notes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                    Add Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="artists" className="space-y-4">
            {artists.map((artist) => (
              <Card key={artist.id} className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{artist.artist_name}</CardTitle>
                      <CardDescription className="text-white/60 mt-1">
                        {artist.genre && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                            {artist.genre}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {Number.parseFloat(artist.treasury_balance).toFixed(2)}{" "}
                        <span className="text-amber-400 text-sm">BC</span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">Treasury Balance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-white/50">Email</p>
                      <p className="text-white truncate">{artist.email}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Total Earned</p>
                      <p className="text-green-400 font-medium">
                        {Number.parseFloat(artist.total_earned).toFixed(2)} BC
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Total Distributed</p>
                      <p className="text-purple-400 font-medium">
                        {Number.parseFloat(artist.total_distributed).toFixed(2)} BC
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Wallet</p>
                      {artist.wallet_address || artist.stellar_public_key ? (
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-white/70" />
                          <p className="text-white/70 truncate">
                            {artist.wallet_type === "stellar" && artist.stellar_public_key
                              ? `${artist.stellar_public_key.slice(0, 6)}...${artist.stellar_public_key.slice(-4)}`
                              : artist.wallet_address
                                ? `${artist.wallet_address.slice(0, 6)}...${artist.wallet_address.slice(-4)}`
                                : "Not connected"}
                          </p>
                          {(artist.wallet_type === "stellar" || artist.stellar_public_key) && (
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              Stellar
                            </Badge>
                          )}
                          {artist.wallet_type === "ethereum" && artist.wallet_address && (
                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                              Ethereum
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-white/40">Not connected</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setDistributionArtistId(artist.id)
                      setDistributionDialogOpen(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Distribute Revenue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="supporters" className="space-y-4">
            {supporters.map((supporter) => (
              <Card key={supporter.id} className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{supporter.display_name || supporter.email}</CardTitle>
                      <CardDescription className="text-white/60">{supporter.email}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{supporter.active_stakes}</div>
                      <p className="text-xs text-white/50">Active Stakes</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/50">Total Staked</p>
                      <p className="text-blue-400 font-medium">
                        {Number.parseFloat(supporter.total_staked).toFixed(2)} BC
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Total Rewards</p>
                      <p className="text-green-400 font-medium">
                        {Number.parseFloat(supporter.total_rewards).toFixed(2)} BC
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50">Wallet</p>
                      {supporter.wallet_address || supporter.stellar_public_key ? (
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-white/70" />
                          <p className="text-white/70 truncate">
                            {supporter.wallet_type === "stellar" && supporter.stellar_public_key
                              ? `${supporter.stellar_public_key.slice(0, 6)}...${supporter.stellar_public_key.slice(-4)}`
                              : supporter.wallet_address
                                ? `${supporter.wallet_address.slice(0, 6)}...${supporter.wallet_address.slice(-4)}`
                                : "Not connected"}
                          </p>
                          {(supporter.wallet_type === "stellar" || supporter.stellar_public_key) && (
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              Stellar
                            </Badge>
                          )}
                          {supporter.wallet_type === "ethereum" && supporter.wallet_address && (
                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                              Ethereum
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-white/40">Not connected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-2">
            {transactions.map((tx) => (
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
                              : "bg-red-500/20"
                        }`}
                      >
                        {tx.transaction_type === "inflow" ? (
                          <ArrowDownRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{tx.artist_name}</p>
                        <p className="text-white/60 text-sm">
                          {tx.category} • {tx.description}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                          {tx.created_by_name && ` by ${tx.created_by_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          tx.transaction_type === "inflow" ? "text-green-400" : "text-red-400"
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
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {tx.transaction_type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      {/* Distribution Dialog */}
      <Dialog open={distributionDialogOpen} onOpenChange={setDistributionDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-400" />
              Distribute Vault Revenue
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Distribute revenue to all vault shareholders proportionally to their stake
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDistributeRevenue} className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-white/80 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="font-medium">How it works:</span>
              </p>
              <p className="text-xs text-white/60 mt-2">
                This creates a blockchain transaction that distributes the specified amount to all vault shareholders
                based on their share ownership percentage. The share price will increase, benefiting all supporters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distribution-amount" className="text-white">
                Distribution Amount (BC)
              </Label>
              <Input
                id="distribution-amount"
                type="number"
                step="0.00000001"
                placeholder="0.00000000"
                value={distributionAmount}
                onChange={(e) => setDistributionAmount(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-white/40 text-xs">
                This amount will be distributed proportionally to all vault shareholders
              </p>
            </div>

            {!user.wallet_address && !user.stellar_public_key && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">Please connect a wallet to sign the distribution transaction</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isDistributing || (!user.wallet_address && !user.stellar_public_key)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isDistributing ? "Creating Transaction..." : "Create Distribution Transaction"}
            </Button>

            <p className="text-white/30 text-xs text-center">
              You'll need to sign the blockchain transaction in your wallet to complete this distribution
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
