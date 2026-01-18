"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface SavedAsset {
  id: number
  asset_id: string
  type: string
  url: string
  prompt: string
  vibe: string | null
  camera: string | null
  timestamp: string
  user_identifier: string
  created_at: string
}

export async function saveAssetToDatabase(asset: {
  asset_id: string
  type: string
  url: string
  prompt: string
  vibe?: string
  camera?: string
  timestamp: string
  user_identifier: string
}) {
  try {
    const result = await sql`
      INSERT INTO vibeportal_assets (asset_id, type, url, prompt, vibe, camera, timestamp, user_identifier)
      VALUES (${asset.asset_id}, ${asset.type}, ${asset.url}, ${asset.prompt}, ${asset.vibe || null}, ${asset.camera || null}, ${asset.timestamp}, ${asset.user_identifier})
      ON CONFLICT (asset_id) DO UPDATE
      SET url = EXCLUDED.url,
          prompt = EXCLUDED.prompt,
          vibe = EXCLUDED.vibe,
          camera = EXCLUDED.camera,
          timestamp = EXCLUDED.timestamp,
          user_identifier = EXCLUDED.user_identifier
      RETURNING *
    `
    return { success: true, data: result[0] }
  } catch (error: any) {
    console.error("Failed to save asset to database:", error)
    return { success: false, error: error.message }
  }
}

export async function loadAssetsFromDatabase(userIdentifier: string): Promise<SavedAsset[]> {
  try {
    const results = await sql`
      SELECT * FROM vibeportal_assets
      WHERE user_identifier = ${userIdentifier}
      ORDER BY created_at DESC
      LIMIT 100
    `
    return results as SavedAsset[]
  } catch (error: any) {
    console.error("Failed to load assets from database:", error)
    return []
  }
}

export async function deleteAssetFromDatabase(assetId: string, userIdentifier: string) {
  try {
    await sql`
      DELETE FROM vibeportal_assets
      WHERE asset_id = ${assetId} AND user_identifier = ${userIdentifier}
    `
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete asset from database:", error)
    return { success: false, error: error.message }
  }
}
