"use server"

import { getDb } from "@/lib/db"

// Track a page view or event
export async function trackEvent(data: {
  eventType: string
  userId?: string
  metadata?: any
}) {
  try {
    const sql = getDb()
    await sql`
      INSERT INTO showcase_analytics_events (
        event_type, page_path, app_name, session_id, 
        user_agent, referrer, metadata
      ) VALUES (
        ${data.eventType}, ${data.pagePath}, ${data.appName || null}, ${data.sessionId},
        ${data.userAgent || null}, ${data.referrer || null}, 
        ${JSON.stringify(data.metadata || {})}
      )
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
    const sql = getDb()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total page views
    const totalViews = await sql`
      SELECT COUNT(*) as count FROM showcase_analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
    `

    // Unique sessions
    const uniqueSessions = await sql`
      SELECT COUNT(DISTINCT session_id) as count FROM showcase_analytics_events 
      WHERE created_at >= ${startDate.toISOString()}
    `

    // Page views by page
    const pageViews = await sql`
      SELECT page_path, COUNT(*) as views 
      FROM showcase_analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
      GROUP BY page_path 
      ORDER BY views DESC 
      LIMIT 10
    `

    // App usage
    const appUsage = await sql`
      SELECT app_name, COUNT(*) as launches 
      FROM showcase_analytics_events 
      WHERE app_name IS NOT NULL AND created_at >= ${startDate.toISOString()}
      GROUP BY app_name 
      ORDER BY launches DESC
    `

    // Daily page views for chart
    const dailyViews = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as views 
      FROM showcase_analytics_events 
      WHERE event_type = 'page_view' AND created_at >= ${startDate.toISOString()}
      GROUP BY DATE(created_at) 
      ORDER BY date ASC
    `

    return {
      success: true,
      data: {
        totalPageViews: totalViews[0]?.count || 0,
        uniqueVisitors: uniqueSessions[0]?.count || 0,
        pageViews: pageViews || [],
        appUsage: appUsage || [],
        dailyViews: dailyViews || [],
      },
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return { success: false, error: String(error), data: null }
  }
}
