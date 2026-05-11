import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUPPORTED_RAMP_COUNTRIES } from "./supported-countries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const detectUserCountry = async (): Promise<string> => {
  try {
    const response = await fetch(`/api/geo?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    const data = await response.json();
    const detectedCountry = (data.country_code || data.country || "")
      .toString()
      .toUpperCase();

    if (detectedCountry && SUPPORTED_RAMP_COUNTRIES.includes(detectedCountry)) {
      return detectedCountry;
    }
  } catch (error) {
    console.error("GeoIP detection failed", error);
  }

  return "NG"; // Global fallback set to Nigeria
};
