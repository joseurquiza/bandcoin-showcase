"use server"

import { getDb } from "@/lib/db"

export interface SavedAsset {
  id: number
  asset_id: string
  type: string
  url: string
  prompt: string
  vibe: string | null
  camera: string | null
  timestamp: string
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
}) {
  try {
    const sql = getDb()
    const result = await sql`
      INSERT INTO showcase_vibeportal_assets (asset_id, type, url, prompt, vibe, camera, timestamp)
      VALUES (${asset.asset_id}, ${asset.type}, ${asset.url}, ${asset.prompt}, ${asset.vibe || null}, ${asset.camera || null}, ${asset.timestamp})
      ON CONFLICT (asset_id) DO UPDATE
      SET url = EXCLUDED.url,
          prompt = EXCLUDED.prompt,
          vibe = EXCLUDED.vibe,
          camera = EXCLUDED.camera,
          timestamp = EXCLUDED.timestamp
      RETURNING *
    `
    return { success: true, data: result[0] }
  } catch (error: any) {
    console.error("Failed to save asset to database:", error)
    return { success: false, error: error.message }
  }
}

export async function loadAssetsFromDatabase(): Promise<SavedAsset[]> {
  try {
    const sql = getDb()
    const results = await sql`
      SELECT * FROM showcase_vibeportal_assets
      ORDER BY created_at DESC
      LIMIT 100
    `
    return results as SavedAsset[]
  } catch (error: any) {
    console.error("Failed to load assets from database:", error)
    return []
  }
}

export async function deleteAssetFromDatabase(assetId: string) {
  try {
    const sql = getDb()
    await sql`
      DELETE FROM showcase_vibeportal_assets
      WHERE asset_id = ${assetId}
    `
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete asset from database:", error)
    return { success: false, error: error.message }
  }
}
