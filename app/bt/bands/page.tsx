import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { MyBandsClient } from "./my-bands-client"

async function getCurrentProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get("bt-session")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = verify(token, process.env.VAULT_JWT_SECRET!) as { profileId: number }
    return decoded.profileId
  } catch {
    return null
  }
}

export default async function BandsPage() {
  const profileId = await getCurrentProfile()

  if (!profileId) {
    redirect("/bt")
  }

  return <MyBandsClient />
}
