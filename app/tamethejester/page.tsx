"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, Music, Users, Star, ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function TameTheJesterShowcase() {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const features = [
    "Custom Interactive Design",
    "Game-like Navigation",
    "Music Player Integration",
    "Responsive Layout",
    "Social Media Links",
    "Coming Soon Announcements",
    "Brand Mascot Integration",
    "Dark Theme Design",
  ]

  const stats = [
    { label: "Interactive Elements", value: "5+", icon: Users },
    { label: "Custom Pages", value: "6", icon: Globe },
    { label: "Music Integration", value: "Full", icon: Music },
    { label: "Mobile Optimized", value: "100%", icon: Smartphone },
  ]

  const getIframeClass = () => {
    switch (viewMode) {
      case "mobile":
        return "w-[375px] h-[667px] mx-auto"
      case "tablet":
        return "w-[768px] h-[1024px] mx-auto"
      default:
        return "w-full h-[800px]"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-orange-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/examples" className="text-orange-400 hover:text-orange-300 font-medium flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
            <Badge className="bg-orange-900/20 text-orange-400 border-orange-800">Custom Website - $250 Package</Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 to-slate-900/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-900/20 text-orange-400 border-orange-800 mb-4">
                Interactive Website • Custom Design
              </Badge>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-orange-400 to-slate-100 bg-clip-text text-transparent mb-6">
                Tame The Jester
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                A fully custom, interactive website featuring game-like elements, dynamic navigation, and immersive
                branding. This project showcases advanced web development with custom animations, interactive features,
                and a unique user experience that perfectly captures the artist's chaotic yet harmonious musical style.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.tamethejester.com/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-lg px-6 py-3">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Visit Live Site
                  </Button>
                </a>
                <Link href="/order?service=website">
                  <Button
                    variant="outline"
                    className="border-orange-600 text-orange-400 hover:bg-orange-600/10 text-lg px-6 py-3 bg-transparent"
                  >
                    Order Website - $250
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-slate-600 rounded-3xl blur-3xl opacity-30"></div>
              <Image
                src="/images/tame-the-jester-portfolio.jpg"
                alt="Tame The Jester Website Screenshot"
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-600 to-slate-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Website Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Live Website Preview</h2>
          <p className="text-center text-gray-400 mb-8 text-lg">
            Experience the interactive website in different device views
          </p>

          {/* Device Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 rounded-lg p-2 flex gap-2">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className={viewMode === "desktop" ? "bg-orange-600" : "text-gray-400 hover:text-white"}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tablet")}
                className={viewMode === "tablet" ? "bg-orange-600" : "text-gray-400 hover:text-white"}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className={viewMode === "mobile" ? "bg-orange-600" : "text-gray-400 hover:text-white"}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>

          {/* Website Iframe */}
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-orange-900/20">
            <div className="overflow-hidden rounded-lg border border-slate-600">
              <iframe
                src="https://www.tamethejester.com/"
                className={`${getIframeClass()} border-0 transition-all duration-300`}
                title="Tame The Jester Website"
                loading="lazy"
              />
            </div>
            <div className="text-center mt-4">
              <a href="https://www.tamethejester.com/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-orange-600 text-orange-400 hover:bg-orange-600/10 bg-transparent"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900/50 to-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Website Features</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">Advanced functionality and custom design elements</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-orange-900/20 text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-600 to-slate-600 rounded-full mb-4">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">{feature}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Technical Implementation</h2>
            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="bg-slate-800/50 border-orange-900/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Custom Development</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    Built with modern web technologies including responsive design, custom animations, and interactive
                    JavaScript elements that create an engaging user experience.
                  </p>
                  <ul className="space-y-2">
                    <li>• Interactive jester counter system</li>
                    <li>• Custom navigation with game elements</li>
                    <li>• Responsive design for all devices</li>
                    <li>• Optimized loading and performance</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-orange-900/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Brand Integration</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    Every element reflects the artist's unique brand identity, from the custom jester mascot to the
                    carefully crafted messaging that captures their musical philosophy.
                  </p>
                  <ul className="space-y-2">
                    <li>• Custom jester mascot design</li>
                    <li>• Thematic color scheme and typography</li>
                    <li>• Brand-consistent messaging</li>
                    <li>• Social media integration</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-900/20 to-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready for Your Custom Website?</h2>
          <p className="text-xl mb-12 text-gray-300">
            Get a fully custom website that perfectly represents your brand and music
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order?service=website">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold text-lg px-8 py-4"
              >
                Order Website - $250
              </Button>
            </Link>
            <Link href="/examples">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
              >
                View More Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            This website was created by{" "}
            <Link href="/" className="text-orange-400 hover:text-orange-300">
              BandCoin
            </Link>
          </p>
          <Badge className="bg-orange-600 text-white">Professional Digital Website Package - $250</Badge>
          <p className="text-gray-500 mt-2 text-sm">© 2025 BandCoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
