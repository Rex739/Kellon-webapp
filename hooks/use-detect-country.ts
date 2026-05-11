import { getFlag } from "@/components/wallet/buy-crypto/steps/AssetSelectionStep";
import { getCurrencyForCountry } from "@/lib/country-currency-map";
import { detectUserCountry } from "@/lib/utils";
import { useEffect, useState } from "react";

interface UseDetectCountryResult {
  countryCode: string;
  currencyCode: string;
  flag: string;
  isDetecting: boolean;
}

const DEFAULT_COUNTRY = "NG";

export function useDetectCountry(
  initialCountry?: string | null,
): UseDetectCountryResult {
  const normalizedInitialCountry = initialCountry?.toUpperCase() || null;
  const [countryCode, setCountryCode] = useState<string>(
    normalizedInitialCountry || DEFAULT_COUNTRY,
  );
  const [currencyCode, setCurrencyCode] = useState<string>(
    getCurrencyForCountry(normalizedInitialCountry || DEFAULT_COUNTRY),
  );
  const [isDetecting, setIsDetecting] = useState(!normalizedInitialCountry);

  useEffect(() => {
    if (normalizedInitialCountry) {
      setCountryCode(normalizedInitialCountry);
      setCurrencyCode(getCurrencyForCountry(normalizedInitialCountry));
      setIsDetecting(false);
      return;
    }

    let isCancelled = false;

    const runDetection = async () => {
      setIsDetecting(true);

      try {
        const detectedCountry = (await detectUserCountry()).toUpperCase();
        if (isCancelled) return;

        setCountryCode(detectedCountry);
        setCurrencyCode(getCurrencyForCountry(detectedCountry));
      } catch {
        if (isCancelled) return;

        setCountryCode(DEFAULT_COUNTRY);
        setCurrencyCode(getCurrencyForCountry(DEFAULT_COUNTRY));
      } finally {
        if (!isCancelled) {
          setIsDetecting(false);
        }
      }
    };

    runDetection();

    return () => {
      isCancelled = true;
    };
  }, [normalizedInitialCountry]);

  return {
    countryCode,
    currencyCode,
    flag: getFlag(countryCode),
    isDetecting,
  };
}
