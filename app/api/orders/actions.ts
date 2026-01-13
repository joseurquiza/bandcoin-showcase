"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function submitOrderAction(data: {
  name: string
  email: string
  phone: string
  websiteDescription: string
  customDomain: string
  budget: string
  timeline: string
}) {
  try {
    // Insert order into database
    const result = await sql`
      INSERT INTO website_orders (
        name,
        email,
        phone,
        website_description,
        custom_domain,
        budget,
        timeline,
        status,
        created_at
      ) VALUES (
        ${data.name},
        ${data.email},
        ${data.phone},
        ${data.websiteDescription},
        ${data.customDomain},
        ${data.budget},
        ${data.timeline},
        'pending',
        NOW()
      )
      RETURNING id
    `

    return { success: true, orderId: result[0].id }
  } catch (error) {
    console.error("Failed to submit order:", error)
    throw new Error("Failed to submit order")
  }
}

export async function submitWebsiteOrderAction(data: {
  name: string
  email: string
  phone: string
  websiteIdea: string
  customDomain: string
  budget: string
  timeline: string
  v0ChatId: string | null
}) {
  try {
    // Insert order into database
    const result = await sql`
      INSERT INTO website_orders (
        name,
        email,
        phone,
        website_description,
        custom_domain,
        budget,
        timeline,
        status,
        created_at
      ) VALUES (
        ${data.name},
        ${data.email},
        ${data.phone},
        ${data.websiteIdea},
        ${data.customDomain},
        ${data.budget},
        ${data.timeline},
        'pending',
        NOW()
      )
      RETURNING id
    `

    return { success: true, orderId: result[0].id }
  } catch (error) {
    console.error("Failed to submit website order:", error)
    throw new Error("Failed to submit order")
  }
}
