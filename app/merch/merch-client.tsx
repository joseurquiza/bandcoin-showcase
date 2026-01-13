"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductMockup } from "@/components/product-mockup"
import {
  Package,
  ShoppingCart,
  Wallet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  Upload,
  X,
  ImageIcon,
} from "lucide-react"
import {
  fetchPrintfulProducts,
  fetchProductVariants,
  createMerchOrder,
  generateProductMockups,
  getMockupTaskResult,
} from "./merch-actions"
import { removeBackground } from "@imgly/background-removal"

interface Collectible {
  id: number
  name: string
  image_url: string
  theme: string
}

interface Product {
  id: number
  type: string
  type_name: string
  title: string
  image: string
  variant_count: number
}

interface Variant {
  id: number
  name: string
  size: string
  color: string
  color_code: string
  image: string
  price: string
  in_stock: boolean
}

interface Mockup {
  mockup_url: string
  variant_ids: number[]
}

const PRODUCT_CATEGORIES = {
  all: "All Products",
  apparel: "Apparel",
  accessories: "Accessories",
  "home-living": "Home & Living",
  other: "Other",
}

const categorizeProduct = (type: string): string => {
  const lowerType = type.toLowerCase()
  if (lowerType.includes("shirt") || lowerType.includes("hoodie") || lowerType.includes("tank")) return "apparel"
  if (lowerType.includes("mug") || lowerType.includes("poster") || lowerType.includes("pillow")) return "home-living"
  if (lowerType.includes("tote") || lowerType.includes("bag") || lowerType.includes("phone")) return "accessories"
  return "other"
}

