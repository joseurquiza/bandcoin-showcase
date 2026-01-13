"use client"

import type React from "react"

import { useState } from "react"
import { Gem, Sparkles, ArrowLeft, X, Download, Share2, Calendar, Trash2, Send, RotateCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { deleteCollectible, sendCollectible } from "@/app/collectibles/collectibles-actions"

interface Collectible {
  id: number
  name: string
  description: string
  material: string
  shape: string
  color_palette: string
  rarity: string
  image_url: string
  created_at: string
  metadata?: {
    material: string
    shape: string
  }
}

interface MyCollectionClientProps {
  initialCollectibles: Collectible[]
}

function CollectibleModal({
  collectible,
  onClose,
  onDelete,
}: { collectible: Collectible; onClose: () => void; onDelete: (id: number) => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSendForm, setShowSendForm] = useState(false)
  const [recipientWallet, setRecipientWallet] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isFlipped, setIsFlipped] = useState(false)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-600"
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-600"
      case "uncommon":
        return "bg-gradient-to-r from-green-500 to-emerald-600"
      default:
        return "bg-gray-600"
    }
  }

  const handleDownload = async () => {
    if (collectible.image_url) {
      const response = await fetch(collectible.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collectible.name.replace(/\s+/g, "-")}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: collectible.name,
          text: collectible.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCollectible(collectible.id)
      if (result.success) {
        onDelete(collectible.id)
        onClose()
      } else {
        alert(result.error || "Failed to delete collectible")
      }
    } catch (error) {
      console.error("Error deleting collectible:", error)
      alert("Failed to delete collectible")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSend = async () => {
    if (!recipientWallet.trim()) {
      setSendError("Please enter a recipient wallet address")
      return
    }

    setIsSending(true)
    setSendError("")

    try {
      const result = await sendCollectible(collectible.id, recipientWallet.trim())
      if (result.success) {
        alert(`Successfully sent "${collectible.name}" to ${recipientWallet.substring(0, 8)}...`)
        onDelete(collectible.id) // Remove from current user's collection
        onClose()
      } else {
        setSendError(result.error || "Failed to send collectible")
      }
    } catch (error) {
      console.error("Error sending collectible:", error)
      setSendError("Failed to send collectible. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -15 // Max 15deg tilt
    const rotateY = ((x - centerX) / centerX) * 15
    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal content */}
      <div
        className="relative z-10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-amber-500/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Image with enhanced 3D animations */}
          <div className="relative group">
            <div className="relative perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div
                className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/20 transition-transform duration-300 ease-out preserve-3d"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isFlipped ? "rotateY(180deg)" : ""}`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Front side */}
                <div className={`absolute inset-0 backface-hidden ${isFlipped ? "invisible" : "visible"}`}>
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"
                    style={{
                      transform: `translateZ(20px) scale(1.05)`,
                    }}
                  />

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent opacity-50 animate-pulse"
                    style={{
                      transform: `translateZ(30px) scale(1.08)`,
                    }}
                  />

                  {/* Collectible image with parallax depth */}
                  <div
                    className="relative w-full h-full animate-float z-10"
                    style={{
                      transform: `translateZ(50px)`,
                    }}
                  >
                    {collectible.image_url ? (
                      <img
                        src={collectible.image_url || "/placeholder.svg"}
                        alt={collectible.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gem className="h-24 w-24 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Shine effect layer */}
                  <div
                    className="absolute inset-0 opacity-70 z-20"
                    style={{
                      transform: `translateZ(60px)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-sweep" />
                  </div>

                  {/* Outer glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-30 blur-2xl animate-pulse" />
                </div>

                {/* Back side - collectible details */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 flex flex-col justify-center backface-hidden ${isFlipped ? "visible" : "invisible"}`}
                  style={{
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center space-y-4">
                    <Gem className="h-16 w-16 text-amber-400 mx-auto" />
                    <h3 className="text-2xl font-bold text-amber-400">{collectible.name}</h3>
                    <p className="text-gray-400 text-sm">{collectible.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-500">Material</div>
                        <div className="text-white font-semibold">{collectible.metadata?.material || "Unknown"}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-500">Shape</div>
                        <div className="text-white font-semibold">{collectible.metadata?.shape || "Unknown"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-amber-400 transition-colors backdrop-blur-sm"
                title={isFlipped ? "Show front" : "Show details"}
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 border-amber-500/30 hover:bg-amber-500/10 text-amber-400 bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setShowSendForm(true)}
                variant="outline"
                className="border-green-500/30 hover:bg-green-500/10 text-green-400 bg-transparent"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="border-red-500/30 hover:bg-red-500/10 text-red-400 bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Send collectible form */}
            {showSendForm && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Send Collectible</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Enter the recipient's Stellar wallet address to transfer this collectible to them.
                </p>
                <Input
                  type="text"
                  placeholder="G... (Stellar address)"
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  className="mb-3 bg-black/50 border-green-500/30 text-white placeholder:text-gray-500"
                />
                {sendError && <p className="text-red-400 text-sm mb-3">{sendError}</p>}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSend}
                    disabled={isSending}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSendForm(false)
                      setSendError("")
                      setRecipientWallet("")
                    }}
                    variant="outline"
                    className="flex-1 border-gray-500/30 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm mb-3">
                  Are you sure you want to delete this collectible? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 border-gray-500/30 text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-6">
            {/* Header with rarity */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-3xl font-bold text-white">{collectible.name}</h2>
                <Badge
                  className={`${getRarityColor(collectible.rarity)} px-3 py-1.5 text-sm font-bold uppercase shadow-lg`}
                >
                  {collectible.rarity}
                </Badge>
              </div>
              <p className="text-gray-400 text-base leading-relaxed">{collectible.description}</p>
            </div>

            {/* Properties grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-500 text-sm mb-1">Material</div>
                <div className="text-white font-semibold capitalize">{collectible.material}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-500 text-sm mb-1">Shape</div>
                <div className="text-white font-semibold capitalize">{collectible.shape}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-500 text-sm mb-1">Color Palette</div>
                <div className="text-white font-semibold capitalize">{collectible.color_palette}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="text-gray-500 text-sm mb-1">Rarity</div>
                <div className="text-white font-semibold capitalize">{collectible.rarity}</div>
              </div>
            </div>

            {/* Created date */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Created on{" "}
                  {new Date(collectible.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Stats or additional info */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-gray-400 text-sm mb-2">Collectible ID</div>
              <div className="font-mono text-amber-400">#{String(collectible.id).padStart(6, "0")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectibleCard({ collectible, onClick }: { collectible: Collectible; onClick: () => void }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
      case "epic":
        return "bg-gradient-to-r from-purple-500 to-pink-600"
      case "rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-600"
      case "uncommon":
        return "bg-gradient-to-r from-green-500 to-emerald-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Sweeping shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-sweep" />
      </div>

      {/* Collectible Image with enhanced effects */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950">
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 animate-pulse" />

        {collectible.image_url ? (
          <img
            src={collectible.image_url || "/placeholder.svg"}
            alt={collectible.name}
            className="relative z-10 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gem className="h-16 w-16 text-gray-600" />
          </div>
        )}

        {/* Rarity badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
          <Badge
            className={`${getRarityColor(collectible.rarity)} px-2 py-1 text-xs sm:text-sm font-bold uppercase shadow-lg animate-pulse`}
          >
            {collectible.rarity}
          </Badge>
        </div>
      </div>

      {/* Card details */}
      <div className="relative z-10 p-3 sm:p-4">
        <h3 className="font-bold text-white mb-1 sm:mb-2 text-base sm:text-lg truncate">{collectible.name}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{collectible.description}</p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
            {collectible.shape}
          </Badge>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
            {collectible.material}
          </Badge>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
            {collectible.color_palette}
          </Badge>
        </div>

        <div className="text-xs text-gray-500">Created {new Date(collectible.created_at).toLocaleDateString()}</div>
      </div>

      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300 pointer-events-none" />
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-amber-500/50 transition-all duration-300 pointer-events-none" />
    </div>
  )
}

export default function MyCollectionClient({ initialCollectibles }: MyCollectionClientProps) {
  const [collectibles, setCollectibles] = useState(initialCollectibles)
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null)

  const handleDelete = (id: number) => {
    setCollectibles(collectibles.filter((c) => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/collectibles">
            <Button variant="ghost" className="mb-4 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Create
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Gem className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400" />
              <div className="absolute inset-0 blur-xl bg-amber-400/30" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              My Collection
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">Your personal collectible token gallery</p>
        </div>

        {/* Collection Grid */}
        {collectibles.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="relative inline-block mb-6">
              <Gem className="h-20 w-20 sm:h-24 sm:w-24 text-gray-600 mx-auto" />
              <div className="absolute inset-0 blur-2xl bg-amber-400/10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-3">No collectibles yet</h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-md mx-auto">
              Start creating unique collectible tokens to build your personal collection!
            </p>
            <Link href="/collectibles">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold h-11 px-6">
                <Sparkles className="h-5 w-5 mr-2" />
                Create Your First Collectible
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-400 text-sm sm:text-base">
                {collectibles.length} {collectibles.length === 1 ? "collectible" : "collectibles"} in your collection
              </p>
              <Link href="/collectibles">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {collectibles.map((collectible) => (
                <CollectibleCard
                  key={collectible.id}
                  collectible={collectible}
                  onClick={() => setSelectedCollectible(collectible)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {selectedCollectible && (
        <CollectibleModal
          collectible={selectedCollectible}
          onClose={() => setSelectedCollectible(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
