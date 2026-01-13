import BuyBandCoinClient from "./buy-bandcoin-client"

export const metadata = {
  title: "Buy BandCoin | BandCoin ShowCase",
  description: "Purchase BandCoin to unlock unlimited AI features",
}

export default function BuyBandCoinPage({
  searchParams,
}: {
  searchParams: { product?: string }
}) {
  return <BuyBandCoinClient searchParams={searchParams} />
}
