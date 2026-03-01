"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { submitContactForm } from "./actions"

export default function ViewOurWork() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bandName: "",
    serviceType: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const result = await submitContactForm(formData)
    if (result.success) {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const portfolioExamples = [
    {
      id: 1,
      title: "HollowVox",
      type: "Website",
      genre: "Crypto/Gaming",
      description: "Futuristic Action Token platform with community features, rewards system, and gaming integration",
      image: "/images/hollowvox-logo.png",
      features: [
        "Action Token Integration",
        "Community Dashboard",
        "Rewards System",
        "Gaming Elements",
        "Mobile Responsive",
      ],
      stats: ["Action Token Platform", "Community Driven", "Futuristic Design"],
      link: "/hollowvox",
      isLive: true,
      color: "green",
    },
    {
      id: 2,
      title: "3 Years Hollow",
      type: "EPK",
      genre: "Rock/Metal",
      description: "Powerful rock anthems with crushing riffs and emotionally charged vocals",
      image: "/images/3years-hollow-band.png",
      features: ["Band Photos", "Album Showcase", "Press Coverage", "Tour Schedule", "Contact Info"],
      stats: ["40K Monthly Listeners", "21M Total Streams", "80K Songstats Followers"],
      link: "/3yearshollow",
      isLive: true,
      color: "red",
    },
    {
      id: 3,
      title: "Now Its Dark",
      type: "EPK",
      genre: "Rock/Alternative",
      description: "Chicago rock quartet featuring their mystical single 'NYMPH' - now streaming on all platforms",
      image: "/images/now-its-dark-portfolio.png",
      features: ["Band Profiles", "Discography", "Producer Credits", "Live History", "Social Links"],
      stats: ["Latest Single: NYMPH", "Chicago Based", "Mystical Rock Sound"],
      link: "/now-its-dark",
      isLive: true,
      color: "blue",
    },
    {
      id: 4,
      title: "Tame The Jester",
      type: "Website",
      genre: "Interactive/Custom",
      description:
        "Fully custom interactive website with game-like elements, custom animations, and immersive branding experience",
      image: "/images/tame-the-jester-album.png",
      features: ["Interactive Design", "Custom Animations", "Game Elements", "Brand Integration", "Mobile Responsive"],
      stats: ["Interactive Elements", "Custom Development", "Game-like Navigation"],
      link: "/tamethejester",
      isLive: true,
      color: "orange",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/images/bandcoin-logo.png" alt="BandCoin Logo" width={40} height={40} className="h-10 w-10" />
              <span className="text-2xl font-bold text-white">BandCoin ShowCase</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/#services" className="text-white/80 hover:text-white transition-colors">
                Services
              </Link>
              <Link href="/#portfolio" className="text-white/80 hover:text-white transition-colors">
                Portfolio
              </Link>
              <Link href="/explore" className="text-white/80 hover:text-white transition-colors">
                Explore
              </Link>
              <Link href="/beatbuilder" className="text-white/80 hover:text-white transition-colors">
                Beat Builder
              </Link>
                <Link href="/#contact" className="text-white/80 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
            <a href="#get-started">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">Get Started</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Our Amazing Work
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-3xl mx-auto">
            Explore our portfolio of completed, fully-functional EPKs. Each example represents real work we've delivered
            for artists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#live-demos">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4">
                View Live Demos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#get-started">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
              >
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Live Demos Section */}
      <section id="live-demos" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Our Completed Work</h2>
          <p className="text-center text-white/70 mb-12 text-lg">
            Click through these fully functional EPKs to see our work in action
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {portfolioExamples.map((item) => (
              <Card
                key={item.id}
                className="bg-white/10 border-white/20 overflow-hidden group hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge
                      className={`${item.color === "green" ? "bg-green-600" : item.color === "purple" ? "bg-purple-600" : "bg-red-600"}`}
                    >
                      {item.type}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30 bg-black/20">
                      {item.genre}
                    </Badge>
                    <Badge className="bg-green-600 text-white">LIVE DEMO</Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  </div>
                </div>

                <CardHeader>
                  <CardDescription className="text-white/70 text-base">{item.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="bg-white/20 text-white text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Highlights:</h4>
                      <ul className="text-white/70 text-sm space-y-1">
                        {item.stats.map((stat, index) => (
                          <li key={index}>• {stat}</li>
                        ))}
                      </ul>
                    </div>

                    <Link href={item.link}>
                      <Button
                        className={`w-full bg-gradient-to-r ${
                          item.color === "green"
                            ? "from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                            : item.color === "purple"
                              ? "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              : "from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-600"
                        }`}
                      >
                        View Live Demo <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="get-started" className="py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Ready to Create Your Own?</h2>
          <p className="text-center text-white/70 mb-10 text-lg">
            Tell us about your project and we'll get back to you shortly.
          </p>

          {submitted ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-12 text-center">
              <CheckCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">We got your message!</h3>
              <p className="text-white/70">We'll be in touch with you soon to discuss your project.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/10 border border-white/20 rounded-2xl p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Your Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="jane@yourband.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bandName" className="text-white">Band / Artist Name</Label>
                <Input
                  id="bandName"
                  required
                  placeholder="Your band or artist name"
                  value={formData.bandName}
                  onChange={(e) => setFormData({ ...formData, bandName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-white">What are you looking for?</Label>
                <select
                  id="serviceType"
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="" disabled className="bg-gray-900">Select a service...</option>
                  <option value="epk" className="bg-gray-900">EPK (Electronic Press Kit)</option>
                  <option value="website" className="bg-gray-900">Full Website</option>
                  <option value="both" className="bg-gray-900">Both EPK + Website</option>
                  <option value="unsure" className="bg-gray-900">Not sure yet</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">Tell us about your project</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Genre, style inspiration, any specific features you'd like, timeline, etc."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-lg"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image src="/images/bandcoin-logo.png" alt="BandCoin Logo" width={24} height={24} className="h-6 w-6" />
            <span className="text-xl font-bold text-white">BandCoin ShowCase</span>
          </div>
          <p className="text-white/60">© 2025 BandCoin ShowCase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
