"use server"

import { getDb } from "@/lib/db"

const serviceLabel: Record<string, string> = {
  epk: "EPK",
  website: "Website",
  both: "EPK + Website",
  unsure: "Not sure yet",
}

async function sendSlackNotification(data: {
  name: string
  email: string
  bandName: string
  serviceType: string
  message: string
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const service = serviceLabel[data.serviceType] ?? data.serviceType

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `:envelope: *New project inquiry from ${data.bandName}*`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `New Inquiry: ${data.bandName}` },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Name:*\n${data.name}` },
            { type: "mrkdwn", text: `*Email:*\n${data.email}` },
            { type: "mrkdwn", text: `*Band / Artist:*\n${data.bandName}` },
            { type: "mrkdwn", text: `*Service:*\n${service}` },
          ],
        },
        ...(data.message
          ? [
              {
                type: "section",
                text: { type: "mrkdwn", text: `*Message:*\n${data.message}` },
              },
            ]
          : []),
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View in Admin" },
              url: "https://showcase.bandcoin.io/admin",
              style: "primary",
            },
            {
              type: "button",
              text: { type: "plain_text", text: `Email ${data.name}` },
              url: `mailto:${data.email}`,
            },
          ],
        },
      ],
    }),
  })
}

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

    // Fire Slack notification (non-blocking)
    sendSlackNotification(data).catch((err) =>
      console.error("[v0] Slack notification failed:", err)
    )

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
