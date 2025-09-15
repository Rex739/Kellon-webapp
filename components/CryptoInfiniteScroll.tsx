"use client"
import { FC, HtmlHTMLAttributes, useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Define the skeleton item component
const SkeletonItem: FC = () => {
  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 mx-1 bg-white/90 dark:bg-gray-800/90 rounded-none border border-gray-200/30 dark:border-gray-700/30 min-w-[120px] text-xs">
      {/* Rank Circle Skeleton */}
      <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>

      {/* Image Placeholder Skeleton */}
      <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse"></div>

      {/* Text Content Skeleton */}
      <div className="min-w-0 flex-1 flex items-center space-x-1">
        {/* Symbol Placeholder */}
        <div className="h-3 bg-gray-300 rounded w-10 animate-pulse"></div>
        {/* Price Placeholder */}
        <div className="h-3 bg-gray-300 rounded w-14 animate-pulse"></div>
        {/* Percentage Placeholder */}
        <div className="h-3 bg-gray-300 rounded w-8 animate-pulse"></div>
      </div>
    </div>
  )
}

interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  priceUsd: string
  changePercent24Hr: string
  marketCapUsd: string
  rank: string
  image?: string
}

type CryptoInfiniteScrollProps = HtmlHTMLAttributes<HTMLDivElement>

const CryptoInfiniteScroll: FC<CryptoInfiniteScrollProps> = ({ className }) => {
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptoCurrency[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/cryptos")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }
        const data = await response.json()
        setCryptocurrencies(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        console.error("Fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    // Render skeleton UI with 10 placeholder items
    return (
      <div className={cn("w-full overflow-hidden py-2", className)}>
        <div className="relative flex">
          <div className="flex animate-infinite-scroll whitespace-nowrap">
            {[...Array(10)].map((_, index) => (
              <SkeletonItem key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex justify-center items-center h-12", className)}>
        <div className="text-red-500 text-xs">Error loading</div>
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-hidden py-2", className)}>
      <div className="relative flex">
        <div className="flex animate-infinite-scroll whitespace-nowrap">
          {cryptocurrencies.map((crypto, index) => (
            <CryptoItem key={`${crypto.id}-${index}`} crypto={crypto} />
          ))}
          {cryptocurrencies.map((crypto, index) => (
            <CryptoItem key={`${crypto.id}-dup-${index}`} crypto={crypto} />
          ))}
        </div>
      </div>
    </div>
  )
}

const CryptoItem: FC<{ crypto: CryptoCurrency }> = ({ crypto }) => {
  const priceChange = parseFloat(crypto.changePercent24Hr)
  const isPositive = priceChange >= 0.0
  const price = parseFloat(crypto.priceUsd)
  const formatPrice = (price: number): string => {
    if (price < 0.01) return price.toFixed(4)
    if (price < 1) return price.toFixed(3)
    if (price < 100) return price.toFixed(2)
    return price.toFixed(1)
  }
  const imageUrl = crypto.image
    ? crypto.image
    : `https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 mx-1 bg-white/90 dark:bg-gray-800/90 rounded-none border border-gray-200/30 dark:border-gray-700/30 min-w-[120px] text-xs">
      <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{crypto.rank}</span>
      </div>
      <Image
        src={imageUrl}
        alt={crypto.name}
        width={20}
        height={20}
        className="w-5 h-5 rounded-full flex-shrink-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = `https://via.placeholder.com/20/3B82F6/FFFFFF?text=${crypto.symbol.charAt(0)}`
        }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-gray-900 dark:text-white truncate">
            ${crypto.symbol.toUpperCase()}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            ${formatPrice(price)}
          </span>
          <span
            className={cn(
              "font-medium px-1 py-0.5 rounded",
              isPositive
                ? "text-green-700 bg-green-100/50 dark:bg-green-900/20"
                : "text-red-700 bg-red-100/50 dark:bg-red-900/20"
            )}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default CryptoInfiniteScroll
