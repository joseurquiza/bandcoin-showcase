import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limiter"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000)
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.api.check(clientId)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.reset)
    }

    const body = await request.json()
    const { name, email, phone, serviceType, bandName, genre, description, budget, timeline, websiteUrl, socialMedia, additionalInfo } = body

    if (!name || !email || !serviceType || !bandName || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: phone ? sanitizeInput(phone) : null,
      serviceType: sanitizeInput(serviceType),
      bandName: sanitizeInput(bandName),
      genre: genre ? sanitizeInput(genre) : null,
      description: sanitizeInput(description),
      budget: budget ? sanitizeInput(budget) : null,
      timeline: timeline ? sanitizeInput(timeline) : null,
      websiteUrl: websiteUrl ? sanitizeInput(websiteUrl) : null,
      socialMedia: socialMedia ? sanitizeInput(socialMedia) : null,
      additionalInfo: additionalInfo ? sanitizeInput(additionalInfo) : null,
    }

    const sql = getDb()
    const result = await sql`
      INSERT INTO showcase_orders (
        name, email, phone, service_type, band_name, genre, description,
        budget, timeline, website_url, social_media, additional_info
      ) VALUES (
        ${sanitizedData.name}, ${sanitizedData.email}, ${sanitizedData.phone},
        ${sanitizedData.serviceType}, ${sanitizedData.bandName}, ${sanitizedData.genre},
        ${sanitizedData.description}, ${sanitizedData.budget}, ${sanitizedData.timeline},
        ${sanitizedData.websiteUrl}, ${sanitizedData.socialMedia}, ${sanitizedData.additionalInfo}
      ) RETURNING id, created_at
    `

    return NextResponse.json({ success: true, orderId: result[0].id, createdAt: result[0].created_at, message: "Order submitted successfully" })
  } catch (error) {
    console.error("Order submission error:", error)
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.api.check(`admin:${clientId}`)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.reset)
    }

    const authHeader = request.headers.get("authorization")
    const adminKey = process.env.ADMIN_API_KEY
    if (!adminKey || !authHeader || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "10"), 1), 100)
    const offset = Math.max(Number.parseInt(searchParams.get("offset") || "0"), 0)

    const sql = getDb()
    const orders = await sql`
      SELECT id, name, email, service_type, band_name, genre, status, created_at
      FROM showcase_orders
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
