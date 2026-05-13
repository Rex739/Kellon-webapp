"use client"

import { useEffect } from "react"
import { EVM, config as lifiConfig } from "@lifi/sdk"

import { wagmiConfig } from "./wagmi-provider"
import { getWalletClient } from "@wagmi/core"

export default function SDKProviders() {
  useEffect(() => {
    const evmProvider = EVM({
      getWalletClient: () => getWalletClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId })
        return getWalletClient(wagmiConfig, { chainId: chain.id })
      },
    })

    // Register runtime EVM provider (client-side)
    lifiConfig.setProviders([evmProvider])

    console.log("✅ LiFi runtime provider set.")
  }, [])

  return null
}
