"use client"

import { useEffect, useState, useRef } from "react"
import { X, Play, Pause, FastForward, Rewind, ZoomIn, ZoomOut } from "lucide-react"

interface StarWarsOnboardingProps {
  onComplete: () => void
}

export function replayOnboarding() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bandcoin-onboarding-complete")
    window.location.reload()
  }
}

export default function StarWarsOnboarding({ onComplete }: StarWarsOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const crawlRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      if (!isPaused) {
        handleComplete()
      }
    }, 60000 / speed)

    return () => clearTimeout(timer)
  }, [isPaused, speed, isVisible])

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(onComplete, 500)
    if (typeof window !== "undefined") {
      localStorage.setItem("bandcoin-onboarding-complete", "true")
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="stars-layer-1" />
        <div className="stars-layer-2" />
        <div className="stars-layer-3" />
      </div>

      <div className="absolute top-8 left-8 z-50 flex flex-col gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col gap-2">
          <div className="text-white text-sm font-semibold mb-2">Playback Speed: {speed}x</div>
          <div className="flex gap-2">
            <button
              onClick={() => setSpeed(Math.max(0.25, speed - 0.25))}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-all"
              title="Slow down"
            >
              <Rewind className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-all"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSpeed(Math.min(4, speed + 0.25))}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-all"
              title="Speed up"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col gap-2">
          <div className="text-white text-sm font-semibold mb-2">Zoom: {Math.round(zoom * 100)}%</div>
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-all"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-all"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 group"
        aria-label="Skip onboarding"
      >
        <span>Skip</span>
        <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div
        className="perspective-container"
        style={{
          perspective: "400px",
          perspectiveOrigin: "50% 100%",
        }}
      >
        <div className="crawl-container">
          <div
            ref={crawlRef}
            className="crawl"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
              animationDuration: `${60 / speed}s`,
              transform: `scale(${zoom})`,
            }}
          >
            <div className="title">
              <h1 className="text-8xl font-bold text-yellow-400 mb-8 tracking-wider">BANDCOIN SHOWCASE</h1>
            </div>

            <div className="text-content text-yellow-300 text-4xl leading-relaxed space-y-8">
              <p>
                A long time ago, in a galaxy far, far away, musicians struggled to find the tools they needed to
                succeed...
              </p>

              <p className="font-bold text-5xl text-yellow-400">But now, everything has changed.</p>

              <p>
                Welcome to <span className="font-bold">BandCoin ShowCase</span> – your all-in-one platform for music
                creation, visual design, and professional web experiences.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">CREATE MUSIC</h2>
              <p>
                <span className="font-bold">Beat Builder:</span> Craft custom drum patterns and rhythms with an
                intuitive interface and AI-powered suggestions.
              </p>
              <p>
                <span className="font-bold">BandCoin Studio:</span> Access a full digital audio workstation with AI
                music creation tools, stem players, and professional mixing capabilities.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">DESIGN VISUALS</h2>
              <p>
                <span className="font-bold">VibePortal:</span> Generate stunning album art, promotional materials, and
                social media graphics using image generation technology.
              </p>
              <p>
                <span className="font-bold">Collectibles:</span> Create unique digital tokens and merchandise designs to
                engage your fanbase.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">BUILD YOUR PRESENCE</h2>
              <p>
                <span className="font-bold">Site Builder:</span> Design and host professional websites and EPKs without
                writing a single line of code.
              </p>
              <p>
                <span className="font-bold">Portfolio Showcase:</span> Explore examples of stunning websites and EPKs
                we've created for other artists.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">GROW YOUR CAREER</h2>
              <p>
                <span className="font-bold">Gig Finder:</span> Discover venues, connect with bookers, and find
                performance opportunities using venue discovery tools.
              </p>
              <p>
                <span className="font-bold">PubAssist:</span> Navigate music publishing registration with ASCAP, BMI,
                and other PROs with guided assistance.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">MANAGE YOUR ASSETS</h2>
              <p>
                <span className="font-bold">Vault:</span> Securely manage your digital wallet, BandCoin tokens, and
                blockchain assets.
              </p>
              <p>
                <span className="font-bold">Rewards:</span> Earn BandCoin tokens by using the platform and engaging with
                the community.
              </p>

              <h2 className="text-6xl font-bold text-yellow-400 mt-12 mb-6">EXPLORE THE ECOSYSTEM</h2>
              <p>
                Discover integrations, partnerships, and the full suite of tools available in the BandCoin ecosystem.
              </p>

              <p className="text-4xl font-bold text-center mt-20 mb-32">LET'S BEGIN YOUR JOURNEY.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .crawl-container {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: 50% 100%;
          transform: rotateX(25deg);
          transform-style: preserve-3d;
        }

        .crawl {
          position: relative;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          animation: crawl 60s linear forwards;
          transform-style: preserve-3d;
        }

        @keyframes crawl {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-100vh);
          }
        }

        .stars-layer-1,
        .stars-layer-2,
        .stars-layer-3 {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
        }

        .stars-layer-1 {
          background-image: radial-gradient(2px 2px at 20px 30px, white, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 60px 70px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 50px 50px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 130px 80px, white, rgba(0, 0, 0, 0)),
            radial-gradient(2px 2px at 90px 10px, white, rgba(0, 0, 0, 0));
          background-size: 200px 200px;
          animation: zoom 15s infinite;
          opacity: 0.5;
        }

        .stars-layer-2 {
          background-image: radial-gradient(1px 1px at 40px 60px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 110px 90px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 80px 30px, white, rgba(0, 0, 0, 0));
          background-size: 200px 200px;
          animation: zoom 20s infinite;
          opacity: 0.4;
        }

        .stars-layer-3 {
          background-image: radial-gradient(1px 1px at 70px 40px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 150px 100px, white, rgba(0, 0, 0, 0)),
            radial-gradient(1px 1px at 30px 120px, white, rgba(0, 0, 0, 0));
          background-size: 200px 200px;
          animation: zoom 25s infinite;
          opacity: 0.3;
        }

        @keyframes zoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  )
}
