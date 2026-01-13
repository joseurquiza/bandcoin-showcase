"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ExternalLink,
  Users,
  Star,
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Coins,
  Trophy,
  Gamepad2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function HollowVoxShowcase() {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const features = [
    "Action Token Integration",
    "Community Dashboard",
    "Rewards System",
    "Gaming Elements",
    "Raffle System",
    "Digital Asset Management",
    "Community Driven",
    "Futuristic Design",
  ]

  const stats = [
    { label: "Token Integration", value: "Full", icon: Coins },
    { label: "Community Features", value: "5+", icon: Users },
    { label: "Gaming Elements", value: "Advanced", icon: Gamepad2 },
    { label: "Rewards System", value: "Active", icon: Trophy },
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
      <header className="bg-black/80 backdrop-blur-sm border-b border-green-900/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/examples" className="text-green-400 hover:text-green-300 font-medium flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
            <Badge className="bg-green-900/20 text-green-400 border-green-800">
              Action Token Website - $250 Package
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-slate-900/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-green-900/20 text-green-400 border-green-800 mb-4">
                Action Token Platform • Crypto/Gaming
              </Badge>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-green-400 to-slate-100 bg-clip-text text-transparent mb-6">
                HollowVox
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                A futuristic Action Token platform featuring "The Hollow" - the official sanctuary for community
                members. Built with advanced gaming elements, rewards systems, and comprehensive dashboard
                functionality. This platform represents the cutting edge of crypto community engagement with its
                immersive digital frontier experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://www.hollowvox.com/" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700 text-lg px-6 py-3">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Visit Live Platform
                  </Button>
                </a>
                <Link href="/order?service=website">
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-600/10 text-lg px-6 py-3 bg-transparent"
                  >
                    Order Website - $250
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-slate-600 rounded-3xl blur-3xl opacity-30"></div>
              <Image
                src="/images/hollowvox-portfolio.jpg"
                alt="HollowVox Platform Screenshot"
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-slate-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Platform Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Live Platform Preview</h2>
          <p className="text-center text-gray-400 mb-8 text-lg">
            Experience the HollowVox platform in different device views
          </p>

          {/* Device Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 rounded-lg p-2 flex gap-2">
              <Button
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className={viewMode === "desktop" ? "bg-green-600" : "text-gray-400 hover:text-white"}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={viewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tablet")}
                className={viewMode === "tablet" ? "bg-green-600" : "text-gray-400 hover:text-white"}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                variant={viewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className={viewMode === "mobile" ? "bg-green-600" : "text-gray-400 hover:text-white"}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>

          {/* Platform Iframe */}
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-green-900/20">
            <div className="overflow-hidden rounded-lg border border-slate-600">
              <iframe
                src="https://www.hollowvox.com/"
                className={`${getIframeClass()} border-0 transition-all duration-300`}
                title="HollowVox Platform"
                loading="lazy"
              />
            </div>
            <div className="text-center mt-4">
              <a href="https://www.hollowvox.com/" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-400 hover:bg-green-600/10 bg-transparent"
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
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Platform Features</h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Advanced functionality and community-driven features
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 border-green-900/20 text-center">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-slate-600 rounded-full mb-4">
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
            <h2 className="text-4xl font-bold text-center mb-12 text-white">Platform Implementation</h2>
            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="bg-slate-800/50 border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Action Token Integration</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    Built as part of the ACTIONverse ecosystem, HollowVox seamlessly integrates Action Token
                    functionality with community features, rewards systems, and gaming elements.
                  </p>
                  <ul className="space-y-2">
                    <li>• Community dashboard and management</li>
                    <li>• Integrated rewards and raffle systems</li>
                    <li>• Action Token asset management</li>
                    <li>• Cross-platform compatibility</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-green-900/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Community Experience</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300 space-y-4">
                  <p>
                    "The Hollow" serves as the official sanctuary for community members, providing exclusive access to
                    rewards, digital assets, and deep lore exploration in the digital frontier.
                  </p>
                  <ul className="space-y-2">
                    <li>• Exclusive community sanctuary access</li>
                    <li>• Comprehensive lore and storytelling</li>
                    <li>• Member rewards and incentives</li>
                    <li>• Interactive gaming elements</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready for Your Platform?</h2>
          <p className="text-xl mb-12 text-gray-300">
            Get a cutting-edge platform that engages your community and drives results
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order?service=website">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-black font-semibold text-lg px-8 py-4"
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
            This platform was created by{" "}
            <Link href="/" className="text-green-400 hover:text-green-300">
              BandCoin
            </Link>
          </p>
          <Badge className="bg-green-600 text-white">Professional Digital Platform - $250</Badge>
          <p className="text-gray-500 mt-2 text-sm">© 2025 BandCoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
