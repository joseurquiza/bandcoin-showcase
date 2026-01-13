export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCurrentUser } from "../auth-actions"
import AdminVaultDashboard from "./admin-vault-dashboard"

export default async function AdminVaultPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/vault/login")
  }

  if (user.role !== "admin") {
    redirect("/vault")
  }

  return <AdminVaultDashboard user={user} />
}
