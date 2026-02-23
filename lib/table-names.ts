/**
 * Table name mappings with showcase_ prefix
 * Use these constants throughout the app to reference database tables
 */

export const TABLES = {
  // Rewards System
  REWARD_USERS: 'showcase_reward_users',
  REWARD_ACTIVITIES: 'showcase_reward_activities',
  REWARD_RULES: 'showcase_reward_rules',
  REWARD_WITHDRAWALS: 'showcase_reward_withdrawals',
  
  // Vault System
  VAULT_USERS: 'showcase_vault_users',
  VAULT_ARTISTS: 'showcase_vault_artists',
  VAULT_STAKES: 'showcase_vault_stakes',
  VAULT_TRANSACTIONS: 'showcase_vault_transactions',
  VAULT_REINVESTMENT_RULES: 'showcase_vault_reinvestment_rules',
  
  // Band Together
  BT_PROFILES: 'showcase_bt_profiles',
  BT_MESSAGES: 'showcase_bt_messages',
  BT_GIGS: 'showcase_bt_gigs',
  BT_BANDS: 'showcase_bt_bands',
  
  // Collectibles
  KEEPSAKE_TOKENS: 'showcase_keepsake_tokens',
  AI_PAYMENT_TRANSACTIONS: 'showcase_ai_payment_transactions',
  
  // Vibe Portal
  VIBEPORTAL_ASSETS: 'showcase_vibeportal_assets',
  
  // Merch
  MERCH_ORDERS: 'showcase_merch_orders',
  
  // AI Usage
  AI_USAGE: 'showcase_ai_usage',
  
  // Analytics
  ANALYTICS_EVENTS: 'showcase_analytics_events',
} as const

export type TableName = typeof TABLES[keyof typeof TABLES]
