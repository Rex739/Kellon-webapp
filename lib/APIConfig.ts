const config = {
  lifi: {
    key: process.env.LIFI_API_KEY,
    name: "LiFi",
  },
  ankr: {
    key: process.env.ANKR_RPC_KEY,
    name: "Ankr",
  },
  alchemy: {
    key: process.env.ALCHEMY_API_KEY,
    name: "Alchemy",
  },
  infura: {
    key: process.env.INFURA_API_KEY,
    name: "Infura",
  },
} as const

export const getAPIKey = (service: keyof typeof config): string => {
  const { key, name } = config[service]

  if (!key || key.length === 0) {
    throw new Error(`Missing ${name} API key!!!`)
  }

  return key
}
