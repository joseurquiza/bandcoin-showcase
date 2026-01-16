"use client"

import { Textarea } from "@/components/ui/textarea"
import Image from "next/image" // Import Image component

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ImageIcon, Music, Wand2, Upload, Download, Camera, Video, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label" // Import Label component

import { useRef } from "react"
import type React from "react"
import {
  generateImageWithImagenAction,
  refinePromptAction,
  randomizePromptAction,
  extractStyleFromImageAction,
} from "./actions"
import { saveAssetToDatabase, loadAssetsFromDatabase, deleteAssetFromDatabase } from "./db-actions"

// --- Constants ---
const CAMERA_PRESETS = [
  { id: "none", label: "Default", prompt: "", icon: "/icons/camera-default.jpg" },
  {
    id: "nikon",
    label: "Nikon Z9",
    prompt:
      "Shot on Nikon Z9, Nikkor Z 58mm f/0.95 Noct lens, incredible sharpness, vivid true-to-life colors, deep dynamic range, professional photography",
    icon: "/icons/camera-nikon.jpg",
  },
  {
    id: "canon",
    label: "Canon R5",
    prompt:
      "Shot on Canon EOS R5, 85mm f/1.2 lens, warm skin tones, creamy smooth bokeh, soft focus falloff, emotional portrait style",
    icon: "/icons/camera-canon.jpg",
  },
  {
    id: "sony",
    label: "Sony A7R V",
    prompt:
      "Shot on Sony A7R V, 35mm G Master lens, hyper-realistic detail, modern look, slightly cool color temperature, razor sharp",
    icon: "/icons/camera-sony.jpg",
  },
  {
    id: "leica",
    label: "Leica M11",
    prompt:
      'Shot on Leica M11 Rangefinder, Summilux 50mm, legendary "Leica look", high micro-contrast, rich blacks, soulful street photography aesthetic',
    icon: "/icons/camera-leica.jpg",
  },
  {
    id: "fuji",
    label: "Fujifilm GFX",
    prompt:
      "Shot on Fujifilm GFX 100S Medium Format, nostalgic color science, Classic Chrome film simulation, immense depth and texture",
    icon: "/icons/camera-fuji.jpg",
  },
  {
    id: "hasselblad",
    label: "Hasselblad",
    prompt:
      "Shot on Hasselblad X2D 100C, medium format sensor, studio quality, natural color science, incredible resolution and texture",
    icon: "/icons/camera-hasselblad.jpg",
  },
  {
    id: "35mm",
    label: "Kodak Portra",
    prompt:
      "Shot on 35mm Kodak Portra 400 film, fine grain, warm nostalgic tones, slight overexposure, analog imperfection",
    icon: "/icons/camera-35mm.jpg",
  },
  {
    id: "polaroid",
    label: "Polaroid",
    prompt:
      "Vintage Polaroid SX-70, flash photography, heavy vignetting, soft washed-out colors, instant film aesthetic, chemical development artifacts",
    icon: "/icons/camera-polaroid.jpg",
  },
  {
    id: "gopro",
    label: "GoPro",
    prompt:
      "GoPro Hero 11, ultra wide fish-eye lens, hyper-realistic, POV, sharp, vibrant, slight lens distortion, action cam style",
    icon: "/icons/camera-gopro.jpg",
  },
  {
    id: "drone",
    label: "DJI Drone",
    prompt: "Aerial view, DJI Mavic 3 Cine, high altitude, wide angle, bird's eye perspective, epic landscape scale",
    icon: "/icons/camera-drone.jpg",
  },
  {
    id: "cinema",
    label: "Arri Alexa",
    prompt:
      "Shot on Arri Alexa Mini LF, Anamorphic lenses, 2.39:1 aspect ratio, cinematic color grading, teal and orange, Hollywood movie look",
    icon: "/icons/camera-cinema.jpg",
  },
]

