"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Mail,
  Phone,
  Instagram,
  SproutIcon as Spotify,
  MapPin,
  Users,
  Star,
  ExternalLink,
  Music2,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PDFDownloadButton } from "@/components/pdf-download-button"

export default function NowItsDarkEPK() {
  const pressQuotes = [
    {
      quote:
        "Now Its Dark brings a solid rock sound with influences of Three Days Grace, Evanescence, and Killswitch Engage paired with a raw sincerity to making music.",
      source: "Official Bio",
      rating: 4.5,
    },
    {
      quote:
        "Their single 'Bother Me' quickly became one of their most streamed songs, showcasing the band's evolution and strong fan reception.",
      source: "Streaming Analytics",
      rating: 4.2,
    },
    {
      quote:
        "A quartet that's rehashing 2000s hard rock with a dash of metal, appealing directly to fans of the genre.",
      source: "ScarFire Media Podcast",
      rating: 4.0,
    },
  ]

  const tourHistory = [
    {
      date: "Recent",
      venue: "Various Venues",
      city: "Chicago Area",
      status: "Completed",
      specialGuest: "with Icon For Hire",
    },
    {
      date: "Recent",
      venue: "Various Venues",
      city: "Midwest",
      status: "Completed",
      specialGuest: "with A Killers Confession",
    },
    {
      date: "Recent",
      venue: "Various Venues",
      city: "Regional",
      status: "Completed",
      specialGuest: "with City Of The Weak",
    },
  ]

  const stats = [
    { label: "Monthly Listeners", value: "36+", icon: Users },
    { label: "Years Active", value: "4+", icon: Calendar },
    { label: "Studio Albums", value: "1", icon: Music2 },
    { label: "Based In", value: "Chicago", icon: MapPin },
  ]

  const discography = [
    {
      title: "NYMPH",
      type: "Single",
      year: "2024",
      featured: true,
      description: "Latest single - mystical rock anthem now streaming on all platforms",
    },
    {
      title: "Bother Me",
      type: "Single",
      year: "2024",
      featured: true,
      description: "Most streamed song, produced with Tavis Stanley",
    },
    {
      title: "Elusive",
      type: "Single",
      year: "2024",
      featured: true,
      description: "Previous single release",
    },
    {
      title: "First Full-Length Album",
      type: "Album",
      year: "2023",
      featured: false,
      description: "Debut album released October 2023, created with Grammy-nominated guitarist",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-blue-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/examples" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Portfolio
            </Link>
            <Badge className="bg-blue-900/20 text-blue-400 border-blue-800">Chicago Rock Band EPK - $100 Package</Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-slate-900/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-900/20 text-blue-400 border-blue-800 mb-4">
                Rock • Alternative Metal • Chicago
              </Badge>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 to-slate-100 bg-clip-text text-transparent mb-6">
                Now Its Dark
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Chicago rock quartet bringing raw sincerity to modern rock music. Influenced by Three Days Grace,
                Evanescence, and Killswitch Engage, they've shared stages with Icon For Hire, A Killers Confession, and
                City Of The Weak. Their latest single "NYMPH" showcases their mystical rock sound, continuing their
                evolution with producer Tavis Stanley.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://open.spotify.com/artist/nowitsdark" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3">
                    <Play className="mr-2 h-5 w-5" />
                    Listen Now
                  </Button>
                </a>
                <PDFDownloadButton
                  epkType="now-its-dark"
                  artistName="Now Its Dark"
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/10 text-lg px-6 py-3 bg-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-600 rounded-3xl blur-3xl opacity-30"></div>
              <Image
                src="/images/now-its-dark-nymph.png"
                alt="Now Its Dark - NYMPH Single Artwork"
                width={600}
                height={600}
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Band Members Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">The Band</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Meet the Chicago rock quartet</p>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-blue-900/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div className="relative">
                  <Image
                    src="/images/frost-tayla-portrait.png"
                    alt="Frost Tayla - Lead Vocalist performing live"
                    width={400}
                    height={400}
                    className="w-full rounded-lg shadow-2xl"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-white mb-2">Frost Tayla</h3>
                  <Badge className="bg-blue-600 text-white w-fit mb-4">Lead Vocalist</Badge>
                  <p className="text-gray-300 mb-6 text-lg">
                    The powerful voice behind Now Its Dark's emotionally charged anthems. Frost brings raw sincerity and
                    passionate delivery to every performance, embodying the band's commitment to authentic rock music.
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <strong>Role:</strong> Vocalist, Bassist, Songwriter
                    </p>
                    <p>
                      <strong>Influences:</strong> Three Days Grace, Evanescence
                    </p>
                    <p>
                      <strong>Known For:</strong> Raw, emotional vocal delivery
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Card className="bg-slate-800/30 border-blue-900/20 p-6">
                <p className="text-gray-300 text-lg">
                  <strong className="text-white">Complete Quartet:</strong> Now Its Dark features four talented
                  musicians bringing their Chicago rock sound to life. While Frost Tayla leads on vocals, the full
                  lineup creates the powerful, layered sound that defines their music.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Discography Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Discography</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Latest releases and streaming hits</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {discography.map((release, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-blue-900/20 group hover:bg-slate-800/70 transition-all"
              >
                <div className="relative">
                  {index === 0 ? (
                    <Image
                      src="/images/now-its-dark-nymph.png"
                      alt={release.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <Image
                      src={`/placeholder_image.png?height=300&width=300&text=${release.title.replace(" ", "+")}`}
                      alt={release.title}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={release.type === "Single" ? "bg-blue-600" : "bg-slate-600"}>{release.type}</Badge>
                    {release.featured && <Badge className="bg-green-600 text-white">Featured</Badge>}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-900/80 text-blue-200">{release.year}</Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-white text-xl">{release.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-300 mb-4 text-sm">{release.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Stream
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Press & Reviews */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Press & Recognition</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">What people are saying about Now Its Dark</p>

          <div className="grid md:grid-cols-3 gap-8">
            {pressQuotes.map((press, index) => (
              <Card key={index} className="bg-slate-800/50 border-blue-900/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-blue-900/20 text-blue-400 border-blue-800">{press.source}</Badge>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(press.rating) ? "text-blue-400 fill-current" : "text-gray-600"
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

      {/* Live Performance History */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Live Performance History</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Shared stages with notable acts</p>

          <div className="max-w-4xl mx-auto">
            {tourHistory.map((show, index) => (
              <Card
                key={index}
                className="mb-4 bg-slate-800/50 border-blue-900/20 hover:bg-slate-800/70 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                        <div className="text-lg font-bold text-blue-400">{show.date}</div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{show.venue}</h3>
                        {show.specialGuest && <p className="text-blue-400 font-medium">{show.specialGuest}</p>}
                        <p className="text-gray-400 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {show.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-green-900/20 text-green-400 border-green-800">{show.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Card className="bg-slate-800/30 border-blue-900/20 p-6 max-w-2xl mx-auto">
              <p className="text-gray-300 text-lg">
                <strong className="text-white">Upcoming Tours:</strong> Now Its Dark is actively planning small tours
                and working on new music. Stay connected through their social media for the latest tour announcements.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Producer Collaboration */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Professional Collaborations</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Working with industry professionals</p>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-blue-900/20 p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Tavis Stanley</h3>
                  <Badge className="bg-blue-600 text-white mb-4">Producer - 2024 Collaboration</Badge>
                  <p className="text-gray-300 mb-4">
                    Now Its Dark has been working with renowned producer Tavis Stanley, known for his work with Art Of
                    Dying, Saint Asonia, and Adelitas Way. This collaboration has elevated their sound and production
                    quality.
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <strong>Notable Works:</strong> Art Of Dying, Saint Asonia, Adelitas Way
                    </p>
                    <p>
                      <strong>Collaboration:</strong> "Bother Me" (2024)
                    </p>
                    <p>
                      <strong>Impact:</strong> Enhanced production quality and sound evolution
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">Grammy-Nominated Guitarist</h3>
                  <Badge className="bg-slate-600 text-white mb-4">Debut Album Collaboration - 2023</Badge>
                  <p className="text-gray-300 mb-4">
                    Their first full-length album was created in collaboration with a Grammy-nominated guitarist,
                    bringing professional expertise to their debut release.
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <strong>Project:</strong> First Full-Length Album (October 2023)
                    </p>
                    <p>
                      <strong>Recognition:</strong> Grammy nomination credentials
                    </p>
                    <p>
                      <strong>Impact:</strong> Professional debut album production
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Get In Touch</h2>
          <p className="text-xl mb-12 text-gray-300">Ready to book Now Its Dark for your event?</p>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Booking & Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  <Mail className="h-5 w-5" />
                  <span>booking@nowitsdark.com</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-gray-300">
                  <Phone className="h-5 w-5" />
                  <span>+1 (312) 555-DARK</span>
                </div>
              </div>
              <PDFDownloadButton
                epkType="now-its-dark"
                artistName="Now Its Dark"
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-white">Follow Now Its Dark</h3>
              <div className="flex justify-center gap-4 mb-6">
                <a href="https://www.facebook.com/nowitsdarkofficial" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600/20 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://www.instagram.com/nowitsdarkofficial" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600/20 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://open.spotify.com/artist/nowitsdark" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600/20 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                  >
                    <Spotify className="h-5 w-5" />
                  </Button>
                </a>
                <a href="https://nowitsdark.com" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600/20 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </a>
              </div>
              <p className="text-gray-400">
                Stay updated with the latest releases, tour dates, and behind-the-scenes content from Chicago's rising
                rock quartet.
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
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              BandCoin
            </Link>
          </p>
          <Badge className="bg-blue-600 text-white">Professional Digital EPK Package - $100</Badge>
          <p className="text-gray-500 mt-2 text-sm">© 2025 BandCoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
