"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import NotificationBell from "@/components/notification/NotificationBell"
import AddFundsModal from "@/components/modals/AddFundsModal"
import { useDetectCountry } from "@/hooks/use-detect-country"
import { useExchangeRate } from "@/hooks/use-exchange-rate"
import {
  getCurrencyDecimals,
  getCurrencySymbol,
  COUNTRY_CURRENCY_MAP,
} from "@/lib/country-currency-map"
import { formatNumber } from "@/lib/format-number"
import { cn, getGreeting } from "@/lib/utils"
import priceService from "@/services/price-service"
import { Asset, User } from "@/types/db"
import AssetCard from "./AssetCard"
import QuickAction from "./QuickAction"

interface DashboardClientProps {
  profile: User
}

interface GroupedAssetSummary {
  symbol: string
  name: string
  amount: number
  usdValue: number
  localValue: number
  chainCount: number
  primaryChain: string | null
}

const ASSET_LABELS: Record<string, string> = {
  USDC: "USD Coin",
  USDT: "Tether USD",
}

const DEFAULT_TOKEN_PRICE = 1

function parseAssetAmount(amount: Asset["amount"]): number {
  const parsed = typeof amount === "string" ? Number(amount) : amount
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrencyAmount(value: number, currency: string): string {
  const decimals = getCurrencyDecimals(currency)
  const symbol = getCurrencySymbol(currency)
  const absoluteValue = Math.abs(value)
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absoluteValue)

  if (currency === "USD") {
    return `${value < 0 ? "-" : ""}${symbol}${formattedNumber}`
  }

  return `${value < 0 ? "-" : ""}${symbol}${formattedNumber}`
}

function formatAssetAmount(value: number): string {
  return formatNumber(value, {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })
}

function getAssetName(symbol: string): string {
  return ASSET_LABELS[symbol] || symbol
}

