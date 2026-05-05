import { useEffect, useState } from "react"
import priceService from "@/services/price-service"

export function useExchangeRate(fiatCurrency: string, asset: string | null) {
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRate = async () => {
      setIsLoading(true)
      try {
        const rate = await priceService.getFiatExchangeRate(fiatCurrency)
        setExchangeRate(rate)
      } catch (err) {
        console.error("Rate update failed:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRate()
  }, [fiatCurrency, asset])

  return { exchangeRate, isRateLoading: isLoading }
}
