"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Track a page view or event
export async function trackEvent(data: {
  eventType: string
  pagePath: string
  appName?: string
  sessionId: string
  userAgent?: string
  referrer?: string
  metadata?: Record<string, unknown>
}) {
  try {
    // Also removed screen_width/screen_height which don't exist in table
    await sql`
      INSERT INTO analytics_events (
        event_type, page_path, app_name, session_id, 
        user_agent, referrer, metadata
      ) VALUES (
        ${data.eventType}, ${data.pagePath}, ${data.appName || null}, ${data.sessionId},
        ${data.userAgent || null}, ${data.referrer || null}, 
        ${JSON.stringify(data.metadata || {})}
      )
    `

    // Parse user agent for device info
    const userAgent = data.userAgent || ""
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent)
    const isTablet = /Tablet|iPad/i.test(userAgent)
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop"

    let browser = "Unknown"
    if (userAgent.includes("Chrome")) browser = "Chrome"
    else if (userAgent.includes("Firefox")) browser = "Firefox"
    else if (userAgent.includes("Safari")) browser = "Safari"
    else if (userAgent.includes("Edge")) browser = "Edge"

    let os = "Unknown"
    if (userAgent.includes("Windows")) os = "Windows"
    else if (userAgent.includes("Mac")) os = "macOS"
    else if (userAgent.includes("Linux")) os = "Linux"
    else if (userAgent.includes("Android")) os = "Android"
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone")) os = "iOS"

    // Upsert session
    await sql`
      INSERT INTO analytics_sessions (session_id, user_agent, device_type, browser, os)
      VALUES (${data.sessionId}, ${data.userAgent || null}, ${deviceType}, ${browser}, ${os})
      ON CONFLICT (session_id) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        page_views = analytics_sessions.page_views + 1
    `

    return { success: true }
  } catch (error) {
    console.error("Error tracking event:", error)
    return { success: false, error: String(error) }
  }
}

// Get analytics summary for admin dashboard
export async function getAnalyticsSummary(days = 30) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total page views
    const totalViews = await sql`
      SELECT COUNT(*) as count FROM analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
    `

    // Unique sessions
    const uniqueSessions = await sql`
      SELECT COUNT(DISTINCT session_id) as count FROM analytics_events 
      WHERE created_at >= ${startDate.toISOString()}
    `

    // Page views by page
    const pageViews = await sql`
      SELECT page_path, COUNT(*) as views 
      FROM analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
      GROUP BY page_path 
      ORDER BY views DESC 
      LIMIT 10
    `

    // App usage
    const appUsage = await sql`
      SELECT app_name, COUNT(*) as launches 
      FROM analytics_events 
      WHERE app_name IS NOT NULL AND created_at >= ${startDate.toISOString()}
      GROUP BY app_name 
      ORDER BY launches DESC
    `

    // Daily page views for chart
    const dailyViews = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as views 
      FROM analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `

    // Device breakdown
    const deviceBreakdown = await sql`
      SELECT device_type, COUNT(*) as count 
      FROM analytics_sessions 
      WHERE last_seen >= ${startDate.toISOString()}
      GROUP BY device_type
    `

    // Browser breakdown
    const browserBreakdown = await sql`
      SELECT browser, COUNT(*) as count 
      FROM analytics_sessions 
      WHERE last_seen >= ${startDate.toISOString()}
      GROUP BY browser
      ORDER BY count DESC
    `

    // Recent sessions - Now includes IP address
    const recentSessions = await sql`
      SELECT session_id, first_seen, last_seen, page_views, device_type, browser, os, ip_address
      FROM analytics_sessions
      ORDER BY last_seen DESC
      LIMIT 20
    `

    return {
      success: true,
      data: {
        totalPageViews: totalViews[0]?.count || 0,
        uniqueVisitors: uniqueSessions[0]?.count || 0,
        pageViews: pageViews || [],
        appUsage: appUsage || [],
        dailyViews: dailyViews || [],
        deviceBreakdown: deviceBreakdown || [],
        browserBreakdown: browserBreakdown || [],
        recentSessions: recentSessions || [],
      },
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return { success: false, error: String(error), data: null }
  }
}
