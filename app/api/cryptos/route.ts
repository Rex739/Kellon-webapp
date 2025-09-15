import { CryptoCurrency } from "@/types/token"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h",
      {
        next: { revalidate: 600 },
      }
    )
    if (!response.ok) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      )
    }
    const data: CryptoCurrency[] = await response.json()

    // Transform to match our expected format
    const formattedData = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      priceUsd: coin.current_price?.toString() || "0", // Fallback if undefined/null
      changePercent24Hr: coin.price_change_percentage_24h?.toString() || "0", // Fix: Check for null/undefined
      marketCapUsd: coin.market_cap?.toString() || "0",
      rank: coin.market_cap_rank?.toString() || "N/A",
      image: coin.image,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching crypto data:", error)
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency data" },
      { status: 500 }
    )
  }
}
