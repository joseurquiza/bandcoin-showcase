export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-actions"
import ArtistVaultDashboard from "./artist-vault-dashboard"

export default async function ArtistVaultPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/vault/login")
  }

  if (user.role !== "artist") {
    redirect("/vault")
  }

  return <ArtistVaultDashboard user={user} />
}
