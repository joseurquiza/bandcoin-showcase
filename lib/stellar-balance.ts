import * as StellarSdk from "@stellar/stellar-sdk"

// BANDCOIN asset details from Stellar
const BANDCOIN_CODE = "BANDCOIN"
const BANDCOIN_ISSUER = "GCMEPWXKQ4JCBE4NRRFTPAOP22N3NXUHTHJQSWRSKRD7APA6C7T4ESLG"

// Stellar Horizon server (public network)
const HORIZON_URL = "https://horizon.stellar.org"

export interface BandCoinBalance {
  balance: number
  asset_code: string
  asset_issuer: string
}

/**
 * Query a Stellar wallet's BANDCOIN balance from the blockchain
 */
export async function getStellarBandCoinBalance(stellarAddress: string): Promise<number> {
  try {
    console.log("[v0] getStellarBandCoinBalance called with address:", stellarAddress)

    // Validate address format
    if (!stellarAddress || !stellarAddress.match(/^G[A-Z0-9]{55}$/)) {
      console.error("[v0] Invalid Stellar address format:", stellarAddress)
      return 0
    }

    const server = new StellarSdk.Horizon.Server(HORIZON_URL)

    console.log("[v0] Loading account from Stellar Horizon...")
    // Load account from Stellar network
    const account = await server.loadAccount(stellarAddress)

    console.log("[v0] Account loaded, balances:", account.balances.length)

    // Find BANDCOIN balance in account balances
    const bandcoinBalance = account.balances.find(
      (balance: any) =>
        balance.asset_type !== "native" &&
        balance.asset_code === BANDCOIN_CODE &&
        balance.asset_issuer === BANDCOIN_ISSUER,
    )

    if (!bandcoinBalance) {
      console.log("[v0] No BANDCOIN trustline found for address:", stellarAddress)
      console.log(
        "[v0] Available balances:",
        account.balances.map((b: any) => ({
          asset: b.asset_type === "native" ? "XLM" : `${b.asset_code}:${b.asset_issuer?.substring(0, 8)}...`,
          balance: b.balance,
        })),
      )
      return 0
    }

    const balance = Number.parseFloat(bandcoinBalance.balance)
    console.log(`[v0] ✅ BANDCOIN balance for ${stellarAddress}: ${balance}`)

    return balance
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.error("[v0] Stellar account not found:", stellarAddress)
      return 0
    }
    console.error("[v0] Error fetching Stellar BANDCOIN balance:", error)
    return 0
  }
}

/**
 * Check if an address has a BANDCOIN trustline established
 */
export async function hasBandCoinTrustline(stellarAddress: string): Promise<boolean> {
  try {
    if (!stellarAddress || !stellarAddress.match(/^G[A-Z0-9]{55}$/)) {
      return false
    }

    const server = new StellarSdk.Horizon.Server(HORIZON_URL)
    const account = await server.loadAccount(stellarAddress)

    const hasTrustline = account.balances.some(
      (balance: any) =>
        balance.asset_type !== "native" &&
        balance.asset_code === BANDCOIN_CODE &&
        balance.asset_issuer === BANDCOIN_ISSUER,
    )

    return hasTrustline
  } catch (error) {
    console.error("[v0] Error checking BANDCOIN trustline:", error)
    return false
  }
}

/**
 * Get all asset balances for a Stellar address
 */
export async function getAllStellarBalances(stellarAddress: string): Promise<any[]> {
  try {
    if (!stellarAddress || !stellarAddress.match(/^G[A-Z0-9]{55}$/)) {
      return []
    }

    const server = new StellarSdk.Horizon.Server(HORIZON_URL)
    const account = await server.loadAccount(stellarAddress)

    return account.balances.map((balance: any) => ({
      asset_code: balance.asset_type === "native" ? "XLM" : balance.asset_code,
      asset_issuer: balance.asset_type === "native" ? null : balance.asset_issuer,
      balance: Number.parseFloat(balance.balance),
    }))
  } catch (error) {
    console.error("[v0] Error fetching Stellar balances:", error)
    return []
  }
}
