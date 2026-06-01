"use client"

import { useEffect, useMemo, useState } from "react"
import { useDetectCountry } from "@/hooks/use-detect-country"
import { useExchangeRate } from "@/hooks/use-exchange-rate"
import {
  COUNTRY_CURRENCY_MAP,
  getCurrencySymbol,
} from "@/lib/country-currency-map"
import priceService from "@/services/price-service"
import { transactionService } from "@/services/api/transactions"
import type { Asset, Transaction, User } from "@/types/db"
import type { DisplayCurrency, GroupedAssetSummary } from "./dashboard-types"
import {
  DEFAULT_TOKEN_PRICE,
  formatCurrencyAmount,
  getAssetName,
  parseAssetAmount,
} from "./dashboard-utils"

const FIAT_CURRENCIES = new Set(Object.values(COUNTRY_CURRENCY_MAP))

export function useDashboardData(profile: User) {
  const { countryCode, currencyCode, flag, isDetecting } = useDetectCountry()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [displayCurrency, setDisplayCurrency] =
    useState<DisplayCurrency>("LOCAL")
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [isPricesLoading, setIsPricesLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>(
    profile.transactions || [],
  )
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  )

  const localCurrency = currencyCode || "USD"
  const { exchangeRate, isRateLoading } = useExchangeRate(localCurrency, null)

  const rawAssets = useMemo(
    () => (profile?.assets || []).filter((asset): asset is Asset => !!asset),
    [profile?.assets],
  )

  const cryptoAssets = useMemo(
    () =>
      rawAssets.filter(
        (asset) => !FIAT_CURRENCIES.has(asset.symbol.toUpperCase()),
      ),
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
        setIsPricesLoading(false)
        return
      }

      const symbols = assetSymbolsKey.split(",").filter(Boolean)
      setIsPricesLoading(true)

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

        const fallbackPrices = symbols.reduce<Record<string, number>>(
          (accumulator, symbol) => {
            accumulator[symbol.toUpperCase()] = DEFAULT_TOKEN_PRICE
            return accumulator
          },
          {},
        )

        setTokenPrices(fallbackPrices)
      } finally {
        if (!isCancelled) {
          setIsPricesLoading(false)
        }
      }
    }

    loadPrices()

    return () => {
      isCancelled = true
    }
  }, [assetSymbolsKey])

  useEffect(() => {
    let isCancelled = false

    const loadTransactions = async () => {
      setIsTransactionsLoading(true)
      setTransactionsError(null)

      try {
        const response = await transactionService.getTransactions()
        if (isCancelled) return

        setTransactions(response.data || [])
      } catch (error) {
        if (isCancelled) return

        setTransactionsError(
          error instanceof Error ? error.message : "Failed to load activity",
        )
      } finally {
        if (!isCancelled) {
          setIsTransactionsLoading(false)
        }
      }
    }

    loadTransactions()

    return () => {
      isCancelled = true
    }
  }, [])

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

  const totalNetworks = useMemo(() => {
    const allChains = new Set<string>()

    rawAssets.forEach((asset) => {
      if (asset.chain) allChains.add(asset.chain)
    })

    return allChains.size
  }, [rawAssets])

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 5),
    [transactions],
  )

  const isLocalDisplay = displayCurrency === "LOCAL"
  const activeCurrency = isLocalDisplay ? localCurrency : "USD"
  const activeBalance = isLocalDisplay ? totalLocalBalance : totalUsdBalance
  const secondaryBalance = isLocalDisplay ? totalUsdBalance : totalLocalBalance
  const secondaryCurrency = isLocalDisplay ? "USD" : localCurrency
  const canToggleCurrency = localCurrency !== "USD"
  const isPortfolioLoading = isDetecting || isRateLoading || isPricesLoading
  const isAssetValueLoading = isRateLoading || isPricesLoading

  return {
    activeBalanceLabel: formatCurrencyAmount(activeBalance, activeCurrency),
    activeCurrency,
    assetCountLabel: `${groupedAssets.length} asset${groupedAssets.length === 1 ? "" : "s"}`,
    canToggleCurrency,
    countryCode,
    displayCurrency,
    flag,
    groupedAssets,
    hiddenActiveBalanceLabel: `${getCurrencySymbol(activeCurrency)}••••••`,
    hiddenSecondaryBalanceLabel: `${getCurrencySymbol(secondaryCurrency)}••••••`,
    isAssetValueLoading,
    isBalanceVisible,
    isDetecting,
    isLocalDisplay,
    isPortfolioLoading,
    localCurrency,
    portfolioLabel: `Available Balance (${activeCurrency})`,
    recentTransactions,
    secondaryBalanceLabel: formatCurrencyAmount(
      secondaryBalance,
      secondaryCurrency,
    ),
    setDisplayCurrency,
    setIsBalanceVisible,
    totalNetworks,
    isTransactionsLoading,
    transactionsError,
  }
}
