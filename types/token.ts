export type CryptoCurrency = {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  image: string
}


export type CoinCapResponse  = {
  data: CryptoCurrency[]
  timestamp: number
}
