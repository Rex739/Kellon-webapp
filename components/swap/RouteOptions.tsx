import { FC, useState } from "react"
import { CardContent } from "@/components/ui/card"
import {
  calculateConversion,
  calculatePriceImpact,
  extractRouteData,
  getAggregatorInfo,
  getPriceImpactText,
  getStepDetails,
} from "@/lib/routeHelpers"
import TokenWithChainLogo from "./TokenWithChainLogo"
import { useFormatTokenAmount } from "@/hooks/useFormatTokenAmount"
import { formatUSD } from "@/lib/formatNumber"
import { ChevronDown, Clock } from "lucide-react"
import { Icons } from "@/components/Icons"
import { formatTime } from "@/lib/formatTime"
import { ExtendedChain, Route } from "@lifi/sdk"
import Dot from "@/components/ui/dot"
import AggregatorLogo from "./AggregatorLogo"
import { cn } from "@/lib/utils"

interface RouteOptionsProps {
  routes: Route[]
  chains: ExtendedChain[]
  onRouteSelect: (route: Route) => void
  showAllRoutes: boolean
  toggleShowAllRoutes: () => void
}

const RouteOptions: FC<RouteOptionsProps> = ({
  routes,
  chains,
  onRouteSelect,
  showAllRoutes,
  toggleShowAllRoutes,
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

  const handleRouteSelect = (route: Route) => {
    onRouteSelect(route)
    if (showAllRoutes) toggleShowAllRoutes()
  }

  return (
    <CardContent className="px-2 xs:px-4 md:px-6 relative space-y-2 max-h-[420px] overflow-y-auto">
      {routes.map((route) => {
        const routeData = extractRouteData(route)
        const { aggregator, logoURI, executionDuration } =
          getAggregatorInfo(route)
        const {
          id,
          toToken,
          toChainId,
          toAmountUSD,
          toAmount,
          gasCostUSD,
          fromAmount,
          fromToken,
          fromAmountUSD,
        } = routeData

        const priceImpact = calculatePriceImpact(fromAmountUSD, toAmountUSD)
        const priceImpactText = getPriceImpactText(priceImpact)

        const conversionText = calculateConversion(
          fromAmount,
          toAmount,
          fromToken,
          toToken,
          isReversed
        )

        const detailedSteps = route.steps.flatMap(
          (step) => step.includedSteps || [step]
        )

        return (
          <div
            key={id}
            className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 border border-input cursor-pointer space-y-2"
            onClick={() => handleRouteSelect(route)}
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
                      <span>{formatUSD(toAmountUSD)}</span>
                      <Dot />
                      <span>{priceImpactText}</span>
                      <Dot />
                      {logoURI && <AggregatorLogo logoURI={logoURI} />}
                      <span className="truncate max-w-[60px] xs:max-w-[80px] lg:max-w-full ">
                        {aggregator}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Dropdown icon */}
                <div className="flex-shrink-0">
                  <div className="flex items-center bg-input rounded-full justify-center p-1">
                    <ChevronDown
                      onClick={(e) => toggleDropdown(id, e)}
                      className={cn(
                        "w-4 h-4 transition-transform duration-200 flex-shrink-0",
                        openDropdownId === id && "rotate-180"
                      )}
                    />
                  </div>
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
                        fromToken
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
                          {stepLogoURI && (
                            <AggregatorLogo logoURI={stepLogoURI} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1  flex-1 flex-wrap">
                              {actionType}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-tighter">
                              {formattedFromAmount}
                              {step.action.fromToken.symbol} →{" "}
                              {formattedToAmount} {step.action.toToken.symbol}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={cn("flex justify-between text-sm")}>
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
  )
}

export default RouteOptions
