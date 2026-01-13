export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import CollectiblesClient from "./collectibles-client"

export const metadata: Metadata = {
  title: "Collectibles | BandCoin",
  description: "Create unique AI-generated collectible tokens on the Stellar blockchain",
}

export default function CollectiblesPage() {
  return <CollectiblesClient initialCollectibles={[]} initialPublicCollectibles={[]} />
}
