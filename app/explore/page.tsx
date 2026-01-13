import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Globe, Users, Music, Zap, ArrowRight } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

export default function ExplorePage() {
  const platforms = [
    {
      id: 1,
      name: "BandTogether.io",
      url: "https://bandtogether.io",
      description:
        "Connect, collaborate, and create with musicians worldwide. The ultimate platform for band formation and musical collaboration.",
      category: "Collaboration Platform",
      features: ["Musician Matching", "Band Formation", "Collaboration Tools", "Project Management"],
      status: "Live",
      color: "blue",
      icon: Users,
    },
    {
      id: 2,
      name: "BandCoin.io",
      url: "https://bandcoin.io",
      description:
        "Digital currency and blockchain solutions for the music industry. Revolutionizing how musicians monetize their work.",
      category: "Blockchain Platform",
      features: ["Digital Currency", "Smart Contracts", "Music NFTs", "Royalty Distribution"],
      status: "Live",
      color: "yellow",
      icon: Zap,
    },
  ]

  const comingSoon = [
    {
      name: "BandStream",
      description: "Next-generation music streaming platform with artist-first monetization",
      category: "Streaming Platform",
      status: "Coming Soon",
    },
    {
      name: "BandVault",
      description: "Secure digital asset storage and management for musicians",
      category: "Digital Storage",
      status: "Coming Soon",
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
              <Link href="/#pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/#contact" className="text-white/80 hover:text-white transition-colors">
                Contact
              </Link>
            </nav>
            <Link href="/order?service=epk">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">Order EPK - $100</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
              <Globe className="h-10 w-10 text-black" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Explore Our Ecosystem
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-3xl mx-auto">
            Discover the full range of platforms and applications we support. From collaboration tools to blockchain
            solutions, we're building the future of music technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4">
              <Link href="#platforms" className="flex items-center">
                View Platforms <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
              >
                Back to Main Site
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Platforms Section */}
      <section id="platforms" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Live Platforms</h2>
          <p className="text-center text-white/70 mb-12 text-lg">
            Explore our active platforms that are revolutionizing the music industry
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {platforms.map((platform) => (
              <Card
                key={platform.id}
                className="bg-white/10 border-white/20 overflow-hidden group hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4 mx-auto">
                    <platform.icon className="h-8 w-8 text-black" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-white text-2xl">{platform.name}</CardTitle>
                    <Badge className="bg-green-600 text-white">{platform.status}</Badge>
                  </div>
                  <Badge variant="outline" className="text-white border-white/30 w-fit mx-auto">
                    {platform.category}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                  <CardDescription className="text-white/70 text-base text-center">
                    {platform.description}
                  </CardDescription>

                  <div>
                    <h4 className="text-white font-semibold mb-3 text-center">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {platform.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white/20 text-white text-xs justify-center"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Button
                        className={`w-full bg-gradient-to-r ${
                          platform.color === "blue"
                            ? "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            : "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                        } text-black font-semibold`}
                      >
                        Visit {platform.name} <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Coming Soon</h2>
          <p className="text-center text-white/70 mb-12 text-lg">Exciting new platforms and features in development</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {comingSoon.map((platform, index) => (
              <Card key={index} className="bg-white/5 border-white/10 text-center">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full mb-4 mx-auto">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CardTitle className="text-white text-xl">{platform.name}</CardTitle>
                    <Badge className="bg-orange-600 text-white">{platform.status}</Badge>
                  </div>
                  <Badge variant="outline" className="text-white/60 border-white/20 w-fit mx-auto">
                    {platform.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/60">{platform.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">The BandCoin Ecosystem</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We're building a comprehensive ecosystem of tools and platforms designed to empower musicians at every
              stage of their career. From collaboration and creation to monetization and distribution, our suite of
              applications covers the entire music industry value chain.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="bg-white/10 border-white/20 text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Collaboration</h3>
                  <p className="text-gray-300 text-sm">
                    Connect musicians worldwide and facilitate seamless collaboration
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-center">
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-300 text-sm">
                    Cutting-edge blockchain and digital solutions for the music industry
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-center">
                <CardContent className="p-6">
                  <Globe className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Global Reach</h3>
                  <p className="text-gray-300 text-sm">
                    Platforms designed to connect musicians and fans across the globe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Join Our Ecosystem?</h2>
          <p className="text-xl mb-12 text-gray-300">
            Start with our core digital services and explore the full range of platforms we offer
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order?service=epk">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-lg px-8 py-4"
              >
                Order EPK - $100
              </Button>
            </Link>
            <Link href="/order?service=website">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-transparent"
              >
                Order Website - $250
              </Button>
            </Link>
          </div>
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
