"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Sparkles, Radio, Home, Menu, X, FileText, MapPin, Users, Coins, Gem, MessageCircle } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function StudioSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280) // Default 280px for full text display
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 1024 // lg breakpoint
    setIsCollapsed(isMobile)
  }, [])

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidebar-width")
    if (savedWidth) {
      setSidebarWidth(Number.parseInt(savedWidth, 10))
    }
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(500, e.clientX)) // Min 200px, max 500px
      setSidebarWidth(newWidth)
      localStorage.setItem("sidebar-width", newWidth.toString())
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    document.body.style.cursor = "ew-resize"
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }
  }, [isResizing])

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`)
  }, [sidebarWidth])

  const homeApp = {
    id: "home",
    name: "Home",
    icon: Home,
    href: "/",
    gradient: "from-white to-gray-300",
  }

  // const exploreApp = {
  //   id: "explore",
  //   name: "Explore",
  //   icon: Globe,
  //   href: "/explore",
  //   gradient: "from-green-500 to-teal-600",
  // }

  const apps = [
    // Music Platform
    {
      id: "bt",
      name: "Band Together",
      icon: Users,
      href: "/bt",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "stemplayer",
      name: "BandCoin Studio",
      icon: Radio,
      href: "https://www.bandcoin.io/artist/studio",
      gradient: "from-violet-500 to-pink-600",
      external: true,
    },
    {
      id: "gigfinder",
      name: "Gig Finder",
      icon: MapPin,
      href: "/gig-finder",
      gradient: "from-orange-500 to-red-600",
    },
    {
      id: "vibeportal",
      name: "VibePortal",
      icon: Sparkles,
      href: "/vibeportal",
      gradient: "from-pink-500 to-purple-600",
    },
    // Content/Creation
    {
      id: "collectibles",
      name: "Collectibles",
      icon: Gem,
      href: "/collectibles",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      id: "my-collection",
      name: "My Collection",
      icon: Gem,
      href: "/my-collection",
      gradient: "from-purple-400 to-pink-500",
    },
    // {
    //   id: "merch",
    //   name: "Merch Store",
    //   icon: Shirt,
    //   href: "/merch",
    //   gradient: "from-orange-500 to-red-500",
    // },
    // {
    //   id: "portfolio",
    //   name: "Portfolio",
    //   icon: Briefcase,
    //   href: "/examples",
    //   gradient: "from-amber-500 to-orange-600",
    // },
    {
      id: "pubassist",
      name: "PubAssist",
      icon: FileText,
      href: "/pubassist",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      id: "chat",
      name: "Chat",
      icon: MessageCircle,
      href: "/chat",
      gradient: "from-blue-400 to-indigo-500",
    },
    // Platform/System
    {
      id: "buy-bandcoin",
      name: "Buy BandCoin",
      icon: Coins,
      href: "/buy-bandcoin",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      id: "rewards",
      name: "Rewards",
      icon: Coins,
      href: "/rewards",
      gradient: "from-amber-400 to-orange-500",
    },
    // {
    //   id: "vault",
    //   name: "Vault",
    //   icon: Vault,
    //   href: "/vault",
    //   gradient: "from-amber-500 to-orange-600",
    // },
  ]

  const renderNavItem = (app: typeof homeApp, isActive: boolean) => {
    const Icon = app.icon
    return (
      <Link
        key={app.id}
        href={app.href}
        {...("external" in app &&
          app.external && {
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": `${app.name} - Opens in new window`,
          })}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
          isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
        title={isCollapsed ? app.name : undefined}
      >
        {isActive && (
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${app.gradient}`}
          />
        )}

        <div className="relative flex-shrink-0">
          <Icon className="w-5 h-5 relative z-10" />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${app.gradient} rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity`}
          />
        </div>

        {!isCollapsed && (
          <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{app.name}</span>
        )}

        {!isCollapsed && "external" in app && app.external && (
          <svg
            className="w-3 h-3 ml-auto flex-shrink-0 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-r ${app.gradient} rounded-lg opacity-0 group-hover:opacity-5 transition-opacity`}
        />
      </Link>
    )
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-zinc-900 border border-white/10 rounded-lg p-2 text-white hover:bg-zinc-800 transition-colors"
        aria-label={isCollapsed ? "Open navigation menu" : "Close navigation menu"}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{ width: isCollapsed ? "80px" : `${sidebarWidth}px` }}
        className={`fixed top-0 left-0 h-full bg-zinc-950 border-r border-white/10 backdrop-blur-xl z-40 transition-all duration-300 ${
          isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <Image
                  src="/images/bandcoin-logo.png"
                  alt="BandCoin Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h2 className="text-white font-bold text-lg whitespace-nowrap">BandCoin ShowCase</h2>
                  <p className="text-white/40 text-xs whitespace-nowrap">Creative Platform</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scroll" aria-label="Primary navigation">
            {/* Home */}
            {renderNavItem(homeApp, pathname === homeApp.href)}

            {/* Explore */}
            {/* {renderNavItem(
              exploreApp,
              pathname === exploreApp.href || (exploreApp.href !== "/" && pathname.startsWith(exploreApp.href)),
            )} */}

            {/* Apps Section */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <h2 className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Music Platform</h2>
              </div>
            )}

            {apps.slice(0, 4).map((app) => {
              const isActive = pathname === app.href || (app.href !== "/" && pathname.startsWith(app.href))
              return renderNavItem(app as typeof homeApp, isActive)
            })}

            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <h2 className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Content/Creation</h2>
              </div>
            )}

            {apps.slice(4, 9).map((app) => {
              const isActive = pathname === app.href || (app.href !== "/" && pathname.startsWith(app.href))
              return renderNavItem(app as typeof homeApp, isActive)
            })}

            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <h2 className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Platform/System</h2>
              </div>
            )}

            {apps.slice(9).map((app) => {
              const isActive = pathname === app.href || (app.href !== "/" && pathname.startsWith(app.href))
              return renderNavItem(app as typeof homeApp, isActive)
            })}
          </nav>

          {/* Collapse button (desktop only) */}
          <div className="hidden lg:block p-4 border-t border-white/10">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div
            className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500/50 transition-colors group"
            onMouseDown={() => setIsResizing(true)}
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                setSidebarWidth(Math.max(200, sidebarWidth - 10))
              } else if (e.key === "ArrowRight") {
                setSidebarWidth(Math.min(500, sidebarWidth + 10))
              }
            }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-20 bg-white/20 rounded-l group-hover:bg-blue-500 transition-colors" />
          </div>
        )}
      </aside>
    </>
  )
}
