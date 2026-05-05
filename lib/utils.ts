import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SUPPORTED_RAMP_COUNTRIES } from "./supported-countries"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export const detectUserCountry = async (): Promise<string> => {
  try {
    // Method 1: IP-based lookup
    const response = await fetch("/api/geo")
    const data = await response.json()
    if (
      data.country_code &&
      SUPPORTED_RAMP_COUNTRIES.includes(data.country_code)
    ) {
      return data.country_code
    }
  } catch (error) {
    console.error("GeoIP detection failed", error)
  }

  return "NG" // Global fallback set to Nigeria
}
