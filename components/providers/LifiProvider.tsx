// SDKProviders.tsx (client)
"use client"
import { useEffect } from "react"
import { EVM, config as lifiConfig } from "@lifi/sdk"
import { getWalletClient, switchChain } from "@wagmi/core"
import { wagmiConfig } from "@/components/providers/wagmi-provider" // your wagmi config

export function SDKProviders() {
  useEffect(() => {
    const evmProvider = EVM({
      getWalletClient: () => getWalletClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId })
        return getWalletClient(wagmiConfig, { chainId: chain.id })
      },
    })
    // set providers at runtime (merges/overwrites)
    lifiConfig.setProviders([evmProvider])
    // optionally set rpcUrls at runtime if needed
  }, [])

  return null
}
