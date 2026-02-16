import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { BANDCOIN_PRODUCTS } from "@/lib/products"
import { addBandCoin } from "@/lib/ai-usage-limiter"
import { getRequiredEnv } from "@/lib/env-validator"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event

  try {
    // SECURITY: Must have STRIPE_WEBHOOK_SECRET set - no fallback allowed
    const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET')
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 })
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object

    // Get product info from metadata
    const productId = session.metadata?.productId
    const product = BANDCOIN_PRODUCTS.find((p) => p.id === productId)

    if (product && session.client_reference_id) {
      // Credit BandCoins to user's account
      await addBandCoin(session.client_reference_id, product.bandcoins, "stripe_purchase")
    }
  }

  return NextResponse.json({ received: true })
}
