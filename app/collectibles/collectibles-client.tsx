"use client"

import { useRef } from "react"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Sparkles,
  Coins,
  Gem,
  CircleDot,
  Hexagon,
  Star,
  Shield,
  Loader2,
  ImageIcon,
  Trophy,
  Zap,
  Upload,
  X,
  ShoppingCart,
  Check,
  RefreshCw,
  Wallet,
} from "lucide-react"
import {
  generateCollectiblesPrompt,
  generateCollectibleImage,
  saveCollectible,
  checkCollectiblesUsage,
  getMyCollectibles,
  getPublicCollectibles,
} from "./collectibles-actions"
import Image from "next/image"
import Link from "next/link"
import { requestStellarPayment } from "@/lib/stellar-payment"
import { getStellarBandCoinBalance } from "@/lib/stellar-balance"
import { getWalletConnection } from "@/app/rewards/rewards-actions"

const MATERIALS = [
  { value: "gold", label: "Gold", icon: Coins, color: "text-yellow-400" },
  { value: "silver", label: "Silver", icon: Coins, color: "text-gray-300" },
  { value: "bronze", label: "Bronze", icon: Coins, color: "text-amber-600" },
  { value: "platinum", label: "Platinum", icon: Gem, color: "text-blue-200" },
  { value: "crystal", label: "Crystal", icon: Gem, color: "text-cyan-300" },
  { value: "obsidian", label: "Obsidian", icon: Gem, color: "text-purple-900" },
]

const SHAPES = [
  { value: "coin", label: "Coin", icon: CircleDot },
  { value: "hexagon", label: "Hexagon", icon: Hexagon },
  { value: "star", label: "Star", icon: Star },
  { value: "shield", label: "Shield", icon: Shield },
]

const STYLES = [
  { value: "classic", label: "Classic" },
  { value: "futuristic", label: "Futuristic" },
  { value: "mystical", label: "Mystical" },
  { value: "steampunk", label: "Steampunk" },
  { value: "minimalist", label: "Minimalist" },
  { value: "ornate", label: "Ornate" },
]

const RARITY_COLORS: Record<string, string> = {
  common: "bg-gray-500",
  uncommon: "bg-green-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
}

interface Props {
  initialCollectibles?: any[]
  initialPublicCollectibles?: any[]
}

