"use client"

import { FC, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ArrowLeft, Loader2, Search, SearchX } from "lucide-react"
import { Token } from "@lifi/sdk"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

interface TokenSelectProps {
  tokens?: Token[]
  selectedToken: Token | null
  loading?: boolean
  onClose: (side: "from" | "to") => void
  side: "from" | "to"
}

const TokenSelect: FC<TokenSelectProps> = ({
  tokens = [],
  selectedToken,
  loading = false,
  onClose,
  side,
}) => {
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams()

  // IMP START - Token Filtering
  // Filters token list based on search query (matches by symbol, name, or address)
  const filteredTokens = tokens.filter((t) => {
    const query = search.toLowerCase()
    return (
      t.symbol.toLowerCase().includes(query) ||
      t.name?.toLowerCase().includes(query) ||
      t.address.toLowerCase().includes(query)
    )
  })
  // IMP END - Token Filtering

  // IMP START - URL Builder
  // Helper function to build query params for selected token
  const buildUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    return `/?${params.toString()}`
  }
  // IMP END - URL Builder

  return (
    <>
      {/* =================== MOBILE VIEW =================== */}
      <div className="block w-full md:hidden">
        <div className="bg-transparent">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by token or address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full bg-white2 dark:bg-secondary-60 border-input text-black dark:text-white placeholder:text-gray-400 placeholder:text-xs"
              />
            </div>

            {/* Token List */}
            <div className="max-h-[calc(70dvh-180px)] xs:max-h-[calc(70dvh-200px)] overflow-y-auto overflow-x-hidden">
              {loading ? (
                // Loading state
                <div className="flex space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading tokens</p>
                </div>
              ) : filteredTokens.length > 0 ? (
                // Render token items
                filteredTokens.map((token) => (
                  <Link
                    key={token.address}
                    href={buildUrl(
                      side === "from" ? "fromToken" : "toToken",
                      token.address
                    )}
                    onClick={() => onClose(side)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white2 dark:hover:bg-secondary-60 hover:rounded-lg transition text-black dark:text-white cursor-pointer",
                      selectedToken?.address === token.address &&
                        "bg-purple-100 dark:bg-secondary-70 rounded-lg"
                    )}
                  >
                    {/* Token Logo or fallback */}
                    {token.logoURI ? (
                      <Image
                        src={token.logoURI}
                        alt={token.symbol}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="rounded-full flex justify-center items-center bg-blue-950 text-white p-2 w-7 h-7">
                        {token.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Token Details */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                      <span className="text-[10px]">{token.name}</span>
                    </div>
                  </Link>
                ))
              ) : (
                // No results found
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                  <SearchX className="w-10 h-10 mb-2" />
                  <p className="text-sm">No tokens found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================== DESKTOP VIEW =================== */}
      <div className="hidden md:block">
        <Card className="bg-white dark:bg-secondary-10 border border-input rounded-r-2xl rounded-l-none h-[600px] w-[400px]">
          <CardContent className="p-4 space-y-4">
            {/* Header with back arrow */}
            <div className="flex items-center relative w-full">
              <ArrowLeft
                onClick={() => onClose(side)}
                className="absolute left-0"
              />
              <div className="mx-auto text-center">Swap from</div>
            </div>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by token or address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full bg-white2 dark:bg-secondary-60 border-input text-black dark:text-white placeholder:text-gray-400 placeholder:text-xs"
              />
            </div>

            {/* Token List */}
            <div className="max-h-[460px] overflow-y-auto overflow-x-hidden">
              {loading ? (
                // Loading state
                <div className="flex space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading tokens</p>
                </div>
              ) : filteredTokens.length > 0 ? (
                // Render token items
                filteredTokens.map((token) => (
                  <Link
                    key={token.address}
                    href={buildUrl(
                      side === "from" ? "fromToken" : "toToken",
                      token.address
                    )}
                    onClick={() => onClose(side)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white2 dark:hover:bg-secondary-60 hover:rounded-lg transition text-black dark:text-white cursor-pointer",
                      selectedToken?.address === token.address &&
                        "bg-purple-100 dark:bg-secondary-70 rounded-lg"
                    )}
                  >
                    {/* Token Logo or fallback */}
                    {token.logoURI ? (
                      <Image
                        src={token.logoURI}
                        alt={token.symbol}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="rounded-full flex justify-center items-center bg-blue-950 text-white h-7 w-7">
                        {token.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Token Details */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                      <span className="text-[10px]">{token.name}</span>
                    </div>
                  </Link>
                ))
              ) : (
                // No results found
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                  <SearchX className="w-10 h-10 mb-2" />
                  <p className="text-sm">No tokens found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default TokenSelect
