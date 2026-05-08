export type Step = "asset" | "amount" | "provider" | "review"

export const STEPS: Step[] = ["asset", "amount", "provider", "review"]

export const STEP_TITLES: Record<Step, string> = {
  asset: "Buy Crypto",
  amount: "Enter Amount",
  provider: "Choose Provider",
  review: "Review Purchase",
}

export const STEP_DESCRIPTIONS: Record<Step, string> = {
  asset: "Select your preferred stablecoin and blockchain network.",
  amount: "Enter how much you'd like to purchase.",
  provider: "Compare and select your preferred payment provider.",
  review: "Review your order details before confirming.",
}

export type PaymentMethod = "card" | "bank" | "mobile_money"

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "Debit/Credit Card",
  bank: "Bank Transfer",
  mobile_money: "Mobile Money",
}

export interface Asset {
  id: string
  name: string
  symbol: "USDC" | "USDT"
}

export interface Provider {
  id: string
  name: string
  logo: string
  deliveryTime: string
  fee: string
  isRecommended?: boolean
  features: string[]
}

export const ASSETS: Asset[] = [
  { id: "usdc", name: "USD Coin", symbol: "USDC" },
  { id: "usdt", name: "Tether", symbol: "USDT" },
]

export const MIN_CRYPTO_THRESHOLD = 0.01
