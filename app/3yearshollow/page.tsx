"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Youtube,
  AirplayIcon as Spotify,
  MapPin,
  Users,
  TrendingUp,
  Star,
  ExternalLink,
  Download,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import "./print-styles.css"
import { PDFDownloadButton } from "@/components/pdf-download-button"

export default function ThreeYearsHollowEPK() {
  const pressQuotes = [
    {
      quote:
        "3 Years Hollow delivers crushing riffs and emotionally charged vocals that resonate with the soul of modern rock.",
      source: "Rock Sound",
      rating: 4.5,
    },
    {
      quote:
        "Their latest album 'The Cracks' showcases a band that has found their perfect balance between melody and aggression.",
      source: "Revolver",
      rating: 8.5,
    },
    {
      quote: "3 Years Hollow proves that rock music is alive and well with their powerful, anthemic sound.",
      source: "Loudwire",
      rating: 4,
    },
  ]

  const tourDates = [
    {
      date: "Aug 2, 2025",
      venue: "Mississippi Valley Fair",
      city: "Davenport, IA",
      status: "On Sale",
      specialGuest: "with Pop Evil",
    },
  ]

  const stats = [
    { label: "Monthly Listeners", value: "40K", icon: Users },
    { label: "Total Streams", value: "21M", icon: Play },
    { label: "Songstats Followers", value: "80K", icon: TrendingUp },
    { label: "Countries", value: "101+", icon: MapPin },
  ]

  const songs = [
    { title: "Hungry", album: "The Cracks", year: "2024", featured: true },
    { title: "For Life", album: "The Cracks", year: "2024", featured: true },
    { title: "Fallen", album: "The Cracks", year: "2024", featured: true },
    { title: "Chemical Ride", album: "The Cracks", year: "2024", featured: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-red-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-red-400 hover:text-red-300 font-medium">
              ← Back to BandCoin
            </Link>
            <Badge className="bg-red-900/20 text-red-400 border-red-800">Rock Band EPK - $100 Package</Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 to-gray-900/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-red-900/20 text-red-400 border-red-800 mb-4">Rock • Alternative Metal</Badge>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-red-400 to-gray-100 bg-clip-text text-transparent mb-6">
                3 Years Hollow
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Powerful rock anthems with crushing riffs and emotionally charged vocals. The band's latest album "The
                Cracks" showcases their perfect balance between melody and aggression, featuring hits like "Hungry",
                "For Life", and "Chemical Ride".
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.youtube.com/3yearshollow" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-red-600 hover:bg-red-700 text-lg px-6 py-3">
                    <Play className="mr-2 h-5 w-5" />
                    Listen Now
                  </Button>
                </a>
                <PDFDownloadButton
                  epkType="3years-hollow"
                  artistName="3 Years Hollow"
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600/10 text-lg px-6 py-3 bg-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-gray-600 rounded-3xl blur-3xl opacity-30"></div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jBQdL62IYLO5KLEj7q8K8MIPowQkfi.png"
                alt="3 Years Hollow Band"
                width={600}
                height={400}
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-gray-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Album Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Latest Album</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Stream "The Cracks" now on all platforms</p>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800/50 border-red-900/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div className="relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kI6s8Esf6lg5v9wwD0SX0edsV8aaDL.png"
                    alt="The Cracks Album Cover"
                    width={400}
                    height={400}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-white mb-4">The Cracks</h3>
                  <p className="text-gray-300 mb-6 text-lg">
                    The band's most powerful release yet, featuring crushing riffs, soaring melodies, and deeply
                    personal lyrics that explore themes of struggle, resilience, and redemption.
                  </p>

                  <div className="space-y-3 mb-6">
                    {songs.map((song, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Play className="h-4 w-4 text-red-400" />
                          <span className="text-white font-medium">{song.title}</span>
                          {song.featured && <Badge className="bg-red-600 text-white text-xs">Featured</Badge>}
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <a
                      href="https://open.spotify.com/artist/3yearshollow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="bg-red-600 hover:bg-red-700 w-full">
                        <Spotify className="mr-2 h-4 w-4" />
                        Spotify
                      </Button>
                    </a>
                    <a
                      href="https://music.apple.com/artist/3yearshollow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/10 w-full bg-transparent"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Apple Music
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Press & Reviews */}
      <section className="py-20 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Press & Reviews</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">What the critics are saying</p>

          <div className="grid md:grid-cols-3 gap-8">
            {pressQuotes.map((press, index) => (
              <Card key={index} className="bg-gray-800/50 border-red-900/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-red-900/20 text-red-400 border-red-800">{press.source}</Badge>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(press.rating) ? "text-red-400 fill-current" : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-400">{press.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-gray-300 italic">"{press.quote}"</blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tour Dates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Upcoming Shows</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Catch 3 Years Hollow live</p>

          <div className="max-w-4xl mx-auto">
            {tourDates.map((show, index) => (
              <Card key={index} className="mb-4 bg-gray-800/50 border-red-900/20 hover:bg-gray-800/70 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                        <div className="text-2xl font-bold text-red-400">{show.date.split(",")[0]}</div>
                        <div className="text-sm text-gray-400">{show.date.split(",")[1]}</div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{show.venue}</h3>
                        {show.specialGuest && <p className="text-red-400 font-medium">{show.specialGuest}</p>}
                        <p className="text-gray-400 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {show.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        className={
                          show.status === "Sold Out"
                            ? "bg-red-900/20 text-red-400 border-red-800"
                            : show.status === "Few Tickets Left"
                              ? "bg-yellow-900/20 text-yellow-400 border-yellow-800"
                              : "bg-green-900/20 text-green-400 border-green-800"
                        }
                      >
                        {show.status}
                      </Badge>
                      <Button
                        variant={show.status === "Sold Out" ? "outline" : "default"}
                        disabled={show.status === "Sold Out"}
                        className={
                          show.status !== "Sold Out" ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-gray-400"
                        }
                      >
                        {show.status === "Sold Out" ? "Sold Out" : "Get Tickets"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">About 3 Years Hollow</h2>
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  3 Years Hollow emerged from the heartland of American rock with a sound that perfectly balances
                  crushing heaviness with melodic accessibility. The band has carved out their own unique space in the
                  modern rock landscape, delivering emotionally charged anthems that resonate with audiences worldwide.
                </p>
                <p>
                  Their latest album "The Cracks" represents the culmination of years of musical evolution, featuring
                  standout tracks like "Hungry," "For Life," "Fallen," and "Chemical Ride." Each song showcases the
                  band's ability to craft memorable hooks while maintaining the raw power that defines their sound.
                </p>
                <p>
                  With 40,000 monthly Spotify listeners, 21 million total streams, and 80,000 Songstats followers, 3
                  Years Hollow has proven their ability to connect with fans on a deep level.
                </p>
                <p>
                  The band continues to tour extensively, bringing their powerful live show to venues across the country
                  and building a dedicated fanbase that spans multiple generations of rock music lovers.
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-900/20">
                  <h3 className="font-semibold text-white mb-4">Quick Facts</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <strong>Genre:</strong> Rock, Alternative Metal
                    </li>
                    <li>
                      <strong>Formed:</strong> 2010
                    </li>
                    <li>
                      <strong>Latest Album:</strong> The Cracks (2024)
                    </li>
                    <li>
                      <strong>Label:</strong> Independent
                    </li>
                    <li>
                      <strong>Members:</strong> 5-piece band
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-red-900/20">
                  <h3 className="font-semibold text-white mb-4">Featured Tracks</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Hungry</li>
                    <li>• For Life</li>
                    <li>• Fallen</li>
                    <li>• Chemical Ride</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stage Plot Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Stage Plot</h2>
          <p className="text-center text-gray-400 mb-8 text-lg">
            Technical setup and requirements for live performances
          </p>

          {/* Download Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            
            <Button
              onClick={() => {
                // Convert stage plot to canvas and download as PNG
                const stagePlotElement = document.getElementById("stage-plot-diagram")
                if (stagePlotElement) {
                  // Use html2canvas library (would need to be imported in a real implementation)
                  // For now, we'll create a simplified version
                  const canvas = document.createElement("canvas")
                  const ctx = canvas.getContext("2d")
                  canvas.width = 800
                  canvas.height = 600

                  // Fill with white background
                  if (ctx) {
                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    // Add title
                    ctx.fillStyle = "black"
                    ctx.font = "bold 24px Arial"
                    ctx.textAlign = "center"
                    ctx.fillText("3 YEARS HOLLOW", canvas.width / 2, 40)
                    ctx.font = "16px Arial"
                    ctx.fillText("Stage Plot & Technical Requirements", canvas.width / 2, 65)

                    // Add basic stage plot elements (simplified)
                    // Drums
                    ctx.fillStyle = "#374151"
                    ctx.fillRect(canvas.width / 2 - 40, 100, 80, 60)
                    ctx.fillStyle = "white"
                    ctx.font = "bold 12px Arial"
                    ctx.fillText("DRUMS", canvas.width / 2, 135)

                    // Front line positions
                    const positions = ["Guitar 1", "Guitar 2", "Lead Vocals", "Bass Amp", "Guitar 3"]
                    const spacing = canvas.width / 6
                    positions.forEach((pos, index) => {
                      const x = spacing * (index + 1)
                      const y = 400

                      // Equipment representation
                      ctx.fillStyle = "#374151"
                      if (pos === "Lead Vocals") {
                        ctx.fillRect(x - 5, y, 10, 40) // Mic stand
                      } else {
                        ctx.fillRect(x - 25, y, 50, 60) // Amp
                      }

                      // Monitor wedge
                      ctx.fillStyle = "#6B7280"
                      ctx.fillRect(x - 10, y + 70, 20, 10)

                      // Label
                      ctx.fillStyle = "black"
                      ctx.font = "10px Arial"
                      ctx.textAlign = "center"
                      ctx.fillText(pos, x, y + 100)
                    })

                    // Stage front line
                    ctx.strokeStyle = "#9CA3AF"
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(100, 520)
                    ctx.lineTo(700, 520)
                    ctx.stroke()
                    ctx.fillText("STAGE FRONT", canvas.width / 2, 540)
                  }

                  // Download the canvas as PNG
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = "3-years-hollow-stage-plot.png"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                    }
                  })
                }
              }}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/10 bg-transparent"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Stage Plot (PNG)
            </Button>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Stage Plot Diagram */}
              <div className="lg:col-span-3">
                <Card className="bg-gray-800/50 border-red-900/20 p-8">
                  <div id="stage-plot-diagram" className="relative bg-white rounded-lg p-12 min-h-[600px]">
                    {/* Stage Plot Title */}
                    <div className="text-center mb-12">
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">3 YEARS HOLLOW</h3>
                    </div>

                    {/* Power Required Legend */}
                    <div className="absolute top-8 left-8">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-5 h-5 border-2 border-yellow-500 flex items-center justify-center mr-2">
                          <span className="text-yellow-600 font-bold text-xs">!</span>
                        </div>
                        <span>Power Required</span>
                      </div>
                    </div>

                    {/* Back Row - Drums */}
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-20 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                          <span className="text-white text-sm font-bold">DRUMS</span>
                        </div>
                        <div className="text-sm text-gray-600 text-center mb-3">
                          <div className="font-semibold">1-2 monitors</div>
                          <div>Standard Drum Mics</div>
                        </div>
                        {/* Monitor wedges for drummer */}
                        <div className="flex gap-3">
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45"></div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>

                    {/* Front Row - Band Members with better spacing */}
                    <div className="absolute bottom-24 left-0 right-0">
                      <div className="flex justify-between items-end px-8">
                        {/* Guitar 1 */}
                        <div className="flex flex-col items-center w-20">
                          <div className="w-14 h-20 bg-gray-700 rounded mb-2">
                            <div className="w-full h-10 bg-gray-800 rounded-t"></div>
                          </div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45 mb-3"></div>
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            <div className="font-semibold mb-1">Guitar 1</div>
                            <div>SM57 or equiv.</div>
                            <div>Monitor, Power for FX</div>
                          </div>
                          {/* Power indicator */}
                          <div className="w-4 h-4 border border-yellow-500 flex items-center justify-center mt-2">
                            <span className="text-yellow-600 font-bold text-xs">!</span>
                          </div>
                        </div>

                        {/* Guitar 2 */}
                        <div className="flex flex-col items-center w-20">
                          <div className="w-14 h-20 bg-gray-700 rounded mb-2">
                            <div className="w-full h-10 bg-gray-800 rounded-t"></div>
                          </div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45 mb-3"></div>
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            <div className="font-semibold mb-1">Guitar 2</div>
                            <div>SM57 or equiv.</div>
                            <div>Monitor, Power for FX</div>
                          </div>
                          {/* Power indicator */}
                          <div className="w-4 h-4 border border-yellow-500 flex items-center justify-center mt-2">
                            <span className="text-yellow-600 font-bold text-xs">!</span>
                          </div>
                        </div>

                        {/* Lead Vocals */}
                        <div className="flex flex-col items-center w-20">
                          <div className="w-4 h-16 bg-gray-800 rounded-full mb-2 mx-auto"></div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45 mb-3"></div>
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            <div className="font-semibold mb-1">Lead Vocals</div>
                            <div>SM58 or equiv.</div>
                            <div>Monitor</div>
                          </div>
                        </div>

                        {/* Bass Guitar */}
                        <div className="flex flex-col items-center w-20">
                          <div className="w-16 h-24 bg-gray-700 rounded mb-2">
                            <div className="w-full h-12 bg-gray-800 rounded-t"></div>
                            <div className="flex justify-center mt-1 gap-1">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div className="flex justify-center gap-1">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45 mb-3"></div>
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            <div className="font-semibold mb-1">Bass Amp</div>
                            <div>DI on amp head</div>
                            <div>Monitor, Power</div>
                          </div>
                          {/* Power indicator */}
                          <div className="w-4 h-4 border border-yellow-500 flex items-center justify-center mt-2">
                            <span className="text-yellow-600 font-bold text-xs">!</span>
                          </div>
                        </div>

                        {/* Guitar 3 */}
                        <div className="flex flex-col items-center w-20">
                          <div className="w-14 h-20 bg-gray-700 rounded mb-2">
                            <div className="w-full h-10 bg-gray-800 rounded-t"></div>
                          </div>
                          <div className="w-5 h-4 bg-gray-600 transform rotate-45 mb-3"></div>
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            <div className="font-semibold mb-1">Guitar 3</div>
                            <div>SM57 or equiv.</div>
                            <div>Monitor, Power for FX</div>
                          </div>
                          {/* Power indicator */}
                          <div className="w-4 h-4 border border-yellow-500 flex items-center justify-center mt-2">
                            <span className="text-yellow-600 font-bold text-xs">!</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage front indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="text-sm text-gray-500 font-semibold text-center">STAGE FRONT</div>
                      <div className="w-40 h-0.5 bg-gray-400 mt-2"></div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Drum Channel List */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800/50 border-red-900/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Drum Channel List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        "1. Kick in",
                        "2. Kick out",
                        "3. Snare top",
                        "4. Snare bottom",
                        "5. Hi hat",
                        "6. Tom 1",
                        "7. Tom 2",
                        "8. Floor tom",
                        "9. OVH L",
                        "10. OVH R",
                        "11. Trax",
                      ].map((channel, index) => (
                        <div key={index} className="flex items-center text-gray-300 text-sm">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          <span>{channel}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-600">
                      <h4 className="text-white font-semibold mb-3">Technical Notes</h4>
                      <ul className="text-gray-300 text-xs space-y-1">
                        <li>• Standard drum mic setup</li>
                        <li>• All guitar amps mic'd</li>
                        <li>• Bass DI from amp head</li>
                        <li>• Monitor mix required</li>
                        <li>• Power for guitar effects</li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h4 className="text-white font-semibold mb-2">Contact</h4>
                      <p className="text-gray-300 text-xs">
                        For technical questions:
                        <br />
                        <span className="text-red-400">admin@3yearsinc.com</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Technical Requirements */}
            <div className="mt-8">
              <Card className="bg-gray-800/50 border-red-900/20">
                <CardHeader>
                  <CardTitle className="text-white">Additional Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Power Requirements</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 3x Guitar amp power</li>
                        <li>• 1x Bass amp power</li>
                        <li>• Effects pedal power</li>
                        <li>• Standard 120V outlets</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Monitor Mix</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 5x Floor monitors</li>
                        <li>• Individual mix control</li>
                        <li>• Drum monitor mix</li>
                        <li>• Vocal prominence</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">Stage Dimensions</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Minimum 20' x 16'</li>
                        <li>• Drum riser preferred</li>
                        <li>• Adequate load-in access</li>
                        <li>• Standard stage height</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="py-20 bg-gradient-to-r from-red-900/20 to-gray-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Get In Touch</h2>
          <p className="text-xl mb-12 text-gray-300">Ready to book 3 Years Hollow for your event?</p>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Booking & Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  <Mail className="h-5 w-5" />
                  <span>admin@3yearsinc.com</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  <Phone className="h-5 w-5" />
                  <span>+1 (309) 314-3010</span>
                </div>
              </div>
              <PDFDownloadButton
                epkType="3years-hollow"
                artistName="3 Years Hollow"
                className="mt-6 bg-red-600 hover:bg-red-700"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Follow 3 Years Hollow</h3>
              <div className="flex justify-center gap-4 mb-6">
                <a href="https://www.instagram.com/3yearshollow" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-600/20 text-red-400 hover:bg-red-600/10 bg-transparent"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://twitter.com/3yearshollow" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-600/20 text-red-400 hover:bg-red-600/10 bg-transparent"
                  >
                    <Twitter className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://www.youtube.com/3yearshollow" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-600/20 text-red-400 hover:bg-red-600/10 bg-transparent"
                  >
                    <Youtube className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://open.spotify.com/artist/3yearshollow" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-red-600/20 text-red-400 hover:bg-red-600/10 bg-transparent"
                  >
                    <Spotify className="h-5 w-5" />
                  </Button>
                </a>
              </div>
              <p className="text-gray-400">
                Stay updated with the latest releases, tour dates, and behind-the-scenes content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            This EPK was created by{" "}
            <Link href="/" className="text-red-400 hover:text-red-300">
              BandCoin
            </Link>
          </p>
          <Badge className="bg-red-600 text-white">Professional Digital EPK Package - $100</Badge>
          <p className="text-gray-500 mt-2 text-sm">© 2025 BandCoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
