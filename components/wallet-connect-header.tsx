"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Wallet, CheckCircle2, Mail, PlayCircle } from "lucide-react"
import { signIn, signOut as vaultSignOut, getCurrentUser } from "@/app/vault/auth-actions"
import { saveWalletAddress, clearWalletAddress, getWalletConnection } from "@/app/rewards/rewards-actions"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFreighter } from "@/hooks/use-freighter"
import { replayOnboarding } from "@/components/star-wars-onboarding"

declare global {
  interface Window {
    ethereum?: any
    freighterApi?: any
    solana?: any
  }
}

type ChainType = "ethereum" | "stellar" | "solana"
type WalletType = "metamask" | "phantom" | "bandcoin" | "walletconnect"
type AuthMethod = "wallet" | "email"

const WALLET_OPTIONS = [
  {
    id: "metamask" as WalletType,
    name: "MetaMask",
    description: "Connect with MetaMask wallet",
    icon: "🦊",
    chain: "ethereum" as ChainType,
    bgGradient: "from-orange-500 to-yellow-500",
  },
  {
    id: "phantom" as WalletType,
    name: "Phantom",
    description: "Connect with Phantom wallet",
    icon: "👻",
    chain: "solana" as ChainType,
    bgGradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "bandcoin" as WalletType,
    name: "Freighter Wallet",
    description: "Connect with Stellar (Freighter)",
    icon: "🎸",
    chain: "stellar" as ChainType,
    bgGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "walletconnect" as WalletType,
    name: "WalletConnect",
    description: "Connect with WalletConnect",
    icon: "🔗",
    chain: "ethereum" as ChainType,
    bgGradient: "from-blue-600 to-blue-700",
  },
]

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [chainType, setChainType] = useState<ChainType>("ethereum")
  const [walletType, setWalletType] = useState<WalletType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authMethod, setAuthMethod] = useState<AuthMethod>("wallet")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailUser, setEmailUser] = useState<{ email: string; displayName: string | null } | null>(null)
  const [mounted, setMounted] = useState(false)
  const freighter = useFreighter()

  useEffect(() => {
    setMounted(true)
    checkEmailSession()
    restoreWalletConnection()
  }, [])

  async function checkEmailSession() {
    const user = await getCurrentUser()
    if (user) {
      setEmailUser({ email: user.email, displayName: user.display_name })
      setAuthMethod("email")
    }
  }

  async function restoreWalletConnection() {
    try {
      const connection = await getWalletConnection()

      if (connection) {
        setAddress(connection.address)
        setWalletType(connection.walletType as WalletType)
        setChainType(connection.chainType as ChainType)
        console.log("[v0] Restored wallet connection:", connection.address)
      }
    } catch (error) {
      console.error("[v0] Error restoring wallet connection:", error)
    }
  }

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      console.log("[v0] MetaMask connection failed: MetaMask not detected")
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask extension",
      })
      return
    }

    setConnecting(true)
    console.log("[v0] Starting MetaMask connection...")

    try {
      console.log("[v0] Requesting MetaMask accounts...")
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const walletAddress = accounts[0]
      console.log("[v0] MetaMask connected, address:", walletAddress)
      setAddress(walletAddress)
      setChainType("ethereum")
      setWalletType("metamask")

      console.log("[v0] Saving wallet address to rewards system...")
      const result = await saveWalletAddress(walletAddress, "ethereum")
      console.log("[v0] Save wallet result:", result)

      if (result.success) {
        toast.success("MetaMask connected", {
          description: `Connected ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        })
        setIsModalOpen(false)
        window.dispatchEvent(new CustomEvent("walletConnected"))
      } else {
        console.error("[v0] Failed to save wallet address:", result.error)
        toast.error("Failed to save wallet address")
      }
    } catch (error: any) {
      console.error("[v0] MetaMask connection error:", error)
      toast.error("Connection failed", {
        description: error.message || "Failed to connect MetaMask",
      })
    } finally {
      setConnecting(false)
    }
  }

  const connectPhantom = async () => {
    if (typeof window === "undefined" || !window.solana) {
      console.log("[v0] Phantom connection failed: Phantom not detected")
      toast.error("Phantom not detected", {
        description: "Please install Phantom wallet",
      })
      return
    }

    setConnecting(true)
    console.log("[v0] Starting Phantom connection...")

    try {
      console.log("[v0] Requesting Phantom connection...")
      const resp = await window.solana.connect()
      const walletAddress = resp.publicKey.toString()
      console.log("[v0] Phantom connected, address:", walletAddress)

      setAddress(walletAddress)
      setChainType("solana")
      setWalletType("phantom")

      console.log("[v0] Saving wallet address to rewards system...")
      const result = await saveWalletAddress(walletAddress, "solana")
      console.log("[v0] Save wallet result:", result)

      if (result.success) {
        toast.success("Phantom connected", {
          description: `Connected ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        })
        setIsModalOpen(false)
        window.dispatchEvent(new CustomEvent("walletConnected"))
      } else {
        console.error("[v0] Failed to save wallet address:", result.error)
        toast.error("Failed to save wallet address", {
          description: result.error || "Please try again",
        })
      }
    } catch (error: any) {
      console.error("[v0] Phantom connection error:", error)
      toast.error("Connection failed", {
        description: error.message || "Failed to connect Phantom",
      })
    } finally {
      setConnecting(false)
    }
  }

  const connectBandCoin = async () => {
    setConnecting(true)
    console.log("[v0] Starting BandCoin Wallet (Freighter) connection...")

    try {
      console.log("[v0] Requesting Freighter access...")
      const publicKey = await freighter.connect()
      console.log("[v0] Freighter connected, public key:", publicKey)

      setAddress(publicKey)
      setChainType("stellar")
      setWalletType("bandcoin")

      console.log("[v0] Saving Stellar wallet address to rewards system...")
      const result = await saveWalletAddress(publicKey, "stellar")
      console.log("[v0] Save wallet result:", result)

      if (result.success) {
        toast.success("BandCoin Wallet connected", {
          description: `Connected ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
        })
        setIsModalOpen(false)
        window.dispatchEvent(new CustomEvent("walletConnected"))
      } else {
        console.error("[v0] Failed to save wallet address:", result.error)
        toast.error("Failed to save wallet address", {
          description: result.error || "Please try again",
        })
      }
    } catch (error: any) {
      console.error("[v0] BandCoin Wallet connection error:", error)
      toast.error("Connection failed", {
        description: error.message || "Failed to connect BandCoin Wallet. Please ensure Freighter is installed.",
      })
    } finally {
      setConnecting(false)
    }
  }

  const connectWalletConnect = async () => {
    toast.info("Coming soon", {
      description: "WalletConnect integration is in progress",
    })
  }

  const handleWalletSelect = (wallet: WalletType) => {
    switch (wallet) {
      case "metamask":
        connectMetaMask()
        break
      case "phantom":
        connectPhantom()
        break
      case "bandcoin":
        connectBandCoin()
        break
      case "walletconnect":
        connectWalletConnect()
        break
    }
  }

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setConnecting(true)

    try {
      const result = await signIn(email, password)

      if (result.success && result.user) {
        setEmailUser({ email: result.user.email, displayName: result.user.display_name })
        setAuthMethod("email")
        toast.success("Signed in successfully", {
          description: `Welcome back, ${result.user.display_name || result.user.email}`,
        })
        setIsModalOpen(false)
        window.dispatchEvent(new CustomEvent("walletConnected"))
      } else {
        toast.error("Sign in failed", {
          description: result.error || "Invalid credentials",
        })
      }
    } catch (error: any) {
      console.error("Email login error:", error)
      toast.error("Login failed", {
        description: error.message || "An error occurred",
      })
    } finally {
      setConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (authMethod === "email") {
      await vaultSignOut()
      setEmailUser(null)
      toast.success("Signed out successfully")
    } else {
      await clearWalletAddress()

      if (walletType === "bandcoin") {
        freighter.disconnect()
      }
      setAddress(null)
      setWalletType(null)
      toast.success("Wallet disconnected")

      window.location.reload()
    }
  }

  const getWalletName = () => {
    const wallet = WALLET_OPTIONS.find((w) => w.id === walletType)
    return wallet?.name || "Wallet"
  }

  if (!mounted) {
    return (
      <Button
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        disabled
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect
      </Button>
    )
  }

  if (emailUser) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <div className="flex-1">
          <p className="text-xs text-white/60">Email Account</p>
          <p className="text-xs font-medium text-white">{emailUser.displayName || emailUser.email}</p>
        </div>
        <Button
          onClick={replayOnboarding}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
          title="Replay intro"
        >
          <PlayCircle className="w-3 h-3" />
        </Button>
        <Button
          onClick={disconnectWallet}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
        <CheckCircle2 className="w-4 h-4 text-green-400" />
        <div className="flex-1">
          <p className="text-xs text-white/60">{getWalletName()}</p>
          <p className="text-xs font-medium text-white">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <Button
          onClick={replayOnboarding}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
          title="Replay intro"
        >
          <PlayCircle className="w-3 h-3" />
        </Button>
        <Button
          onClick={disconnectWallet}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Connect to BandCoin</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Choose your preferred method to connect and earn BandCoin tokens
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="wallet" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="wallet" className="data-[state=active]:bg-zinc-700">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-zinc-700">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="mt-4">
              <div className="grid gap-3">
                {WALLET_OPTIONS.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletSelect(wallet.id)}
                    disabled={connecting}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.bgGradient} text-2xl`}
                    >
                      {wallet.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white group-hover:text-white/90">{wallet.name}</h3>
                      <p className="text-sm text-zinc-400">{wallet.description}</p>
                    </div>
                    <div className="text-zinc-600 group-hover:text-zinc-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled={connecting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    disabled={connecting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleEmailLogin()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleEmailLogin}
                  disabled={connecting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {connecting ? "Signing in..." : "Sign In"}
                </Button>
                <p className="text-xs text-center text-zinc-500">
                  {"Don't have an account? "}
                  <a href="/vault/signup" className="text-purple-400 hover:text-purple-300">
                    Sign up
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-zinc-500 mt-4 text-center">Earn BandCoin tokens as you explore and use apps</p>
        </DialogContent>
      </Dialog>
    </>
  )
}
