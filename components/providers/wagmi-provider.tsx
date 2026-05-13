"use client"

import { useSupportedChains } from "@/hooks/use-supported-chains"
import { type FC, type PropsWithChildren, useEffect, useState } from "react"
import { createClient, http } from "viem"
import { mainnet } from "viem/chains"
import type { Config, CreateConnectorFn } from "wagmi"
import { WagmiProvider, createConfig as createWagmiConfig } from "wagmi"
import { injected } from "wagmi/connectors"

const connectors: CreateConnectorFn[] = [injected()]

export const wagmiConfig: Config = createWagmiConfig({
  chains: [mainnet],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
})

export const CustomWagmiProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chains } = useSupportedChains()
  const [isMounted, setIsMounted] = useState(false)

  // 👇 Delay rendering until after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      {children}
    </WagmiProvider>
  )
}
