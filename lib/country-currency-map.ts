export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // North America
  US: "USD",
  CA: "CAD",
  MX: "MXN",

  // Europe
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  PT: "EUR",
  IE: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",

  // Africa
  NG: "NGN",
  KE: "KES",
  GH: "GHS",
  ZA: "ZAR",
  UG: "UGX",
  TZ: "TZS",
  RW: "RWF",
  CM: "XAF",
  CI: "XOF",
  SN: "XOF",

  // Asia / Oceania
  IN: "INR",
  SG: "SGD",
  JP: "JPY",
  KR: "KRW",
  HK: "HKD",
  CN: "CNY",
  AU: "AUD",
  NZ: "NZD",
  ID: "IDR",
  PH: "PHP",
  TH: "THB",
  VN: "VND",
  MY: "MYR",

  // Latin America
  BR: "BRL",
  AR: "ARS",
  CO: "COP",
  CL: "CLP",
  PE: "PEN",
}

export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: "$",
  NGN: "₦",
  GBP: "£",
  EUR: "€",
  KES: "KSh",
  GHS: "GH₵",
  ZAR: "R",
  CAD: "CA$",
  INR: "₹",
  JPY: "¥",
  CNY: "¥",
  AUD: "A$",
  NZD: "NZ$",
  BRL: "R$",
  ZMW: "ZK",
  UGX: "USh",
  TZS: "TSh",
  RWF: "FRw",
  EGP: "E£",
  MAD: "DH",
  XAF: "FCFA",
  XOF: "CFA",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  MXN: "$",
  SGD: "S$",
  HKD: "HK$",
  KRW: "₩",
  TRY: "₺",
  RUB: "₽",
  IDR: "Rp",
  PHP: "₱",
  THB: "฿",
  VND: "₫",
  MYR: "RM",
  ARS: "$",
  COP: "$",
  CLP: "$",
  PEN: "S/",
}

export const getCurrencyForCountry = (
  countryCode: string | undefined,
): string => {
  if (!countryCode) return "USD"
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || "USD"
}

export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOL_MAP[currency.toUpperCase()] || "$"
}

export const isFiatCurrency = (symbol: string | undefined): boolean => {
  if (!symbol) return false
  const uppercased = symbol.toUpperCase()
  return (
    !!CURRENCY_SYMBOL_MAP[uppercased] ||
    Object.values(COUNTRY_CURRENCY_MAP).includes(uppercased)
  )
}

export const getCurrencyDecimals = (currency: string | undefined): number => {
  if (!currency) return 2
  const uppercased = currency.toUpperCase()
  if (["NGN", "ZAR", "JPY", "KRW", "CLP"].includes(uppercased)) return 0
  return 2
}