export default function CollectiblesClient({ initialCollectibles = [], initialPublicCollectibles = [] }: Props) {
  const [name, setName] = useState("")
  const [theme, setTheme] = useState("")
  const [description, setDescription] = useState("")
  const [material, setMaterial] = useState("gold")
  const [shape, setShape] = useState("coin")
  const [style, setStyle] = useState("classic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [remaining, setRemaining] = useState<number | null>(null)
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null)
  const [referencePhotoName, setReferencePhotoName] = useState<string>("")

  const [myCollectibles, setMyCollectibles] = useState<any[]>(initialCollectibles)
  const [publicCollectibles, setPublicCollectibles] = useState<any[]>(initialPublicCollectibles)
  const [isLoading, setIsLoading] = useState(false)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [generationAttempts, setGenerationAttempts] = useState<number>(0)
  const [maxAttempts, setMaxAttempts] = useState<number>(0)
  const [paidSession, setPaidSession] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewTilt, setPreviewTilt] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadData()
    checkWalletConnection()

    // Listen for wallet connection events
    const handleWalletConnected = () => {
      console.log("[v0] Wallet connected event detected, reloading usage info...")
      loadData()
      checkWalletConnection()
    }

    window.addEventListener("walletConnected", handleWalletConnected)

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected)
    }
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usageResult, myResult, galleryResult] = await Promise.all([
        checkCollectiblesUsage(),
        getMyCollectibles(),
        getPublicCollectibles(),
      ])

      setUsageInfo(usageResult)
      setRemaining(usageResult.remaining)

      if (myResult.success) setMyCollectibles(myResult.collectibles || [])
      if (galleryResult.success) setPublicCollectibles(galleryResult.collectibles || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkWalletConnection = async () => {
    try {
      console.log("[v0] Checking wallet connection from database...")
      const connection = await getWalletConnection()

      if (connection && connection.address) {
        console.log("[v0] Wallet connected:", connection.address)
        setWalletAddress(connection.address)

        // Query on-chain BANDCOIN balance
        console.log("[v0] Querying on-chain BANDCOIN balance for:", connection.address)
        const balance = await getStellarBandCoinBalance(connection.address)
        console.log("[v0] On-chain BANDCOIN balance:", balance)
        setWalletBalance(balance)
      } else {
        console.log("[v0] No wallet connection found in database")
        setWalletAddress(null)
        setWalletBalance(0)
      }
    } catch (error) {
      console.error("[v0] Error checking wallet connection:", error)
      setWalletAddress(null)
      setWalletBalance(0)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setReferencePhoto(base64)
      setReferencePhotoName(file.name)
      toast.success("Reference photo uploaded!")
    }
    reader.onerror = () => {
      toast.error("Failed to read image file.")
    }
    reader.readAsDataURL(file)
  }

  const removeReferencePhoto = () => {
    setReferencePhoto(null)
    setReferencePhotoName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!name.trim() || !theme.trim()) {
      toast.error("Please enter a name and theme for your collectible")
      return
    }

    setIsGenerating(true)
    if (!paidSession || generationAttempts === 0) {
      setGeneratedPrompt("")
      setGeneratedImage("")
      setGeneratedImages([])
      setSelectedImageIndex(0)
    }

    try {
      const promptResult = await generateCollectiblesPrompt(name, theme, material, shape, style, referencePhoto)

      if (!promptResult.success) {
        if (promptResult.error?.includes("free daily limit")) {
          toast.error(
            <div className="flex flex-col gap-2">
              <p>{promptResult.error}</p>
              <Link href="/buy-bandcoin">
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white w-full">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Buy BandCoin
                </Button>
              </Link>
            </div>,
            { duration: 5000 },
          )
        } else {
          toast.error(promptResult.error || "Failed to generate design")
        }
        return
      }

      if (promptResult.requiresPayment && !paidSession) {
        if (!walletAddress) {
          toast.error("Please connect your Stellar wallet to pay with BANDCOIN")
          return
        }

        if (walletBalance < 15) {
          toast.error("Insufficient BANDCOIN. You need 15 BC to generate a collectible.")
          return
        }

        toast.info("Please sign the payment transaction in Freighter...")

        const paymentResult = await requestStellarPayment({
          amount: "15",
          memo: `Collectible: ${name}`,
          userWallet: walletAddress,
        })

        if (!paymentResult.success) {
          toast.error(paymentResult.error || "Payment failed. Please try again.")
          return
        }

        await checkWalletConnection()

        setPaidSession(true)
        setMaxAttempts(3)
        setGenerationAttempts(0)
      }

      setGeneratedPrompt(promptResult.prompt || "")
      setRemaining(promptResult.remaining ?? null)

      let referenceImageData = undefined
      if (referencePhoto) {
        const matches = referencePhoto.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          referenceImageData = {
            mimeType: matches[1],
            base64Data: matches[2],
          }
        }
      }

      const imageResult = await generateCollectibleImage(promptResult.prompt || "", referenceImageData)

      if (!imageResult.success || !imageResult.imageUrls || imageResult.imageUrls.length === 0) {
        toast.error(imageResult.error || "Failed to generate image")
        return
      }

      setGeneratedImage(imageResult.imageUrls[0])
      setGeneratedImages([imageResult.imageUrls[0]])
      setSelectedImageIndex(0)
      setRemaining(imageResult.remaining ?? null)

      const newAttempt = generationAttempts + 1
      setGenerationAttempts(newAttempt)

      if (paidSession) {
        const remainingAttempts = maxAttempts - newAttempt
        if (remainingAttempts > 0) {
          toast.success(
            `Collectible generated! You have ${remainingAttempts} more attempt${remainingAttempts > 1 ? "s" : ""}.`,
          )
        } else {
          toast.success("Collectible generated! This was your last attempt.")
        }
      } else {
        toast.success("Collectible generated!")
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      toast.error(error.message || "Failed to generate collectible")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = () => {
    setPaidSession(false)
    setGenerationAttempts(0)
    setMaxAttempts(0)
    toast.success("Great choice! You can now save this collectible to your collection.")
  }

  const handleSave = async () => {
    if (!generatedImage || generatedImages.length === 0) {
      toast.error("Please generate a collectible first")
      return
    }

    const result = await saveCollectible({
      name,
      description: description || `A ${material} ${shape} token with ${theme} theme`,
      prompt: generatedPrompt,
      material,
      shape,
      colorPalette: style,
      rarity: "common",
      imageUrl: generatedImages[selectedImageIndex],
      walletAddress: undefined,
    })

    if (result.success) {
      toast.success("Collectible saved to your collection!")
      const updated = await getMyCollectibles()
      if (updated.success) {
        setMyCollectibles(updated.collectibles || [])
      }
    } else {
      toast.error(result.error || "Failed to save collectible")
    }
  }

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10 // Smaller tilt for preview
    const rotateY = ((x - centerX) / centerX) * 10
    setPreviewTilt({ x: rotateX, y: rotateY })
  }

  const handlePreviewMouseLeave = () => {
    setPreviewTilt({ x: 0, y: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Collectibles Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Create, manage, and explore unique AI-generated tokens</p>
            </div>
            <Link href="/my-collection">
              <Button variant="outline" className="border-amber-500/50 hover:bg-amber-500/10 bg-transparent">
                <Trophy className="h-4 w-4 mr-2" />
                View Full Collection
              </Button>
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-amber-500/20 p-3">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Collection</p>
                  <p className="text-2xl font-bold text-white">{myCollectibles.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-3">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Free Generations Left</p>
                  <p className="text-2xl font-bold text-white">{remaining ?? 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/20 p-3">
                  <Coins className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">BandCoin Balance</p>
                  <p className="text-2xl font-bold text-white">{walletBalance.toFixed(2)} BC</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Creation Form */}
          <div className="space-y-6">
            {!walletAddress && (
              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="rounded-full bg-amber-500/20 p-3">
                      <Wallet className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
                      <p className="text-sm text-gray-300 mb-4">
                        Connect your Stellar wallet to create collectibles and pay with BANDCOIN
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const connectBtn = document.querySelector("[data-wallet-connect]") as HTMLElement
                        if (connectBtn) connectBtn.click()
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Design Your Collectible
                </CardTitle>
                <CardDescription className="text-gray-400">Customize every aspect of your unique token</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={!walletAddress ? "opacity-50 pointer-events-none" : ""}>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Token Name</Label>
                    <Input
                      placeholder="e.g., Phoenix Rising"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Theme / Concept</Label>
                    <Textarea
                      placeholder="Describe your token's theme..."
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Reference Photo (Optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">Upload an image for inspiration</p>

                    {referencePhoto ? (
                      <div className="relative rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={referencePhoto || "/placeholder.svg"}
                              alt="Reference"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{referencePhotoName}</p>
                            <p className="text-xs text-gray-400">Reference image uploaded</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeReferencePhoto}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                      >
                        <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Material</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {MATERIALS.map((m) => {
                        const Icon = m.icon
                        return (
                          <button
                            key={m.value}
                            onClick={() => setMaterial(m.value)}
                            className={`p-3 rounded-lg border transition-all ${
                              material === m.value
                                ? "bg-amber-500/20 border-amber-500"
                                : "bg-white/5 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <Icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                            <span className="text-xs text-gray-300">{m.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Shape</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {SHAPES.map((s) => {
                        const Icon = s.icon
                        return (
                          <button
                            key={s.value}
                            onClick={() => setShape(s.value)}
                            className={`p-3 rounded-lg border transition-all ${
                              shape === s.value
                                ? "bg-amber-500/20 border-amber-500"
                                : "bg-white/5 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <Icon className="h-5 w-5 mx-auto mb-1 text-gray-300" />
                            <span className="text-xs text-gray-300">{s.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Art Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        {STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-white">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Description (Optional)</Label>
                    <Textarea
                      placeholder="Add a personal description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {generatedImages.length === 0 ? (
                    <Button
                      onClick={handleGenerate}
                      disabled={
                        !name || !theme || isGenerating || !walletAddress || (remaining === 0 && walletBalance < 15)
                      }
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold h-12"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Collectible
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={!generatedImages[selectedImageIndex]}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold h-12"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Accept This One
                      </Button>
                      {paidSession && generationAttempts < maxAttempts && (
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          variant="outline"
                          className="flex-1 border-amber-500/50 hover:bg-amber-500/10 h-12 bg-transparent text-white"
                        >
                          {isGenerating ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-5 w-5 mr-2" />
                          )}
                          Try Again ({maxAttempts - generationAttempts} left)
                        </Button>
                      )}
                    </div>
                  )}

                  {!walletAddress ? (
                    <p className="text-xs text-center text-gray-400">
                      Connect your wallet to start creating collectibles
                    </p>
                  ) : remaining === 0 && walletBalance < 15 ? (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-amber-400">No free uses or BandCoin available</p>
                      <Link href="/buy-bandcoin">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-amber-500/50 hover:bg-amber-500/10 bg-transparent"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy BandCoin
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-gray-400">
                      {remaining !== null && remaining > 0
                        ? `${remaining} free generation${remaining !== 1 ? "s" : ""} remaining today`
                        : walletBalance >= 15
                          ? `15 BC per generation • You have ${walletBalance.toFixed(2)} BC`
                          : "Ready to generate"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview & Recent Collection */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-cyan-400" />
                  Preview
                </CardTitle>
                <CardDescription className="text-gray-400">Your generated collectible will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 && generatedImages[selectedImageIndex] ? (
                  <div className="space-y-4">
                    <div
                      className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-amber-500/20 animate-shimmer transition-transform duration-300 ease-out cursor-pointer"
                      style={{
                        transform: `perspective(1000px) rotateX(${previewTilt.x}deg) rotateY(${previewTilt.y}deg)`,
                        transformStyle: "preserve-3d",
                      }}
                      onMouseMove={handlePreviewMouseMove}
                      onMouseLeave={handlePreviewMouseLeave}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-purple-500/10 animate-pulse"
                        style={{ transform: "translateZ(20px) scale(1.05)" }}
                      />
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{ transform: "translateZ(30px) scale(1.08)" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                      </div>
                      <div style={{ transform: "translateZ(50px)" }}>
                        <Image
                          src={generatedImages[selectedImageIndex] || "/placeholder.svg"}
                          alt="Generated collectible"
                          fill
                          className="object-contain animate-float relative z-10"
                        />
                      </div>
                      <div className="absolute top-4 right-4 z-20" style={{ transform: "translateZ(60px)" }}>
                        <Badge
                          className={`${RARITY_COLORS["legendary"]} text-white uppercase tracking-wider animate-pulse`}
                        >
                          {material.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{name || "Untitled"}</h3>
                      <p className="text-sm text-gray-400">{theme || "A unique collectible token"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        <CircleDot className="h-3 w-3 mr-1" />
                        {shape}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        {style}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-sm">No preview yet</p>
                    <p className="text-gray-600 text-xs mt-1">Generate a collectible to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Collection Preview */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Recent Collectibles
                  </CardTitle>
                  {myCollectibles.length > 0 && (
                    <Link href="/my-collection">
                      <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                        View All →
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                  </div>
                ) : myCollectibles.length === 0 ? (
                  <div className="text-center py-8">
                    <Gem className="h-12 w-12 mx-auto text-gray-700 animate-pulse" />
                    <p className="text-gray-500 text-sm">No collectibles yet</p>
                    <p className="text-gray-600 text-xs mt-1">Create your first one above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {myCollectibles.slice(0, 4).map((collectible) => (
                      <CollectibleCard key={collectible.id} collectible={collectible} compact />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectibleCard({
  collectible,
  showOwner = false,
  compact = false,
}: {
  collectible: any
  showOwner?: boolean
  compact?: boolean
}) {
  return (
    <Card
      className={`bg-white/5 border-white/10 hover:border-amber-500/50 transition-all overflow-hidden group ${
        compact ? "hover:shadow-none" : "hover:shadow-2xl hover:shadow-amber-500/20"
      }`}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.6s ease-out",
      }}
      onMouseMove={(e) => {
        if (compact) return
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
      }}
      onMouseLeave={(e) => {
        if (compact) return
        const card = e.currentTarget
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)"
      }}
    >
      <div className={`relative aspect-square ${compact ? "w-full" : ""}`}>
        {collectible.image_url ? (
          <div className="relative w-full h-full">
            {!compact && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </>
            )}
            <img
              src={collectible.image_url || "/placeholder.svg"}
              alt={collectible.name}
              className={`w-full h-full object-cover ${!compact ? "transition-transform duration-500 group-hover:scale-110" : ""}`}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <Gem className="h-12 w-12 sm:h-16 sm:w-16 text-gray-700 animate-pulse" />
          </div>
        )}
        <div
          className={`absolute top-2 ${compact ? "right-2" : "right-2 sm:right-2"} flex gap-1.5 ${compact ? "sm:gap-1.5" : "sm:gap-2"}`}
        >
          <Badge
            className={`${RARITY_COLORS[collectible.rarity] || RARITY_COLORS.common} text-white ${compact ? "text-[10px]" : "text-[10px] sm:text-xs"} px-1.5 sm:px-2 ${!compact ? "animate-pulse" : ""}`}
          >
            {collectible.rarity?.toUpperCase()}
          </Badge>
        </div>
        <div className={`absolute bottom-2 ${compact ? "left-2" : "left-2"}`}>
          <Badge className="bg-black/60 text-gray-300 text-[10px] sm:text-xs px-1.5 sm:px-2">
            {collectible.material}
          </Badge>
        </div>
      </div>
      <CardContent className={`p-3 ${compact ? "sm:p-3" : "sm:p-4"}`}>
        <h3 className={`font-semibold text-white truncate ${compact ? "text-sm" : "text-sm sm:text-base"}`}>
          {collectible.name}
        </h3>
        <p className={`text-gray-500 truncate ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
          {collectible.description}
        </p>
        <div
          className={`flex items-center gap-2 ${compact ? "sm:gap-2" : "sm:gap-3"} mt-2 ${compact ? "text-[10px]" : "text-[10px] sm:text-xs"} text-gray-400`}
        >
          <span className="flex items-center gap-1">
            <CircleDot className="h-3 w-3" />
            {collectible.shape}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className={`h-3 w-3 ${!compact ? "animate-pulse" : ""}`} />
            {collectible.color_palette}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

const float = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`

const shimmer = `
  @keyframes shimmer {
    0% {
      background-position: -500px 0;
    }
    100% {
      background-position: 500px 0;
    }
  }
`

const shine = `
  @keyframes shine {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`
