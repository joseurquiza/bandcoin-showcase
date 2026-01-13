import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-actions"
import SupporterVaultDashboard from "./supporter-vault-dashboard"

export default async function SupporterVaultPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/vault/login")
  }

  if (user.role !== "supporter") {
    redirect("/vault")
  }

  return <SupporterVaultDashboard user={user} />
}
