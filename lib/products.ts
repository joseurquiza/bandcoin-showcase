export interface BandCoinProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  bandcoins: number
  stripePriceId: string
  stripeProductId: string
  popular?: boolean
}

export const BANDCOIN_PRODUCTS: BandCoinProduct[] = [
  {
    id: "bandcoin-starter",
    name: "Starter Pack",
    description: "Perfect for getting started",
    priceInCents: 499, // $4.99
    bandcoins: 100,
    stripePriceId: "price_1Sie9d8DW0mdL72Ybiryu3os",
    stripeProductId: "prod_Tg09LQFeCh7szU",
  },
  {
    id: "bandcoin-value",
    name: "Value Pack",
    description: "Great value for regular users",
    priceInCents: 1999, // $19.99
    bandcoins: 500,
    stripePriceId: "price_1Sie9d8DW0mdL72YbHQzdAaa",
    stripeProductId: "prod_Tg09k8j9DHOTFO",
    popular: true,
  },
  {
    id: "bandcoin-power",
    name: "Power Pack",
    description: "Best value for power users",
    priceInCents: 4999, // $49.99
    bandcoins: 1500,
    stripePriceId: "price_1Sie9d8DW0mdL72YBsUOfWwr",
    stripeProductId: "prod_Tg09tDFfsdMmzi",
  },
]
