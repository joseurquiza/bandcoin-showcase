import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getRequiredEnv } from "@/lib/env-validator"
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limiter"

const sql = neon(getRequiredEnv('DATABASE_URL'))

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000) // Limit input length
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.api.check(clientId)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.reset)
    }

    const body = await request.json()

    const {
      name,
      email,
      phone,
      serviceType,
      bandName,
      genre,
      description,
      budget,
      timeline,
      websiteUrl,
      socialMedia,
      additionalInfo,
    } = body

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

    // Insert order into database
    const result = await sql`
      INSERT INTO orders (
        name, 
        email, 
        phone, 
        service_type, 
        band_name, 
        genre, 
        description, 
        budget, 
        timeline, 
        website_url, 
        social_media, 
        additional_info
      ) VALUES (
        ${sanitizedData.name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.serviceType},
        ${sanitizedData.bandName},
        ${sanitizedData.genre},
        ${sanitizedData.description},
        ${sanitizedData.budget},
        ${sanitizedData.timeline},
        ${sanitizedData.websiteUrl},
        ${sanitizedData.socialMedia},
        ${sanitizedData.additionalInfo}
      ) RETURNING id, created_at
    `

    const orderId = result[0].id
    const createdAt = result[0].created_at

    // Here you could also send an email notification
    // await sendOrderNotification({ orderId, name, email, serviceType, bandName })

    return NextResponse.json({
      success: true,
      orderId,
      createdAt,
      message: "Order submitted successfully",
    })
  } catch (error) {
    console.error("Order submission error:", error)
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for admin endpoint
    const clientId = getClientIdentifier(request)
    const rateLimitResult = await rateLimiters.api.check(`admin:${clientId}`)
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.reset)
    }

    const authHeader = request.headers.get("authorization")

    // SECURITY: Require strong admin API key - no fallback
    const adminKey = getRequiredEnv('ADMIN_API_KEY')

    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "10"), 1), 100)
    const offset = Math.max(Number.parseInt(searchParams.get("offset") || "0"), 0)

    const orders = await sql`
      SELECT 
        id,
        name,
        email,
        service_type,
        band_name,
        genre,
        status,
        created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
