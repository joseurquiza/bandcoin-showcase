"use client"

import Link from "next/link"
import Image from "next/image"
import { Music, Sparkles, Globe, Briefcase, Radio, Wand2, FileText, MapPin, Wallet, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import StarWarsOnboarding from "@/components/star-wars-onboarding"

export default function HomePage() {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("bandcoin-onboarding-complete")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("bandcoin-onboarding-complete", "true")
    setShowOnboarding(false)
  }

  const apps = [
    {
      id: "vibeportal",
      name: "VibePortal",
      description: "Image Generation Suite (AI)",
      icon: Sparkles,
      image: "/images/vibestudio-icon.jpg",
      href: "/vibeportal",
      gradient: "from-pink-500 via-purple-500 to-indigo-600",
      glowColor: "rgba(168, 85, 247, 0.5)",
    },
    {
      id: "pubassist",
      name: "PubAssist",
      description: "Publishing Registration Assistant",
      icon: FileText,
      image: "/images/pubassist-icon.jpg",
      href: "/pubassist",
      gradient: "from-emerald-500 via-green-500 to-teal-600",
      glowColor: "rgba(16, 185, 129, 0.5)",
    },
    {
      id: "gigfinder",
      name: "Gig Finder",
      description: "Venue Discovery (AI)",
      icon: MapPin,
      image: "/images/gigfinder-icon.jpg",
      href: "/gig-finder",
      gradient: "from-orange-500 via-red-500 to-rose-600",
      glowColor: "rgba(249, 115, 22, 0.5)",
    },
    {
      id: "stemplayer",
      name: "BandCoin Studio",
      description: "Full DAW AI Music Creation Engine",
      icon: Radio,
      image: "/images/stemplayer-icon.jpg",
      href: "https://www.bandcoin.io/artist/studio",
      gradient: "from-violet-500 via-fuchsia-500 to-pink-600",
      glowColor: "rgba(192, 38, 211, 0.5)",
      external: true,
    },
    {
      id: "portfolio",
      name: "Portfolio Showcase",
      description: "EPKs & Websites We've Built",
      icon: Briefcase,
      image: "/images/portfolio-icon.jpg",
      href: "/examples",
      gradient: "from-amber-500 via-yellow-500 to-orange-600",
      glowColor: "rgba(245, 158, 11, 0.5)",
    },
    {
      id: "website",
      name: "Explore Ecosystem",
      description: "Discover Our Full Platform Suite",
      icon: Globe,
      image: "/images/ecosystem-icon.jpg",
      href: "/explore",
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      glowColor: "rgba(16, 185, 129, 0.5)",
    },
    {
      id: "vault",
      name: "Vault",
      description: "Secure Wallet & Asset Management",
      icon: Wallet,
      image: "/images/vault-icon.jpg",
      href: "/vault",
      gradient: "from-slate-500 via-zinc-500 to-gray-600",
      glowColor: "rgba(100, 116, 139, 0.5)",
    },
    {
      id: "rewards",
      name: "Rewards",
      description: "Earn BandCoin Tokens",
      icon: Gift,
      image: "/images/rewards-icon.jpg",
      href: "/rewards",
      gradient: "from-amber-500 via-orange-500 to-yellow-600",
      glowColor: "rgba(251, 146, 60, 0.5)",
    },
  ]

  return (
    <>
      {showOnboarding && <StarWarsOnboarding onComplete={handleOnboardingComplete} />}

      <main id="main-content" className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated background grid */}
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"
          aria-hidden="true"
        />

        <div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-700"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* Logo and Title */}
          <header className="text-center mb-16 space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Image
                  src="/images/bandcoin-logo.png"
                  alt="BandCoin ShowCase Logo - Professional Digital Services for Musicians"
                  width={80}
                  height={80}
                  className="h-20 w-20 animate-float"
                  priority
                />
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">BandCoin ShowCase</h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              Your complete platform for music production, visual creation, and professional web experiences
            </p>
          </header>

          {/* App Grid */}
          <nav
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1800px] w-full"
            aria-label="Application suite"
          >
            {apps.map((app) => {
              const Icon = app.icon
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  {...(app.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "aria-label": `${app.name} - Opens in new window`,
                  })}
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  onFocus={() => setHoveredApp(app.id)}
                  onBlur={() => setHoveredApp(null)}
                  className="group relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-2xl"
                >
                  {/* Content */}
                  <article className="relative bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-white/20 overflow-hidden">
                    {/* Gradient glow effect on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`}
                      aria-hidden="true"
                    />

                    {/* Animated border glow */}
                    {hoveredApp === app.id && (
                      <div
                        className="absolute -inset-[1px] rounded-2xl animate-spin-slow"
                        style={{
                          background: `conic-gradient(from 0deg, transparent, ${app.glowColor}, transparent 50%)`,
                        }}
                        aria-hidden="true"
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                      {/* Icon container with animated gradient */}
                      <div className="flex items-center justify-center w-full" aria-hidden="true">
                        <div className="relative w-28 h-28">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-zinc-900 rounded-2xl p-3 border border-white/10 group-hover:border-white/20 transition-colors duration-500 flex items-center justify-center">
                              <Image
                                src={app.image || "/placeholder.svg"}
                                alt=""
                                width={80}
                                height={80}
                                className="w-20 h-20 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all duration-500">
                          {app.name}
                        </h2>
                        <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors duration-500">
                          {app.description}
                        </p>
                      </div>

                      {/* Animated arrow indicator */}
                      <div
                        className="flex items-center gap-2 text-white/40 group-hover:text-white/80 transition-colors duration-500"
                        aria-hidden="true"
                      >
                        <span className="text-sm font-medium">Launch App</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Corner accent lines */}
                    <div
                      className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      aria-hidden="true"
                    />
                  </article>
                </Link>
              )
            })}
          </nav>

          {/* Footer tagline */}
          <footer className="mt-16 text-center">
            <p className="text-white/40 text-sm">Securely build, deploy, and scale the best creative experiences</p>
          </footer>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          .delay-700 {
            animation-delay: 700ms;
          }
        `}</style>
      </main>
    </>
  )
}
