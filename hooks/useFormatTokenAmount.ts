import { useCallback } from "react"

interface UseFormatTokenAmountProps {
  decimals?: number
  precision?: number
}

// Shared core logic
const formatTokenAmountCore = (
  amount: string | number | bigint,
  decimals: number,
  precision: number
): string => {
  if (!amount && amount !== 0) return "0"

  const amountStr =
    typeof amount === "bigint" ? amount.toString() : amount.toString()

  // Handle very large numbers that might exceed JavaScript number precision
  if (amountStr.length > 15) {
    return formatLargeNumber(amountStr, decimals, precision)
  }

  const numericAmount = typeof amount === "number" ? amount : Number(amountStr)
  const divisor = 10 ** decimals
  const formattedAmount = numericAmount / divisor

  // Format with appropriate precision
  return formattedAmount.toFixed(precision).replace(/\.?0+$/, "")
}

const formatLargeNumber = (
  amountStr: string,
  tokenDecimals: number,
  precision: number
): string => {
  // Convert to string and handle decimal placement
  const fullAmount = amountStr.padStart(tokenDecimals + 1, "0")
  const integerPart = fullAmount.slice(0, -tokenDecimals) || "0"
  const fractionalPart = fullAmount.slice(-tokenDecimals)

  // Handle very small amounts (integer part is 0)
  if (integerPart === "0") {
    // Find the first non-zero digit
    let firstNonZeroIndex = -1
    for (let i = 0; i < fractionalPart.length; i++) {
      if (fractionalPart[i] !== "0") {
        firstNonZeroIndex = i
        break
      }
    }

    // If all zeros or no non-zero found
    if (firstNonZeroIndex === -1) {
      return "0"
    }

    const zeroCount = firstNonZeroIndex
    const significantDigits = fractionalPart.slice(
      firstNonZeroIndex,
      firstNonZeroIndex + Math.max(4, precision)
    )

    // Format tiny numbers with subscript notation (like 0.0₆1047)
    if (zeroCount >= 4) {
      return `0.0${zeroCount}${significantDigits.slice(0, 4)}`
    } else {
      // For fewer zeros, show normal format with more precision
      const zeros = "0".repeat(zeroCount)
      const digits = significantDigits.slice(0, 6 - zeroCount)
      return `0.${zeros}${digits}`
    }
  }

  // Trim trailing zeros from fractional part for normal numbers
  let trimmedFractional = fractionalPart.replace(/0+$/, "")
  if (trimmedFractional.length > precision) {
    trimmedFractional = trimmedFractional.slice(0, precision)
  }

  return trimmedFractional ? `${integerPart}.${trimmedFractional}` : integerPart
}

// Hook version
export const useFormatTokenAmount = ({
  decimals = 18,
  precision = 6,
}: UseFormatTokenAmountProps = {}) => {
  const formatTokenAmount = useCallback(
    (amount: string | number | bigint, customDecimals?: number): string => {
      const tokenDecimals = customDecimals ?? decimals
      return formatTokenAmountCore(amount, tokenDecimals, precision)
    },
    [decimals, precision]
  )

  const parseTokenAmount = useCallback(
    (formattedAmount: string, customDecimals?: number): string => {
      if (!formattedAmount) return "0"

      const tokenDecimals = customDecimals ?? decimals

      // Handle subscript notation (0.0₆1047 → 0.000001047)
      if (formattedAmount.includes("0₋")) {
        const match = formattedAmount.match(/0\.0(\d+)(\d+)/)
        if (match) {
          const zeroCount = parseInt(match[1])
          const digits = match[2]
          const zeros = "0".repeat(zeroCount)
          formattedAmount = `0.${zeros}${digits}`
        }
      }

      const [integerPart, fractionalPart = ""] = formattedAmount.split(".")

      const fractionalPadded = fractionalPart
        .padEnd(tokenDecimals, "0")
        .slice(0, tokenDecimals)
      return integerPart + fractionalPadded
    },
    [decimals]
  )

  return {
    formatTokenAmount,
    parseTokenAmount,
    decimals,
    precision,
  }
}

// Standalone version
export const formatTokenAmount = (
  amount: string | number | bigint,
  decimals: number = 18,
  precision: number = 6
): string => {
  return formatTokenAmountCore(amount, decimals, precision)
}
