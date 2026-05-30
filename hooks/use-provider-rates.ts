// hooks/use-provider-rates.ts
import { useEffect, useState, useRef } from "react";
import { providerService } from "@/services/api/payment-providers";

interface ProviderRateDetails {
  cryptoAmount: number | null; // Calculated crypto amount
  fiatAmount: number | null; // Calculated fiat amount
  rawRate: number | null; // Raw rate from backend
}

type ProviderRatesMap = Record<string, ProviderRateDetails | null>;

interface UseProviderRatesParams {
  providers: { id: string; name: string }[];
  asset: string | null;
  amount: number;
  currency: string | null;
  networkName: string | null;
  isAmountValid: boolean;
  isLoadingProviders: boolean;
  side?: "buy" | "sell";
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function useProviderRates({
  providers,
  asset,
  amount,
  currency,
  networkName,
  isAmountValid,
  isLoadingProviders,
  side = "buy",
}: UseProviderRatesParams) {
  const [rates, setRates] = useState<ProviderRatesMap>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (
      isLoadingProviders ||
      !isAmountValid ||
      !asset ||
      !currency ||
      !networkName ||
      providers.length === 0
    ) {
      if (Object.keys(rates).length > 0) setRates({});
      setIsLoadingRates(false);
      fetchingRef.current = false;
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoadingRates(true);

    const fetchRates = async () => {
      const newRates: ProviderRatesMap = {};

      try {
        const ratePromises = providers.map(async (provider) => {
          try {
            let cryptoAmount: number | null = null;
            let fiatAmount: number | null = null;
            let rawRate: number | null = null;

            if (provider.name.toLowerCase() === "paycrest") {
              const res = await providerService.getPaycrestRate({
                token: asset,
                amount,
                currency: currency,
                network: networkName,
                side,
              });

              const paycrestRate =
                parseNumber(res.data?.rate) ??
                parseNumber(res.data?.data?.rate) ??
                parseNumber(
                  side === "sell" ? res.data?.sell?.rate : res.data?.buy?.rate,
                );

              if (res.success && paycrestRate) {
                rawRate = paycrestRate;
                if (rawRate > 0) {
                  if (side === "sell") {
                    cryptoAmount = amount;
                    fiatAmount =
                      parseNumber(res.data?.receiveAmount) ??
                      parseNumber(res.data?.fiatAmount) ??
                      amount * rawRate;
                  } else {
                    cryptoAmount = amount / rawRate;
                    fiatAmount = amount;
                  }
                }
              }
            } else if (provider.name.toLowerCase() === "centiiv") {
              const res = await providerService.getCentiivQuote({
                fromAsset: side === "sell" ? asset : currency,
                toAsset: side === "sell" ? currency || "USD" : asset,
                amount,
              });

              if (res.success) {
                rawRate = res.data?.rate ? parseFloat(res.data.rate) : null;
                const estimatedAmount = res.data?.estimatedReceivableAmount
                  ? parseFloat(res.data.estimatedReceivableAmount)
                  : null;

                if (side === "sell") {
                  cryptoAmount = amount;
                  fiatAmount = estimatedAmount;
                } else {
                  cryptoAmount = estimatedAmount;
                  fiatAmount = amount;
                }
              }
            }

            newRates[provider.id] =
              cryptoAmount !== null || fiatAmount !== null || rawRate !== null
                ? { cryptoAmount, fiatAmount, rawRate }
                : null;
          } catch (error) {
            console.error(`Failed to fetch rate for ${provider.name}:`, error);
            newRates[provider.id] = null;
          }
        });

        await Promise.all(ratePromises);
        setRates(newRates);
      } catch (error) {
        console.error("Error fetching provider rates:", error);
      } finally {
        setIsLoadingRates(false);
        fetchingRef.current = false;
      }
    };

    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    providers,
    asset,
    amount,
    currency,
    networkName,
    isAmountValid,
    isLoadingProviders,
    side,
  ]);

  return { rates, isLoadingRates };
}
