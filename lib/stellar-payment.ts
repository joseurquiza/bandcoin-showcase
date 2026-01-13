import * as StellarSdk from "@stellar/stellar-sdk"
import freighterApi from "@stellar/freighter-api"

interface FreighterConnectionResult {
  isConnected: boolean
}

interface FreighterSignResult {
  signedTxXdr?: string
  error?: string
}

// BandCoin asset details
const BANDCOIN_ISSUER = process.env.NEXT_PUBLIC_BANDCOIN_ISSUER!
const BANDCOIN_CODE = "BANDCOIN"

// Platform receiving wallet
const PLATFORM_WALLET = "GAF4UUDHK35XNGKO6MJUAM3GXSTXMGPIYIRG2BJGMKCPN7MKABOMCD34"

export interface PaymentRequest {
  amount: string
  memo: string
  userWallet: string
}

export interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

/**
 * Request payment from user's Stellar wallet
 * User signs the transaction with Freighter
 */
export async function requestStellarPayment(request: PaymentRequest): Promise<PaymentResult> {
  try {
    console.log("[v0] Checking Freighter connection...")

    const connectionResult = (await freighterApi.isConnected()) as FreighterConnectionResult
    if (!connectionResult.isConnected) {
      return {
        success: false,
        error: "Freighter wallet not connected. Please connect your Stellar wallet.",
      }
    }

    console.log("[v0] Loading Stellar account:", request.userWallet)

    const server = new StellarSdk.Horizon.Server("https://horizon.stellar.org")

    // Load user account
    const userAccount = await server.loadAccount(request.userWallet)

    // Create BANDCOIN asset
    const bandcoinAsset = new StellarSdk.Asset(BANDCOIN_CODE, BANDCOIN_ISSUER)

    console.log("[v0] Building transaction for", request.amount, "BANDCOIN")

    // Build payment transaction
    const transaction = new StellarSdk.TransactionBuilder(userAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: PLATFORM_WALLET,
          asset: bandcoinAsset,
          amount: request.amount,
        }),
      )
      .addMemo(StellarSdk.Memo.text(request.memo))
      .setTimeout(180)
      .build()

    // Get transaction XDR
    const xdr = transaction.toXDR()

    console.log("[v0] Requesting signature from Freighter...")

    const signResult = (await freighterApi.signTransaction(xdr, {
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })) as FreighterSignResult

    if (signResult.error) {
      throw new Error(signResult.error)
    }

    if (!signResult.signedTxXdr) {
      throw new Error("No signed transaction returned from Freighter")
    }

    console.log("[v0] Transaction signed, submitting to Stellar network...")

    // Submit transaction
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signResult.signedTxXdr, StellarSdk.Networks.PUBLIC)
    const result = await server.submitTransaction(signedTransaction)

    console.log("[v0] Payment successful! Hash:", result.hash)

    return {
      success: true,
      transactionHash: result.hash,
    }
  } catch (error: any) {
    console.error("[v0] Stellar payment error:", error)
    return {
      success: false,
      error: error.message || "Payment failed. Please try again.",
    }
  }
}

/**
 * Verify a payment transaction on Stellar
 */
export async function verifyPayment(transactionHash: string, expectedAmount: string): Promise<boolean> {
  const maxRetries = 5
  const retryDelay = 2000 // 2 seconds

  const server = new StellarSdk.Horizon.Server("https://horizon.stellar.org")

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[v0] Verification attempt ${attempt}/${maxRetries} for transaction:`, transactionHash)

      const transaction = await server.transactions().transaction(transactionHash).call()

      console.log("[v0] Transaction found, successful:", transaction.successful)

      // Check if transaction is successful
      if (!transaction.successful) {
        console.log("[v0] Transaction exists but was not successful")
        return false
      }

      // Verify the payment operation
      console.log("[v0] Fetching operations for transaction...")
      const operations = await server.operations().forTransaction(transactionHash).call()

      console.log("[v0] Found", operations.records.length, "operations")

      for (const op of operations.records) {
        console.log("[v0] Operation type:", op.type)

        if (op.type === "payment") {
          const paymentOp = op as any
          console.log("[v0] Payment details:", {
            asset_code: paymentOp.asset_code,
            asset_issuer: paymentOp.asset_issuer,
            to: paymentOp.to,
            amount: paymentOp.amount,
            expected_amount: expectedAmount,
          })

          if (
            paymentOp.asset_code === BANDCOIN_CODE &&
            paymentOp.asset_issuer === BANDCOIN_ISSUER &&
            paymentOp.to === PLATFORM_WALLET &&
            Number.parseFloat(paymentOp.amount) >= Number.parseFloat(expectedAmount)
          ) {
            console.log("[v0] Payment verified successfully!")
            return true
          } else {
            console.log("[v0] Payment operation doesn't match criteria:", {
              asset_match: paymentOp.asset_code === BANDCOIN_CODE && paymentOp.asset_issuer === BANDCOIN_ISSUER,
              destination_match: paymentOp.to === PLATFORM_WALLET,
              amount_match: Number.parseFloat(paymentOp.amount) >= Number.parseFloat(expectedAmount),
            })
          }
        }
      }

      console.log("[v0] No matching payment operation found")
      return false
    } catch (error: any) {
      console.error(`[v0] Verification attempt ${attempt} failed:`, error.message)

      // If it's a "not found" error and we have retries left, wait and try again
      if (error.response?.status === 404 && attempt < maxRetries) {
        console.log(`[v0] Transaction not found yet, waiting ${retryDelay}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        continue
      }

      // For other errors or if we're out of retries, fail
      console.error("[v0] Payment verification error:", error)
      return false
    }
  }

  console.log("[v0] All verification attempts exhausted")
  return false
}

/**
 * Verify payment by checking wallet balance decreased
 */
export async function verifyPaymentByBalance(
  userWallet: string,
  previousBalance: number,
  expectedDeduction: number,
): Promise<boolean> {
  try {
    console.log("[v0] Verifying payment by checking balance change...")
    console.log("[v0] Previous balance:", previousBalance)
    console.log("[v0] Expected deduction:", expectedDeduction)

    const currentBalance = await getWalletBandCoinBalance(userWallet)
    console.log("[v0] Current balance:", currentBalance)

    // Check if balance decreased by at least the expected amount
    const actualDeduction = previousBalance - currentBalance
    console.log("[v0] Actual deduction:", actualDeduction)

    if (actualDeduction >= expectedDeduction) {
      console.log("[v0] Payment verified! Balance decreased by", actualDeduction, "BC")
      return true
    } else {
      console.log("[v0] Payment verification failed. Balance only decreased by", actualDeduction, "BC")
      return false
    }
  } catch (error: any) {
    console.error("[v0] Balance verification error:", error)
    return false
  }
}

/**
 * Get BANDCOIN balance for a wallet
 */
async function getWalletBandCoinBalance(walletAddress: string): Promise<number> {
  try {
    const server = new StellarSdk.Horizon.Server("https://horizon.stellar.org")

    const account = await server.loadAccount(walletAddress)
    const bandcoinBalance = account.balances.find(
      (balance: any) =>
        balance.asset_type === "credit_alphanum12" &&
        balance.asset_code === BANDCOIN_CODE &&
        balance.asset_issuer === BANDCOIN_ISSUER,
    )
    return bandcoinBalance ? Number.parseFloat(bandcoinBalance.balance) : 0
  } catch (error) {
    console.error("[v0] Error fetching balance:", error)
    return 0
  }
}
