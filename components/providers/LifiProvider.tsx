// SDKProviders.tsx (client)
"use client"
import { useEffect } from "react"
import { EVM, config as lifiConfig } from "@lifi/sdk"
import { getWalletClient, switchChain } from "@wagmi/core"
import { wagmiConfig } from "@/components/providers/wagmi-provider" // your wagmi config

export default function SDKProviders() {
  useEffect(() => {
    const evmProvider = EVM({
      getWalletClient: async () => getWalletClient(wagmiConfig) as never,
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId })
        return getWalletClient(wagmiConfig, { chainId: chain.id }) as never
      },
    })
    // set providers at runtime (merges/overwrites)
    lifiConfig.setProviders([evmProvider])
    // optionally set rpcUrls at runtime if needed
  }, [])

  return null
}
