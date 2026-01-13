"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

interface PDFDownloadButtonProps {
  epkType: "3years-hollow" | "now-its-dark" | "tame-the-jester" | "hollowvox"
  artistName: string
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export function PDFDownloadButton({
  epkType,
  artistName,
  className = "",
  variant = "outline",
  size = "default",
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          epkType,
          epkData: {
            artistName,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${artistName}-Press-Kit.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
      // Fallback to print dialog
      window.print()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} variant={variant} size={size} className={className}>
      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {isGenerating ? "Generating PDF..." : "Download Press Kit"}
    </Button>
  )
}
