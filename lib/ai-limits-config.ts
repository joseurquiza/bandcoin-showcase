export const AI_DAILY_LIMITS: Record<string, number> = {
  "beat-builder": 10,
  vibeportal: 5,
  pubassist: 15,
  "gig-finder": 10,
  support: 20,
  "v0-chat": 10,
  collectibles: 2, // 2 free generations per day
}

export const BANDCOIN_COSTS: Record<string, number> = {
  "beat-builder": 5, // 5 BC per beat generation
  vibeportal: 10, // 10 BC per image generation
  pubassist: 3, // 3 BC per writing assist
  "gig-finder": 5, // 5 BC per gig match
  support: 2, // 2 BC per support message
  "v0-chat": 5, // 5 BC per chat message
  collectibles: 15, // 15 BC per collectible (includes 3 image options)
}
