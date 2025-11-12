"use client"

import { FC, useEffect } from "react"
import { useWeb3Auth } from "@web3auth/modal/react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { createWalletClient, custom } from "viem"
import { mainnet } from "viem/chains"

export const Web3AuthWagmiAdapter: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { web3Auth } = useWeb3Auth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()

  useEffect(() => {
    const syncWeb3AuthWithWagmi = async () => {
      if (!web3Auth) return

      // If Web3Auth is connected but Wagmi isn't, sync them
      if (web3Auth.connected && !isConnected && web3Auth.provider) {
        try {
          console.log("Web3Auth connected - syncing with Wagmi")

          // Create a wallet client from Web3Auth provider
          const walletClient = createWalletClient({
            chain: mainnet, // Use your default chain
            transport: custom(web3Auth.provider),
          })

          // Get the address from Web3Auth
          const accounts = await walletClient.getAddresses()
          const web3AuthAddress = accounts[0]

          console.log("Web3Auth address:", web3AuthAddress)

          // You might need to implement custom connector logic here
          // since Web3Auth isn't a standard Wagmi connector
        } catch (error) {
          console.error("Failed to sync Web3Auth with Wagmi:", error)
        }
      }

      // If Web3Auth is disconnected but Wagmi is connected, disconnect Wagmi
      if (!web3Auth.connected && isConnected) {
        console.log("Web3Auth disconnected - disconnecting Wagmi")
        disconnect()
      }
    }

    syncWeb3AuthWithWagmi()
  }, [web3Auth?.connected, isConnected, web3Auth, disconnect])

  return <>{children}</>
}
