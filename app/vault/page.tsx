import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth-actions"
import VaultLanding from "./vault-landing"

export const metadata = {
  title: "Vault | BandCoin Artist Treasury Autopilot",
  description:
    "Think like a label, not a token. Auto-reinvest fan earnings into artist growth. A band treasury that grows while the band sleeps.",
  openGraph: {
    title: "Vault | BandCoin Artist Treasury Autopilot",
    description: "Think like a label, not a token. Auto-reinvest fan earnings into artist growth.",
  },
}

export default async function VaultPage() {
  const user = await getCurrentUser()

  // Not authenticated - show landing page
  if (!user) {
    return <VaultLanding />
  }

  // Authenticated - route based on role
  if (user.role === "admin") {
    redirect("/vault/admin")
  } else if (user.role === "artist") {
    redirect("/vault/artist")
  } else {
    redirect("/vault/supporter")
  }
}
