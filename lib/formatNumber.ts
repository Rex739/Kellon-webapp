export interface FormatNumberOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export const formatNumber = (
  value: number | string | bigint,
  options: FormatNumberOptions = {}
): string => {
  const numValue =
    typeof value === "bigint"
      ? Number(value)
      : typeof value === "string"
        ? Number(value)
        : value

  if (isNaN(numValue)) return "0"

  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options

  return numValue.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  })
}

// For numbers around 1000 (no decimals needed)
export const formatWholeNumber = (value: number | string | bigint): string =>
  formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

// For numbers that might need 2 decimals (prices, amounts)
export const formatDecimalNumber = (value: number | string | bigint): string =>
  formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Simple USD formatting without extra options
export const formatUSD = (amount: number | string): string => {
  const numAmount = typeof amount === "string" ? Number(amount) : amount
  if (isNaN(numAmount)) return "$0.00"
  return numAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
