import { useEffect } from "react";
import { useDetectCountry } from "@/hooks/use-detect-country";

export function useCountryDetection(
  urlCountry: string | null,
  countrySource: "auto" | "manual" | null,
  onCountryDetected: (country: string, currency: string) => void,
) {
  const { countryCode, currencyCode, isDetecting } = useDetectCountry(
    countrySource === "manual" ? urlCountry : null,
  );

  useEffect(() => {
    if (!countryCode || !currencyCode) {
      return;
    }

    onCountryDetected(countryCode, currencyCode);
  }, [countryCode, currencyCode, onCountryDetected]);

  return { isDetecting };
}