const VibePortal = () => {
  // --- State Management ---
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referencePreview, setReferencePreview] = useState<string | null>(null)
  const [referenceMode, setReferenceMode] = useState<"style" | "transform">("style")
  const [prompt, setPrompt] = useState("")
  const [vibeStrength, setVibeStrength] = useState(0.8)
  const [remixVariety, setRemixVariety] = useState(25)
  const [selectedCamera, setSelectedCamera] = useState("none")
  const [mode, setMode] = useState("image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [generatedAssets, setGeneratedAssets] = useState<any[]>([])
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [progress, setProgress] = useState(0) // Added progress state
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null)

  // Animation/Video Sim State
  const [isPlaying, setIsPlaying] = useState(false)

  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // --- Database Sync State ---
  const [isSyncing, setIsSyncing] = useState(false)
  const [dbSyncEnabled, setDbSyncEnabled] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // --- Load from localStorage AND database on mount ---
  useEffect(() => {
    const loadAssets = async () => {
      // Try to load lightweight cache from localStorage first (just IDs and URLs)
      const saved = localStorage.getItem("vibeportal-assets-cache")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setGeneratedAssets(parsed)
          if (parsed.length > 0) {
            setSelectedAsset(parsed[0])
          }
        } catch (e) {
          console.error("Failed to load saved assets cache")
          // Clear corrupted cache
          localStorage.removeItem("vibeportal-assets-cache")
        }
      }

      // Always load from database if enabled (primary source of truth)
      if (dbSyncEnabled) {
        setIsSyncing(true)
        try {
          const dbAssets = await loadAssetsFromDatabase()
          if (dbAssets.length > 0) {
            const convertedAssets = dbAssets.map((dbAsset) => ({
              id: dbAsset.asset_id,
              type: dbAsset.type as "image" | "video",
              url: dbAsset.url,
              prompt: dbAsset.prompt,
              vibe: dbAsset.vibe || "Pure Text Gen",
              camera: dbAsset.camera || "Default",
              timestamp: dbAsset.timestamp,
              createdAt: dbAsset.created_at,
            }))

            setGeneratedAssets(convertedAssets)
            if (convertedAssets.length > 0 && !selectedAsset) {
              setSelectedAsset(convertedAssets[0])
            }
            setLastSyncTime(new Date().toLocaleTimeString())
          }
        } catch (error) {
          console.error("Failed to load from database:", error)
        } finally {
          setIsSyncing(false)
        }
      }
    }

    loadAssets()
  }, [])

  // --- Save to localStorage AND database when assets change ---
  useEffect(() => {
    if (generatedAssets.length > 0) {
      // Save lightweight cache (without large base64 data) to localStorage
      try {
        const lightweightCache = generatedAssets.slice(0, 20).map((asset) => ({
          id: asset.id,
          type: asset.type,
          url: asset.url,
          prompt: asset.prompt.substring(0, 200), // Truncate long prompts
          vibe: asset.vibe,
          camera: asset.camera,
          timestamp: asset.timestamp,
          createdAt: asset.createdAt,
        }))
        localStorage.setItem("vibeportal-assets-cache", JSON.stringify(lightweightCache))
      } catch (e) {
        // If localStorage is full, clear it and try again with fewer items
        console.warn("localStorage quota exceeded, clearing cache")
        localStorage.removeItem("vibeportal-assets-cache")
        localStorage.removeItem("vibeportal-assets") // Remove old key if it exists
        try {
          const minimalCache = generatedAssets.slice(0, 5).map((asset) => ({
            id: asset.id,
            type: asset.type,
            url: asset.url,
            prompt: asset.prompt.substring(0, 100),
            timestamp: asset.timestamp,
          }))
          localStorage.setItem("vibeportal-assets-cache", JSON.JSON.stringify(minimalCache))
        } catch (e2) {
          console.error("Failed to save even minimal cache")
        }
      }

      // Save to database if enabled (primary storage)
      if (dbSyncEnabled) {
        const syncToDatabase = async () => {
          setIsSyncing(true)
          try {
            const latestAsset = generatedAssets[0]
            await saveAssetToDatabase({
              asset_id: latestAsset.id,
              type: latestAsset.type,
              url: latestAsset.url,
              prompt: latestAsset.prompt,
              vibe: latestAsset.vibe,
              camera: latestAsset.camera,
              timestamp: latestAsset.timestamp,
            })
            setLastSyncTime(new Date().toLocaleTimeString())
          } catch (error) {
            console.error("Failed to sync to database:", error)
          } finally {
            setIsSyncing(false)
          }
        }
        syncToDatabase()
      }
    }
  }, [generatedAssets, dbSyncEnabled])

  // --- Helper: Image Compression ---
  const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      // Check if we're in the browser before using window
      if (typeof window === "undefined") {
        resolve(base64Str) // Return original if server-side
        return
      }

      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
        }
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.onerror = () => {
        resolve(base64Str)
      }
    })
  }

  // --- API Configuration ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("[v0] File uploaded:", file.name, file.type, file.size)

      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 10MB.")
        return
      }

      setReferenceImage(file)

      // Create initial preview
      const reader = new FileReader()
      reader.onloadend = async () => {
        const result = reader.result as string
        console.log("[v0] Data URL created, length:", result.length)

        // Compress if larger than 2MB to prevent 413 errors
        if (result.length > 2 * 1024 * 1024) {
          console.log("[v0] Compressing large image...")
          const compressed = await compressImage(result, 1024, 0.8)
          console.log("[v0] Compressed size:", compressed.length)
          setReferencePreview(compressed)
        } else {
          setReferencePreview(result)
        }
      }
      reader.onerror = () => {
        console.error("[v0] Error reading file")
        alert("Error reading file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!selectedAsset) return

    const link = document.createElement("a")
    link.href = selectedAsset.url
    link.download = `vibe-creation-${selectedAsset.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFullScreen = () => {
    if (!imageContainerRef.current) return

    if (!document.fullscreenElement) {
      imageContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim() && !referenceImage) {
      console.log("No input provided")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setStatusMessage("Initializing...")

    try {
      let finalPrompt = prompt.trim()

      // Step 1: Handle Reference Image (if provided)
      if (referenceImage && referencePreview) {
        if (referenceMode === "style") {
          // Style extraction mode: Extract style and add to prompt
          setStatusMessage("Extracting vibe from reference image...")
          const base64Data = referencePreview.split(",")[1]
          const mimeType = referenceImage.type || "image/jpeg" // Fallback to image/jpeg
          const styleDescription = await extractStyleFromImageAction(base64Data, mimeType)
          console.log("[v0] Extracted style description:", styleDescription)
          finalPrompt = `${finalPrompt}\n\nStyle inspiration: ${styleDescription}`
        }
        // If transform mode, we'll pass the image directly to generation
      }

      // Step 2: Build the prompt
      setStatusMessage(
        `Synthesizing ${mode === "video" ? "Video Frames" : "Image"} with ${mode === "video" ? "Veo" : "Gemini 3 Nano Banana"} pipeline...`,
      )

      // Add Camera Style
      if (selectedCamera !== "none") {
        const cameraStyle = CAMERA_PRESETS.find((c) => c.id === selectedCamera)?.prompt
        if (cameraStyle) {
          finalPrompt += `\n\nCAMERA LENS/STYLE: ${cameraStyle}`
        }
      }

      finalPrompt += `
      High fidelity, cinematic lighting, 8k resolution.`

      let result: string
      if (mode === "image") {
        if (referenceMode === "transform" && referenceImage && referencePreview) {
          const base64Data = referencePreview.split(",")[1]
          const mimeType = referenceImage.type || "image/jpeg" // Fallback to image/jpeg
          result = await generateImageWithImagenAction(finalPrompt, {
            base64Data,
            mimeType,
          })
        } else {
          result = await generateImageWithImagenAction(finalPrompt)
        }
      } else {
        // Handle video generation logic here if needed
        result = await generateImageWithImagenAction(finalPrompt) // Placeholder for video
      }

      if (result) {
        setStatusMessage("Optimizing asset for storage...")
        const optimizedUrl = await compressImage(result)

        const newAssetData = {
          id: Date.now().toString(),
          type: mode,
          url: optimizedUrl,
          prompt: prompt,
          vibe:
            referenceMode === "style"
              ? "Style Extracted"
              : referenceMode === "transform" && referenceImage
                ? "Image Transformed"
                : "Pure Text Gen",
          camera: selectedCamera !== "none" ? CAMERA_PRESETS.find((c) => c.id === selectedCamera)?.label : "Default",
          timestamp: new Date().toLocaleTimeString(),
          createdAt: new Date().toISOString(),
        }

        setGeneratedAssets((prev) => [newAssetData, ...prev])
        setSelectedAsset(newAssetData)
        setStatusMessage("Generation complete & saved!")
      } else {
        setStatusMessage("Generation failed. Please try again.")
      }
    } catch (error: any) {
      console.error(error)
      setStatusMessage(`Error: ${error.message || "Something went wrong"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const randomizePrompt = async () => {
    setIsRandomizing(true)
    setStatusMessage("Remixing prompt...")
    try {
      const newPrompt = await randomizePromptAction(prompt, remixVariety)
      setPrompt(newPrompt)
      setStatusMessage("Prompt remixed!")
      setTimeout(() => setStatusMessage(""), 2000)
    } catch (error: any) {
      console.error(error)
      setStatusMessage("Failed to remix prompt. Please check GEMINI_API_KEY environment variable.")
    } finally {
      setIsRandomizing(false)
    }
  }

  const refinePrompt = async () => {
    setIsRefining(true)
    setStatusMessage("Polishing prompt...")
    try {
      const newPrompt = await refinePromptAction(prompt)
      setPrompt(newPrompt)
      setStatusMessage("Prompt refined!")
      setTimeout(() => setStatusMessage(""), 2000)
    } catch (error: any) {
      console.error(error)
      setStatusMessage("Failed to refine prompt. Please check GEMINI_API_KEY environment variable.")
    } finally {
      setIsRefining(false)
    }
  }

  const fileToGenerativePart = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(",")[1])
      }
      reader.readAsDataURL(file)
    })
  }

  // --- Manual Sync Function ---
  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      // Save all assets to database
      for (const asset of generatedAssets) {
        await saveAssetToDatabase({
          asset_id: asset.id,
          type: asset.type,
          url: asset.url,
          prompt: asset.prompt,
          vibe: asset.vibe,
          camera: asset.camera,
          timestamp: asset.timestamp,
        })
      }
      setLastSyncTime(new Date().toLocaleTimeString())
      setStatusMessage(`Synced ${generatedAssets.length} assets to database!`)
    } catch (error) {
      setStatusMessage("Failed to sync to database")
    } finally {
      setIsSyncing(false)
    }
  }

  // --- Delete Function with Database Sync ---
  const handleDelete = async (assetId: string) => {
    if (dbSyncEnabled) {
      await deleteAssetFromDatabase(assetId)
    }
    setGeneratedAssets((prev) => prev.filter((a) => a.id !== assetId))
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(generatedAssets[0] || null)
    }
  }

  // --- UI Components ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile layout: stacked */}
          <div className="flex flex-col sm:hidden space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-2 rounded-lg">
                  <Loader2 className="w-5 h-5 text-black fill-current" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">
                    VibePortal <span className="font-light text-white/50 text-sm">Studio</span>
                  </h1>
                </div>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 bg-green-500/10 text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px]">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/50 font-mono">Gemini 3 Nano Banana x Veo</p>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent h-7 text-xs"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop layout: single row */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 p-2 rounded-lg">
                <Loader2 className="w-6 h-6 text-black fill-current" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  VibePortal <span className="font-light text-white/50">Studio</span>
                </h1>
                <p className="text-xs text-white/50 font-mono">Gemini 3 Nano Banana x Veo Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 bg-green-500/10 text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Engine Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Controls */}
          <Card className="lg:col-span-1 bg-black/40 backdrop-blur-lg border border-white/10 p-6 rounded-3xl">
            {/* Reference Image Section */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Reference Vibe{" "}
                  <span className="ml-2 text-[10px] bg-white/20 text-white px-2 py-1.5 rounded-full lowercase">
                    optional
                  </span>
                </h2>
                {referencePreview && (
                  <button
                    onClick={() => {
                      setReferencePreview(null)
                      setReferenceImage(null)
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative group">
                {referencePreview ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-white/10 group-hover:border-yellow-500/50 transition-colors">
                    <img
                      src={referencePreview || "/placeholder.svg"}
                      alt="Reference"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("[v0] Image failed to load")
                        // Fallback to placeholder if image fails
                        e.currentTarget.src = "/upload-error.jpg"
                      }}
                      onLoad={() => {
                        console.log("[v0] Image preview loaded successfully")
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-medium text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {referenceMode === "style" ? "Style Reference Active" : "Transform Mode Active"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-xl hover:bg-black/20 hover:border-yellow-500/50 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 mb-3 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <p className="mb-2 text-sm text-white">
                        <span className="font-semibold text-white">Click to upload</span> vibe reference
                      </p>
                      <p className="text-xs text-white/50">Optional: Leave empty for pure prompting</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </label>
                )}
              </div>

              {referencePreview && (
                <div className="mt-4 bg-black/30 rounded-lg p-3 border border-white/10">
                  <div className="text-xs text-white/50 mb-2">Reference Mode</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setReferenceMode("style")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        referenceMode === "style"
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Camera className="w-3 h-3 mr-1" />
                      </div>
                      Extract Style
                    </button>
                    <button
                      onClick={() => setReferenceMode("transform")}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        referenceMode === "transform"
                          ? "bg-purple-500 text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <Wand2 className="w-3 h-3 mr-1" />
                      </div>
                      Transform Image
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 leading-relaxed">
                    {referenceMode === "style"
                      ? "Analyzes the reference image's artistic style and uses it to inspire a new generation."
                      : "Directly transforms/modifies the reference image based on your prompt."}
                  </p>
                </div>
              )}

              <div
                className={`mt-4 transition-opacity ${referencePreview && referenceMode === "style" ? "opacity-100" : "opacity-30 pointer-events-none"}`}
              >
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span>Vibe Strength</span>
                  <span>{Math.round(vibeStrength * 100)}%</span>
                </div>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={[vibeStrength]}
                  onValueChange={(value) => setVibeStrength(value[0])}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            </div>

            {/* Prompt Section */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white mb-4 flex items-center">
                <Music className="w-4 h-4 mr-2" />
                Configuration
              </h2>

              <div className="flex space-x-2 mb-4 bg-black/20 p-1 rounded-lg">
                <Button
                  onClick={() => setMode("image")}
                  variant={mode === "image" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gemini 3 Nano
                </Button>
                <Button
                  onClick={() => setMode("video")}
                  variant={mode === "video" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Veo
                </Button>
              </div>

              {/* Prompt Input */}
              <div className="relative">
                <Textarea
                  placeholder={
                    mode === "image"
                      ? "Describe the image you want to create... (optional if using reference)"
                      : "Describe the video sequence you want to synthesize..."
                  }
                  className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 resize-none pr-24 pb-14"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button
                    onClick={refinePrompt}
                    disabled={isRefining || isRandomizing || isGenerating}
                    variant="outline"
                    size="sm"
                    className="bg-black/90 hover:bg-purple-500 hover:text-white text-white rounded-lg transition-all backdrop-blur-sm border border-white/10 hover:border-purple-400 active:scale-95 group/wand"
                    title="Refine Prompt (Enhance Quality)"
                    type="button"
                  >
                    <Sparkles
                      className={`w-4 h-4 ${isRefining ? "animate-pulse" : "group-hover/wand:rotate-12 transition-transform duration-300"}`}
                    />
                  </Button>
                  <Button
                    onClick={randomizePrompt}
                    disabled={isRandomizing || isGenerating}
                    variant="outline"
                    size="sm"
                    className="bg-black/90 hover:bg-yellow-500 hover:text-black text-white rounded-lg transition-all backdrop-blur-sm border border-white/10 hover:border-yellow-400 active:scale-95 group/dice"
                    title="Remix Prompt (Variation)"
                    type="button"
                  >
                    <Loader2
                      className={`w-4 h-4 ${isRandomizing ? "animate-spin" : "group-hover/dice:rotate-180 transition-transform duration-500"}`}
                    />
                  </Button>
                </div>
              </div>

              {/* Camera Preset Selector */}
              <div className="space-y-3">
                <Label className="text-white">Camera Preset</Label>
                <div className="grid grid-cols-4 gap-3">
                  {CAMERA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedCamera(preset.id)}
                      onMouseEnter={() => setHoveredCamera(preset.id)}
                      onMouseLeave={() => setHoveredCamera(null)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        selectedCamera === preset.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-white/10 bg-black/20 hover:border-white/30"
                      }`}
                    >
                      <div className="relative">
                        <Image
                          src={preset.icon || "/placeholder.svg"}
                          alt={preset.label}
                          width={48}
                          height={48}
                          className="object-contain transition-transform"
                        />
                      </div>
                      <span className="text-xs text-white/80 text-center">{preset.label}</span>
                      {selectedCamera === preset.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {hoveredCamera && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
                  <Image
                    src={CAMERA_PRESETS.find((p) => p.id === hoveredCamera)?.icon || "/placeholder.svg"}
                    alt="Camera Preview"
                    width={144}
                    height={144}
                    className="object-contain drop-shadow-2xl border-4 border-purple-500 rounded-lg bg-black/95 p-4"
                  />
                </div>
              )}

              {/* Remix Variety Slider */}
              <div className="mb-6 px-1">
                <div className="flex justify-between items-center text-xs text-white/50 mb-2">
                  <span className="flex items-center">
                    <Loader2 className="w-3 h-3 mr-1" /> Remix Variety
                  </span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded ${remixVariety < 33 ? "bg-green-900/30 text-green-400" : remixVariety < 66 ? "bg-blue-900/30 text-blue-400" : "bg-purple-900/30 text-purple-400"}`}
                  >
                    {remixVariety < 33 ? "Subtle" : remixVariety < 66 ? "Variation" : "Creative"}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  value={[remixVariety]}
                  onValueChange={(value) => setRemixVariety(value[0])}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-slate-500 hover:accent-yellow-500 transition-colors"
                />
                <div className="flex justify-between text-[10px] text-white/50 mt-1">
                  <span>Precision</span>
                  <span>Wild</span>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="default"
                size="lg"
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95 flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 fill-current" />
                    GENERATE {mode === "image" ? "IMAGE" : "VIDEO"}
                  </>
                )}
              </Button>

              {statusMessage && <p className="mt-3 text-xs text-center text-white/50 animate-pulse">{statusMessage}</p>}
            </div>

            {/* Database Sync Controls */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="text-sm font-medium">Database Sync</Badge>
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-pulse text-yellow-400" />
                  ) : (
                    <Camera className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <Button
                  onClick={() => setDbSyncEnabled(!dbSyncEnabled)}
                  variant="outline"
                  size="sm"
                  className="bg-white/5 hover:bg-white/10 border-white/20"
                >
                  {dbSyncEnabled ? "Disable Sync" : "Enable Sync"}
                </Button>
              </div>

              {lastSyncTime && <p className="text-xs text-white/50">Last synced: {lastSyncTime}</p>}

              <Button
                onClick={handleManualSync}
                disabled={isSyncing || !dbSyncEnabled}
                variant="outline"
                size="sm"
                className="w-full bg-white/5 hover:bg-white/10 border-white/20"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                {isSyncing ? "Syncing..." : "Manual Sync All"}
              </Button>
            </div>
          </Card>

          {/* Right Panel: Display */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {/* Main Canvas */}
            <div className="flex-1 bg-black/20 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
              <div className="absolute top-4 left-4 z-10 flex space-x-2">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-white border border-white/10">
                  OUTPUT_CANVAS
                </div>
                {selectedAsset && selectedAsset.type === "video" && (
                  <div className="bg-red-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-red-200 border border-red-500/30 flex items-center animate-pulse">
                    <Video className="w-3 h-3 mr-2" /> REC
                  </div>
                )}
              </div>

              <div
                ref={imageContainerRef}
                className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] flex items-center justify-center relative group"
              >
                {selectedAsset ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <img
                      src={selectedAsset.url || "/placeholder.svg"}
                      alt="Generated Content"
                      className={`max-w-full max-h-full object-contain shadow-2xl transition-transform duration-[10s] ease-in-out ${selectedAsset.type === "video" && isPlaying ? "scale-110" : "scale-100"}`}
                    />

                    {/* Info Overlay */}
                    {showInfo && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-md p-6 border-t border-white/10 transform transition-transform animate-in slide-in-from-bottom-10 z-20 text-left">
                        <div className="max-w-3xl mx-auto">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider">User Prompt</h4>
                            <span className="text-xs text-white/50 font-mono">{selectedAsset.timestamp}</span>
                          </div>
                          <p className="text-sm text-white mb-6 font-medium leading-relaxed border-l-2 border-yellow-500 pl-4">
                            {selectedAsset.prompt}
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                                Vibe DNA
                              </h4>
                              <p className="text-xs text-white/50 bg-black/20 p-3 rounded-lg border border-white/10 font-mono">
                                {selectedAsset.vibe}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                                Camera Gear
                              </h4>
                              <p className="text-xs text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-900/50 font-mono flex items-center">
                                <Camera className="w-3 h-3 mr-2" />
                                {selectedAsset.camera || "Default"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedAsset.type === "video" && (
                      <div
                        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 transition-opacity ${showInfo ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <Button
                          onClick={() => setIsPlaying(!isPlaying)}
                          variant="outline"
                          size="sm"
                          className="p-2 rounded-full bg-white text-black hover:scale-105 transition"
                        >
                          {isPlaying ? (
                            <Loader2 className="w-4 h-4 fill-current" />
                          ) : (
                            <Camera className="w-4 h-4 fill-current pl-0.5" />
                          )}
                        </Button>
                        <div className="h-1 w-32 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-yellow-500 ${isPlaying ? "w-full transition-all duration-[10s] ease-linear" : "w-0"}`}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className={`absolute top-4 right-4 flex flex-col space-y-2 transition-opacity ${showInfo ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    >
                      <Button
                        onClick={() => setShowInfo(!showInfo)}
                        variant="outline"
                        size="sm"
                        className="p-2 backdrop-blur-md rounded-lg transition border border-white/10"
                        title="Show Prompt Info"
                      >
                        <Loader2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleFullScreen}
                        variant="outline"
                        size="sm"
                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-black hover:bg-black hover:text-white transition border border-white/10"
                        title="Fullscreen"
                      >
                        <Loader2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-black hover:bg-black hover:text-white transition border border-white/10"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-10 opacity-30">
                    <div className="w-24 h-24 mx-auto mb-4 border-4 border-dashed border-white/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white/50">Ready to Vibe</h3>
                    <p className="text-white/50 mt-2">Configure the engine on the left to start</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Timeline */}
            <div className="lg:col-span-3">
              <Card className="bg-black/40 backdrop-blur-lg border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Generated Assets ({generatedAssets.length})
                    {isSyncing && <span className="text-xs text-yellow-400 animate-pulse">● Syncing</span>}
                  </h3>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {generatedAssets.map((asset) => (
                    <div key={asset.id} className="relative group">
                      <Button
                        onClick={() => {
                          setSelectedAsset(asset)
                          setIsPlaying(false)
                          setShowInfo(false)
                        }}
                        variant="outline"
                        size="sm"
                        className={`relative min-w-[80px] w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedAsset?.id === asset.id ? "border-yellow-500 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
                      >
                        <img
                          src={asset.url || "/placeholder.svg"}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                        {asset.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                      </Button>
                      {/* Delete Button on Hover */}
                      <Button
                        onClick={() => handleDelete(asset.id)}
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <Loader2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VibePortal
