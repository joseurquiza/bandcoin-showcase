"use server"

import { stripe } from "@/lib/stripe"
import { BANDCOIN_PRODUCTS } from "@/lib/products"
import { cookies } from "next/headers"

export async function startCheckoutSession(productId: string) {
  const product = BANDCOIN_PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      productId: product.id,
      bandcoins: product.bandcoins.toString(),
    },
    client_reference_id: sessionId || `guest_${Date.now()}`,
  })

  return session.client_secret
}
