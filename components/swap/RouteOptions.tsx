"use client"

import { FC, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { RotateCw, ChevronDown, Clock } from "lucide-react"
import { ExtendedChain, Route } from "@lifi/sdk"
import TokenWithChainLogo from "./TokenWithChainLogo"
import { cn } from "@/lib/utils"
import { useFormatTokenAmount } from "@/hooks/useFormatTokenAmount"
import { Icons } from "@/components/Icons"
import { formatTime } from "@/lib/formatTime"
import AggregatorLogo from "./AggregatorLogo"
import Dot from "@/components/ui/dot"

interface RouteOptionsProps {
  routes: Route[]
  chains: ExtendedChain[]
  onRouteSelect: (route: Route) => void
  isRefetched: boolean
  handleRefetchRoute: () => void
}

const RouteOptions: FC<RouteOptionsProps> = ({
  routes,
  chains,
  isRefetched,
  handleRefetchRoute,
  onRouteSelect,
}) => {

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const { formatTokenAmount } = useFormatTokenAmount()
  const [isReversed, setIsReversed] = useState(false)



  const toggleDropdown = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const handleToggleConversion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsReversed((prev) => !prev)
  }

  const getChainName = (chainId: number): string => {
    return chains.find((chain) => chain.id === chainId)?.name || "Unknown"
  }

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

  return (
    <Card className="hidden lg:flex w-md xl:max-w-lgbg-white dark:bg-secondary-10 rounded-2xl lg:rounded-l-none text-gray-20 dark:text-gray-40 border-input px-0!">
      <CardHeader className="px-2 xs:px-4 md:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-black dark:text-white">
            Receive
          </CardTitle>
          <RotateCw
            onClick={handleRefetchRoute}
            className={cn(
              "w-5 h-5 cursor-pointer",
              isRefetched && "rotate-360 duration-300"
            )}
          />
        </div>
      </CardHeader>
      <CardContent className="px-2 xs:px-4 md:px-6 relative space-y-2 max-h-[420px] overflow-y-auto">
        {routes.map((route) => {
          const {
            id,
            toToken,
            toChainId,
            toAmountUSD,
            toAmount,
            steps,
            gasCostUSD,
            fromAmount,
            fromToken,
            fromAmountUSD,
          } = route

          const aggregator = steps[0].toolDetails.name || steps[0].tool
          const logoURI = steps[0].toolDetails.logoURI || ""
          const executionDuration = steps[0].estimate.executionDuration || 0

          // Calculate percentage change
          const percentageChange = calculatePercentageChange(
            fromAmountUSD,
            toAmountUSD
          )
          const isPositive = percentageChange >= 0
          const percentageText = isPositive
            ? `+${percentageChange.toFixed(2)}%`
            : `${percentageChange.toFixed(2)}%`


          const fromAmountBigInt = BigInt(fromAmount)
          const toAmountBigInt = BigInt(toAmount)

          const fromAmountNum =
            Number(fromAmountBigInt) / Math.pow(10, fromToken.decimals)
          const toAmountNum =
            Number(toAmountBigInt) / Math.pow(10, toToken.decimals)

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

          const detailedSteps = steps.flatMap(
            (step) => step.includedSteps || [step]
          )

          return (
            <div
              key={id}
              className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 border border-input cursor-pointer"
              onClick={() => onRouteSelect(route)}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TokenWithChainLogo
                      token={toToken}
                      chains={chains}
                      chainId={toChainId}
                    />
                    <div className="flex flex-col">
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {formatTokenAmount(toAmount, toToken.decimals)}
                      </p>

                      <div className="flex space-x-1 text-xs items-center">
                        <span>{`$${Number(toAmountUSD).toFixed(2)}`}</span>
                        <Dot />
                        <span className={cn("font-medium")}>
                          {percentageText}
                        </span>
                        <Dot />
                        {logoURI && <AggregatorLogo logoURI={logoURI} />}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {aggregator}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-input rounded-full justify-center p-1">
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
                            {stepLogoURI && (
                              <AggregatorLogo logoURI={stepLogoURI} />
                            )}
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

                <div className="flex justify-between text-sm">
                  <span
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={handleToggleConversion}
                  >
                    <p className="hover:text-black dark:hover:text-white duration-100 tracking-tighter">
                      {conversionText}
                    </p>
                  </span>
                  <div className="flex">
                    <span className="flex items-center space-x-1 ml-2">
                      <Icons.GasIcon className="w-4 h-4" />
                      <p className="text-black dark:text-white">{`$${Number(gasCostUSD).toFixed(2)}`}</p>
                    </span>
                    <span className="flex items-center space-x-1 ml-2">
                      <Clock className="w-4 h-4" />
                      <p className="text-black dark:text-white">
                        {formatTime(executionDuration)}
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default RouteOptions
