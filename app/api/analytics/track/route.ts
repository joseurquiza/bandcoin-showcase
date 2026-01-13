import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Get IP address from headers (Vercel provides these)
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"

    const { eventType, pagePath, appName, sessionId, userAgent, referrer, metadata } = data

    // Insert event with IP address
    await sql`
      INSERT INTO analytics_events (
        event_type, page_path, app_name, session_id, 
        user_agent, referrer, metadata, ip_address
      ) VALUES (
        ${eventType}, ${pagePath}, ${appName || null}, ${sessionId},
        ${userAgent || null}, ${referrer || null}, 
        ${JSON.stringify(metadata || {})}, ${ipAddress}
      )
    `

    // Parse user agent for device info
    const ua = userAgent || ""
    const isMobile = /Mobile|Android|iPhone/i.test(ua)
    const isTablet = /Tablet|iPad/i.test(ua)
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop"

    let browser = "Unknown"
    if (ua.includes("Chrome")) browser = "Chrome"
    else if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Safari")) browser = "Safari"
    else if (ua.includes("Edge")) browser = "Edge"

    let os = "Unknown"
    if (ua.includes("Windows")) os = "Windows"
    else if (ua.includes("Mac")) os = "macOS"
    else if (ua.includes("Linux")) os = "Linux"
    else if (ua.includes("Android")) os = "Android"
    else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS"

    // Upsert session with IP address
    await sql`
      INSERT INTO analytics_sessions (session_id, user_agent, device_type, browser, os, ip_address)
      VALUES (${sessionId}, ${userAgent || null}, ${deviceType}, ${browser}, ${os}, ${ipAddress})
      ON CONFLICT (session_id) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        page_views = analytics_sessions.page_views + 1,
        ip_address = COALESCE(analytics_sessions.ip_address, ${ipAddress})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking event:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
