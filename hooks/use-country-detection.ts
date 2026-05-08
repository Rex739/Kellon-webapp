// hooks/useCountryDetection.ts
import { getCurrencyForCountry } from "@/lib/country-currency-map";
import { detectUserCountry } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function useCountryDetection(
  urlCountry: string | null,
  onCountryDetected: (country: string, currency: string) => void
) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    const init = async () => {
      if (urlCountry) {
        // Country already in URL → no detection needed
        hasRun.current = true;
        return;
      }
      try {
        const detected = await detectUserCountry();
        onCountryDetected(detected, getCurrencyForCountry(detected));
      } catch {
        onCountryDetected("NG", getCurrencyForCountry("NG"));
      } finally {
        hasRun.current = true;
      }
    };
    init();
    // We intentionally omit urlCountry from deps – detection should run only once.
    // The check inside uses the initial urlCountry value, which is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCountryDetected]);

  return { isDetecting: false }; // detection is synchronous from user perspective
}