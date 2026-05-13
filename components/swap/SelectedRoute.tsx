"use client"

import { FC, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { ChevronDown, Clock } from "lucide-react"
import { Route, ExtendedChain } from "@lifi/sdk"
import TokenWithChainLogo from "./TokenWithChainLogo"
import { useFormatTokenAmount } from "@/hooks/use-format-token-amount"
import { Icons } from "@/components/Icons"
import AggregatorLogo from "./AggregatorLogo"
import Dot from "@/components/ui/dot"
import { cn } from "@/lib/utils"
import { formatUSD } from "@/lib/format-number"
import {
  calculatePriceImpact,
  getPriceImpactText,
  calculateConversion,
  getStepDetails,
  getAggregatorInfo,
  extractRouteData,
  getChainName,
} from "@/lib/route-helpers"
import { formatTime } from "@/lib/format-time"

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

  const handleToggleConversion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsReversed((prev) => !prev)
  }

  const toggleDropdown = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  if (!selectedRoute) return null

  const routeData = extractRouteData(selectedRoute)
  const { aggregator, logoURI, executionDuration } =
    getAggregatorInfo(selectedRoute)
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
  } = routeData

  const fromAmountFormatted = formatTokenAmount(fromAmount, fromToken.decimals)
  const toAmountFormatted = formatTokenAmount(toAmount, toToken.decimals)
  const detailedSteps = steps.flatMap((step) => step.includedSteps || [step])
  const formattedMinAmount = formatTokenAmount(toAmountMin, toToken.decimals)

  const priceImpact = calculatePriceImpact(fromAmountUSD, toAmountUSD)
  const priceImpactText = getPriceImpactText(priceImpact)

  const conversionText = calculateConversion(
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    isReversed,
  )

  const slippage = steps.map((step) => step.action.slippage)

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
              <p>{formatUSD(fromAmountUSD)}</p>
              <Dot />
              <p className="flex flex-wrap ">
                {fromToken.symbol} on {getChainName(fromChainId, chains)}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregator */}
        <div className="flex items-center text-sm">
          {logoURI && (
            <AggregatorLogo
              logoURI={logoURI}
              className="min-w-10 min-h-10 max-w-10 max-h-10 lg:min-w-11 lg:min-h-11 lg:max-w-11 lg:max-h-11"
            />
          )}
          <span className="text-lg font-semibold text-black dark:text-white">
            {aggregator}
          </span>
          <div className="flex items-center space-x-2 bg-input rounded-full justify-center ml-auto p-1 cursor-pointer">
            <ChevronDown
              onClick={(e) => toggleDropdown(id, e)}
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                openDropdownId === id && "rotate-180",
              )}
            />
          </div>
        </div>

        {openDropdownId === id && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-3">
            <div className="border-t pt-3 space-y-2">
              {detailedSteps.map((step, stepIndex) => {
                const stepDetails = getStepDetails(
                  step,
                  chains,
                  fromAmount,
                  fromToken,
                )
                if (!stepDetails) return null

                const {
                  actionType,
                  formattedFromAmount,
                  formattedToAmount,
                  stepLogoURI,
                } = stepDetails

                return (
                  <div
                    key={stepIndex}
                    className="flex items-start space-x-3 p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {stepLogoURI && <AggregatorLogo logoURI={stepLogoURI} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">
                        {actionType}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 tracking-tighter">
                        {formattedFromAmount} {step.action.fromToken.symbol} →
                        {formattedToAmount} {step.action.toToken.symbol}
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
            <div className="flex flex-wrap space-x-1 text-xs items-center">
              <p className="">{formatUSD(toAmountUSD)}</p>
              <Dot />
              <p>{priceImpactText}</p>
              <Dot />
              <p>
                {toToken.symbol} on {getChainName(toChainId, chains)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Rates & gas */}
      <div className="bg-white2 dark:bg-secondary-60 rounded-lg  p-3 border border-input cursor-default">
        <div className="flex justify-between items-center text-sm">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={handleToggleConversion}
          >
            <p className="hover:text-black dark:hover:text-white duration-100 tracking-tighter ">
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
                  openDropdownId === "2" && "rotate-180",
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
                {priceImpactText}
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
