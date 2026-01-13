import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { BANDCOIN_PRODUCTS } from "@/lib/products"
import { addBandCoin } from "@/lib/ai-usage-limiter"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err: any) {
    console.error("[v0] Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
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
      console.log(`[v0] Credited ${product.bandcoins} BC to ${session.client_reference_id}`)
    }
  }

  return NextResponse.json({ received: true })
}
