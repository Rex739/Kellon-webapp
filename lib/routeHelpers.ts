import { Route, ExtendedChain, Token, Step } from "@lifi/sdk"
import { formatTime } from "./formatTime"
import { formatTokenAmount } from "@/hooks/useFormatTokenAmount"

export interface RouteCalculationResult {
  priceImpact: number
  priceImpactText: string
  isPositive: boolean
  conversionText: string
  rateToFrom: number
  rateFromTo: number
}

export interface RouteStepDetails {
  actionType: string
  formattedFromAmount: string
  formattedToAmount: string
  formattedTime: string
  stepLogoURI: string
  stepAggregator: string
}

// Calculate price impact between fromAmountUSD and toAmountUSD
export const calculatePriceImpact = (
  fromAmountUSD: string,
  toAmountUSD: string
): number => {
  const fromUSD = parseFloat(fromAmountUSD)
  const toUSD = parseFloat(toAmountUSD)

  if (fromUSD === 0) return 0

  const priceImpact = ((toUSD - fromUSD) / fromUSD) * 100
  return priceImpact
}

// Get price impact text with sign
export const getPriceImpactText = (priceImpact: number): string => {
  const isPositive = priceImpact >= 0
  return isPositive
    ? `+${priceImpact.toFixed(2)}%`
    : `${priceImpact.toFixed(2)}%`
}

// Calculate conversion rates and text
export const calculateConversion = (
  fromAmount: string,
  toAmount: string,
  fromToken: Token,
  toToken: Token,
  isReversed: boolean
): string => {
  const fromAmountBigInt = BigInt(fromAmount)
  const toAmountBigInt = BigInt(toAmount)

  const fromAmountNum =
    Number(fromAmountBigInt) / Math.pow(10, fromToken.decimals)
  const toAmountNum = Number(toAmountBigInt) / Math.pow(10, toToken.decimals)

  const rateToFrom = fromAmountNum / toAmountNum
  const rateFromTo = toAmountNum / fromAmountNum

  const rateToFromFormatted = BigInt(
    Math.round(rateToFrom * Math.pow(10, fromToken.decimals))
  )
  const rateFromToFormatted = BigInt(
    Math.round(rateFromTo * Math.pow(10, toToken.decimals))
  )

  return isReversed
    ? `1 ${toToken.symbol} ≈ ${formatTokenAmount(rateToFromFormatted, fromToken.decimals)} ${fromToken.symbol}`
    : `1 ${fromToken.symbol} ≈ ${formatTokenAmount(rateFromToFormatted, toToken.decimals)} ${toToken.symbol}`
}

// Get chain name from chains array
export const getChainName = (
  chainId: number,
  chains: ExtendedChain[]
): string => {
  return chains.find((chain) => chain.id === chainId)?.name || "Unknown"
}

// Format step details for display
export const getStepDetails = (
  step: Step,
  chains: ExtendedChain[],
  fromAmount: string,
  fromToken: Token
): RouteStepDetails | null => {
  const fromChainId = step.action.fromChainId
  const toChainId = step.action.toChainId
  const fromChainName = getChainName(fromChainId, chains)
  const toChainName = getChainName(toChainId, chains)
  // const stepFromToken = step.action.fromToken
  const stepToToken = step.action.toToken
  const stepAggregator = step.toolDetails?.name || step.tool || "Unknown"
  const stepLogoURI = step.toolDetails?.logoURI || ""
  const isSameChain = fromChainId === toChainId

  let actionType: string
  if (step.type === "protocol") {
    return null
  } else if (step.type === "swap") {
    actionType = `Swap on ${fromChainName} via ${stepAggregator}`
  } else if (step.type === "cross" || !isSameChain) {
    actionType = `Bridge from ${fromChainName} to ${toChainName} via ${stepAggregator}`
  } else {
    actionType = `Action on ${fromChainName} via ${stepAggregator}`
  }

  const formattedFromAmount =
    fromAmount && fromToken && formatTokenAmount(fromAmount, fromToken.decimals)

  const formattedToAmount = formatTokenAmount(
    step.estimate.toAmount,
    stepToToken.decimals
  )

  const stepExecutionDuration = step.estimate?.executionDuration || 0
  const formattedTime = formatTime(stepExecutionDuration)

  return {
    actionType,
    formattedFromAmount,
    formattedToAmount,
    formattedTime,
    stepLogoURI,
    stepAggregator,
  }
}

// Get aggregator info from route
export const getAggregatorInfo = (route: Route) => {
  return {
    aggregator: route.steps[0].toolDetails?.name || route.steps[0].tool,
    logoURI: route.steps[0].toolDetails?.logoURI || "",
    executionDuration: route.steps[0].estimate.executionDuration || 0,
  }
}

// Extract common route data
export const extractRouteData = (route: Route) => {
  return {
    id: route.id,
    fromToken: route.fromToken,
    toToken: route.toToken,
    fromChainId: route.fromChainId,
    toChainId: route.toChainId,
    fromAmount: route.fromAmount,
    fromAmountUSD: route.fromAmountUSD,
    toAmount: route.toAmount,
    toAmountUSD: route.toAmountUSD,
    gasCostUSD: route.gasCostUSD,
    steps: route.steps,
    toAmountMin: route.toAmountMin,
  }
}
