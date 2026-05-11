// hooks/use-provider-rates.ts
import { useEffect, useState, useRef } from "react"
import { providerService } from "@/services/api/payment-providers"

type ProviderRatesMap = Record<string, number | null>

interface UseProviderRatesParams {
  providers: { id: string; name: string }[]
  asset: string | null
  fiatAmount: number
  currency: string | null
  networkName: string | null
  isAmountValid: boolean
  isLoadingProviders: boolean
}

export function useProviderRates({
  providers,
  asset,
  fiatAmount,
  currency,
  networkName,
  isAmountValid,
  isLoadingProviders,
}: UseProviderRatesParams) {
  const [rates, setRates] = useState<ProviderRatesMap>({})
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (
      isLoadingProviders ||
      !isAmountValid ||
      !asset ||
      !currency ||
      !networkName ||
      providers.length === 0
    ) {
      if (Object.keys(rates).length > 0) setRates({})
      setIsLoadingRates(false)
      fetchingRef.current = false
      return
    }

    if (fetchingRef.current) return
    fetchingRef.current = true
    setIsLoadingRates(true)

    const fetchRates = async () => {
      const newRates: ProviderRatesMap = {}

      try {
        const ratePromises = providers.map(async (provider) => {
          try {
            let estimatedCrypto: number | null = null

            if (provider.name.toLowerCase() === "paycrest") {
              const res = await providerService.getPaycrestRate({
                token: asset,
                amount: fiatAmount,
                currency: currency,
                network: networkName,
              })

              if (res.success && res.data?.buy?.rate) {
                const rate = parseFloat(res.data.buy.rate)
                if (!isNaN(rate)) {
                  estimatedCrypto = fiatAmount / rate
                }
              }
            } else if (provider.name.toLowerCase() === "centiiv") {
              const res = await providerService.getCentiivQuote({
                fromAsset: currency,
                toAsset: asset,
                amount: fiatAmount,
              })
              if (res.success && res.data?.estimatedReceivableAmount) {
                estimatedCrypto = parseFloat(res.data.estimatedReceivableAmount)
              }
            }

            newRates[provider.id] = estimatedCrypto
          } catch (error) {
            console.error(`Failed to fetch rate for ${provider.name}:`, error)
            newRates[provider.id] = null
          }
        })

        await Promise.all(ratePromises)
        setRates(newRates)
      } catch (error) {
        console.error("Error fetching provider rates:", error)
      } finally {
        setIsLoadingRates(false)
        fetchingRef.current = false
      }
    }

    fetchRates()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    providers,
    asset,
    fiatAmount,
    currency,
    networkName,
    isAmountValid,
    isLoadingProviders,
  ])

  return { rates, isLoadingRates }
}
