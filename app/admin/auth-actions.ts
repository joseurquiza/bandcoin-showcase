"use server"

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminKey = process.env.ADMIN_DASH_API_KEY

  if (!adminKey) {
    console.error("ADMIN_DASH_API_KEY environment variable is not set")
    return false
  }

  return password === adminKey
}
