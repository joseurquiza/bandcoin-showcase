"use client"

import { useEffect } from "react"
import { trackActivity, checkDailyBonus } from "@/app/rewards/rewards-actions"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

const APP_NAMES: Record<string, string> = {
  "/beatbuilder": "beatbuilder",
  "/vibeportal": "vibeportal",
  "/site-builder": "site-builder",
  "/pubassist": "pubassist",
  "/gig-finder": "gig-finder",
  "/vault": "vault",
}

export function RewardsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Check daily bonus on mount
    checkDailyBonus().then((result) => {
      if (result.awarded && result.tokensEarned) {
        toast.success(`Daily Bonus! +${result.tokensEarned} BC`, {
          description: "Come back tomorrow for another bonus!",
        })
      }
    })
  }, [])

  useEffect(() => {
    // Track app visits
    const appName = APP_NAMES[pathname]
    if (appName) {
      trackActivity("app_visit", appName, { path: pathname }).then((result) => {
        if (result.success && result.tokensEarned && result.tokensEarned > 0) {
          toast.success(`+${result.tokensEarned} BandCoin`, {
            description: result.description,
          })
        }
      })
    }
  }, [pathname])

  return null
}

export async function trackFeatureUse(appName: string, feature: string) {
  const result = await trackActivity("feature_use", appName, { feature })
  if (result.success && result.tokensEarned && result.tokensEarned > 0) {
    toast.success(`+${result.tokensEarned} BandCoin`, {
      description: result.description,
    })
  }
  return result
}
