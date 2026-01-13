import { Vault, TrendingUp, Music2, Ticket, Radio, Users, Sparkles, ArrowUpRight, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VaultLanding() {
  const inflows = [
    {
      icon: Users,
      title: "Fan-earned BandCoin",
      description: "Tokens earned by fans through engagement and support",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Music2,
      title: "Merch Revenue Allocations",
      description: "Percentage of merchandise sales flow directly to treasury",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Ticket,
      title: "Ticket Royalties",
      description: "Revenue share from live shows and virtual events",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Radio,
      title: "Streaming Micro-rewards",
      description: "Tiny payments aggregated from streaming platforms",
      color: "from-blue-500 to-cyan-500",
    },
  ]

  const reinvestments = [
    {
      title: "Artist Promotion Pools",
      description: "Fund marketing campaigns and playlist placements",
      percentage: 35,
    },
    {
      title: "Touring Advances",
      description: "Cover upfront costs for tours and live shows",
      percentage: 30,
    },
    {
      title: "Equipment & Studio Funding",
      description: "Invest in better gear and recording time",
      percentage: 25,
    },
    {
      title: "Emergency Reserve",
      description: "Safety net for unexpected opportunities",
      percentage: 10,
    },
  ]

  const distributions = [
    {
      icon: Sparkles,
      title: "Early Supporters",
      description: "Fans who believed first get rewarded when success comes",
    },
    {
      icon: Shield,
      title: "Staked Contributors",
      description: "Those who stayed committed share in the upside",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" id="main-content">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-20 md:py-32">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
              <Vault className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Artist Treasury Autopilot</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance">
              Think like a{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">label</span>
              , not a token.
            </h1>

            <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto text-pretty">
              A band treasury that grows while the band sleeps. That's not crypto. That's infrastructure for culture.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <Link href="/vault/signup">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/vault/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What Goes In */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
            Inflows
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Goes In</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Multiple revenue streams feed into your artist treasury automatically
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inflows.map((item, index) => (
            <Card
              key={index}
              className="bg-zinc-900/50 border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-full h-full text-white" />
                </div>
                <CardTitle className="text-white text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/50">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Vault Behavior */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Auto-Reinvestment */}
          <div>
            <Badge variant="outline" className="mb-4 border-green-500/30 text-green-400">
              Auto-Reinvest
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Vault Behavior</h2>
            <p className="text-white/60 mb-8">
              Your treasury automatically allocates funds to grow your career without you lifting a finger.
            </p>

            <div className="space-y-4">
              {reinvestments.map((item, index) => (
                <div
                  key={index}
                  className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <span className="text-green-400 font-bold">{item.percentage}%</span>
                  </div>
                  <p className="text-white/50 text-sm">{item.description}</p>
                  <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution */}
          <div>
            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400">
              Upside Distribution
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Share the Success</h2>
            <p className="text-white/60 mb-8">
              When your treasury grows, the people who believed in you share in the rewards.
            </p>

            <div className="space-y-6">
              {distributions.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-white/50">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Treasury */}
            <div className="mt-8 bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Vault className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Treasury Balance</p>
                    <p className="text-white/40 text-sm">Auto-compounding</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+12.4%</span>
                </div>
              </div>

              <div className="text-4xl font-bold text-white mb-2">
                24,847 <span className="text-amber-400">BC</span>
              </div>
              <p className="text-white/40 text-sm">≈ $2,484.70 USD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Effect Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16">
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
                The Effect
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Artists stop begging for support.</h2>
              <p className="text-xl text-white/60 mb-6">
                Fans become long-term stakeholders in the music they love. Everyone wins when the artist wins.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Automated Growth</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>Secure Treasury</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Fan Ownership</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl opacity-30" />
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                      <Vault className="w-10 h-10 md:w-14 md:h-14 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to build your treasury?</h2>
        <p className="text-white/60 mb-8 max-w-xl mx-auto">
          Join the artists who are building sustainable careers with BandCoin Vault.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Link href="/vault/signup">
            Get Started
            <ArrowUpRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </main>
  )
}
