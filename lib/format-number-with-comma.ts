// lib/format-number.ts

/**
 * Format a number string with commas for thousands separators
 * @example formatNumberWithCommas("10000") // returns "10,000"
 * @example formatNumberWithCommas("1234567.89") // returns "1,234,567.89"
 */
export function formatNumberWithCommas(value: string | number): string {
  // Convert to string and split into integer and decimal parts
  const numStr = value.toString()
  const parts = numStr.split(".")

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  // Return with decimal part if it exists
  return parts.length === 2 ? `${parts[0]}.${parts[1]}` : parts[0]
}

/**
 * Format number with commas and specified decimal places
 */
export function formatNumberWithCommasDecimals(
  value: number,
  decimals: number = 2,
): string {
  const formatted = value.toFixed(decimals)
  const parts = formatted.split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return parts.length === 2 ? `${parts[0]}.${parts[1]}` : parts[0]
}
