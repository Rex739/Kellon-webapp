"use client"

import { useState, useEffect, useCallback, FC, HtmlHTMLAttributes } from "react"
import {
  getTokens,
  getRoutes,
  executeRoute,
  getTokenAllowance,
  setTokenAllowance,
  RoutesRequest,
  Route,
  Token,
  TokensResponse,
  RoutesResponse,
} from "@lifi/sdk"
import { useQuery } from "@tanstack/react-query"
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi"
import { parseUnits } from "viem"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileClock, RotateCw, Settings } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  sendAmountFormSchema,
  SendAmountFormSchemaType,
} from "@/lib/validations/form"
import { useSupportedChains } from "@/hooks/useSupportedChains"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import ChainSelect from "./ChainSelect"
import SwapBox from "./SwapBox"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import SendAmount from "./SendAmount"
import { Icons } from "@/components/Icons"
import RouteOptions from "./RouteOptions"
import { useDebounce } from "@/hooks/useDebounce"
import SelectedRoute from "./SelectedRoute"
import NoRoutesAvailable from "./noRoutesAvalibale"
import { RouteOptionSkeleton } from "@/components/Skeletons"

type SwapInterfaceProps = HtmlHTMLAttributes<HTMLDivElement>

const SwapInterface: FC<SwapInterfaceProps> = ({ className }) => {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Chains (as numbers)
  const fromChain = searchParams.get("fromChain")
    ? Number(searchParams.get("fromChain"))
    : 0 // default ETH
  const toChain = searchParams.get("toChain")
    ? Number(searchParams.get("toChain"))
    : 0 // default Polygon

  // Tokens (as addresses)
  const fromTokenAddress = searchParams.get("fromToken")
  const toTokenAddress = searchParams.get("toToken")

  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [isBridging, setIsBridging] = useState(false)
  const { chains } = useSupportedChains()
  const [isChainSelectOpen, setIsChainSelectOpen] = useState<boolean>(false)
  const [selectingSide, setSelectingSide] = useState<"from" | "to" | null>(null)
  const [isRefetched, setIsRefetched] = useState(false)
  const [routesQueryExecuted, setRoutesQueryExecuted] = useState(false) // Track if getRoutes was called
  // ✅ Form with zod
  const form = useForm<SendAmountFormSchemaType>({
    resolver: zodResolver(sendAmountFormSchema),
    defaultValues: {
      sendAmount: "",
    },
  })

  const fromAmount = form.watch("sendAmount")
  const debouncedFromAmount = useDebounce(fromAmount, 1000) // 1 second debounce

  // Fetch tokens
  const { data: fromTokensData, isLoading: fromTokensLoading } =
    useQuery<TokensResponse>({
      queryKey: ["fromTokens", fromChain],
      queryFn: async () => await getTokens({ chains: [fromChain] }),
      staleTime: 45_000,
      gcTime: 1000 * 60 * 10,
    })

  const { data: toTokensData, isLoading: toTokensLoading } =
    useQuery<TokensResponse>({
      queryKey: ["toTokens", toChain],
      queryFn: async () => await getTokens({ chains: [toChain] }),
      staleTime: 45_000,
      gcTime: 1000 * 60 * 10,
    })

  useEffect(() => {
    if (fromTokensData?.tokens[fromChain]) {
      const chainTokens = fromTokensData.tokens[fromChain]
      const token = chainTokens.find((t) => t.address === fromTokenAddress)
      const native = chainTokens.find(
        (t) => t.address === "0x0000000000000000000000000000000000000000"
      )
      setFromToken(token || native || chainTokens[0])
    }
  }, [fromTokensData, fromChain, fromTokenAddress])

  useEffect(() => {
    if (toTokensData?.tokens[toChain]) {
      const chainTokens = toTokensData.tokens[toChain]
      const token = chainTokens.find((t) => t.address === toTokenAddress)
      const native = chainTokens.find(
        (t) => t.address === "0x0000000000000000000000000000000000000000"
      )
      setToToken(token || native || chainTokens[0])
    }
  }, [toTokensData, toChain, toTokenAddress])

  // Fetch routes with React Query
  const {
    data: routesData,
    isLoading: routesLoading,
    refetch: refetchRoutes,
    error: routesError,
  } = useQuery({
    queryKey: [
      "routes",
      fromChain,
      toChain,
      fromToken?.address,
      toToken?.address,
      debouncedFromAmount,
      address,
    ],
    queryFn: async (): Promise<RoutesResponse | { routes: never[] }> => {
      if (
        !fromToken ||
        !toToken ||
        !debouncedFromAmount ||
        parseFloat(debouncedFromAmount) <= 0 ||
        !address
      ) {
        return { routes: [] }
      }

      const request: RoutesRequest = {
        fromChainId: fromChain,
        fromTokenAddress: fromToken.address,
        fromAmount: parseUnits(
          debouncedFromAmount,
          fromToken.decimals
        ).toString(),
        toChainId: toChain,
        toTokenAddress: toToken.address,
        fromAddress: address,
        toAddress: address,
        options: {
          integrator: "Kellon",
          slippage: 0.005,
          fee: 0.002,
          order: "CHEAPEST",
          insurance: true,
          allowSwitchChain: false,
          maxPriceImpact: 0.1,
        },
      }
      setRoutesQueryExecuted(true) // Mark that getRoutes was called
      return await getRoutes(request)
    },
    enabled: Boolean(
      fromToken &&
        toToken &&
        debouncedFromAmount &&
        parseFloat(debouncedFromAmount) > 0 &&
        address
    ),
    staleTime: 30_000, // 30 seconds
    retry: 2,
  })

  const handleRouteSelect = useCallback((route: Route) => {
    setSelectedRoute(route)
  }, [])

  // Handle routes errors
  useEffect(() => {
    if (routesError) {
      console.error("Error fetching routes:", routesError)
      toast.error("Failed to fetch routes")
    }
  }, [routesError])

  const routes = routesData?.routes || []

  // Execute swap
  const executeSwap = async () => {
    if (!selectedRoute || !address || !fromToken || !walletClient) return
    setIsBridging(true)

    try {
      if (chainId !== fromChain) {
        await switchChain({ chainId: fromChain })
      }

      const requiredAmount = parseUnits(debouncedFromAmount, fromToken.decimals)

      const allowance = await getTokenAllowance(
        fromToken,
        address,
        selectedRoute.steps[0].estimate.approvalAddress as `0x${string}`
      )

      if (allowance === undefined || allowance < requiredAmount) {
        toast.loading("Approving token...")

        try {
          await setTokenAllowance({
            walletClient,
            token: fromToken,
            spenderAddress: selectedRoute.steps[0].estimate
              .approvalAddress as `0x${string}`,
            amount: requiredAmount,
            infiniteApproval: false,
          })
          toast.success("Approval successful ✅")
        } catch (err) {
          toast.error("Approval failed ❌")
          setIsBridging(false)
          return
        } finally {
          toast.dismiss()
        }
      }

      await executeRoute(selectedRoute, {
        updateRouteHook: (updatedRoute) => {
          console.log("updatedRoute", updatedRoute)
        },
      })
    } catch (error) {
      console.error("Swap error:", error)
      toast.error("Transaction failed")
    } finally {
      setIsBridging(false)
    }
  }

  const handleChainSelectOpen = (side: "from" | "to") => {
    setSelectingSide(side)
    setIsChainSelectOpen(!isChainSelectOpen)
  }

  const swapChains = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("fromChain", toChain.toString())
    params.set("toChain", fromChain.toString())

    if (fromToken) params.set("toToken", fromToken.address)
    if (toToken) params.set("fromToken", toToken.address)

    router.push(`/?${params.toString()}`)
  }

  const isBridge =
    (selectedRoute &&
      selectedRoute.steps.some((step) =>
        step.includedSteps.some((includedStep) => includedStep.type === "cross")
      )) ||
    fromChain !== toChain

  const isRouteOptionsActive = routes?.length > 0

  const handleRefetchRoute = () => {
    setIsRefetched((prev) => !prev)
    refetchRoutes()
  }

  const isModifyBorderRadius =
    isRouteOptionsActive ||
    routesLoading ||
    (routesQueryExecuted && !routesLoading && fromAmount !== "")

  return (
    <section className={cn(className)}>
      {isChainSelectOpen ? (
        <ChainSelect
          side={selectingSide!}
          selectedChain={selectingSide === "from" ? fromChain : toChain}
          handleChainSelectOpen={handleChainSelectOpen}
          tokens={
            selectingSide === "from"
              ? fromTokensData?.tokens[fromChain]
              : toTokensData?.tokens[toChain]
          }
          loading={
            selectingSide === "from" ? fromTokensLoading : toTokensLoading
          }
          selectedToken={selectingSide === "from" ? fromToken : toToken}
        />
      ) : (
        <div className=" lg:flex space-x-1">
          <Card
            className={cn(
              "w-[90dvw] xm:max-w-[350px] md:max-w-[414px] lg:w-md xl:max-w-lg mx-auto bg-white dark:bg-secondary-10 rounded-2xl text-gray-20 dark:text-gray-40 border-input  px-0!",
              isModifyBorderRadius && !selectedRoute && "lg:rounded-r-none"
            )}
          >
            {/* Header */}
            <CardHeader className="px-2 xs:px-4 md:px-6">
              {selectedRoute ? (
                <div className="flex justify-between items-center text-black dark:text-white">
                  <ArrowLeft
                    onClick={() => setSelectedRoute(null)}
                    className="cursor-pointer"
                  />
                  <CardTitle className="text-xl font-semibold">
                    {isBridge ? "Review bridge" : "Review swap"}
                  </CardTitle>
                  <RotateCw
                    onClick={handleRefetchRoute}
                    className={cn(
                      "w-5 h-5 cursor-pointer",
                      isRefetched && "rotate-360 duration-300"
                    )}
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center text-black dark:text-white">
                  <CardTitle className="text-xl font-semibold ">Swap</CardTitle>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <FileClock className="w-5 h-5" />
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Content */}

            {selectedRoute ? (
              <SelectedRoute
                selectedRoute={selectedRoute}
                chains={chains}
                isBridging={isBridge}
              />
            ) : (
              <CardContent className="px-2 xs:px-4 md:px-6 relative">
                <div className="relative space-y-2">
                  {/* From + To Section */}
                  <SwapBox
                    chains={chains}
                    fromChain={fromChain}
                    toChain={toChain}
                    fromToken={fromToken}
                    toToken={toToken}
                    handleChainSelectOpen={handleChainSelectOpen}
                  />

                  {/* Switch Button */}
                  <button
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg z-10 bg-white dark:bg-secondary-60 border-3 border-white1 dark:border-secondary-10 h-9 w-17 lg:h-12 lg:w-20 flex items-center justify-center ring ring-inset ring-input dark:ring-input cursor-pointer group"
                    onClick={swapChains}
                  >
                    <Icons.ArrowUpDown className="h-6 w-6 text-black dark:text-white group-hover:rotate-180 group-hover:duration-300" />
                  </button>
                </div>

                {/* send */}
                <SendAmount
                  fromChain={fromChain}
                  fromToken={fromToken}
                  toToken={toToken}
                  chains={chains}
                  form={form}
                />
              </CardContent>
            )}

            {/* Footer */}
            <CardFooter className="px-2 xs:px-4 md:px-6 pt-4">
              <Button
                className={cn(
                  "w-full text-white",
                  !selectedRoute ||
                    !isConnected ||
                    (isBridging && "cursor-not-allowed")
                )}
                variant="blue"
                size="lg"
                onClick={executeSwap}
                disabled={
                  !selectedRoute || !isConnected || isBridging || routesLoading
                }
                isLoading={isBridging || routesLoading}
              >
                {routesLoading ? "Finding routes..." : "Swap"}
              </Button>
            </CardFooter>
          </Card>
          {/* Route Options or Skeleton or NoRoutesAvailable */}
          {routesLoading ? (
            <Card
              className={
                "w-[90dvw] xm:max-w-[350px] md:max-w-[414px] lg:w-md xl:max-w-lg mx-auto bg-white dark:bg-secondary-10 rounded-2xl lg:rounded-l-none text-gray-20 dark:text-gray-40 border-input"
              }
            >
              <CardContent className="p-4 space-y-3">
                {[...Array(3)].map((_, index) => (
                  <RouteOptionSkeleton key={`route-skeleton-${index}`} />
                ))}
              </CardContent>
            </Card>
          ) : routes?.length > 0 && !selectedRoute ? (
            <RouteOptions
              routes={routes}
              chains={chains}
              onRouteSelect={handleRouteSelect}
              handleRefetchRoute={handleRefetchRoute}
              isRefetched={isRefetched}
            />
          ) : routesQueryExecuted &&
            !selectedRoute &&
            !routesLoading &&
            fromAmount !== "" ? (
            <NoRoutesAvailable
              onRetry={refetchRoutes}
              isLoading={routesLoading}
              className={cn(isModifyBorderRadius && "lg:rounded-l-none")}
            />
          ) : null}
        </div>
      )}
    </section>
  )
}

export default SwapInterface
