"use server"

import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"
import {
  getProducts,
  getProductVariants,
  createOrder,
  estimateShippingCosts,
  uploadFile,
  createMockupTask,
  getMockupTask,
  getProductTemplates,
  getProductPrintfiles, // Added import for printfiles
  getStoreId,
} from "@/lib/printful-client"

const sql = neon(process.env.DATABASE_URL!)

function getSessionId() {
  return cookies().get("session_id")?.value || ""
}

let cachedStoreId: number | null = null

async function getPrintfulStoreId(): Promise<number | null> {
  if (cachedStoreId !== null) {
    return cachedStoreId
  }
  cachedStoreId = await getStoreId()
  return cachedStoreId
}

export async function fetchPrintfulProducts() {
  try {
    const products = await getProducts()

    // Filter to popular product types
    const popularTypes = ["t-shirt", "poster", "mug", "hoodie", "tank-top", "sticker"]
    const filtered = products.filter((p) => popularTypes.some((type) => p.type.toLowerCase().includes(type)))

    return { success: true, products: filtered }
  } catch (error) {
    console.error("Error fetching Printful products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function fetchProductVariants(productId: number) {
  try {
    console.log("[v0] Fetching variants for product:", productId)
    const variants = await getProductVariants(productId)
    console.log("[v0] Fetched", variants.length, "variants")
    return { success: true, variants }
  } catch (error) {
    console.error("[v0] Error fetching product variants:", error)
    return { success: false, error: "Failed to fetch variants" }
  }
}

export async function createMerchOrder(orderData: {
  collectibleId: number
  productVariantId: number
  quantity: number
  recipient: {
    name: string
    email: string
    phone: string
    address1: string
    city: string
    state_code: string
    country_code: string
    zip: string
  }
}) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      return { success: false, error: "Please connect your wallet" }
    }

    // Get user's wallet address
    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId} LIMIT 1
    `

    if (!userResult.length || !userResult[0].stellar_address) {
      return { success: false, error: "Wallet not connected" }
    }

    const walletAddress = userResult[0].stellar_address

    // Get collectible image URL
    const collectibleResult = await sql`
      SELECT image_url FROM collectibles 
      WHERE id = ${orderData.collectibleId} 
      AND wallet_address = ${walletAddress}
      LIMIT 1
    `

    if (!collectibleResult.length) {
      return { success: false, error: "Collectible not found" }
    }

    const imageUrl = collectibleResult[0].image_url

    // Upload file to Printful
    const fileData = await uploadFile(imageUrl)

    const storeId = await getPrintfulStoreId()
    if (!storeId) {
      return { success: false, error: "Printful store not configured" }
    }

    // Create Printful order
    const order = await createOrder(
      {
        external_id: `BC-${Date.now()}`,
        recipient: orderData.recipient,
        items: [
          {
            id: 1,
            external_id: `item-${Date.now()}`,
            variant_id: orderData.productVariantId,
            quantity: orderData.quantity,
            price: "0", // Price will be calculated by Printful
            files: [
              {
                type: "default",
                url: imageUrl,
              },
            ],
          },
        ],
      },
      storeId, // Pass store ID
    )

    // Save order to database
    await sql`
      INSERT INTO merch_orders (
        wallet_address,
        collectible_id,
        printful_order_id,
        external_id,
        status,
        order_data,
        created_at
      ) VALUES (
        ${walletAddress},
        ${orderData.collectibleId},
        ${order.id},
        ${order.external_id},
        ${order.status},
        ${JSON.stringify(order)},
        NOW()
      )
    `

    return { success: true, order }
  } catch (error) {
    console.error("Error creating merch order:", error)
    return { success: false, error: "Failed to create order" }
  }
}

export async function fetchMyOrders() {
  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      return { success: false, error: "Not authenticated" }
    }

    const userResult = await sql`
      SELECT stellar_address FROM reward_users WHERE session_id = ${sessionId} LIMIT 1
    `

    if (!userResult.length) {
      return { success: true, orders: [] }
    }

    const walletAddress = userResult[0].stellar_address

    const orders = await sql`
      SELECT * FROM merch_orders 
      WHERE wallet_address = ${walletAddress}
      ORDER BY created_at DESC
    `

    return { success: true, orders }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function estimateShipping(params: {
  recipient: {
    country_code: string
    state_code?: string
    zip: string
  }
  items: Array<{ variant_id: number; quantity: number }>
}) {
  try {
    const estimate = await estimateShippingCosts(params)
    return { success: true, estimate }
  } catch (error) {
    console.error("Error estimating shipping:", error)
    return { success: false, error: "Failed to estimate shipping" }
  }
}

export async function generateProductMockups(params: {
  productId: number
  variantIds: number[]
  imageUrl: string
}) {
  try {
    console.log("[v0 Server] Starting mockup generation with params:", params)

    const { productId, variantIds, imageUrl } = params

    const storeId = await getPrintfulStoreId()
    if (!storeId) {
      return { success: false, error: "Printful store not configured" }
    }
    console.log("[v0 Server] Using store ID:", storeId)

    console.log("[v0 Server] Fetching printfiles for product:", productId)
    const printfiles = await getProductPrintfiles(productId, undefined, storeId)
    console.log("[v0 Server] Printfiles response:", JSON.stringify(printfiles, null, 2))

    if (!printfiles || !printfiles.variant_printfiles || printfiles.variant_printfiles.length === 0) {
      return { success: false, error: "No printfiles available for this product" }
    }

    // Get the first variant's printfile to extract placement
    const firstVariantPrintfile = printfiles.variant_printfiles[0]
    if (!firstVariantPrintfile.placements || firstVariantPrintfile.placements.length === 0) {
      return { success: false, error: "No placements available for this product" }
    }

    // Use the first available placement
    const placement = firstVariantPrintfile.placements[0]
    console.log("[v0 Server] Using placement:", placement.placement)

    // Build the task data with the correct placement
    const taskData = {
      variant_ids: variantIds,
      format: "jpg" as const,
      files: [
        {
          placement: placement.placement, // Use actual placement from printfiles
          image_url: imageUrl,
        },
      ],
    }
    console.log("[v0 Server] Creating mockup task with data:", JSON.stringify(taskData, null, 2))

    const task = await createMockupTask(productId, taskData, storeId)
    console.log("[v0 Server] Mockup task created successfully:", task)

    return { success: true, taskKey: task.task_key }
  } catch (error) {
    console.error("[v0 Server] Error generating mockups - Full error:", error)
    console.error("[v0 Server] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0 Server] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return {
      success: false,
      error: `Failed to generate mockups: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getMockupTaskResult(taskKey: string) {
  try {
    const storeId = await getPrintfulStoreId()
    const result = await getMockupTask(taskKey, storeId || undefined)
    return { success: true, result }
  } catch (error) {
    console.error("Error fetching mockup task:", error)
    return { success: false, error: "Failed to fetch mockup task" }
  }
}

export async function fetchProductTemplates(productId: number) {
  try {
    const storeId = await getPrintfulStoreId()
    const templates = await getProductTemplates(productId, undefined, storeId || undefined)
    return { success: true, templates }
  } catch (error) {
    console.error("Error fetching templates:", error)
    return { success: false, error: "Failed to fetch templates" }
  }
}