export default function DashboardClient({ profile }: DashboardClientProps) {
  const { countryCode, currencyCode, flag, isDetecting } = useDetectCountry()
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState<"LOCAL" | "USD">(
    "LOCAL",
  )
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})

  const greeting = getGreeting()
  const localCurrency = currencyCode || "USD"
  const { exchangeRate, isRateLoading } = useExchangeRate(localCurrency, null)
  // Build a Set of all fiat currency codes from the country map
  const FIAT_CURRENCIES = new Set(Object.values(COUNTRY_CURRENCY_MAP))

  const rawAssets = useMemo(
    () => (profile?.assets || []).filter((asset): asset is Asset => !!asset),
    [profile?.assets],
  )

  const cryptoAssets = useMemo(
    () =>
      rawAssets.filter(
        (asset) => !FIAT_CURRENCIES.has(asset.symbol.toUpperCase()),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawAssets],
  )

  const assetSymbolsKey = useMemo(
    () =>
      Array.from(
        new Set(cryptoAssets.map((asset) => asset.symbol.toUpperCase())),
      ).join(","),
    [cryptoAssets],
  )

  useEffect(() => {
    let isCancelled = false

    const loadPrices = async () => {
      if (!assetSymbolsKey) {
        setTokenPrices({})
        return
      }

      const symbols = assetSymbolsKey.split(",").filter(Boolean)

      try {
        const prices = await priceService.getMultipleTokenPrices(symbols)
        if (isCancelled) return

        const nextPrices = symbols.reduce<Record<string, number>>(
          (accumulator, symbol) => {
            const normalizedSymbol = symbol.toUpperCase()
            accumulator[normalizedSymbol] =
              prices[symbol] || prices[normalizedSymbol] || DEFAULT_TOKEN_PRICE
            return accumulator
          },
          {},
        )

        setTokenPrices(nextPrices)
      } catch {
        if (isCancelled) return

        const fallbackPrices = assetSymbolsKey
          .split(",")
          .filter(Boolean)
          .reduce<Record<string, number>>((accumulator, symbol) => {
            accumulator[symbol.toUpperCase()] = DEFAULT_TOKEN_PRICE
            return accumulator
          }, {})

        setTokenPrices(fallbackPrices)
      }
    }

    loadPrices()

    return () => {
      isCancelled = true
    }
  }, [assetSymbolsKey])

  const groupedAssets = useMemo<GroupedAssetSummary[]>(() => {
    const grouped = new Map<
      string,
      {
        amount: number
        chains: Set<string>
      }
    >()

    cryptoAssets.forEach((asset) => {
      const symbol = asset.symbol.toUpperCase()
      const currentEntry = grouped.get(symbol) || {
        amount: 0,
        chains: new Set<string>(),
      }

      currentEntry.amount += parseAssetAmount(asset.amount)
      if (asset.chain) {
        currentEntry.chains.add(asset.chain)
      }

      grouped.set(symbol, currentEntry)
    })

    return Array.from(grouped.entries())
      .map(([symbol, entry]) => {
        const usdPrice = tokenPrices[symbol] || DEFAULT_TOKEN_PRICE
        const usdValue = entry.amount * usdPrice

        return {
          symbol,
          name: getAssetName(symbol),
          amount: entry.amount,
          usdValue,
          localValue: usdValue * exchangeRate,
          chainCount: entry.chains.size,
          primaryChain: entry.chains.values().next().value || null,
        }
      })
      .sort((left, right) => right.usdValue - left.usdValue)
  }, [exchangeRate, cryptoAssets, tokenPrices])

  const totalUsdBalance = useMemo(
    () =>
      groupedAssets.reduce(
        (runningTotal, asset) => runningTotal + asset.usdValue,
        0,
      ),
    [groupedAssets],
  )

  const totalLocalBalance = useMemo(
    () =>
      groupedAssets.reduce(
        (runningTotal, asset) => runningTotal + asset.localValue,
        0,
      ),
    [groupedAssets],
  )

  const isLocalDisplay = displayCurrency === "LOCAL"
  const activeCurrency = isLocalDisplay ? localCurrency : "USD"
  const activeBalance = isLocalDisplay ? totalLocalBalance : totalUsdBalance
  const secondaryBalance = isLocalDisplay ? totalUsdBalance : totalLocalBalance
  const secondaryCurrency = isLocalDisplay ? "USD" : localCurrency
  const canToggleCurrency = localCurrency !== "USD"

  const portfolioLabel = `Portfolio Balance (${activeCurrency})`
  const activeBalanceLabel = formatCurrencyAmount(activeBalance, activeCurrency)
  const secondaryBalanceLabel = formatCurrencyAmount(
    secondaryBalance,
    secondaryCurrency,
  )
  const marketRateLabel =
    localCurrency === "USD"
      ? "1 USD = $1.00"
      : `$1 = ${formatCurrencyAmount(exchangeRate, localCurrency)}`
  const assetCountLabel = `${groupedAssets.length} asset${groupedAssets.length === 1 ? "" : "s"}`
  const topAsset = groupedAssets[0]
  const hiddenActiveBalanceLabel = `${getCurrencySymbol(activeCurrency)}••••••`
  const hiddenSecondaryBalanceLabel = `${getCurrencySymbol(secondaryCurrency)}••••••`

  return (
    <div className="container mx-auto w-full max-w-7xl px-4 pb-32 pt-4 md:px-6 md:pb-12 md:pt-28 space-y-6 md:space-y-8">
      {/* ─── Mobile Header ─── */}
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-80 bg-primary-95 transition-all group-hover:border-primary-50 dark:border-white dark:bg-primary-70">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "User"}
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-sm font-bold text-primary-50 dark:text-white">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <Link
            href="/settings/profile"
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-medium capitalize text-gray-20 dark:text-gray-40">
              {greeting}
            </span>
            <span className="text-xs font-semibold leading-tight text-black dark:text-white">
              {(profile && `${profile.name?.split(" ")[0]}!`) || "Guest"}
            </span>
          </Link>
        </div>

        <NotificationBell />
      </div>

      {/* ─── Desktop Header ─── */}
      <div className="hidden items-end justify-between md:flex">
        <div>
          <p className="text-sm font-medium capitalize text-gray-20 dark:text-gray-40">
            {greeting},{" "}
            <span className="text-black dark:text-white">
              {profile?.name?.split(" ")[0] || "Guest"}
            </span>
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-black dark:text-white">
            Dashboard
          </h1>
        </div>
      </div>

      {/* ─── Main Content Wrapper ─── */}
      <div
        className={cn(
          "px-0 py-0 text-gray-20 dark:text-gray-40",
          "rounded-none",
          "md:rounded-lg md:border md:border-input md:bg-gray-99 md:p-4 md:shadow-sm",
          "md:dark:bg-secondary-50/10",
        )}
      >
        <div className="grid md:gap-4 lg:grid-cols-12">
          {/* ─── Balance Card ─── */}
          <section className="flex flex-col items-start space-y-4 md:mb-0 md:block lg:col-span-8">
            <div className="relative flex w-full flex-col items-start space-y-4 overflow-hidden rounded-none bg-transparent p-0 text-left text-gray-20 shadow-none dark:text-gray-40 md:min-h-[360px] md:items-stretch md:justify-between md:rounded-lg md:border md:border-gray-80/80 md:p-8 md:text-left md:text-cryptoNight md:shadow-sm md:dark:border-white/10 md:dark:bg-secondary-40 md:dark:text-white">
              {/* Background Gradient (Desktop Only) */}
              <div className="absolute inset-x-0 top-0 hidden h-32 md:block md:bg-[radial-gradient(circle_at_20%_0%,rgba(167,22,127,0.12),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.65),transparent_30%)] md:dark:bg-[radial-gradient(circle_at_20%_0%,rgba(193,92,165,0.45),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.14),transparent_30%)]" />

              {/* ─── Top Row: Flag, Label, Currency Toggle ─── */}
              <div className="relative flex items-center justify-start gap-3 self-stretch md:justify-between">
                <div className="flex items-center gap-2 rounded-full border border-gray-80 bg-gray-90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-gray-20 dark:border-white/5 dark:bg-secondary-50 dark:text-gray-40 md:border-gray-80 md:bg-white/80 md:py-1.5 md:text-[10px] md:tracking-normal md:backdrop-blur md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/75">
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/5 text-[11px] leading-none dark:border-white/10 md:border-primary-90/40 md:bg-primary-99 md:dark:border-white/20 md:dark:bg-white/5"
                    aria-label={`Detected country ${countryCode}`}
                    title={countryCode}
                  >
                    {flag}
                  </span>
                  {portfolioLabel}
                  {canToggleCurrency && (
                    <button
                      type="button"
                      onClick={() =>
                        setDisplayCurrency((c) =>
                          c === "LOCAL" ? "USD" : "LOCAL",
                        )
                      }
                      className="ml-1 rounded-full border border-gray-80 px-1.5 py-0.5 text-[9px] font-bold text-gray-20 transition hover:border-gray-60 hover:text-cryptoNight dark:border-white/10 dark:text-gray-40 dark:hover:text-white md:border-primary-90/40 md:bg-primary-99 md:text-[8px] md:text-primary-50 md:hover:text-primary-30 md:dark:border-white/10 md:dark:bg-white/5 md:dark:text-primary-80 md:dark:hover:text-primary-90"
                    >
                      {isLocalDisplay ? "USD" : localCurrency}
                    </button>
                  )}
                </div>

                {/* Desktop Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setIsBalanceVisible((s) => !s)}
                  className="hidden rounded-full border border-gray-80 bg-white/80 p-1.5 text-gray-20 transition hover:bg-white hover:text-cryptoNight md:block md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/70 md:dark:hover:bg-white/15 md:dark:hover:text-white"
                  aria-label={
                    isBalanceVisible ? "Hide balances" : "Show balances"
                  }
                >
                  {isBalanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              {/* ─── Center: Market Rate & Balance ─── */}
              <div className="relative flex flex-1 flex-col justify-start self-stretch pt-1 md:justify-center md:pt-0">
                {/* Market Rate Pill */}
                <div className="mb-2 flex w-fit items-center gap-1.5 md:rounded-md md:border md:border-white/5 dark:md:border-white/10 py-1 text-[10px] font-bold uppercase text-primary-40  dark:text-white/75  md:mb-3 md:gap-2 md:px-3 md:py-1 md:text-xs">
                  {isDetecting || isRateLoading
                    ? "Updating..."
                    : marketRateLabel}
                </div>

                {/* Clickable Balance Group */}
                <div
                  className="group cursor-pointer select-none"
                  onClick={() => setIsBalanceVisible((s) => !s)}
                >
                  <div className="flex items-center justify-start gap-3">
                    <h2 className="text-3xl font-bold leading-none  text-cryptoNight transition-opacity group-active:opacity-70 dark:text-white md:max-w-[11ch] md:text-6xl lg:text-7xl">
                      {isBalanceVisible
                        ? activeBalanceLabel
                        : hiddenActiveBalanceLabel}
                    </h2>
                  </div>

                  <p className="mt-1 text-xs font-medium text-gray-20 dark:text-gray-40 md:mt-2 md:max-w-xl md:text-base md:dark:text-white/70">
                    {isBalanceVisible
                      ? secondaryBalanceLabel
                      : hiddenSecondaryBalanceLabel}
                  </p>
                </div>
              </div>

              {/* ─── Desktop Stats Grid ─── */}
              <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:pt-6">
                <div className="rounded-xl border border-gray-80/80 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-tight text-gray-30 dark:text-white/35">
                    Market Rate
                  </p>
                  <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
                    {isDetecting || isRateLoading
                      ? "Updating..."
                      : marketRateLabel}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-80/80 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-tight text-gray-30 dark:text-white/35">
                    Total Holdings
                  </p>
                  <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
                    {assetCountLabel}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-80/80 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-tight text-gray-30 dark:text-white/35">
                    Largest Position
                  </p>
                  <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
                    {topAsset
                      ? `${topAsset.symbol} ${isBalanceVisible ? formatAssetAmount(topAsset.amount) : "••••"}`
                      : "No assets yet"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Quick Actions ─── */}
          <section className="flex items-start justify-start gap-2 xs:gap-3 md:grid md:grid-cols-2 md:content-start md:gap-3 lg:col-span-4">
            <QuickAction
              icon={<Plus size={22} />}
              label="Add Funds"
              onClick={() => setIsAddFundsOpen(true)}
            />
            <QuickAction icon={<ArrowUpRight size={22} />} label="Send" />
            <QuickAction icon={<ArrowUp size={22} />} label="Withdraw" />
            <QuickAction icon={<MoreHorizontal size={22} />} label="More" />
          </section>
        </div>

        {/* ─── Assets & Activity Grid ─── */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-4 md:gap-4 lg:grid-cols-12">
          {/* Assets Column */}
          <div className="space-y-4 md:rounded-lg md:border md:border-input md:bg-white md:p-5 md:dark:bg-secondary-20 lg:col-span-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-normal text-black dark:text-white md:text-xl">
                  My Assets
                </h3>
                <p className="hidden text-sm font-medium text-gray-20 dark:text-gray-40 md:block">
                  Grouped multichain balances from your wallet profile
                </p>
              </div>
            </div>

            {groupedAssets.length > 0 ? (
              <div className="grid gap-3 md:gap-3">
                {groupedAssets.map((asset) => {
                  const cardValue =
                    displayCurrency === "LOCAL"
                      ? asset.localValue
                      : asset.usdValue
                  const subtitle =
                    asset.chainCount > 1
                      ? `${asset.symbol} • Multi-chain`
                      : `${asset.symbol} • ${asset.primaryChain || "single chain"}`

                  return (
                    <AssetCard
                      key={asset.symbol}
                      name={asset.name}
                      symbol={asset.symbol}
                      amount={formatAssetAmount(asset.amount)}
                      value={formatCurrencyAmount(cardValue, activeCurrency)}
                      subtitle={subtitle}
                      hideBalances={!isBalanceVisible}
                      className="py-3 px-4 md:py-4 md:px-5"
                    />
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm font-medium text-gray-500 dark:border-white/5 dark:bg-secondary-40 dark:text-gray-400 md:rounded-lg">
                No assets yet. Once balances land in your wallet, they will be
                grouped here across chains.
              </div>
            )}
          </div>

          {/* Activity Column */}
          <div className="space-y-4 md:rounded-lg md:border md:border-input md:bg-white md:p-5 md:dark:bg-secondary-20 lg:col-span-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-normal text-black dark:text-white md:text-xl">
                  Activity
                </h3>
                <p className="hidden text-sm font-medium text-gray-20 dark:text-gray-40 md:block">
                  Recent wallet movement
                </p>
              </div>
              <button className="text-xs font-semibold text-primary-70 hover:opacity-80 md:text-sm">
                See All
              </button>
            </div>

            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:min-h-[292px] md:rounded-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:mb-5 md:h-14 md:w-14">
                <Clock
                  size={24}
                  className="text-gray-400 dark:text-gray-600 md:h-7 md:w-7"
                />
              </div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
                No transactions yet
              </h4>
              <p className="max-w-[180px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
                Your financial journey starts with your first deposit.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={setIsAddFundsOpen} />
    </div>
  )
}
