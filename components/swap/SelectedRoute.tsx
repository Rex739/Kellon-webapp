"use client"

import { FC, useState } from "react"
import { CardContent } from "../ui/card"
import { ChevronDown, Clock } from "lucide-react"
import { Route, ExtendedChain } from "@lifi/sdk"
import TokenWithChainLogo from "./TokenWithChainLogo"
import { useFormatTokenAmount } from "@/hooks/useFormatTokenAmount"
import { Icons } from "@/components/Icons"
import { formatTime } from "@/lib/formatTime"
import AggregatorLogo from "./AggregatorLogo"
import Dot from "@/components/ui/dot"
import { cn } from "@/lib/utils"

interface SelectedRouteProps {
  selectedRoute: Route | null
  chains: ExtendedChain[]
  isBridging: boolean
}

const SelectedRoute: FC<SelectedRouteProps> = ({
  selectedRoute,
  chains,
  isBridging,
}) => {
  const { formatTokenAmount } = useFormatTokenAmount()
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [isReversed, setIsReversed] = useState(false)


  // Calculate percentage change between fromAmountUSD and toAmountUSD
  const calculatePercentageChange = (
    fromAmountUSD: string,
    toAmountUSD: string
  ): number => {
    const fromUSD = parseFloat(fromAmountUSD)
    const toUSD = parseFloat(toAmountUSD)

    if (fromUSD === 0) return 0

    const percentageChange = ((toUSD - fromUSD) / fromUSD) * 100
    return percentageChange
  }

  const handleToggleConversion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsReversed((prev) => !prev)
  }

  if (!selectedRoute) return null

  const {
    id,
    fromToken,
    toToken,
    fromChainId,
    toChainId,
    fromAmount,
    fromAmountUSD,
    toAmount,
    toAmountUSD,
    gasCostUSD,
    steps,
    toAmountMin,
  } = selectedRoute

  const aggregator = steps[0].toolDetails?.name || steps[0].tool
  const aggregatorLogo = steps[0].toolDetails?.logoURI || ""
  const executionDuration = steps[0].estimate.executionDuration || 0

  const fromAmountFormatted = formatTokenAmount(fromAmount, fromToken.decimals)
  const toAmountFormatted = formatTokenAmount(toAmount, toToken.decimals)
  const detailedSteps = steps.flatMap((step) => step.includedSteps || [step])
  const toggleDropdown = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setOpenDropdownId(openDropdownId === id ? null : id)
  }
  const getChainName = (chainId: number): string => {
    return chains.find((chain) => chain.id === chainId)?.name || "Unknown"
  }

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
  const conversionText = isReversed
    ? `1 ${toToken.symbol} ≈ ${formatTokenAmount(rateToFromFormatted, fromToken.decimals)} ${fromToken.symbol}`
    : `1 ${fromToken.symbol} ≈ ${formatTokenAmount(rateFromToFormatted, toToken.decimals)} ${toToken.symbol}`

  const slippage = steps.map((step) => step.action.slippage)

  // Calculate percentage change
  const percentageChange = calculatePercentageChange(fromAmountUSD, toAmountUSD)
  const isPositive = percentageChange >= 0
  const percentageText = isPositive
    ? `+${percentageChange.toFixed(2)}%`
    : `${percentageChange.toFixed(2)}%`

  const formattedMinAmount = formatTokenAmount(toAmountMin, toToken.decimals)

  return (
    <CardContent className="px-2 xs:px-4 md:px-6 space-y-4 ">
      <div className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 border border-input cursor-default space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold text-black dark:text-white">
            {isBridging ? "Bridge" : "Swap"}
          </span>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span className="text-black dark:text-white">
              {formatTime(executionDuration)}
            </span>
          </div>
        </div>
        {/* From section */}
        <div className="flex items-center space-x-3">
          <TokenWithChainLogo
            token={fromToken}
            chains={chains}
            chainId={fromChainId}
          />
          <div className="flex flex-col">
            <p className="text-lg font-semibold text-black dark:text-white">
              {fromAmountFormatted}
            </p>
            <div className="flex space-x-1 text-xs items-center">
              <p>{`$${Number(toAmountUSD).toFixed(2)}`}</p>
              <Dot />
              <p className=" ">
                {fromToken.symbol} on{" "}
                {chains.find((c) => c.id === fromChainId)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregator */}
        <div className="flex items-center text-sm">
          {aggregatorLogo && (
            <AggregatorLogo
              logoURI={aggregatorLogo}
              className="min-w-11 min-h-11 max-w-11 max-h-11"
            />
          )}
          <span>{aggregator} </span>
          <div className="flex items-center space-x-2 bg-input rounded-full justify-center ml-auto p-1">
            <ChevronDown
              onClick={(e) => toggleDropdown(id, e)}
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                openDropdownId === id && "rotate-180"
              )}
            />
          </div>
        </div>

        {openDropdownId === id && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-3">
            <div className="border-t pt-3 space-y-2">
              {detailedSteps.map((step, stepIndex) => {
                const fromChainId = step.action.fromChainId
                const toChainId = step.action.toChainId
                const fromChainName = getChainName(fromChainId)
                const toChainName = getChainName(toChainId)
                const fromToken = step.action.fromToken
                const toToken = step.action.toToken
                const stepAggregator =
                  step.toolDetails?.name || step.tool || "Unknown"
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

                const formattedStepFromAmount = formatTokenAmount(
                  step.estimate.fromAmount,
                  fromToken.decimals
                )
                const formattedStepToAmount = formatTokenAmount(
                  step.estimate.toAmount,
                  toToken.decimals
                )
                const stepExecutionDuration =
                  step.estimate?.executionDuration || 0
                const formattedTime = formatTime(stepExecutionDuration)

                return (
                  <div
                    key={stepIndex}
                    className="flex items-start space-x-3 p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {stepLogoURI && <AggregatorLogo logoURI={stepLogoURI} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1 truncate">
                        {actionType} ({formattedTime})
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 tracking-tighter">
                        {formattedStepFromAmount} {fromToken.symbol} →{" "}
                        {formattedStepToAmount} {toToken.symbol}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* To section */}
        <div className="flex items-center space-x-3">
          <TokenWithChainLogo
            token={toToken}
            chains={chains}
            chainId={toChainId}
          />
          <div>
            <p className="text-lg font-semibold text-black dark:text-white">
              {toAmountFormatted}
            </p>
            <p className="text-xs">
              ${Number(toAmountUSD).toFixed(2)} • {toToken.symbol} on{" "}
              {chains.find((c) => c.id === toChainId)?.name}
            </p>
          </div>
        </div>
      </div>
      {/* Rates & gas */}
      <div className="bg-white2 dark:bg-secondary-60 rounded-lg  p-3 border border-input cursor-default">
        <div className="flex justify-between items-center">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={handleToggleConversion}
          >
            <p className="hover:text-black dark:hover:text-white duration-100 tracking-tighter text-base">
              {conversionText}
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            {openDropdownId !== "2" && (
              <>
                <Icons.GasIcon className="w-4 h-4" />
                <span className="text-black dark:text-white">
                  ${Number(gasCostUSD).toFixed(2)}
                </span>
              </>
            )}

            <div className="flex items-center space-x-2 bg-input rounded-full justify-center ml-auto p-1 cursor-pointer">
              <ChevronDown
                onClick={(e) => toggleDropdown("2", e)}
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  openDropdownId === "2" && "rotate-180"
                )}
              />
            </div>
          </div>
        </div>

        {openDropdownId === "2" && (
          <div className="mt-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="">Network cost</span>
              <span className="text-black dark:text-white">
                ${Number(gasCostUSD).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="">Price Impact</span>
              <span className="text-black dark:text-white">
                {percentageText}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="">Max. slippage</span>
              <span className="text-black dark:text-white">
                {slippage && slippage}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="">Min. received</span>
              <span className="text-black dark:text-white">
                {formattedMinAmount}
              </span>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  )
}

export default SelectedRoute
