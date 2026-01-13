import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { MessagesClient } from "./messages-client"

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

export default async function MessagesPage() {
  const profileId = await getCurrentProfile()

  if (!profileId) {
    redirect("/bt")
  }

  return <MessagesClient />
}