export default function MerchStoreClient({
  collectibles: initialCollectibles = [],
}: {
  collectibles: Collectible[]
}) {
  const [collectibles, setCollectibles] = useState<Collectible[]>(initialCollectibles)
  const [uploadedImage, setUploadedImage] = useState<{
    url: string
    name: string
    file: File
  } | null>(null)
  const [processingBackground, setProcessingBackground] = useState(false)
  const [selectedCollectible, setSelectedCollectible] = useState<Collectible | null>(null)
  const [designSource, setDesignSource] = useState<"collectible" | "upload">("collectible")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [mockups, setMockups] = useState<Mockup[]>([])
  const [generatingMockups, setGeneratingMockups] = useState(false)
  const [mockupError, setMockupError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null)
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    state_code: "",
    country_code: "US",
    zip: "",
  })
  const [collectiblePage, setCollectiblePage] = useState(1)
  const [productPage, setProductPage] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const collectiblesPerPage = 12
  const productsPerPage = 12
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const result = await fetchPrintfulProducts()
    if (result.success && result.products) {
      setProducts(result.products)
    }
  }

  const handleProductSelect = async (product: Product) => {
    console.log("[v0] Product selected:", product.id, product.title)
    setSelectedProduct(product)
    setLoading(true)
    setMockups([])
    setMockupError(null)

    const result = await fetchProductVariants(product.id)
    setLoading(false)
    if (result.success && result.variants) {
      console.log("[v0] Variants loaded:", result.variants.length)
      setVariants(result.variants)

      const design = getCurrentDesign()
      if (design) {
        await generateMockups(product.id, result.variants, design.url)
      }
    }
  }

  const handleCreateOrder = async () => {
    if ((!selectedCollectible && !uploadedImage) || !selectedVariant) return

    setLoading(true)
    const result = await createMerchOrder({
      collectibleId: selectedCollectible ? selectedCollectible.id : null,
      productVariantId: selectedVariant.id,
      quantity: 1,
      recipient: orderForm,
      design: getCurrentDesign(),
    })
    setLoading(false)

    if (result.success) {
      alert("Order created successfully!")
      setSelectedCollectible(null)
      setSelectedProduct(null)
      setSelectedVariant(null)
      setUploadedImage(null)
      setDesignSource("collectible")
    } else {
      alert(result.error || "Failed to create order")
    }
  }

  const getFilteredVariants = () => {
    if (!selectedColorFilter) return variants.filter((v) => v.in_stock)
    return variants.filter((v) => v.in_stock && v.color === selectedColorFilter)
  }

  const getAvailableColors = () => {
    const colors = new Set(variants.filter((v) => v.in_stock).map((v) => v.color))
    return Array.from(colors)
  }

  const getFilteredProducts = () => {
    if (selectedCategory === "all") return products
    return products.filter((p) => categorizeProduct(p.type) === selectedCategory)
  }

  const getPaginatedCollectibles = () => {
    const start = (collectiblePage - 1) * collectiblesPerPage
    return collectibles.slice(start, start + collectiblesPerPage)
  }

  const getPaginatedProducts = () => {
    const filtered = getFilteredProducts()
    const start = productPage * productsPerPage
    return filtered.slice(start, start + productsPerPage)
  }

  const totalCollectiblePages = Math.ceil(collectibles.length / collectiblesPerPage)
  const totalProductPages = Math.ceil(getFilteredProducts().length / productsPerPage)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB")
      return
    }

    const originalUrl = URL.createObjectURL(file)

    setUploadedImage({ url: originalUrl, name: file.name, file })
    setSelectedCollectible(null)
    setDesignSource("upload")

    setProcessingBackground(true)
    const processedUrl = await removeImageBackground(originalUrl)
    setUploadedImage({ url: processedUrl, name: file.name, file })
    setProcessingBackground(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB")
      return
    }

    const originalUrl = URL.createObjectURL(file)

    setUploadedImage({ url: originalUrl, name: file.name, file })
    setSelectedCollectible(null)
    setDesignSource("upload")

    setProcessingBackground(true)
    const processedUrl = await removeImageBackground(originalUrl)
    setUploadedImage({ url: processedUrl, name: file.name, file })
    setProcessingBackground(false)
  }

  const removeImageBackground = async (imageUrl: string): Promise<string> => {
    try {
      console.log("[v0] Starting background removal...")
      const blob = await removeBackground(imageUrl)
      const url = URL.createObjectURL(blob)
      console.log("[v0] Background removal complete")
      return url
    } catch (error) {
      console.error("[v0] Background removal failed:", error)
      return imageUrl
    }
  }

  const getCurrentDesign = () => {
    if (designSource === "upload" && uploadedImage) {
      return { url: uploadedImage.url, theme: uploadedImage.name }
    }
    if (designSource === "collectible" && selectedCollectible) {
      return { url: selectedCollectible.image_url, theme: selectedCollectible.theme }
    }
    return null
  }

  const generateMockups = async (productId: number, variants: Variant[], imageUrl: string) => {
    console.log("[v0] Starting Printful mockup generation...")
    setGeneratingMockups(true)
    setMockupError(null)

    try {
      const variantIds = variants.slice(0, 3).map((v) => v.id)
      console.log("[v0] Generating mockups for variants:", variantIds)

      const result = await generateProductMockups({
        productId,
        variantIds,
        imageUrl,
      })

      if (result.success && result.taskKey) {
        console.log("[v0] Mockup task created:", result.taskKey)
        await pollMockupTask(result.taskKey)
      } else {
        console.error("[v0] Mockup generation failed:", result.error)
        setMockupError(result.error || "Failed to generate mockups")
      }
    } catch (error) {
      console.error("[v0] Mockup generation error:", error)
      setMockupError("Failed to generate mockups")
    } finally {
      setGeneratingMockups(false)
    }
  }

  const pollMockupTask = async (taskKey: string, maxAttempts = 20) => {
    console.log("[v0] Polling mockup task:", taskKey)

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const result = await getMockupTaskResult(taskKey)
      console.log("[v0] Mockup task status check", i + 1, ":", result)

      if (result.success && result.result) {
        const { status, mockups: generatedMockups } = result.result

        if (status === "completed" && generatedMockups) {
          console.log("[v0] Mockups generated successfully:", generatedMockups)
          setMockups(generatedMockups)
          return
        } else if (status === "failed") {
          setMockupError("Mockup generation failed")
          return
        }
      }
    }

    setMockupError("Mockup generation timed out")
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 ${getCurrentDesign() ? "text-emerald-500" : "text-orange-500"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${getCurrentDesign() ? "bg-emerald-500" : "bg-orange-500"} text-white font-bold`}
            >
              1
            </div>
            <span className="text-sm font-medium">Design</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div
            className={`flex items-center gap-2 ${selectedProduct ? "text-emerald-500" : getCurrentDesign() ? "text-orange-500" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedProduct ? "bg-emerald-500" : getCurrentDesign() ? "bg-orange-500" : "bg-gray-700"} text-white font-bold`}
            >
              2
            </div>
            <span className="text-sm font-medium">Product</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div
            className={`flex items-center gap-2 ${selectedVariant ? "text-emerald-500" : selectedProduct ? "text-orange-500" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedVariant ? "bg-emerald-500" : selectedProduct ? "bg-orange-500" : "bg-gray-700"} text-white font-bold`}
            >
              3
            </div>
            <span className="text-sm font-medium">Customize</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className={`flex items-center gap-2 ${selectedVariant ? "text-orange-500" : "text-gray-600"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedVariant ? "bg-orange-500" : "bg-gray-700"} text-white font-bold`}
            >
              4
            </div>
            <span className="text-sm font-medium">Checkout</span>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-orange-500" />
            Step 1: Choose Your Design
          </h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setDesignSource("collectible")
                setUploadedImage(null)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                designSource === "collectible"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              My Collectibles
            </button>
            <button
              onClick={() => {
                setDesignSource("upload")
                setSelectedCollectible(null)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                designSource === "upload"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Upload Design
            </button>
          </div>

          {designSource === "collectible" ? (
            collectibles.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No collectibles found</p>
                <p className="text-gray-500 text-sm">Create some collectibles first or upload your own design</p>
                <Button
                  onClick={() => (window.location.href = "/collectibles")}
                  className="mt-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  Create Collectibles
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {getPaginatedCollectibles().map((collectible) => (
                    <button
                      key={collectible.id}
                      onClick={() => {
                        setSelectedCollectible(collectible)
                        setUploadedImage(null)
                        setDesignSource("collectible")
                      }}
                      className={`relative rounded-lg overflow-hidden transition-all ${
                        selectedCollectible?.id === collectible.id
                          ? "ring-4 ring-emerald-500 scale-105"
                          : "hover:scale-105 hover:ring-2 ring-gray-700"
                      }`}
                    >
                      <img
                        src={collectible.image_url || "/placeholder.svg"}
                        alt={collectible.theme}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                        <p className="text-xs font-medium truncate">{collectible.theme}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {collectibles.length > 12 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCollectiblePage(Math.max(1, collectiblePage - 1))}
                      disabled={collectiblePage === 1}
                      className="bg-gray-800 border-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {collectiblePage} of {Math.ceil(collectibles.length / 12)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCollectiblePage(Math.min(Math.ceil(collectibles.length / 12), collectiblePage + 1))
                      }
                      disabled={collectiblePage === Math.ceil(collectibles.length / 12)}
                      className="bg-gray-800 border-gray-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="space-y-4">
              {uploadedImage ? (
                <div className="relative">
                  <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                    <img
                      src={uploadedImage.url || "/placeholder.svg"}
                      alt={uploadedImage.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-lg">{uploadedImage.name}</p>
                      <p className="text-sm text-gray-400">{(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {processingBackground && (
                        <p className="text-sm text-orange-500 animate-pulse mt-1">Removing background...</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        URL.revokeObjectURL(uploadedImage.url)
                        setUploadedImage(null)
                      }}
                      className="bg-red-500/10 border-red-500/50 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-orange-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Upload Your Design</h3>
                  <p className="text-gray-400 mb-4">Drag and drop your image here, or click to browse</p>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, SVG • Max size: 10MB</p>
                  <p className="text-xs text-orange-500 mt-2">✨ Background will be automatically removed</p>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              )}

              {uploadedImage && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-sm text-blue-400">✓ Design ready! Select a product type in Step 2 to continue.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {(selectedCollectible || uploadedImage) && (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" />
              Step 2: Choose Product Type
            </h2>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCategory(key)
                      setProductPage(0)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === key
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getPaginatedProducts().map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    console.log("[v0] User clicked product:", product.title)
                    handleProductSelect(product)
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedProduct?.id === product.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-600 hover:border-gray-500 bg-gray-900/50"
                  }`}
                >
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <p className="text-white text-sm font-medium">{product.type_name}</p>
                  <p className="text-gray-400 text-xs">{product.variant_count} variants</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                onClick={() => setProductPage((p) => Math.max(0, p - 1))}
                disabled={productPage === 0}
                variant="outline"
                size="sm"
                className="bg-gray-900 border-gray-600 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-400 text-sm">
                Page {productPage + 1} of {totalProductPages}
              </span>
              <Button
                onClick={() => setProductPage((p) => Math.min(totalProductPages - 1, p + 1))}
                disabled={productPage >= totalProductPages - 1}
                variant="outline"
                size="sm"
                className="bg-gray-900 border-gray-600 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {(selectedCollectible || uploadedImage) && selectedProduct && (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-500" />
              Step 3: Customize Your Product
            </h2>

            {!selectedProduct ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Please select a product first</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading product options...</p>
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No variants available for this product</p>
              </div>
            ) : (
              <>
                {generatingMockups && (
                  <div className="mb-8 text-center py-12 bg-gray-900 rounded-xl">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold">Generating Official Product Mockups...</p>
                    <p className="text-gray-400 text-sm mt-2">This shows exactly how your design will print</p>
                  </div>
                )}

                {mockupError && !generatingMockups && (
                  <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-400 text-sm">⚠️ {mockupError}</p>
                    <p className="text-gray-400 text-xs mt-1">Showing preview mode instead</p>
                  </div>
                )}

                {mockups.length > 0 && !generatingMockups && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-500" />
                      Official Printful Product Mockups
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockups.map((mockup, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-xl overflow-hidden">
                          <img
                            src={mockup.mockup_url || "/placeholder.svg"}
                            alt={`Mockup ${idx + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                          <div className="p-3">
                            <p className="text-sm text-gray-400">{mockup.variant_ids?.join(", ")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-4">
                      ✓ These mockups show exactly how your design will be printed and positioned
                    </p>
                  </div>
                )}

                {(!mockups.length || mockupError) && !generatingMockups && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-500" />
                      Interactive Mockup Preview
                    </h3>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8">
                      <ProductMockup
                        collectibleImage={
                          selectedCollectible
                            ? selectedCollectible.image_url
                            : uploadedImage
                              ? uploadedImage.url
                              : "/placeholder.svg"
                        }
                        productImage={selectedVariant?.image || selectedProduct.image}
                        productType={selectedProduct.type_name}
                        showControls={true}
                      />
                      <p className="text-gray-400 text-sm text-center mt-4">
                        Drag to reposition • Use controls to rotate and zoom • Click Reset to restore defaults
                      </p>
                    </div>
                  </div>
                )}

                {getAvailableColors().length > 1 && (
                  <div className="mb-6">
                    <Label className="text-white mb-3 block">Filter by Color</Label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedColorFilter(null)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          !selectedColorFilter
                            ? "bg-orange-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        All Colors
                      </button>
                      {getAvailableColors().map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColorFilter(color)}
                          className={`px-4 py-2 rounded-lg text-sm ${
                            selectedColorFilter === color
                              ? "bg-orange-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFilteredVariants().map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500"
                          : "border-gray-600 hover:border-gray-500 bg-gray-900/50"
                      }`}
                    >
                      <img
                        src={variant.image || selectedProduct.image}
                        alt={variant.name}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                      <p className="text-white text-sm font-medium">{variant.size}</p>
                      <p className="text-gray-400 text-xs">{variant.color}</p>
                      <p className="text-emerald-400 text-sm font-semibold mt-1">${variant.price}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {(selectedCollectible || uploadedImage) && selectedProduct && selectedVariant && (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              Step 4: Checkout
            </h2>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-300">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-300">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={orderForm.address1}
                    onChange={(e) => setOrderForm({ ...orderForm, address1: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-gray-300">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={orderForm.city}
                    onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-gray-300">
                    State Code
                  </Label>
                  <Input
                    id="state"
                    value={orderForm.state_code}
                    onChange={(e) => setOrderForm({ ...orderForm, state_code: e.target.value })}
                    placeholder="e.g., CA"
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="zip" className="text-gray-300">
                    ZIP Code
                  </Label>
                  <Input
                    id="zip"
                    value={orderForm.zip}
                    onChange={(e) => setOrderForm({ ...orderForm, zip: e.target.value })}
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-gray-300">
                    Country Code
                  </Label>
                  <Input
                    id="country"
                    value={orderForm.country_code}
                    onChange={(e) => setOrderForm({ ...orderForm, country_code: e.target.value })}
                    placeholder="e.g., US"
                    className="bg-gray-900 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Product:</span>
                    <span className="font-medium">{selectedProduct?.type_name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Variant:</span>
                    <span className="font-medium">
                      {selectedVariant.size} - {selectedVariant.color}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Price:</span>
                    <span className="font-medium text-emerald-400">${selectedVariant.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Design:</span>
                    <span className="font-medium">
                      {designSource === "collectible" ? selectedCollectible?.name : uploadedImage?.name}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between text-white text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-emerald-400">${selectedVariant.price}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-12 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
