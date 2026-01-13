"use client"

import { Suspense } from "react"
import { CoinsIcon, SparklesIcon, ZapIcon } from "lucide-react"
import { BANDCOIN_PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Checkout from "./checkout"

export default function BuyBandCoinClient({
  searchParams,
}: {
  searchParams: { product?: string }
}) {
  const selectedProduct = searchParams.product

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
            <SparklesIcon className="h-4 w-4" />
            <span>Unlock Unlimited AI Features</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Buy BandCoin</h1>
          <p className="text-lg text-zinc-400">
            Use BandCoin to generate AI content, create collectibles, and access premium features
          </p>
        </div>

        {!selectedProduct ? (
          // Product selection grid
          <div className="grid gap-6 md:grid-cols-3">
            {BANDCOIN_PRODUCTS.map((product) => (
              <Card
                key={product.id}
                className="relative border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-zinc-900/80"
              >
                {product.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-4 flex items-center justify-center">
                  <div className="rounded-full bg-amber-500/10 p-4">
                    <CoinsIcon className="h-8 w-8 text-amber-400" />
                  </div>
                </div>

                <h3 className="mb-2 text-center text-2xl font-bold text-white">{product.name}</h3>

                <div className="mb-4 text-center">
                  <div className="text-4xl font-bold text-amber-400">{product.bandcoins}</div>
                  <div className="text-sm text-zinc-500">BandCoins</div>
                </div>

                <div className="mb-6 text-center text-3xl font-bold text-white">
                  ${(product.priceInCents / 100).toFixed(2)}
                </div>

                <p className="mb-6 text-center text-sm text-zinc-400">{product.description}</p>

                <Button
                  className="w-full bg-amber-500 text-black hover:bg-amber-400"
                  onClick={() => {
                    window.location.href = `/buy-bandcoin?product=${product.id}`
                  }}
                >
                  <ZapIcon className="mr-2 h-4 w-4" />
                  Purchase
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          // Checkout view
          <div className="mx-auto max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6 text-zinc-400 hover:text-white"
              onClick={() => {
                window.location.href = "/buy-bandcoin"
              }}
            >
              ← Back to packages
            </Button>

            <Card className="border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
              <Suspense
                fallback={
                  <div className="flex h-64 items-center justify-center">
                    <div className="text-zinc-400">Loading checkout...</div>
                  </div>
                }
              >
                <Checkout productId={selectedProduct} />
              </Suspense>
            </Card>
          </div>
        )}

        {/* Features */}
        {!selectedProduct && (
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-amber-500/10 p-4">
                  <SparklesIcon className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">AI Generation</h3>
              <p className="text-sm text-zinc-400">Generate beats, images, collectibles, and more with AI</p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-amber-500/10 p-4">
                  <ZapIcon className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">No Limits</h3>
              <p className="text-sm text-zinc-400">Bypass daily limits and create unlimited content</p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-amber-500/10 p-4">
                  <CoinsIcon className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Earn More</h3>
              <p className="text-sm text-zinc-400">Keep earning free BandCoins through platform activities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
