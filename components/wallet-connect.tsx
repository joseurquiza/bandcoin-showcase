"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, CheckCircle2 } from "lucide-react"
import { updateWalletAddress } from "@/app/vault/auth-actions"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    ethereum?: any
    freighterApi?: any
  }
}

type ChainType = "ethereum" | "stellar"

export default function WalletConnect({
  initialAddress,
  initialChain = "ethereum",
}: {
  initialAddress: string | null
  initialChain?: ChainType
}) {
  const [address, setAddress] = useState<string | null>(initialAddress)
  const [connecting, setConnecting] = useState(false)
  const [selectedChain, setSelectedChain] = useState<ChainType>(initialChain)

  useEffect(() => {
    if (typeof window !== "undefined" && initialAddress) {
      setAddress(initialAddress)
      setSelectedChain(initialChain)
    }
  }, [initialAddress, initialChain])

  const connectEthereum = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask to connect your Ethereum wallet",
      })
      return
    }

    setConnecting(true)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const walletAddress = accounts[0]
      setAddress(walletAddress)
      setSelectedChain("ethereum")

      const result = await updateWalletAddress(walletAddress, "ethereum")

      if (result.success) {
        toast.success("Ethereum wallet connected", {
          description: `Connected ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        })
      } else {
        toast.error("Failed to save wallet address")
      }
    } catch (error: any) {
      console.error("Ethereum wallet connection error:", error)
      toast.error("Connection failed", {
        description: error.message || "Failed to connect Ethereum wallet",
      })
    } finally {
      setConnecting(false)
    }
  }

  const connectStellar = async () => {
    if (typeof window === "undefined") {
      toast.error("Browser not supported")
      return
    }

    // Check for Freighter wallet
    const isFreighterInstalled = await window.freighterApi?.isConnected()

    if (!isFreighterInstalled) {
      toast.error("Freighter Wallet not detected", {
        description: "Please install Freighter to connect your Stellar wallet",
      })
      return
    }

    setConnecting(true)

    try {
      const publicKey = await window.freighterApi.getPublicKey()

      setAddress(publicKey)
      setSelectedChain("stellar")

      const result = await updateWalletAddress(publicKey, "stellar")

      if (result.success) {
        toast.success("Stellar wallet connected", {
          description: `Connected ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
        })
      } else {
        toast.error("Failed to save wallet address")
      }
    } catch (error: any) {
      console.error("Stellar wallet connection error:", error)
      toast.error("Connection failed", {
        description: error.message || "Failed to connect Stellar wallet",
      })
    } finally {
      setConnecting(false)
    }
  }

  const connectWallet = () => {
    if (selectedChain === "ethereum") {
      connectEthereum()
    } else {
      connectStellar()
    }
  }

  const disconnectWallet = async () => {
    setAddress(null)
    await updateWalletAddress("", selectedChain)
    toast.success("Wallet disconnected")
  }

  if (address) {
    return (
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {selectedChain === "ethereum" ? "Ethereum" : "Stellar"} Wallet Connected
          </p>
          <p className="text-xs text-green-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <Button
          onClick={disconnectWallet}
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Tabs value={selectedChain} onValueChange={(v) => setSelectedChain(v as ChainType)}>
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger value="ethereum" className="data-[state=active]:bg-purple-600">
            Ethereum
          </TabsTrigger>
          <TabsTrigger value="stellar" className="data-[state=active]:bg-blue-600">
            Stellar
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Button
        onClick={connectWallet}
        disabled={connecting}
        className={`w-full ${
          selectedChain === "ethereum"
            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        }`}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {connecting ? "Connecting..." : `Connect ${selectedChain === "ethereum" ? "MetaMask" : "Freighter"}`}
      </Button>

      <p className="text-xs text-zinc-400 text-center">
        {selectedChain === "ethereum" ? "Install MetaMask browser extension" : "Install Freighter browser extension"}
      </p>
    </div>
  )
}
