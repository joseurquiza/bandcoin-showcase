export const dynamic = "force-dynamic"

import { getUserRewards, getRewardRules } from "./rewards-actions"
import { RewardsDisplayClient } from "./rewards-display-client"

export const metadata = {
  title: "BandCoin Rewards | BandCoin ShowCase",
  description: "Earn BandCoin tokens by exploring apps and engaging with the platform",
}

export default async function RewardsPage() {
  const [userData, rewardRules] = await Promise.all([getUserRewards(), getRewardRules()])

  const data = {
    ...userData,
    rewardRules,
    user: userData.user,
  }

  return <RewardsDisplayClient initialData={data} />
}
