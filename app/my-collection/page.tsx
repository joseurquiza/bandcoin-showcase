export const dynamic = "force-dynamic"

import { getMyCollectibles } from "../collectibles/collectibles-actions"
import MyCollectionClient from "./my-collection-client"

export const metadata = {
  title: "My Collection | BandCoin",
  description: "View all your collectible tokens",
}

export default async function MyCollectionPage() {
  try {
    const result = await getMyCollectibles()

    // Even if there's an error, still render the page with empty array
    const collectibles = result.success ? result.collectibles || [] : []

    return <MyCollectionClient initialCollectibles={collectibles} />
  } catch (error) {
    console.error("[v0] Error loading My Collection page:", error)
    // Return empty collection on error instead of crashing
    return <MyCollectionClient initialCollectibles={[]} />
  }
}
