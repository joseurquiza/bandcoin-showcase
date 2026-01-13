"use client"

import { useState, useRef } from "react"
import {
  Search,
  MapPin,
  Music,
  Users,
  Mail,
  Phone,
  Globe,
  Loader2,
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
  Download,
  Printer,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { findGigsAction } from "./actions"

interface ArtistInfo {
  name: string
  genre: string
  location: string
  description: string
  spotifyUrl?: string
  instagramUrl?: string
  monthlyListeners?: string
}

interface SimilarArtist {
  name: string
  genre: string
  similarity: string
  venues: string[]
}

interface Venue {
  name: string
  location: string
  capacity: string
  genres: string[]
  bookingContact?: {
    name?: string
    email?: string
    phone?: string
    website?: string
  }
  recentShows: string[]
  tips?: string
}

interface GigFinderResults {
  artist: ArtistInfo
  similarArtists: SimilarArtist[]
  venues: Venue[]
  bookingTips: string[]
}

export default function GigFinderClient() {
  const [artistName, setArtistName] = useState("")
  const [location, setLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<GigFinderResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchPhase, setSearchPhase] = useState("")
  const resultsRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("venues")

  const handleSearch = async () => {
    if (!artistName.trim()) return

    setIsSearching(true)
    setError(null)
    setResults(null)

    const phases = [
      "Analyzing your artist profile...",
      "Finding similar artists...",
      "Discovering venues they play...",
      "Gathering booking contacts...",
      "Compiling recommendations...",
    ]

    let phaseIndex = 0
    const phaseInterval = setInterval(() => {
      setSearchPhase(phases[phaseIndex % phases.length])
      phaseIndex++
    }, 2000)

    try {
      const result = await findGigsAction(artistName, location)
      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setResults(result.data)
      }
    } catch (err) {
      setError("Failed to find gigs. Please try again.")
    } finally {
      clearInterval(phaseInterval)
      setIsSearching(false)
      setSearchPhase("")
    }
  }

  const handleExport = () => {
    if (!results || !resultsRef.current) return

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gig Finder Results - ${results.artist.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
          }
          h1 { color: #ea580c; margin-bottom: 8px; }
          h2 { color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-top: 32px; }
          h3 { color: #555; margin-top: 24px; }
          .header { margin-bottom: 32px; border-bottom: 1px solid #ddd; padding-bottom: 16px; }
          .badge { 
            display: inline-block; 
            background: #f3f4f6; 
            padding: 4px 12px; 
            border-radius: 16px; 
            font-size: 12px; 
            margin: 2px 4px 2px 0;
          }
          .venue { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .venue-name { font-size: 18px; font-weight: bold; color: #333; }
          .venue-location { color: #666; font-size: 14px; }
          .contact-info { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 12px; }
          .contact-info p { margin: 4px 0; font-size: 14px; }
          .contact-label { font-weight: 600; color: #555; }
          .artist-card { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 12px; 
            margin-bottom: 12px;
            display: inline-block;
            width: calc(33% - 16px);
            vertical-align: top;
            margin-right: 12px;
            box-sizing: border-box;
          }
          .tip { 
            display: flex; 
            gap: 12px; 
            margin-bottom: 12px;
            padding: 12px;
            background: #fffbeb;
            border-radius: 6px;
          }
          .tip-number { 
            background: #ea580c; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            flex-shrink: 0;
            font-size: 12px;
            font-weight: bold;
          }
          .generated-date { color: #999; font-size: 12px; margin-top: 40px; text-align: center; }
          @media print {
            body { padding: 20px; }
            .venue { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Gig Finder Results</h1>
          <p style="color: #666;">Booking opportunities for ${results.artist.name}</p>
        </div>

        <h2>Artist Profile</h2>
        <p><strong>${results.artist.name}</strong></p>
        <p>${results.artist.description}</p>
        <div>
          <span class="badge">${results.artist.genre}</span>
          <span class="badge">${results.artist.location}</span>
          ${results.artist.monthlyListeners ? `<span class="badge">${results.artist.monthlyListeners} monthly listeners</span>` : ""}
        </div>

        <h2>Venues & Booking Contacts (${results.venues.length})</h2>
        ${results.venues
          .map(
            (venue) => `
          <div class="venue">
            <div class="venue-name">${venue.name}</div>
            <div class="venue-location">${venue.location} • ${venue.capacity} capacity</div>
            ${
              venue.genres && Array.isArray(venue.genres) && venue.genres.length > 0
                ? `
            <div style="margin-top: 8px;">
              ${venue.genres.map((g) => `<span class="badge">${g}</span>`).join("")}
            </div>
            `
                : ""
            }
            ${
              venue.recentShows && Array.isArray(venue.recentShows) && venue.recentShows.length > 0
                ? `<p style="margin-top: 12px; font-size: 14px; color: #666;">Recent shows: ${venue.recentShows.join(", ")}</p>`
                : ""
            }
            ${
              venue.tips
                ? `<p style="margin-top: 8px; font-style: italic; color: #ea580c; font-size: 14px;">${venue.tips}</p>`
                : ""
            }
            ${
              venue.bookingContact
                ? `
              <div class="contact-info">
                <p style="font-weight: 600; margin-bottom: 8px;">Booking Contact</p>
                ${venue.bookingContact.name ? `<p><span class="contact-label">Name:</span> ${venue.bookingContact.name}</p>` : ""}
                ${venue.bookingContact.email ? `<p><span class="contact-label">Email:</span> ${venue.bookingContact.email}</p>` : ""}
                ${venue.bookingContact.phone ? `<p><span class="contact-label">Phone:</span> ${venue.bookingContact.phone}</p>` : ""}
                ${venue.bookingContact.website ? `<p><span class="contact-label">Website:</span> ${venue.bookingContact.website}</p>` : ""}
              </div>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}

        <h2>Similar Artists (${results.similarArtists.length})</h2>
        <div>
          ${results.similarArtists
            .map(
              (artist) => `
            <div class="artist-card">
              <strong>${artist.name}</strong>
              <div style="margin-top: 4px;">
                <span class="badge">${artist.genre}</span>
                <span class="badge">${artist.similarity} match</span>
              </div>
              ${artist.venues && Array.isArray(artist.venues) && artist.venues.length > 0 ? `<p style="font-size: 12px; color: #666; margin-top: 8px;">Plays at: ${artist.venues.slice(0, 3).join(", ")}</p>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>Booking Tips</h2>
        ${results.bookingTips
          .map(
            (tip, i) => `
          <div class="tip">
            <div class="tip-number">${i + 1}</div>
            <div>${tip}</div>
          </div>
        `,
          )
          .join("")}

        <p class="generated-date">Generated by BandCoin Gig Finder on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownload = () => {
    if (!results) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gig Finder Results - ${results.artist.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
          }
          h1 { color: #ea580c; margin-bottom: 8px; }
          h2 { color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-top: 32px; }
          .header { margin-bottom: 32px; border-bottom: 1px solid #ddd; padding-bottom: 16px; }
          .badge { display: inline-block; background: #f3f4f6; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin: 2px 4px 2px 0; }
          .venue { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
          .venue-name { font-size: 18px; font-weight: bold; }
          .venue-location { color: #666; font-size: 14px; }
          .contact-info { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 12px; }
          .contact-info p { margin: 4px 0; font-size: 14px; }
          .contact-label { font-weight: 600; color: #555; }
          .tip { display: flex; gap: 12px; margin-bottom: 12px; padding: 12px; background: #fffbeb; border-radius: 6px; }
          .tip-number { background: #ea580c; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: bold; }
          .generated-date { color: #999; font-size: 12px; margin-top: 40px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Gig Finder Results</h1>
          <p style="color: #666;">Booking opportunities for ${results.artist.name}</p>
        </div>

        <h2>Artist Profile</h2>
        <p><strong>${results.artist.name}</strong></p>
        <p>${results.artist.description}</p>
        <div>
          <span class="badge">${results.artist.genre}</span>
          <span class="badge">${results.artist.location}</span>
          ${results.artist.monthlyListeners ? `<span class="badge">${results.artist.monthlyListeners} monthly listeners</span>` : ""}
        </div>

        <h2>Venues & Booking Contacts (${results.venues.length})</h2>
        ${results.venues
          .map(
            (venue) => `
          <div class="venue">
            <div class="venue-name">${venue.name}</div>
            <div class="venue-location">${venue.location} • ${venue.capacity} capacity</div>
            ${
              venue.genres && Array.isArray(venue.genres) && venue.genres.length > 0
                ? `
            <div style="margin-top: 8px;">
              ${venue.genres.map((g) => `<span class="badge">${g}</span>`).join("")}
            </div>
            `
                : ""
            }
            ${
              venue.recentShows && Array.isArray(venue.recentShows) && venue.recentShows.length > 0
                ? `<p style="margin-top: 12px; font-size: 14px; color: #666;">Recent shows: ${venue.recentShows.join(", ")}</p>`
                : ""
            }
            ${venue.tips ? `<p style="margin-top: 8px; font-style: italic; color: #ea580c; font-size: 14px;">${venue.tips}</p>` : ""}
            ${
              venue.bookingContact
                ? `
              <div class="contact-info">
                <p style="font-weight: 600; margin-bottom: 8px;">Booking Contact</p>
                ${venue.bookingContact.name ? `<p><span class="contact-label">Name:</span> ${venue.bookingContact.name}</p>` : ""}
                ${venue.bookingContact.email ? `<p><span class="contact-label">Email:</span> ${venue.bookingContact.email}</p>` : ""}
                ${venue.bookingContact.phone ? `<p><span class="contact-label">Phone:</span> ${venue.bookingContact.phone}</p>` : ""}
                ${venue.bookingContact.website ? `<p><span class="contact-label">Website:</span> ${venue.bookingContact.website}</p>` : ""}
              </div>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}

        <h2>Similar Artists (${results.similarArtists.length})</h2>
        <div>
          ${results.similarArtists
            .map(
              (artist) => `
            <div class="artist-card">
              <strong>${artist.name}</strong>
              <div style="margin-top: 4px;">
                <span class="badge">${artist.genre}</span>
                <span class="badge">${artist.similarity} match</span>
              </div>
              ${artist.venues && Array.isArray(artist.venues) && artist.venues.length > 0 ? `<p style="font-size: 12px; color: #666; margin-top: 8px;">Plays at: ${artist.venues.slice(0, 3).join(", ")}</p>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>Booking Tips</h2>
        ${results.bookingTips
          .map(
            (tip, i) => `
          <div class="tip">
            <div class="tip-number">${i + 1}</div>
            <div>${tip}</div>
          </div>
        `,
          )
          .join("")}

        <p class="generated-date">Generated by BandCoin Gig Finder on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gig-finder-${results.artist.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    if (!results) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gig Finder Results - ${results.artist.name}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
            line-height: 1.6;
          }
          h1 { color: #ea580c; margin-bottom: 8px; }
          h2 { color: #333; border-bottom: 2px solid #ea580c; padding-bottom: 8px; margin-top: 32px; }
          h3 { color: #555; margin-top: 24px; }
          .header { margin-bottom: 32px; border-bottom: 1px solid #ddd; padding-bottom: 16px; }
          .badge { 
            display: inline-block; 
            background: #f3f4f6; 
            padding: 4px 12px; 
            border-radius: 16px; 
            font-size: 12px; 
            margin: 2px 4px 2px 0;
          }
          .venue { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .venue-name { font-size: 18px; font-weight: bold; color: #333; }
          .venue-location { color: #666; font-size: 14px; }
          .contact-info { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 12px; }
          .contact-info p { margin: 4px 0; font-size: 14px; }
          .contact-label { font-weight: 600; color: #555; }
          .artist-card { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 12px; 
            margin-bottom: 12px;
            display: inline-block;
            width: calc(33% - 16px);
            vertical-align: top;
            margin-right: 12px;
            box-sizing: border-box;
          }
          .tip { 
            display: flex; 
            gap: 12px; 
            margin-bottom: 12px;
            padding: 12px;
            background: #fffbeb;
            border-radius: 6px;
          }
          .tip-number { 
            background: #ea580c; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            flex-shrink: 0;
            font-size: 12px;
            font-weight: bold;
          }
          .generated-date { color: #999; font-size: 12px; margin-top: 40px; text-align: center; }
          @media print {
            body { padding: 20px; }
            .venue { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Gig Finder Results</h1>
          <p style="color: #666;">Booking opportunities for ${results.artist.name}</p>
        </div>

        <h2>Artist Profile</h2>
        <p><strong>${results.artist.name}</strong></p>
        <p>${results.artist.description}</p>
        <div>
          <span class="badge">${results.artist.genre}</span>
          <span class="badge">${results.artist.location}</span>
          ${results.artist.monthlyListeners ? `<span class="badge">${results.artist.monthlyListeners} monthly listeners</span>` : ""}
        </div>

        <h2>Venues & Booking Contacts</h2>
        ${results.venues
          .map(
            (venue) => `
          <div class="venue">
            <div class="venue-name">${venue.name}</div>
            <div class="venue-location">${venue.location} • ${venue.capacity} capacity</div>
            ${
              venue.genres && Array.isArray(venue.genres) && venue.genres.length > 0
                ? `
            <div style="margin-top: 8px;">
              ${venue.genres.map((g) => `<span class="badge">${g}</span>`).join("")}
            </div>
            `
                : ""
            }
            ${
              venue.recentShows && Array.isArray(venue.recentShows) && venue.recentShows.length > 0
                ? `<p style="margin-top: 12px; font-size: 14px; color: #666;">Recent shows: ${venue.recentShows.join(", ")}</p>`
                : ""
            }
            ${venue.tips ? `<p style="margin-top: 8px; font-style: italic; color: #ea580c; font-size: 14px;">${venue.tips}</p>` : ""}
            ${
              venue.bookingContact
                ? `
              <div class="contact-info">
                <p style="font-weight: 600; margin-bottom: 8px;">Booking Contact</p>
                ${venue.bookingContact.name ? `<p><span class="contact-label">Name:</span> ${venue.bookingContact.name}</p>` : ""}
                ${venue.bookingContact.email ? `<p><span class="contact-label">Email:</span> ${venue.bookingContact.email}</p>` : ""}
                ${venue.bookingContact.phone ? `<p><span class="contact-label">Phone:</span> ${venue.bookingContact.phone}</p>` : ""}
                ${venue.bookingContact.website ? `<p><span class="contact-label">Website:</span> ${venue.bookingContact.website}</p>` : ""}
              </div>
            `
                : ""
            }
          </div>
        `,
          )
          .join("")}

        <h2>Similar Artists (${results.similarArtists.length})</h2>
        <div>
          ${results.similarArtists
            .map(
              (artist) => `
            <div class="artist-card">
              <strong>${artist.name}</strong>
              <div style="margin-top: 4px;">
                <span class="badge">${artist.genre}</span>
                <span class="badge">${artist.similarity} match</span>
              </div>
              ${artist.venues && Array.isArray(artist.venues) && artist.venues.length > 0 ? `<p style="font-size: 12px; color: #666; margin-top: 8px;">Plays at: ${artist.venues.slice(0, 3).join(", ")}</p>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>

        <h2>Booking Tips</h2>
        ${results.bookingTips
          .map(
            (tip, i) => `
          <div class="tip">
            <div class="tip-number">${i + 1}</div>
            <div>${tip}</div>
          </div>
        `,
          )
          .join("")}

        <p class="generated-date">Generated by BandCoin Gig Finder on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </body>
      </html>
    `

    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gig Finder</h1>
          <p className="text-white/80">Discover venues and booking contacts for your music</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Search Form */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Gig</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Enter your band or artist name and we'll find similar artists, the venues they play, and booking contacts
              to help you land your next show.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-white/60 text-sm mb-2 block">Artist / Band Name</label>
                  <div className="relative">
                    <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="e.g., Arctic Monkeys, Khruangbin, Turnstile"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10 h-12"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <label className="text-white/60 text-sm mb-2 block">Location (optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Los Angeles, NYC"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10 h-12"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <div className="md:self-end">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !artistName.trim()}
                    className="w-full md:w-auto h-12 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Find Gigs
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <Sparkles className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-white/80 mt-6 text-lg font-medium">{searchPhase}</p>
            <p className="text-white/40 mt-2 text-sm">This may take a moment...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400">{error}</p>
              <Button
                onClick={handleSearch}
                variant="outline"
                className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && !isSearching && (
          <div className="space-y-8" ref={resultsRef}>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-400 font-semibold mb-1">Verification Required</h4>
                <p className="text-amber-200/80 text-sm">
                  This information is AI-generated based on publicly available data. Please verify all venue details,
                  contact information, and booking procedures directly with each venue before reaching out. Contact
                  details may have changed or may not be current.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save PDF
              </Button>
            </div>

            {/* Artist Profile */}
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-orange-500" />
                  Artist Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{results.artist.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {results.artist.genre}
                      </Badge>
                      <Badge className="bg-zinc-700/50 text-white/70 border-zinc-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {results.artist.location}
                      </Badge>
                      {results.artist.monthlyListeners && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Users className="w-3 h-3 mr-1" />
                          {results.artist.monthlyListeners} monthly listeners
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60">{results.artist.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {results.artist.spotifyUrl && (
                      <a href={results.artist.spotifyUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Spotify
                        </Button>
                      </a>
                    )}
                    {results.artist.instagramUrl && (
                      <a href={results.artist.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 bg-transparent"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Instagram
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Similar Artists and Venues */}
            <Tabs defaultValue="venues" className="w-full">
              <TabsList className="bg-zinc-900/50 border border-white/10 p-1">
                <TabsTrigger
                  value="venues"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white/60"
                  onClick={() => setActiveTab("venues")}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Venues & Contacts (${results.venues.length})
                </TabsTrigger>
                <TabsTrigger
                  value="similar"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white/60"
                  onClick={() => setActiveTab("similar")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Similar Artists (${results.similarArtists.length})
                </TabsTrigger>
                <TabsTrigger
                  value="tips"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white/60"
                  onClick={() => setActiveTab("tips")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Booking Tips
                </TabsTrigger>
              </TabsList>

              {/* Venues Tab */}
              {activeTab === "venues" && (
                <TabsContent value="venues" className="mt-6">
                  <div className="grid gap-4">
                    {results.venues.map((venue, index) => (
                      <Card
                        key={index}
                        className="bg-zinc-900/50 border-white/10 hover:border-orange-500/30 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-white">{venue.name}</h3>
                                  <p className="text-white/60 flex items-center gap-1 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {venue.location}
                                  </p>
                                </div>
                                <Badge className="bg-zinc-700/50 text-white/70 border-zinc-600">
                                  {venue.capacity} capacity
                                </Badge>
                              </div>

                              {venue.genres && Array.isArray(venue.genres) && venue.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {venue.genres.map((genre, i) => (
                                    <Badge key={i} variant="outline" className="border-white/20 text-white/60">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {venue.recentShows &&
                                Array.isArray(venue.recentShows) &&
                                venue.recentShows.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-white/40 text-sm mb-2">Recent shows by similar artists:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {venue.recentShows.map((show, i) => (
                                        <Badge key={i} className="bg-zinc-800 text-white/70 border-zinc-700">
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {show}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {venue.tips && (
                                <p className="text-orange-400/80 text-sm italic">
                                  <Sparkles className="w-3 h-3 inline mr-1" />
                                  {venue.tips}
                                </p>
                              )}
                            </div>

                            {/* Booking Contact */}
                            {venue.bookingContact && (
                              <div className="lg:w-72 bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-orange-500" />
                                  Booking Contact
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {venue.bookingContact.name && (
                                    <p className="text-white/80">{venue.bookingContact.name}</p>
                                  )}
                                  {venue.bookingContact.email && (
                                    <a
                                      href={`mailto:${venue.bookingContact.email}`}
                                      className="text-orange-400 hover:text-orange-300 flex items-center gap-2 transition-colors"
                                    >
                                      <Mail className="w-4 h-4" />
                                      {venue.bookingContact.email}
                                    </a>
                                  )}
                                  {venue.bookingContact.phone && (
                                    <a
                                      href={`tel:${venue.bookingContact.phone}`}
                                      className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                                    >
                                      <Phone className="w-4 h-4" />
                                      {venue.bookingContact.phone}
                                    </a>
                                  )}
                                  {venue.bookingContact.website && (
                                    <a
                                      href={venue.bookingContact.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                                    >
                                      <Globe className="w-4 h-4" />
                                      Visit Website
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}

              {/* Similar Artists Tab */}
              {activeTab === "similar" && (
                <TabsContent value="similar" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.similarArtists.map((artist, index) => (
                      <Card
                        key={index}
                        className="bg-zinc-900/50 border-white/10 hover:border-orange-500/30 transition-colors"
                      >
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="border-white/20 text-white/60">
                              {artist.genre}
                            </Badge>
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              {artist.similarity} match
                            </Badge>
                          </div>
                          {artist.venues && Array.isArray(artist.venues) && artist.venues.length > 0 && (
                            <div className="text-white/60 text-sm">
                              <p className="mb-2">Plays at:</p>
                              <div className="flex flex-wrap gap-2">
                                {artist.venues.slice(0, 3).map((venue, i) => (
                                  <Badge key={i} className="bg-zinc-800 text-white/70 border-zinc-700">
                                    {venue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              )}

              {/* Booking Tips Tab */}
              {activeTab === "tips" && (
                <TabsContent value="tips" className="mt-6">
                  <Card className="bg-zinc-900/50 border-white/10">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Personalized Booking Tips
                      </h3>
                      <ul className="space-y-4">
                        {results.bookingTips.map((tip, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <p className="text-white/80">{tip}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!results && !isSearching && !error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-white/10 mb-6">
              <MapPin className="w-10 h-10 text-orange-500/50" />
            </div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">Ready to find your next gig?</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Enter your artist or band name above and we'll find venues where similar artists perform, complete with
              booking contacts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
