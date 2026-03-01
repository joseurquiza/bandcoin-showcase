"use server"

import { getDb } from "@/lib/db"

export async function submitContactForm(data: {
  name: string
  email: string
  bandName: string
  serviceType: string
  message: string
}) {
  try {
    const sql = getDb()
    await sql`
      INSERT INTO showcase_contact_submissions (name, email, band_name, service_type, message)
      VALUES (${data.name}, ${data.email}, ${data.bandName}, ${data.serviceType}, ${data.message || ""})
    `
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Failed to save contact submission:", error)
    return { success: false, error: error.message }
  }
}

export async function getContactSubmissions() {
  try {
    const sql = getDb()
    const rows = await sql`
      SELECT * FROM showcase_contact_submissions
      ORDER BY created_at DESC
    `
    return { success: true, submissions: rows }
  } catch (error: any) {
    console.error("[v0] Failed to get contact submissions:", error)
    return { success: false, submissions: [] }
  }
}

export async function updateSubmissionStatus(id: number, status: string) {
  try {
    const sql = getDb()
    await sql`
      UPDATE showcase_contact_submissions SET status = ${status} WHERE id = ${id}
    `
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
