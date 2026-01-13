import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio Examples - EPKs & Websites We've Built",
  description:
    "Explore our portfolio of completed EPKs and custom websites for musicians. View live demos of HollowVox, 3 Years Hollow, Now Its Dark, and Tame The Jester.",
  keywords: [
    "musician EPK examples",
    "band website portfolio",
    "music marketing examples",
    "EPK showcase",
    "artist website design",
  ],
  openGraph: {
    title: "Portfolio Examples - Music EPKs & Websites",
    description: "View our completed work for musicians including EPKs and custom websites",
    type: "website",
  },
}

export default function ViewOurWork() {
  const portfolioExamples = [
    {
      id: 1,
      title: "HollowVox",
      type: "Website",
      genre: "Crypto/Gaming",
      price: "$250",
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
      price: "$100",
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
      price: "$100",
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
      price: "$250",
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Our Amazing Work
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-3xl mx-auto">
            Explore our portfolio of completed, fully-functional EPKs. Each example represents real work we've delivered
            for artists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4">
              <Link href="#live-demos" className="flex items-center">
                View Live Demos <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="flex gap-2">
              <Link href="/order?service=epk">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-lg px-6 py-4 bg-transparent"
                >
                  EPK - $100
                </Button>
              </Link>
              <Link href="/order?service=website">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-lg px-6 py-4 bg-transparent"
                >
                  Website - $250
                </Button>
              </Link>
            </div>
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
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white font-bold">{item.price}</Badge>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Create Your Own?</h2>
          <p className="text-white/70 mb-8 text-lg max-w-2xl mx-auto">
            See something you like? Let's create a custom EPK or website that perfectly represents your music and brand.
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
