"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { RotateCw, Move } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductMockupProps {
  collectibleImage: string
  productImage: string
  productType: string
  showControls?: boolean
}

export function ProductMockup({
  collectibleImage,
  productImage,
  productType,
  showControls = true,
}: ProductMockupProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const getPrintArea = (type: string) => {
    const normalizedType = type.toLowerCase()

    if (normalizedType.includes("shirt") || normalizedType.includes("tee")) {
      return { x: 0.3, y: 0.25, width: 0.4, height: 0.4, perspective: 1.1 }
    } else if (normalizedType.includes("mug")) {
      return { x: 0.35, y: 0.3, width: 0.3, height: 0.4, perspective: 0.9 }
    } else if (normalizedType.includes("poster") || normalizedType.includes("print")) {
      return { x: 0.1, y: 0.1, width: 0.8, height: 0.8, perspective: 1.0 }
    } else if (normalizedType.includes("hoodie")) {
      return { x: 0.25, y: 0.3, width: 0.5, height: 0.4, perspective: 1.1 }
    } else if (normalizedType.includes("bag") || normalizedType.includes("tote")) {
      return { x: 0.3, y: 0.35, width: 0.4, height: 0.3, perspective: 1.05 }
    } else if (normalizedType.includes("phone")) {
      return { x: 0.15, y: 0.25, width: 0.7, height: 0.5, perspective: 1.0 }
    }

    // Default print area
    return { x: 0.25, y: 0.25, width: 0.5, height: 0.5, perspective: 1.0 }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const productImg = new Image()
    const collectibleImg = new Image()
    productImg.crossOrigin = "anonymous"
    collectibleImg.crossOrigin = "anonymous"

    let imagesLoaded = 0
    const checkAllLoaded = () => {
      imagesLoaded++
      if (imagesLoaded === 2) {
        drawMockup()
      }
    }

    productImg.onload = checkAllLoaded
    collectibleImg.onload = checkAllLoaded

    productImg.src = productImage
    collectibleImg.src = collectibleImage

    const drawMockup = () => {
      const printArea = getPrintArea(productType)

      canvas.width = 800
      canvas.height = 800

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height)

      const printX = canvas.width * printArea.x + position.x
      const printY = canvas.height * printArea.y + position.y
      const printWidth = canvas.width * printArea.width * scale.x
      const printHeight = canvas.height * printArea.height * scale.y

      ctx.save()
      ctx.translate(printX + printWidth / 2, printY + printHeight / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(printArea.perspective, printArea.perspective)

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 5
      ctx.shadowOffsetY = 5

      ctx.drawImage(collectibleImg, -printWidth / 2, -printHeight / 2, printWidth, printHeight)
      ctx.restore()

      if (productType.toLowerCase().includes("shirt") || productType.toLowerCase().includes("hoodie")) {
        ctx.save()
        ctx.globalAlpha = 0.05
        ctx.fillStyle = "white"
        ctx.fillRect(printX, printY, printWidth, printHeight)
        ctx.restore()
      }
    }
  }, [collectibleImage, productImage, productType, rotation, scale, position])

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    setIsResizing(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isResizing) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isResizing) {
      const deltaX = (e.clientX - dragStart.x) / 400
      const deltaY = (e.clientY - dragStart.y) / 400

      if (isResizing === "corner-tl" || isResizing === "corner-br") {
        const delta = (deltaX + deltaY) / 2
        const multiplier = isResizing === "corner-tl" ? -1 : 1
        setScale((s) => ({
          x: Math.max(0.3, Math.min(2, s.x + delta * multiplier)),
          y: Math.max(0.3, Math.min(2, s.y + delta * multiplier)),
        }))
      } else if (isResizing === "corner-tr" || isResizing === "corner-bl") {
        const delta = (deltaX - deltaY) / 2
        const multiplier = isResizing === "corner-tr" ? 1 : -1
        setScale((s) => ({
          x: Math.max(0.3, Math.min(2, s.x + delta * multiplier)),
          y: Math.max(0.3, Math.min(2, s.y + delta * multiplier)),
        }))
      } else if (isResizing === "edge-right" || isResizing === "edge-left") {
        const multiplier = isResizing === "edge-right" ? 1 : -1
        setScale((s) => ({
          ...s,
          x: Math.max(0.3, Math.min(2, s.x + deltaX * multiplier)),
        }))
      } else if (isResizing === "edge-top" || isResizing === "edge-bottom") {
        const multiplier = isResizing === "edge-bottom" ? 1 : -1
        setScale((s) => ({
          ...s,
          y: Math.max(0.3, Math.min(2, s.y + deltaY * multiplier)),
        }))
      }

      setDragStart({ x: e.clientX, y: e.clientY })
    } else if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(null)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full aspect-square rounded-lg shadow-2xl cursor-move"
        onMouseDown={handleMouseDown}
      />

      {showControls && (
        <>
          <div
            className="absolute top-0 left-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize shadow-lg hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, "corner-tl")}
            title="Resize proportionally"
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize shadow-lg hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, "corner-tr")}
            title="Resize proportionally"
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize shadow-lg hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, "corner-bl")}
            title="Resize proportionally"
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize shadow-lg hover:scale-125 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, "corner-br")}
            title="Resize proportionally"
          />

          <div
            className="absolute top-1/2 left-0 w-3 h-8 bg-blue-500 border-2 border-white rounded-r cursor-ew-resize shadow-lg hover:scale-110 transition-transform -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, "edge-left")}
            title="Resize horizontally"
          />
          <div
            className="absolute top-1/2 right-0 w-3 h-8 bg-blue-500 border-2 border-white rounded-l cursor-ew-resize shadow-lg hover:scale-110 transition-transform -translate-y-1/2"
            onMouseDown={(e) => handleResizeStart(e, "edge-right")}
            title="Resize horizontally"
          />
          <div
            className="absolute top-0 left-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-b cursor-ns-resize shadow-lg hover:scale-110 transition-transform -translate-x-1/2"
            onMouseDown={(e) => handleResizeStart(e, "edge-top")}
            title="Resize vertically"
          />
          <div
            className="absolute bottom-0 left-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-t cursor-ns-resize shadow-lg hover:scale-110 transition-transform -translate-x-1/2"
            onMouseDown={(e) => handleResizeStart(e, "edge-bottom")}
            title="Resize vertically"
          />
        </>
      )}

      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
          <div className="text-white text-xs px-2 flex items-center gap-1">
            <Move className="w-3 h-3" />
            Drag to position
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRotation((r) => (r - 15) % 360)}
            className="text-white hover:bg-white/20"
            title="Rotate Left"
          >
            <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRotation((r) => (r + 15) % 360)}
            className="text-white hover:bg-white/20"
            title="Rotate Right"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-600" />
          <div className="text-white text-xs px-2">
            {Math.round(scale.x * 100)}% × {Math.round(scale.y * 100)}%
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRotation(0)
              setScale({ x: 1, y: 1 })
              setPosition({ x: 0, y: 0 })
            }}
            className="text-white hover:bg-white/20 text-xs"
          >
            Reset
          </Button>
        </div>
      )}
    </div>
  )
}
