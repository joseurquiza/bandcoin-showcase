"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Map of paths to app names
const pathToAppName: Record<string, string> = {
  "/vibeportal": "VibePortal",
  "/site-builder": "Site Builder",
  "/gig-finder": "Gig Finder",
  "/pubassist": "PubAssist",
  "/bandcoin-studio": "BandCoin Studio",
  "/beat-builder": "Beat Builder",
  "/portfolio": "Portfolio",
  "/examples": "Examples",
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = sessionStorage.getItem("analytics_session_id")
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem("analytics_session_id", sessionId)
  }
  return sessionId
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPathRef = useRef<string>("")

  useEffect(() => {
    // Prevent duplicate tracking on same path
    if (pathname === lastPathRef.current) return
    lastPathRef.current = pathname

    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    // Determine app name from path
    const appName = Object.entries(pathToAppName).find(([path]) => pathname.startsWith(path))?.[1]

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "page_view",
        pagePath: pathname,
        appName,
        sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
    }).catch((err) => console.error("Analytics tracking error:", err))
  }, [pathname])

  return null
}

// Export a function to track custom events
export function trackCustomEvent(eventType: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return

  const sessionId = getOrCreateSessionId()
  if (!sessionId) return

  const pathname = window.location.pathname
  const appName = Object.entries(pathToAppName).find(([path]) => pathname.startsWith(path))?.[1]

  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      pagePath: pathname,
      appName,
      sessionId,
      userAgent: navigator.userAgent,
      metadata,
    }),
  }).catch((err) => console.error("Analytics tracking error:", err))
}
